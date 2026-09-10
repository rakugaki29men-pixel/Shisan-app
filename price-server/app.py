"""
株価・為替レートの取得用の小さなAPIサーバー。
フロントエンド（Reactアプリ）とは別のRenderサービスとしてデプロイする想定。
yfinance（無料・APIキー不要）でYahoo Financeのデータを取得する。

エンドポイント：
  GET /health
      -> {"status": "ok"}
  GET /fx?date=YYYY-MM-DD (dateは省略可、省略時は最新)
      -> {"usdjpy": <number>, "date": "YYYY-MM-DD"}
  GET /prices?symbols=AAPL,VYM,1628.T,BTC-USD&date=YYYY-MM-DD (dateは省略可)
      -> [{"symbol": "AAPL", "price": 123.45, "currency": "USD", "asOf": "2026-09-10"}, ...]
      見つからなかった銘柄は結果の配列から省かれる（投資信託など、そもそも
      Yahoo Financeにティッカーが存在しないものは常に省かれる）。
  GET /search?q=<キーワード>
      -> {"candidates": [{"name", "exchange", "ticker", "instrumentType", "currency", "assetCat"}, ...]}
      銘柄名・ティッカーのあいまい検索。Yahoo Financeの検索候補をそのまま変換する。
"""
import os
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


def _currency_for(symbol):
    return "JPY" if symbol.upper().endswith(".T") else "USD"


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


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/fx")
def fx():
    date_str = request.args.get("date")
    try:
        ticker = yf.Ticker("JPY=X")
        if date_str:
            start, end = _date_range_around(date_str)
            hist = ticker.history(start=start, end=end)
            if hist.empty:
                return jsonify({"error": "no data for that date"}), 404
            row = hist.iloc[0]
            used_date = hist.index[0].strftime("%Y-%m-%d")
        else:
            hist = ticker.history(period="5d")
            if hist.empty:
                return jsonify({"error": "no data"}), 404
            row = hist.iloc[-1]
            used_date = hist.index[-1].strftime("%Y-%m-%d")
        return jsonify({"usdjpy": round(float(row["Close"]), 4), "date": used_date})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def _fetch_one_price(symbol, date_str):
    try:
        ticker = yf.Ticker(symbol)
        if date_str:
            start, end = _date_range_around(date_str)
            hist = ticker.history(start=start, end=end)
            if hist.empty:
                return None
            price = float(hist.iloc[0]["Close"])
            as_of = hist.index[0].strftime("%Y-%m-%d")
        else:
            hist = ticker.history(period="5d")
            if hist.empty:
                return None
            price = float(hist.iloc[-1]["Close"])
            as_of = hist.index[-1].strftime("%Y-%m-%d")
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
    if not query:
        return jsonify({"candidates": []})

    try:
        quotes = yf.Search(query, max_results=8).quotes
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    candidates = []
    for q in quotes:
        symbol = q.get("symbol")
        quote_type = (q.get("quoteType") or "").upper()
        if not symbol or quote_type not in _QUOTE_TYPE_MAP:
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


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
