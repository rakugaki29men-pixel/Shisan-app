"""
株価・為替レートの取得用の小さなAPIサーバー。
フロントエンド（Reactアプリ）とは別のRenderサービスとしてデプロイする想定。
yfinance（無料・APIキー不要）でYahoo Financeのデータを取得する。

エンドポイント：
  GET /health
      -> {"status": "ok"}
  GET /fx?currencies=USD,EUR&date=YYYY-MM-DD (dateは省略可、省略時は最新)
      -> {"rates": {"USD": 150.2, "EUR": 163.4}, "date": "YYYY-MM-DD"}
      各通貨の対円レート。取得できなかった通貨は結果に含めない。
  GET /prices?symbols=AAPL,VYM,1628.T,BTC-USD&date=YYYY-MM-DD (dateは省略可)
      -> [{"symbol": "AAPL", "price": 123.45, "currency": "USD", "asOf": "2026-09-10"}, ...]
      見つからなかった銘柄は結果の配列から省かれる（投資信託など、そもそも
      Yahoo Financeにティッカーが存在しないものは常に省かれる）。
  GET /search?q=<キーワード>&types=EQUITY,ETF,MUTUALFUND,CRYPTOCURRENCY (typesは省略可、省略時は全種類)
      -> {"candidates": [{"name", "exchange", "ticker", "instrumentType", "currency", "assetCat"}, ...]}
      銘柄名・ティッカーのあいまい検索。Yahoo Financeの検索候補をそのまま変換する。
  GET /names?symbols=1306.T,7203.T
      -> {"names": {"1306.T": "NEXT FUNDS TOPIX連動型上場投信", ...}}
      日本の銘柄（.T）の正式名称のうち、日本語表記が取れたものだけを返す
      （英語表記しか見つからない銘柄は結果に含めない）。
"""
import math
import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta

from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf

app = Flask(__name__)
CORS(app)

MAX_SYMBOLS_PER_REQUEST = 60


def _date_range_around(date_str):
    start = datetime.strptime(date_str, "%Y-%m-%d")
    # 指定日が休場日でも直後の取引日まで拾えるよう、数日分の幅を見て取得する
    end = start + timedelta(days=7)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


_EXCHANGE_SUFFIX_CURRENCY = {
    ".T": "JPY",
    ".PA": "EUR", ".DE": "EUR", ".AS": "EUR", ".MI": "EUR", ".MC": "EUR", ".BR": "EUR",
    ".L": "GBP",
    ".SW": "CHF",
    ".HK": "HKD",
    ".AX": "AUD",
    ".TO": "CAD", ".V": "CAD",
    ".SS": "CNY", ".SZ": "CNY",
}


def _currency_for(symbol):
    su = symbol.upper()
    for suffix, currency in _EXCHANGE_SUFFIX_CURRENCY.items():
        if su.endswith(suffix):
            return currency
    return "USD"


def _last_valid_close(hist):
    # auto_adjust=Falseでも配当・分割データ取得に失敗した行はCloseがNaNになることがあるため、
    # 直近の有効な値まで遡って拾う
    closes = hist["Close"].dropna()
    if closes.empty:
        return None, None
    return float(closes.iloc[-1]), closes.index[-1].strftime("%Y-%m-%d")


def _first_valid_close(hist):
    closes = hist["Close"].dropna()
    if closes.empty:
        return None, None
    return float(closes.iloc[0]), closes.index[0].strftime("%Y-%m-%d")


_EXCHANGE_MAP = {
    "NMS": "NASDAQ",
    "NGM": "NASDAQ",
    "NCM": "NASDAQ",
    "NYQ": "NYSE",
    "ASE": "NYSEARCA",
    "PCX": "NYSEARCA",
    "BATS": "NYSEARCA",
}

_QUOTE_TYPE_MAP = {
    "EQUITY": "個別銘柄",
    "ETF": "ETF",
    "CRYPTOCURRENCY": "仮想通貨",
    "MUTUALFUND": "投信",
}

_ASSET_CAT_MAP = {
    "EQUITY": "株式",
    "ETF": "株式",
    "MUTUALFUND": "株式",
    "CRYPTOCURRENCY": "仮想通貨",
}


def _split_symbol(symbol, yahoo_exchange):
    if symbol.upper().endswith(".T"):
        return "TYO", symbol[:-2]
    return _EXCHANGE_MAP.get(yahoo_exchange, yahoo_exchange or ""), symbol


_JA_CHAR_RE = re.compile(r"[぀-ヿ㐀-鿿]")


def _fetch_one_ja_name(symbol):
    try:
        info = yf.Ticker(symbol).info
        name = info.get("longName") or info.get("shortName")
        if name and _JA_CHAR_RE.search(name):
            return symbol, name
    except Exception:
        pass
    return symbol, None


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


def _fetch_one_fx_rate(currency, date_str):
    # USDJPY=X のような「{通貨}JPY=X」表記はYahoo Financeの為替クロスの標準形式
    symbol = "JPY=X" if currency == "USD" else f"{currency}JPY=X"
    try:
        ticker = yf.Ticker(symbol)
        if date_str:
            start, end = _date_range_around(date_str)
            hist = ticker.history(start=start, end=end, auto_adjust=False)
            price, used_date = _first_valid_close(hist)
        else:
            hist = ticker.history(period="5d", auto_adjust=False)
            price, used_date = _last_valid_close(hist)
        if price is None:
            return currency, None, None
        return currency, round(price, 4), used_date
    except Exception:
        return currency, None, None


@app.route("/fx")
def fx():
    date_str = request.args.get("date")
    currencies_param = request.args.get("currencies", "USD")
    currencies = list({c.strip().upper() for c in currencies_param.split(",") if c.strip() and c.strip().upper() != "JPY"})
    if not currencies:
        return jsonify({"rates": {}, "date": None})

    rates = {}
    used_date = None
    with ThreadPoolExecutor(max_workers=min(10, len(currencies))) as executor:
        futures = [executor.submit(_fetch_one_fx_rate, c, date_str) for c in currencies]
        for future in as_completed(futures):
            currency, rate, d = future.result()
            if rate is not None:
                rates[currency] = rate
                used_date = used_date or d

    return jsonify({"rates": rates, "date": used_date})


def _fetch_one_price(symbol, date_str):
    try:
        ticker = yf.Ticker(symbol)
        if date_str:
            start, end = _date_range_around(date_str)
            hist = ticker.history(start=start, end=end, auto_adjust=False)
            price, as_of = _first_valid_close(hist)
        else:
            hist = ticker.history(period="5d", auto_adjust=False)
            price, as_of = _last_valid_close(hist)
        if price is None or math.isnan(price):
            return None
        return {
            "symbol": symbol,
            "price": round(price, 4),
            "currency": _currency_for(symbol),
            "asOf": as_of,
        }
    except Exception:
        return None  # この銘柄だけスキップし、他の銘柄の取得は継続する


@app.route("/prices")
def prices():
    symbols_param = request.args.get("symbols", "")
    date_str = request.args.get("date")
    symbols = [s.strip() for s in symbols_param.split(",") if s.strip()][:MAX_SYMBOLS_PER_REQUEST]
    if not symbols:
        return jsonify([])

    # I/O待ちがほとんどなので並列化して合計時間を短縮する（無料プランのCPUが遅いため直列だとタイムアウトしやすい）
    results = []
    with ThreadPoolExecutor(max_workers=min(10, len(symbols))) as executor:
        futures = [executor.submit(_fetch_one_price, s, date_str) for s in symbols]
        for future in as_completed(futures):
            r = future.result()
            if r is not None:
                results.append(r)

    return jsonify(results)


@app.route("/search")
def search():
    query = request.args.get("q", "").strip()
    types_param = request.args.get("types", "")
    wanted_types = {t.strip().upper() for t in types_param.split(",") if t.strip()}
    if not query:
        return jsonify({"candidates": []})

    try:
        # 種類を絞る場合、目的の件数分残るよう多めに取得してからフィルタする
        quotes = yf.Search(query, max_results=15 if wanted_types else 8).quotes
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    candidates = []
    for q in quotes:
        symbol = q.get("symbol")
        quote_type = (q.get("quoteType") or "").upper()
        if not symbol or quote_type not in _QUOTE_TYPE_MAP:
            continue
        if wanted_types and quote_type not in wanted_types:
            continue
        exchange, ticker = _split_symbol(symbol, q.get("exchange"))
        name = q.get("longname") or q.get("shortname") or symbol
        candidates.append({
            "name": name,
            "exchange": exchange,
            "ticker": ticker,
            "instrumentType": _QUOTE_TYPE_MAP.get(quote_type, "個別銘柄"),
            "currency": "JPY" if exchange == "TYO" else "USD",
            "assetCat": _ASSET_CAT_MAP.get(quote_type, "その他"),
        })

    return jsonify({"candidates": candidates[:5]})


@app.route("/names")
def names():
    symbols_param = request.args.get("symbols", "")
    symbols = [s.strip() for s in symbols_param.split(",") if s.strip() and s.strip().upper().endswith(".T")][:MAX_SYMBOLS_PER_REQUEST]
    if not symbols:
        return jsonify({"names": {}})

    result = {}
    with ThreadPoolExecutor(max_workers=min(10, len(symbols))) as executor:
        futures = [executor.submit(_fetch_one_ja_name, s) for s in symbols]
        for future in as_completed(futures):
            symbol, name = future.result()
            if name:
                result[symbol] = name

    return jsonify({"names": result})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
