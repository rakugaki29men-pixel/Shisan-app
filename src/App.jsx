import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot
} from "recharts";

/* ============================================================
   埋め込みデータ（元エクセルファイルから抽出）
   ============================================================ */
const RAW = {"sim": {"years": [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050, 2051, 2052, 2053, 2054, 2055, 2056, 2057, 2058, 2059, 2060], "params": {"housingType": 1.0, "loanInitial": 60000, "loanRate": 0.01, "buildingInitial": 20000.0, "landInitial": 40000.0, "dividendRate": 0.01, "growthRate": 1.03, "realEstateFlag": "無", "initAssetSecurities2019": null, "repairNotes": null}, "expense": {"tuition": {"child1": [150.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 500.0, 500.0, 500.0, 500.0, 500.0, 500.0, 2000.0, 2000.0, 2000.0, 2000.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "child1_extra": [0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 200.0, 200.0, 350.0, 500.0, 500.0, 700.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "child2": [0, 0, 150.0, 150.0, 150.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 500.0, 500.0, 500.0, 500.0, 500.0, 500.0, 2000.0, 2000.0, 2000.0, 2000.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "child2_extra": [0, 0, 0, 0, 0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 200.0, 200.0, 350.0, 500.0, 500.0, 700.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "child3": [0, 0, 0, 0, 150.0, 150.0, 150.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 500.0, 500.0, 500.0, 500.0, 1000.0, 1000.0, 2000.0, 2000.0, 2000.0, 2000.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "child3_extra": [0, 0, 0, 0, 0, 0, 0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 200.0, 200.0, 350.0, 500.0, 500.0, 700.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "dorm": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 600.0, 600.0, 1200.0, 1200.0, 600.0, 600.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "medical": {"us": [0, 0, 0, 536.0, 30.0, 315.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0, 70.0], "gfather_p": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0], "gmother_p": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0], "gfather_m": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0], "gmother_m": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0]}, "housing_opt1_loanPayment": [0, 0, 1404.0, 1830.0, 1830.0, 1830.0, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 1830, 0, 0, 0, 0], "housing_opt1_loanDeduction": [0, 0, 400.0, 400.0, 400.0, 400.0, 400, 400, 400, 400, 400, 400, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "housing_opt1_propertyTax": [0, 0, 150.0, 130.0, 134.0, 135.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0], "housing_opt1_insurance": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "housing_opt1_repair": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200.0, 0, 0, 0, 0, 200.0, 0, 0, 0, 0, 200.0, 0, 0, 0, 0, 2000, 0, 0, 0, 0, 200.0, 0, 0, 0, 0, 2000.0, 0, 0, 0, 0, 200.0], "housing_opt2_rent_relocate": [396.0, 396.0, 396.0, 396.0, 396.0, 396.0, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540, 1540], "housing_opt3_used_condo": [396.0, 396.0, 396.0, 396.0, 396.0, 396.0, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160, 2160], "housing_opt4_rent_to_condo": [396.0, 396.0, 396.0, 396.0, 396.0, 396.0, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 2100, 30000, 360, 360, 360, 360, 360, 360, 360, 360, 360, 360, 360, 360, 360, 360, 360], "car": {"body": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5000.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "parking": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "gas": [60.0, 60.0, 60.0, 60.0, 60.0, 42.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0], "insurance": [80.0, 80.0, 80.0, 80.0, 80.0, 28.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0, 80.0], "tax": [40.0, 40.0, 40.0, 40.0, 40.0, 35.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0], "inspection": [0, 80.0, 0, 80.0, 0, 0, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 80, 80, 80, 80, 80], "other": [10.0, 10.0, 10.0, 10.0, 10.0, 142.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0]}, "living": {"food_father": [120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120], "food_mother": [120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120], "food_child1": [60.0, 120.0, 120.0, 120.0, 120.0, 180.0, 180.0, 180.0, 200.0, 200.0, 240.0, 240.0, 240.0, 240.0, 240.0, 240.0, 240.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "food_child2": [60.0, 60.0, 60.0, 60.0, 60.0, 96.0, 96, 96, 180, 270, 270, 270, 300, 300, 360, 360, 360, 360, 360, 360, 360, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "food_child3": [72.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60, 120.0, 120.0, 120.0, 234, 351, 351, 351, 390, 390, 468, 468, 468, 468, 468, 468, 468, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "utilities": [300.0, 300.0, 300.0, 252.0, 300.0, 290.0, 350.0, 350.0, 350.0, 350.0, 350.0, 350.0, 350.0, 350.0, 350.0, 350.0, 350.0, 350.0, 350.0, 300.0, 300.0, 300.0, 300.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0, 200.0], "communication": [120.0, 120.0, 120.0, 89.0, 70.0, 71.0, 120, 180, 180, 180, 180, 240, 240, 300, 300, 300, 300, 240, 240, 240, 240, 180, 180, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120], "daily_goods": [200.0, 200.0, 200.0, 356.0, 350.0, 412.0, 250.0, 250.0, 250.0, 250.0, 250.0, 250.0, 250.0, 250.0, 250.0, 250.0, 250.0, 250.0, 250.0, 200.0, 200.0, 200.0, 200.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0, 150.0]}, "social": [720.0, 720.0, 720.0, 791.0, 676.0, 567.0, 960, 960, 960, 960, 960, 960, 960, 960, 960, 960, 960, 960, 960, 960, 1960, 960, 960, 960, 960, 960, 0, 0, 1000.0, 0, 1000.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "leisure": [300.0, 300.0, 300.0, 70.0, 110.0, 113.0, 300.0, 300.0, 300.0, 300.0, 1000.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 1000.0, 300.0, 300.0, 300.0, 300.0, 1000.0, 500.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0, 300.0], "other": [120.0, 144.0, 144.0, 120.0, 264.0, 330.0, 180, 204, 228, 240, 312, 336, 336, 360, 420, 420, 480, 360, 360, 360, 360, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240], "sudden": [0.0, 0.0, 500.0, 0.0, 0.0, 0.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 0.0, 0.0, 500.0, 0, 0, 500.0, 0, 0]}, "income": {"father": [6500.0, 6500.0, 6500.0, 6524.0, 6990.0, 7219.0, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 7219, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "mother": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "taxRefund": [0, 0, 0, 512.0, 0, 251.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "other_childAllowance": [0, 0, 0, 1259.0, 1310.0, 1963.0, 1700, 600, 600, 600, 600, 600, 600, 480, 480, 480, 480, 360.0, 360.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "pension_retirement": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20000.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}}, "portfolio": {"usdjpy": 155.949991, "holdings": [{"account": "", "exchange": "NYSEARCA", "ticker": "VYM", "name": "Vanguard High Dividend Yield Index Fund ETF", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": 164.23, "priceJpyUnit": 25611.66702, "valueJpy": 0, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:VYM", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSEARCA", "ticker": "VHT", "name": "Vanguard Health Care Index Fund ETF", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": 321.66, "priceJpyUnit": 50162.87411, "valueJpy": 0, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:VHT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSEARCA", "ticker": "SPYD", "name": "State Street SPDR Portfolio S&P 500 High Dvd ETF", "qty": 1.0, "avgJpyTotal": 3577.25, "priceUsdUnit": 49.62, "priceJpyUnit": 7738.238553, "valueJpy": 7738.238553, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:SPYD", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NASDAQ", "ticker": "IBB", "name": "iShares Biotechnology ETF", "qty": 1.0, "avgJpyTotal": 15528.54, "priceUsdUnit": 211.92, "priceJpyUnit": 33048.92209, "valueJpy": 33048.92209, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:IBB", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSEARCA", "ticker": "HDV", "name": "iShares Core High Dividend ETF", "qty": 1.0, "avgJpyTotal": 9865.48, "priceUsdUnit": 29.4, "priceJpyUnit": 4584.929735, "valueJpy": 4584.929735, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:HDV", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 1.0, "avgJpyTotal": 15454.46, "priceUsdUnit": 82.21, "priceJpyUnit": 12820.64876, "valueJpy": 12820.64876, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "米国債", "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 1.0, "avgJpyTotal": 13647, "priceUsdUnit": 82.21, "priceJpyUnit": 12820.64876, "valueJpy": 12820.64876, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "米国債", "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSEARCA", "ticker": "GLD", "name": "SPDR Gold Trust", "qty": 1.0, "avgJpyTotal": 18701.34, "priceUsdUnit": 406.77, "priceJpyUnit": 63435.77784, "valueJpy": 63435.77784, "assetCat": "ｺﾓﾃﾞｨﾃｨ", "stockType": null, "commodityType": "貴金属", "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:GLD", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NASDAQ", "ticker": "BND", "name": "Vanguard Total Bond Market Index Fund ETF", "qty": 1.0, "avgJpyTotal": 10235.96, "priceUsdUnit": 71.95, "priceJpyUnit": 11220.60185, "valueJpy": 11220.60185, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "米国債", "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:BND", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSEARCA", "ticker": "DBA", "name": "Invesco DB Agriculture Fund", "qty": 1.0, "avgJpyTotal": 1727.96, "priceUsdUnit": 28.85, "priceJpyUnit": 4499.15724, "valueJpy": 4499.15724, "assetCat": "ｺﾓﾃﾞｨﾃｨ", "stockType": null, "commodityType": "農作物", "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:DBA", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSEARCA", "ticker": "EIDO", "name": "iShares MSCI Indonesia ETF", "qty": 1.0, "avgJpyTotal": 2356.46, "priceUsdUnit": 13.06, "priceJpyUnit": 2036.706882, "valueJpy": 2036.706882, "assetCat": "株式", "stockType": "新興国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:EIDO", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSEARCA", "ticker": "EPI", "name": "WisdomTree India Earnings Fund", "qty": 1.0, "avgJpyTotal": 3498.33, "priceUsdUnit": 43.34, "priceJpyUnit": 6758.87261, "valueJpy": 6758.87261, "assetCat": "株式", "stockType": "新興国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:EPI", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NASDAQ", "ticker": "VCIT", "name": "Vanguard Intermediate-Term Corp Bond Idx Fund ETF", "qty": 1.0, "avgJpyTotal": 0, "priceUsdUnit": 80.53, "priceJpyUnit": 12558.65278, "valueJpy": 12558.65278, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "社債", "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:VCIT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSEARCA", "ticker": "VWO", "name": "Vanguard Emerging Markets Stock Index Fund ETF", "qty": 1.0, "avgJpyTotal": 0, "priceUsdUnit": 61.44, "priceJpyUnit": 9581.567447, "valueJpy": 9581.567447, "assetCat": "株式", "stockType": "新興国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:VWO", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSEARCA", "ticker": "AFK", "name": "VanEck Africa Index ETF", "qty": 1.0, "avgJpyTotal": 2443.3, "priceUsdUnit": 29.78, "priceJpyUnit": 4644.190732, "valueJpy": 4644.190732, "assetCat": "株式", "stockType": "新興国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:AFK", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "NYSE", "ticker": "HES", "name": "#N/A", "qty": 1.0, "avgJpyTotal": 11048.92, "priceUsdUnit": null, "priceJpyUnit": 0, "valueJpy": 0, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "個別銘柄", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSE:HES", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "TYO", "ticker": 1628.0, "name": "TYO:1628", "qty": 1.0, "avgJpyTotal": 14323.18, "priceUsdUnit": 21285.0, "priceJpyUnit": 21285, "valueJpy": 21285, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:1628.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "TYO", "ticker": 1628.0, "name": "TYO:1628", "qty": 1.0, "avgJpyTotal": 43247, "priceUsdUnit": 118500.0, "priceJpyUnit": 118500, "valueJpy": 118500, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:1628.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "TYO", "ticker": 2288.0, "name": "TYO:2288", "qty": 1.0, "avgJpyTotal": 1691.78, "priceUsdUnit": 2200.0, "priceJpyUnit": 2200, "valueJpy": 2200, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2288.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "TYO", "ticker": 1655.0, "name": "TYO:1655", "qty": 1.0, "avgJpyTotal": 660, "priceUsdUnit": 843.3, "priceJpyUnit": 843.3, "valueJpy": 843.3, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:1655.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "TYO", "ticker": 2222.0, "name": "TYO:2222", "qty": 1.0, "avgJpyTotal": 2190, "priceUsdUnit": 1983.5, "priceJpyUnit": 1983.5, "valueJpy": 1983.5, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2222.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "TYO", "ticker": 3139.0, "name": "TYO:3139", "qty": 1.0, "avgJpyTotal": 2980, "priceUsdUnit": 3210.0, "priceJpyUnit": 3210, "valueJpy": 3210, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:3139.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "TYO", "ticker": 4967.0, "name": "TYO:4967", "qty": 1.0, "avgJpyTotal": 5885, "priceUsdUnit": 5515.0, "priceJpyUnit": 5515, "valueJpy": 5515, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:4967.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "TYO", "ticker": 7202.0, "name": "TYO:7202", "qty": 1.0, "avgJpyTotal": 2029, "priceUsdUnit": 2163.0, "priceJpyUnit": 2163, "valueJpy": 2163, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:7202.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "TYO", "ticker": 9003.0, "name": "TYO:9003", "qty": 1.0, "avgJpyTotal": 2438, "priceUsdUnit": 2422.0, "priceJpyUnit": 2422, "valueJpy": 2422, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:9003.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "TYO", "ticker": 3281.0, "name": "TYO:3281", "qty": 1.0, "avgJpyTotal": 2438, "priceUsdUnit": 133700.0, "priceJpyUnit": 133700, "valueJpy": 133700, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:3281.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "TYO", "ticker": 2621.0, "name": "TYO:2621", "qty": 1.0, "avgJpyTotal": 1140, "priceUsdUnit": 1050.0, "priceJpyUnit": 1050, "valueJpy": 1050, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "米国債", "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2621.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "TYO", "ticker": 2621.0, "name": "TYO:2621", "qty": 1.0, "avgJpyTotal": 1140, "priceUsdUnit": 1050.0, "priceJpyUnit": 1050, "valueJpy": 1050, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "米国債", "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2621.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "TYO", "ticker": 2621.0, "name": "TYO:2621", "qty": 1.0, "avgJpyTotal": 1140, "priceUsdUnit": 1050.0, "priceJpyUnit": 1050, "valueJpy": 1050, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "米国債", "instrumentType": "個別銘柄", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2621.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "", "ticker": "eMAXIS 国内TPX", "name": "eMAXIS 国内TPX", "qty": 1.0, "avgJpyTotal": 10183, "priceUsdUnit": 31175.0, "priceJpyUnit": 31175, "valueJpy": 3061774.0, "assetCat": "株式", "stockType": "国内", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS 国内TPX", "qtyMode": "nav10000", "unitsImplied": 982124.7794707296, "lastUpdated": null}, {"account": "", "exchange": "", "ticker": "eMAXIS 先進国", "name": "eMAXIS 先進国", "qty": 1.0, "avgJpyTotal": 18232, "priceUsdUnit": 43436.0, "priceJpyUnit": 43436, "valueJpy": 17269788.0, "assetCat": "株式", "stockType": "先進国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS 先進国", "qtyMode": "nav10000", "unitsImplied": 3975915.8301869417, "lastUpdated": null}, {"account": "NISA", "exchange": "", "ticker": "eMAXIS 米国", "name": "eMAXIS 米国", "qty": 1.0, "avgJpyTotal": 18635, "priceUsdUnit": null, "priceJpyUnit": null, "valueJpy": 0, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": false, "searchLabel": null, "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "", "ticker": "eMAXIS 米国", "name": "eMAXIS 米国", "qty": 1.0, "avgJpyTotal": 33326, "priceUsdUnit": 42853.0, "priceJpyUnit": 42853, "valueJpy": 821320.0, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS 米国", "qtyMode": "nav10000", "unitsImplied": 191659.86045317713, "lastUpdated": null}, {"account": "NISA", "exchange": "", "ticker": "eMAXIS 先進国", "name": "eMAXIS 先進国", "qty": 1.0, "avgJpyTotal": 10764, "priceUsdUnit": null, "priceJpyUnit": null, "valueJpy": 0, "assetCat": "株式", "stockType": "先進国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": false, "searchLabel": null, "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA", "exchange": "", "ticker": "SP500", "name": "SP500", "qty": 1.0, "avgJpyTotal": 2.7906, "priceUsdUnit": 3.9775, "priceJpyUnit": 3.9775, "valueJpy": 3.9775, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": true, "searchLabel": "SP500", "qtyMode": "nav10000", "unitsImplied": 10000.0, "lastUpdated": null}, {"account": "NISA", "exchange": "", "ticker": "SP500", "name": "SP500", "qty": 1.0, "avgJpyTotal": 1.5078, "priceUsdUnit": 3.9775, "priceJpyUnit": 3.9775, "valueJpy": 3.9775, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": true, "searchLabel": "SP500", "qtyMode": "nav10000", "unitsImplied": 10000.0, "lastUpdated": null}, {"account": "NISA", "exchange": "", "ticker": "eMAXIS 米国", "name": "eMAXIS 米国", "qty": 1.0, "avgJpyTotal": 2.9867, "priceUsdUnit": 4.3497, "priceJpyUnit": 4.3497, "valueJpy": 4.3497, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS 米国", "qtyMode": "nav10000", "unitsImplied": 10000.0, "lastUpdated": null}, {"account": "NISA", "exchange": "", "ticker": "eMAXIS オルカン", "name": "eMAXIS オルカン", "qty": 1.0, "avgJpyTotal": 3.454, "priceUsdUnit": 3.7227, "priceJpyUnit": 3.7227, "valueJpy": 3.7227, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS オルカン", "qtyMode": "nav10000", "unitsImplied": 10000.0, "lastUpdated": null}, {"account": "NISA", "exchange": "", "ticker": "eMAXIS オルカン", "name": "eMAXIS オルカン", "qty": 1.0, "avgJpyTotal": 3.454, "priceUsdUnit": 3.7227, "priceJpyUnit": 3.7227, "valueJpy": 3.7227, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS オルカン", "qtyMode": "nav10000", "unitsImplied": 10000.0, "lastUpdated": null}, {"account": "NISA-j", "exchange": "NYSEARCA", "ticker": "SPY", "name": "State Street SPDR S&P 500 ETF Trust", "qty": 1.0, "avgJpyTotal": 3577.25, "priceUsdUnit": 770.19, "priceJpyUnit": 120111.1236, "valueJpy": 120111.1236, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:SPY", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA-j", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 1.0, "avgJpyTotal": 13647, "priceUsdUnit": 82.21, "priceJpyUnit": 12820.64876, "valueJpy": 12820.64876, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "米国債", "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA-j", "exchange": "NYSEARCA", "ticker": "SPY", "name": "State Street SPDR S&P 500 ETF Trust", "qty": 1.0, "avgJpyTotal": 3577.25, "priceUsdUnit": 770.19, "priceJpyUnit": 120111.1236, "valueJpy": 120111.1236, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:SPY", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA-j", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 1.0, "avgJpyTotal": 13647, "priceUsdUnit": 82.21, "priceJpyUnit": 12820.64876, "valueJpy": 12820.64876, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "米国債", "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA-j", "exchange": "NYSEARCA", "ticker": "SPY", "name": "State Street SPDR S&P 500 ETF Trust", "qty": 1.0, "avgJpyTotal": 3577.25, "priceUsdUnit": 770.19, "priceJpyUnit": 120111.1236, "valueJpy": 120111.1236, "assetCat": "株式", "stockType": "米国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:SPY", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "NISA-j", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 1.0, "avgJpyTotal": 13647, "priceUsdUnit": 82.21, "priceJpyUnit": 12820.64876, "valueJpy": 12820.64876, "assetCat": "債権", "stockType": null, "commodityType": null, "bondType": "米国債", "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "", "ticker": "BTC", "name": "BTC", "qty": 1.0, "avgJpyTotal": 2000000, "priceUsdUnit": 12479532.77, "priceJpyUnit": 12479532.77, "valueJpy": 12479532.77, "assetCat": "ｺﾓﾃﾞｨﾃｨ", "stockType": null, "commodityType": "仮想通貨", "bondType": null, "instrumentType": "仮想通貨", "currency": "円建", "autoFetchable": true, "searchLabel": "BTC", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "", "ticker": "ETH", "name": "ETH", "qty": 1.0, "avgJpyTotal": 1000000, "priceUsdUnit": 389673.4107, "priceJpyUnit": 389673.4107, "valueJpy": 389673.4107, "assetCat": "ｺﾓﾃﾞｨﾃｨ", "stockType": null, "commodityType": "仮想通貨", "bondType": null, "instrumentType": "仮想通貨", "currency": "円建", "autoFetchable": true, "searchLabel": "ETH", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "", "exchange": "", "ticker": "", "name": "iDeco", "qty": 1.0, "avgJpyTotal": 0, "priceUsdUnit": 1600000.0, "priceJpyUnit": 1600000, "valueJpy": 1600000, "assetCat": "株式", "stockType": "先進国", "commodityType": null, "bondType": null, "instrumentType": "投信", "currency": "円建", "autoFetchable": true, "searchLabel": "iDeco", "qtyMode": "nav10000", "unitsImplied": 10000.0, "lastUpdated": null}, {"account": "", "exchange": "", "ticker": "ちゃいかぶ", "name": "ちゃいかぶ", "qty": 1.0, "avgJpyTotal": 1000000, "priceUsdUnit": 2540000.0, "priceJpyUnit": 2540000, "valueJpy": 2540000, "assetCat": "株式", "stockType": "新興国", "commodityType": null, "bondType": null, "instrumentType": "ETF", "currency": "ドル建", "autoFetchable": false, "searchLabel": null, "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}]}, "cash": [{"bank": "口座1", "amount": 4000000}, {"bank": "口座2", "amount": 100000}, {"bank": "口座3", "amount": 1313714}, {"bank": "口座4", "amount": 6730000}, {"bank": "口座5", "amount": 2260000}, {"bank": "口座6", "amount": 4568000}, {"bank": "口座7", "amount": 1642000}, {"bank": "口座8", "amount": 1476000}, {"bank": "口座9", "amount": 600000}, {"bank": "口座10", "amount": 600000}, {"bank": "口座11", "amount": 600000}], "init": {"securities0": 38000.0, "cash0": 17000.0}};

/* ============================================================
   デザイントークン — 「帳簿（家計簿）」モチーフ
   黒字＝墨色 / 赤字＝朱色 という和式帳簿の伝統的な色分けを基調に
   ============================================================ */
const INK = "#20304B";
const INK_SOFT = "#5A6B85";
const PAPER = "#FAF7F0";
const PAPER_LINE = "#E4DCC8";
const SEAL = "#B5372A";
const SEAL_SOFT = "#F6E6E2";
const SUMI = "#1F5C4E";
const SUMI_SOFT = "#E4EEE9";
const GOLD = "#B8892B";
const GOLD_SOFT = "#F3E9D4";
const CARD = "#FFFFFF";

const CAT_COLORS = {
  tuition: "#5B7FA6",
  medical: "#8E6BA6",
  housing: "#B8892B",
  car: "#4A8FA8",
  living: "#6B9B6E",
  social: "#C77B4F",
  leisure: "#5CA0A0",
  other: "#8A8577",
  sudden: "#B5372A",
};

// YEARS は「開始年」変更時にその場で書き換える（中身を差し替えるだけで、
// 期間の長さ N は常に固定。以後 YEARS を読むコードはすべて新しい年に追従する）
let YEARS = [...RAW.sim.years];
const N = YEARS.length;
const zeros = () => new Array(N).fill(0);
const clone = (o) => JSON.parse(JSON.stringify(o));

/* 開始年の変更にあわせて、実年に紐づく年別配列（学費・収入など）だけを
   シフトする。家族メモ・住宅ローン金利の上書き・年次スナップショットは
   もともと実年（西暦）をキーにしたオブジェクトなので触らなくてよい。 */
function shiftYearArrays(node, shift) {
  if (Array.isArray(node)) {
    if (node.length !== N) return node;
    const shifted = zeros();
    for (let i = 0; i < N; i++) {
      const srcIdx = i + shift;
      shifted[i] = srcIdx >= 0 && srcIdx < N ? (node[srcIdx] ?? 0) : 0;
    }
    return shifted;
  }
  if (node && typeof node === "object") {
    const out = {};
    for (const k of Object.keys(node)) out[k] = shiftYearArrays(node[k], shift);
    return out;
  }
  return node;
}
function fillForward(arr, i, v) {
  for (let k = i; k < arr.length; k++) arr[k] = v;
}
const NO_CASCADE_PATHS = new Set(["other", "sudden"]);

function fmt(n, digits = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  const v = Math.round(n * 10 ** digits) / 10 ** digits;
  return v.toLocaleString("ja-JP", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
const fmtMan = (n) => fmt(n) + " 万円";
const fmtYen = (n) => "¥" + fmt(n);

// 食費を家族一人ずつ（父・母・子1〜3）ではなく世帯でまとめて1行にする移行処理。
// 既にlivingにfoodがある場合は何もしない。
function migrateSimFoodFields(sim) {
  const living = sim?.expense?.living;
  if (!living || living.food) return sim;
  const oldKeys = ["food_father", "food_mother", "food_child1", "food_child2", "food_child3"];
  if (!oldKeys.some((k) => living[k])) return sim;
  const next = clone(sim);
  const nl = next.expense.living;
  const food = zeros();
  oldKeys.forEach((k) => {
    const arr = nl[k];
    if (arr) for (let i = 0; i < N; i++) food[i] += arr[i] || 0;
    delete nl[k];
  });
  nl.food = food;
  return next;
}

// 家計簿の紐付けが旧・家族別食費項目を指していた場合、統合後の項目に付け替える
function migrateLedgerLinks(ledger) {
  if (!ledger?.categories) return ledger;
  const renameMap = {
    "living.food_father": "living.food", "living.food_mother": "living.food",
    "living.food_child1": "living.food", "living.food_child2": "living.food", "living.food_child3": "living.food",
  };
  let changed = false;
  const categories = ledger.categories.map((c) => {
    if (c.linkPath && renameMap[c.linkPath]) { changed = true; return { ...c, linkPath: renameMap[c.linkPath] }; }
    return c;
  });
  return changed ? { ...ledger, categories } : ledger;
}

function defaultSimState() { return migrateSimFoodFields({ ...clone(RAW.sim), wizardTouched: [] }); }
function defaultPortfolioState() { return clone(RAW.portfolio.holdings); }
function defaultCashState() { return clone(RAW.cash); }

function defaultFamilyState() {
  return [
    { id: "father", label: "父", group: "parent", birthYear: null, custom: false, memos: {} },
    { id: "mother", label: "母", group: "parent", birthYear: null, custom: false, memos: {} },
    { id: "child1", label: "子1", group: "child", birthYear: null, custom: false, memos: {} },
    { id: "child2", label: "子2", group: "child", birthYear: null, custom: false, memos: {} },
    { id: "child3", label: "子3", group: "child", birthYear: null, custom: false, memos: {} },
    { id: "gfather_p", label: "父方祖父", group: "grandparent", birthYear: null, custom: false, memos: {} },
    { id: "gmother_p", label: "父方祖母", group: "grandparent", birthYear: null, custom: false, memos: {} },
    { id: "gfather_m", label: "母方祖父", group: "grandparent", birthYear: null, custom: false, memos: {} },
    { id: "gmother_m", label: "母方祖母", group: "grandparent", birthYear: null, custom: false, memos: {} },
  ];
}

/* 生年から人生の各ステージ（進学・高齢期など）を計算する
   ※ 生年（年）のみを使った簡易計算。実際の誕生月によっては前後1年ずれる場合がある */
function stagesFor(member, yearsRange) {
  const [minY, maxY] = yearsRange;
  const clip = (s, e) => ({ start: Math.max(s, minY), end: Math.min(e, maxY) });
  const by = member.birthYear;
  if (by == null) return [];
  if (member.group === "child") {
    const raw = [
      { label: "未就学", start: by, end: by + 5, color: "#D8CFC0" },
      { label: "小学校", start: by + 6, end: by + 11, color: "#6B9B6E" },
      { label: "中学校", start: by + 12, end: by + 14, color: "#4A8FA8" },
      { label: "高校", start: by + 15, end: by + 17, color: "#5B7FA6" },
      { label: "大学(4年制想定)", start: by + 18, end: by + 21, color: "#B8892B" },
      { label: "社会人", start: by + 22, end: by + 100, color: "#E4DCC8" },
    ];
    return raw.map((s) => ({ ...s, ...clip(s.start, s.end) })).filter((s) => s.end >= minY && s.start <= maxY);
  }
  // 親・祖父母・その他：年齢帯で色分け（後期高齢者は医療費と連動する想定）
  const raw = [
    { label: "〜64歳", start: by, end: by + 64, color: "#E4EEE9" },
    { label: "前期高齢者(65-74)", start: by + 65, end: by + 74, color: "#F3E9D4" },
    { label: "後期高齢者(75〜)", start: by + 75, end: by + 105, color: "#F6E6E2" },
  ];
  return raw.map((s) => ({ ...s, ...clip(s.start, s.end) })).filter((s) => s.end >= minY && s.start <= maxY);
}

function milestonesFor(member) {
  const by = member.birthYear;
  if (by == null || member.group !== "child") return [];
  return [
    { label: "小学校入学", year: by + 6 },
    { label: "中学校入学", year: by + 12 },
    { label: "高校入学", year: by + 15 },
    { label: "高校卒業", year: by + 18 },
    { label: "大学入学", year: by + 18 },
    { label: "大学卒業(4年制)", year: by + 22 },
  ];
}

/* 生年から、学年・受験などのデフォルトメモを自動生成する
   （初期設定時に一度だけ埋め込まれ、以後は自由に上書き編集できる） */
function generateChildMemos(by) {
  const m = {};
  for (let g = 1; g <= 6; g++) m[by + 5 + g] = `小${g}`;
  m[by + 12] = "中1"; m[by + 13] = "中2"; m[by + 14] = "中3(受験)";
  m[by + 15] = "高1"; m[by + 16] = "高2"; m[by + 17] = "高3(受験)";
  m[by + 18] = "大1"; m[by + 19] = "大2"; m[by + 20] = "大3"; m[by + 21] = "大4";
  return m;
}
function generateAdultMemos(by) {
  const m = {};
  m[by + 65] = "前期高齢者";
  m[by + 75] = "後期高齢者";
  return m;
}
function generateMemosFor(member, birthYear) {
  if (birthYear == null) return {};
  return member.group === "child" ? generateChildMemos(birthYear) : generateAdultMemos(birthYear);
}

function defaultParamsState() {
  return {
    ...clone(RAW.sim.params),
    includeRealEstate: RAW.sim.params.realEstateFlag === "" || RAW.sim.params.realEstateFlag === "含",
    securities0: RAW.init.securities0,
    cash0: RAW.init.cash0,
    fxRate: RAW.portfolio.usdjpy || 150,
    simStartYear: RAW.sim.years[0],
    wageGrowthRate: 0,
    downPayment: 0,
    housingSubsidyAnnual: 0,
    housingPlanEnabled: false,
    housingPlanAcquisitionType: "buy",
    housingPlanPropertyType: "house",
    housingPlanCondition: "new",
    housingPlanPurchaseYear: new Date().getFullYear(),
    housingPlanPrice: 0,
    housingPlanDownPayment: 0,
    housingPlanRate: 0.01,
    housingPlanRateIncrease: 0,
    housingPlanRateCap: 0.05,
    housingPlanRepaymentMode: "fixed",
    housingPlanTermYears: 35,
    housingPlanOtherAnnual: 0,
    housingPlanRateOverrides: {},
    housingPlanRentMonthly: 0,
    housingPlanRentEscalation: 0,
    housingPlanMoveEnabled: false,
    housingPlanMoveAcquisitionType: "buy",
    housingPlanMoveYear: new Date().getFullYear() + 10,
    housingPlanMoveSaleProceeds: 0,
    housingPlanMovePropertyType: "condo",
    housingPlanMoveCondition: "new",
    housingPlanMovePrice: 0,
    housingPlanMoveDownPayment: 0,
    housingPlanMoveRate: 0.01,
    housingPlanMoveRateIncrease: 0,
    housingPlanMoveRateCap: 0.05,
    housingPlanMoveRepaymentMode: "fixed",
    housingPlanMoveTermYears: 30,
    housingPlanMoveOtherAnnual: 0,
    housingPlanMoveRateOverrides: {},
    housingPlanMoveRentMonthly: 0,
    housingPlanMoveRentEscalation: 0,
  };
}

/* ============================================================
   価格自動取得（準備中）
   Claude.aiアーティファクト専用のweb検索ツール経由の取得方式は
   独立アプリでは動作しないため、本物の金融データAPI（yfinance/
   CoinGecko等）に置き換えるまでの間、明示的に「準備中」を返す。
   ============================================================ */
async function callClaudeWithSearch(promptText) {
  throw new Error("価格の自動取得は現在準備中です（次のステップで本物の金融データAPIに置き換えます）。今は手入力をご利用ください。");
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ============================================================
   指定日時点での保有銘柄の価格を取得する共通ロジック
   （ポートフォリオタブ／資産集計タブの両方から利用）
   ============================================================ */
async function fetchPricesAsOf(dateStr, holdings, fallbackFx, onStatus) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const isHistorical = dateStr !== todayStr;
  let fxRate = fallbackFx;

  onStatus?.(isHistorical ? `${dateStr}時点の為替レートを取得中…` : "現在の為替レートを取得中…");
  try {
    const fxPrompt = isHistorical
      ? `Search the web for the historical USD/JPY exchange rate on ${dateStr} (use the closing rate on that date, or the nearest prior business day if markets were closed). Respond with ONLY JSON, no prose, no markdown fences: {"usdjpy": <number>, "dateUsed": "YYYY-MM-DD"}`
      : 'Search the web for today\'s current USD/JPY exchange rate. Respond with ONLY JSON, no prose, no markdown fences: {"usdjpy": <number>}';
    const fx = await callClaudeWithSearch(fxPrompt);
    if (fx && typeof fx.usdjpy === "number") fxRate = fx.usdjpy;
  } catch (e) { /* keep fallback fx */ }

  const targets = holdings.map((h, idx) => ({ ...h, idx })).filter((h) => h.autoFetchable && h.searchLabel);
  const batches = chunk(targets, 8);
  const valueMap = {};
  let updated = 0, failed = 0;

  for (let b = 0; b < batches.length; b++) {
    onStatus?.(`${isHistorical ? dateStr + "時点の" : ""}銘柄価格を取得中… (${b + 1}/${batches.length})`);
    const batch = batches[b];
    const list = batch.map((h) => {
      const tag = h.qtyMode === "nav10000" ? "[投資信託・基準価額を1万口あたりで]" : "[個別銘柄/ETF・1株あたりの価格]";
      return `i=${h.idx}: ${tag} ${h.searchLabel}`;
    }).join("\n");
    const prompt = isHistorical
      ? `Use web search (historical price data pages such as Yahoo Finance historical prices, stooq, Japanese fund NAV history pages, or similar) to find the CLOSING price/NAV on ${dateStr} for each of these items (use the nearest prior trading/business day if closed on that exact date). For items tagged [投資信託], find the 基準価額 (NAV) per 10,000 units in JPY. For items tagged [個別銘柄/ETF], find the per-share closing price:\n${list}\n\nRespond with ONLY a JSON array, no prose, no markdown fences, in this exact format:\n[{"i":<index number>,"price":<price as a plain number>,"currency":"USD" or "JPY","asOf":"<actual date used, YYYY-MM-DD>"}]\nIf a price cannot be found for an item, omit it from the array.`
      : `Use web search to find the current/latest price for each of these items. For items tagged [投資信託], find the current 基準価額 (NAV) per 10,000 units in JPY. For items tagged [個別銘柄/ETF], find the current per-share price:\n${list}\n\nRespond with ONLY a JSON array, no prose, no markdown fences, in this exact format:\n[{"i":<index number>,"price":<price as a plain number>,"currency":"USD" or "JPY","asOf":"<date found, YYYY-MM-DD>"}]\nIf a price cannot be found for an item, omit it from the array.`;
    try {
      const results = await callClaudeWithSearch(prompt);
      if (Array.isArray(results)) {
        results.forEach((r) => {
          const idx = r.i;
          const h = holdings[idx];
          if (typeof idx !== "number" || !h || typeof r.price !== "number") return;
          let valueJpy;
          if (h.qtyMode === "nav10000") {
            valueJpy = ((h.unitsImplied || 0) / 10000) * r.price;
          } else if (r.currency === "USD") {
            valueJpy = h.qty * r.price * fxRate;
          } else {
            valueJpy = h.qty * r.price;
          }
          valueMap[idx] = { valueJpy, price: r.price, currency: r.currency, asOf: r.asOf || dateStr };
          updated++;
        });
      }
    } catch (e) {
      failed += batch.length;
    }
  }
  return { fxRate, valueMap, updated, failed };
}

/* ============================================================
   再計算エンジン：元のワークブックの年次カスケード式を再現
   （各年の値が前年の値に依存する構造）
   ============================================================ */
function sumArrAt(obj, keys, i) {
  let s = 0;
  for (const k of keys) s += (obj[k]?.[i] ?? 0);
  return s;
}

/* ============================================================
   住宅ローン試算プラン（費用ウィザードの「住宅」から設定）
   購入・住み替えを、価格/頭金/金利/返済方式から年別に計算する。
   既存の housing_opt1〜4 の実績配列とは独立した計算経路。
   ============================================================ */
function calcAnnuityPayment(principal, rate, years) {
  if (years <= 0) return principal;
  if (rate === 0) return principal / years;
  return (principal * rate) / (1 - Math.pow(1 + rate, -years));
}

function computeHousingPlan(params) {
  const housingCost = zeros(), loanBalance = zeros(), realEstateAsset = zeros(), rateArr = zeros();
  const purchaseIdx = YEARS.indexOf(params.housingPlanPurchaseYear);
  const moveIdx = params.housingPlanMoveEnabled ? YEARS.indexOf(params.housingPlanMoveYear) : -1;
  // 開始年より前に購入している場合、購入年の実インデックスは負になる
  // （＝一覧には出ない過去の年から、途中経過のローン残高で始まる）
  const purchaseIdxReal = (params.housingPlanPurchaseYear ?? YEARS[0]) - YEARS[0];
  let regime = null;
  let prevBal = 0, prevRate = 0;

  const startBuyRegime = (startIdx, price, downPayment, rate, rateIncrease, rateCap, mode, term, otherAnnual, overrides) => {
    regime = { type: "buy", startIdx, price, rateIncrease: rateIncrease || 0, rateCap: rateCap || 1, mode, term, otherAnnual: otherAnnual || 0, overrides: overrides || {} };
    prevBal = Math.max(0, (price || 0) - (downPayment || 0));
    prevRate = Math.min(regime.rateCap, regime.overrides[YEARS[0] + startIdx] ?? (rate || 0));
    regime.fixedPayment = calcAnnuityPayment(prevBal, prevRate, term || 1);
  };
  const startRentRegime = (startIdx, rentMonthly, rentEscalation, otherAnnual) => {
    regime = { type: "rent", startIdx, rentAnnual: (rentMonthly || 0) * 12, rentEscalation: rentEscalation || 0, otherAnnual: otherAnnual || 0 };
    prevBal = 0; prevRate = 0;
  };
  // 1年分、残高・金利を進める（表示範囲外の「助走」計算にも使う）
  const advanceStep = (i) => {
    const yrsSince = i - regime.startIdx;
    if (regime.type === "rent") {
      prevBal = 0; prevRate = 0;
      return regime.rentAnnual * Math.pow(1 + regime.rentEscalation, yrsSince) + regime.otherAnnual;
    }
    const hasOverride = regime.overrides[YEARS[0] + i] !== undefined;
    const naturalRate = regime.mode === "variable" ? prevRate + regime.rateIncrease : prevRate;
    const currentRate = Math.min(regime.rateCap, hasOverride ? regime.overrides[YEARS[0] + i] : naturalRate);
    const interest = prevBal * currentRate;
    if (regime.mode === "fixed" && hasOverride) {
      regime.fixedPayment = calcAnnuityPayment(prevBal, currentRate, Math.max(1, regime.term - yrsSince));
    }
    const payment = regime.mode === "variable"
      ? calcAnnuityPayment(prevBal, currentRate, Math.max(1, regime.term - yrsSince))
      : regime.fixedPayment;
    const nextBal = Math.max(0, prevBal - (payment - interest));
    prevRate = currentRate;
    prevBal = nextBal;
    return payment + regime.otherAnnual;
  };

  if (params.housingPlanAcquisitionType !== "rent" && purchaseIdxReal < 0) {
    startBuyRegime(purchaseIdxReal, params.housingPlanPrice, params.housingPlanDownPayment, params.housingPlanRate,
      params.housingPlanRateIncrease, params.housingPlanRateCap, params.housingPlanRepaymentMode, params.housingPlanTermYears,
      params.housingPlanOtherAnnual, params.housingPlanRateOverrides);
    for (let vi = purchaseIdxReal + 1; vi < 0; vi++) advanceStep(vi);
  }

  for (let i = 0; i < N; i++) {
    if (i === purchaseIdx) {
      if (params.housingPlanAcquisitionType === "rent") {
        startRentRegime(i, params.housingPlanRentMonthly, params.housingPlanRentEscalation, params.housingPlanOtherAnnual);
      } else {
        startBuyRegime(i, params.housingPlanPrice, params.housingPlanDownPayment, params.housingPlanRate,
          params.housingPlanRateIncrease, params.housingPlanRateCap, params.housingPlanRepaymentMode, params.housingPlanTermYears,
          params.housingPlanOtherAnnual, params.housingPlanRateOverrides);
      }
      loanBalance[i] = prevBal;
      rateArr[i] = prevRate;
      housingCost[i] = (regime.type === "rent" ? regime.rentAnnual : regime.fixedPayment) + regime.otherAnnual;
      realEstateAsset[i] = params.includeRealEstate ? (regime.price || 0) - prevBal : 0;
      continue;
    }
    if (i === moveIdx) {
      const saleProceeds = params.housingPlanAcquisitionType === "rent" ? 0 : (params.housingPlanMoveSaleProceeds || 0);
      let cashEffect;
      if (params.housingPlanMoveAcquisitionType === "rent") {
        cashEffect = -saleProceeds;
        startRentRegime(i, params.housingPlanMoveRentMonthly, params.housingPlanMoveRentEscalation, params.housingPlanMoveOtherAnnual);
      } else {
        cashEffect = (params.housingPlanMoveDownPayment || 0) - saleProceeds;
        startBuyRegime(i, params.housingPlanMovePrice, params.housingPlanMoveDownPayment, params.housingPlanMoveRate,
          params.housingPlanMoveRateIncrease, params.housingPlanMoveRateCap, params.housingPlanMoveRepaymentMode, params.housingPlanMoveTermYears,
          params.housingPlanMoveOtherAnnual, params.housingPlanMoveRateOverrides);
      }
      loanBalance[i] = prevBal;
      rateArr[i] = prevRate;
      housingCost[i] = (regime.type === "rent" ? regime.rentAnnual : regime.fixedPayment) + regime.otherAnnual + cashEffect;
      realEstateAsset[i] = params.includeRealEstate ? (regime.price || 0) - prevBal : 0;
      continue;
    }
    if (!regime || i < regime.startIdx) continue;
    housingCost[i] = advanceStep(i);
    loanBalance[i] = prevBal;
    rateArr[i] = prevRate;
    realEstateAsset[i] = params.includeRealEstate ? (regime.price || 0) - prevBal : 0;
  }
  return { housingCost, loanBalance, realEstateAsset, rateArr };
}

function computeModel(sim, params) {
  const exp = sim.expense;
  const inc = sim.income;

  const tuitionKeys = ["child1", "child1_extra", "child2", "child2_extra", "child3", "child3_extra"];
  const medicalKeys = ["us", "gfather_p", "gmother_p", "gfather_m", "gmother_m"];
  const carKeys = ["body", "parking", "gas", "insurance", "tax", "inspection", "other"];
  const livingKeys = ["food", "utilities", "communication", "daily_goods"];

  const tuition = zeros(), medical = zeros(), carTotal = zeros(), livingTotal = zeros();
  let housingCost = zeros(), loanBalance = zeros(), loanInterest = zeros();
  const buildingVal = zeros(), landVal = zeros(), saleEstimate = zeros();
  let realEstateAsset = zeros();

  // この既定シナリオの購入年は実年2021年に固定（開始年を変えても購入年自体は動かない）。
  // 開始年を2021年より後にずらすと購入時点が表示範囲外になるため、その場合は
  // 表示範囲の最初の年の返済額がずっと続いていたとみなして残高を簡易的に遡り計算する。
  const HOUSE_PURCHASE_YEAR = 2021;
  const houseStartIdx = HOUSE_PURCHASE_YEAR - YEARS[0];
  let houseWarmBal = Math.max(0, params.loanInitial - (params.downPayment || 0));
  if (houseStartIdx < 0) {
    const approxPayment = exp.housing_opt1_loanPayment[0] ?? 0;
    // i===0（配列の最初の可視年）でさらに1回分の返済が適用されるため、
    // ここでは「最初の可視年の前年末時点」まで（1回少なく）進めておく
    for (let vi = houseStartIdx; vi < -1; vi++) {
      const interest = houseWarmBal * params.loanRate;
      houseWarmBal = Math.max(0, houseWarmBal - (approxPayment - interest));
    }
  }
  const AMORT_YEARS = 22;
  const housingPlan = params.housingPlanEnabled ? computeHousingPlan(params) : null;
  if (housingPlan) {
    housingCost = housingPlan.housingCost;
    loanBalance = housingPlan.loanBalance;
    realEstateAsset = housingPlan.realEstateAsset;
  }

  for (let i = 0; i < N; i++) {
    tuition[i] = sumArrAt(exp.tuition, tuitionKeys, i);
    medical[i] = sumArrAt(exp.medical, medicalKeys, i);
    carTotal[i] = sumArrAt(exp.car, carKeys, i);
    livingTotal[i] = sumArrAt(exp.living, livingKeys, i);

    if (housingPlan) {
      housingCost[i] -= (params.housingSubsidyAnnual || 0);
      continue;
    }

    if (params.housingType === 1 && i >= houseStartIdx) {
      const yrsSince = i - houseStartIdx;
      buildingVal[i] = Math.max(0, params.buildingInitial - (params.buildingInitial / AMORT_YEARS) * yrsSince);
      landVal[i] = params.landInitial;
    }

    if (params.housingType === 1) {
      if (i === houseStartIdx) {
        loanBalance[i] = Math.max(0, params.loanInitial - (params.downPayment || 0));
        loanInterest[i] = 0;
      } else if (i > houseStartIdx) {
        const prevBal = i === 0 ? houseWarmBal : loanBalance[i - 1];
        loanInterest[i] = prevBal * params.loanRate;
        const payment = exp.housing_opt1_loanPayment[i] ?? 0;
        loanBalance[i] = Math.max(0, prevBal - (payment - loanInterest[i]));
      }
      saleEstimate[i] = buildingVal[i] + landVal[i] - loanBalance[i];
      const payment = exp.housing_opt1_loanPayment[i] ?? 0;
      const propTax = exp.housing_opt1_propertyTax[i] ?? 0;
      const insurance = exp.housing_opt1_insurance[i] ?? 0;
      const repair = exp.housing_opt1_repair[i] ?? 0;
      const deduction = exp.housing_opt1_loanDeduction[i] ?? 0;
      const downPaymentCost = i === houseStartIdx ? (params.downPayment || 0) : 0;
      housingCost[i] = payment + propTax + insurance + repair - deduction + downPaymentCost;
      realEstateAsset[i] = params.includeRealEstate ? saleEstimate[i] : 0;
    } else if (params.housingType === 2) {
      housingCost[i] = exp.housing_opt2_rent_relocate[i] ?? 0;
    } else if (params.housingType === 3) {
      housingCost[i] = exp.housing_opt3_used_condo[i] ?? 0;
    } else {
      housingCost[i] = exp.housing_opt4_rent_to_condo[i] ?? 0;
    }
    housingCost[i] -= (params.housingSubsidyAnnual || 0);
  }

  const expenseTotal = zeros(), incomeTotal = zeros(), balance = zeros();
  const dividend = zeros(), securities = zeros(), cash = zeros(), assetTotal = zeros();

  for (let i = 0; i < N; i++) {
    expenseTotal[i] = tuition[i] + (exp.dorm[i] ?? 0) + medical[i] + housingCost[i] + carTotal[i] +
      livingTotal[i] + (exp.social[i] ?? 0) + (exp.leisure[i] ?? 0) + (exp.other[i] ?? 0) + (exp.sudden[i] ?? 0);

    dividend[i] = i === 0 ? 0 : securities[i - 1] * params.dividendRate;

    incomeTotal[i] = (inc.father[i] ?? 0) + (inc.mother[i] ?? 0) + (inc.taxRefund[i] ?? 0) +
      dividend[i] + (inc.other_childAllowance[i] ?? 0) + (inc.pension_retirement[i] ?? 0);

    balance[i] = incomeTotal[i] - expenseTotal[i];

    if (i === 0) {
      securities[i] = params.securities0;
      cash[i] = params.cash0;
    } else {
      const cashPrev = cash[i - 1];
      const secPrev = securities[i - 1];
      if (cashPrev + balance[i] < 0) {
        cash[i] = 0;
        securities[i] = (secPrev + cashPrev + balance[i]) * params.growthRate;
      } else {
        cash[i] = cashPrev + balance[i];
        securities[i] = secPrev * params.growthRate;
      }
    }
    assetTotal[i] = securities[i] + cash[i] + realEstateAsset[i];
  }

  return {
    tuition, medical, carTotal, livingTotal, housingCost, loanBalance, loanInterest,
    buildingVal, landVal, saleEstimate, realEstateAsset,
    housingRate: housingPlan ? housingPlan.rateArr : null,
    expenseTotal, incomeTotal, balance, dividend, securities, cash, assetTotal,
  };
}

/* ============================================================
   汎用UIパーツ
   ============================================================ */
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: `2px solid ${INK}`, background: PAPER, position: "sticky", top: 0, zIndex: 30 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            flex: 1,
            padding: "12px 4px 10px",
            border: "none",
            background: active === t.key ? INK : "transparent",
            color: active === t.key ? PAPER : INK_SOFT,
            fontFamily: "'Shippori Mincho', 'Noto Serif JP', serif",
            fontSize: 13.5,
            letterSpacing: "0.05em",
            cursor: "pointer",
            transition: "background .15s",
            borderTopLeftRadius: active === t.key ? 6 : 0,
            borderTopRightRadius: active === t.key ? 6 : 0,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ title, sub, rightSlot }) {
  return (
    <div style={{ padding: "18px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
      <div>
        <h2 style={{
          margin: 0, fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 19,
          color: INK, letterSpacing: "0.03em", borderLeft: `4px solid ${GOLD}`, paddingLeft: 10,
        }}>{title}</h2>
        {sub && <p style={{ margin: "4px 0 0 14px", fontSize: 12.5, color: INK_SOFT }}>{sub}</p>}
      </div>
      {rightSlot && <div style={{ flexShrink: 0 }}>{rightSlot}</div>}
    </div>
  );
}

function RealEstateToggle({ params, setParams }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: INK_SOFT, cursor: "pointer" }}>
      <input type="checkbox" checked={params.includeRealEstate}
        onChange={(e) => setParams((p) => ({ ...p, includeRealEstate: e.target.checked }))} />
      不動産（売却試算額）を総資産に含める
    </label>
  );
}

function StatCard({ label, value, tone = "ink", small }) {
  const color = tone === "seal" ? SEAL : tone === "sumi" ? SUMI : tone === "gold" ? GOLD : INK;
  return (
    <div style={{
      background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 4, padding: "12px 14px",
      flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      <div style={{ fontSize: small ? 14 : 16, fontWeight: 700, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.25, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function NumField({ value, onChange, width = 74, suffix, readOnly }) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type="number"
        value={value === 0 ? 0 : Math.round((value ?? 0) * 100) / 100}
        readOnly={readOnly}
        onChange={readOnly ? undefined : (e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
        style={{
          width, padding: "4px 4px", fontSize: 12.5, textAlign: "right", border: `1px solid ${PAPER_LINE}`,
          borderRadius: 3, fontVariantNumeric: "tabular-nums", color: readOnly ? INK_SOFT : INK,
          background: readOnly ? PAPER : "#FFFDF9",
        }}
      />
    </div>
  );
}

function Accordion({ title, colorKey, defaultOpen, children, rightSlot, onWizard, wizardLabel }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const color = CAT_COLORS[colorKey] || INK;
  return (
    <div style={{ border: `1px solid ${PAPER_LINE}`, borderRadius: 5, marginBottom: 10, overflow: "hidden", background: CARD }}>
      <div style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px", background: "#FFFEFC", borderLeft: `5px solid ${color}`,
      }}>
        <button onClick={() => setOpen((o) => !o)} style={{
          flex: 1, textAlign: "left", border: "none", background: "transparent", cursor: "pointer", padding: 0,
          fontSize: 14, fontWeight: 600, color: INK,
        }}>{title}</button>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {rightSlot}
          {onWizard && (
            <button onClick={onWizard} title={wizardLabel || "ウィザード"} style={{
              fontSize: 14, width: 26, height: 26, padding: 0, borderRadius: 4, border: `1px solid ${GOLD}`,
              background: GOLD_SOFT, color: INK, cursor: "pointer", lineHeight: 1,
            }}>🧮</button>
          )}
          <button onClick={() => setOpen((o) => !o)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: INK_SOFT, padding: 0 }}>
            {open ? "▲" : "▼"}
          </button>
        </span>
      </div>
      {open && <div style={{ padding: "10px 12px 14px" }}>{children}</div>}
    </div>
  );
}

// 横スクロール・年次編集テーブル（帳簿の見開きページ風）
function YearRow({ label, arr, onChange, indent, wizard }) {
  const bg = wizard ? SUMI_SOFT : CARD;
  return (
    <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${PAPER_LINE}` }}>
      <div style={{
        width: 108, flexShrink: 0, fontSize: 12, color: indent ? INK_SOFT : INK, padding: "6px 8px 6px " + (indent ? "18px" : "8px"),
        position: "sticky", left: 0, background: bg, zIndex: 2, borderRight: `1px solid ${PAPER_LINE}`,
      }}>{label}{wizard && <span title="費用ウィザードで設定" style={{ marginLeft: 4 }}>🧮</span>}</div>
      <div style={{ display: "flex", background: bg }}>
        {YEARS.map((y, i) => (
          <div key={y} style={{ padding: "5px 3px", borderRight: `1px solid ${PAPER_LINE}` }}>
            <NumField value={arr[i]} onChange={onChange ? (v) => onChange(i, v) : undefined} readOnly={!onChange} />
          </div>
        ))}
      </div>
    </div>
  );
}

function YearHeader() {
  return (
    <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 3, background: INK }}>
      <div style={{ width: 108, flexShrink: 0, position: "sticky", left: 0, background: INK, zIndex: 4 }} />
      {YEARS.map((y) => (
        <div key={y} style={{ width: 82, flexShrink: 0, textAlign: "center", color: PAPER, fontSize: 11.5, padding: "5px 0", borderRight: "1px solid #3A4C6B" }}>
          '{String(y).slice(2)}
        </div>
      ))}
    </div>
  );
}

function EditTable({ rows }) {
  return (
    <div style={{ overflowX: "auto", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, maxHeight: 320 }}>
      <div style={{ minWidth: 108 + N * 82 }}>
        <YearHeader />
        {rows.map((r) => (
          <YearRow key={r.label} label={r.label} arr={r.arr} onChange={r.onChange} indent={r.indent} wizard={r.wizard} />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   タブ1：シミュレーション（前提編集＋グラフ）
   ============================================================ */
const HOUSING_LABELS = { 1: "戸建（購入）", 2: "賃貸→住替え", 3: "分譲中古", 4: "賃貸→分譲" };

/* ============================================================
   費用自動試算ウィザード：参考データ（2026年9月調べ・目安）
   実際の金額は学校・物件・地域によって大きく異なるため、
   あくまで初期値として提示し、必ず手入力で調整できるようにする
   ============================================================ */
const TUITION_BANDS = {
  juniorhigh: {
    public: { label: "公立", perYear: 54.2, source: "3年間総額 約162.6万円（文部科学省 令和5年度 子供の学習費調査）" },
    private: { label: "私立", perYear: 155.7, source: "3年間総額 約467.2万円（同調査）" },
  },
  highschool: {
    public: { label: "公立", perYear: 59.6, source: "3年間総額 約178.7万円（文部科学省 令和5年度 子供の学習費調査）" },
    private: { label: "私立", perYear: 102.6, source: "3年間総額 約307.7万円（同調査）" },
  },
  university: {
    national: { label: "国公立（4年制）", firstYear: 82, laterYear: 53.6, years: 4, source: "初年度納付金の標準額（入学料28.2万円＋授業料53.6万円）" },
    nationalLong: { label: "国公立（医歯薬等6年制）", firstYear: 82, laterYear: 53.6, years: 6, source: "6年間総額 目安 約350万円" },
    privateArts: { label: "私立文系", firstYear: 128, laterYear: 97, years: 4, source: "初年度納付金 平均約128万円／2年目以降は平均授業料 約96.8万円" },
    privateScience: { label: "私立理系", firstYear: 168, laterYear: 107, years: 4, source: "文系より高め（目安。学部差が大きいため必ず確認してください）" },
  },
  privateMedicalNote: "私立の医歯系学部は学校による差が非常に大きく（6年間で数千万円規模になることも）、自動試算の対象外にしています。個別に確認のうえ「一覧」タブで直接入力してください。",
};

const CAR_BANDS = {
  kei: { label: "軽自動車", gas: 8, insurance: 5.1, tax: 1.08, inspection: 3, other: 3, source: "年間目安 合計 約20万円/台" },
  compact: { label: "コンパクトカー", gas: 10, insurance: 5.5, tax: 3, inspection: 3.5, other: 4, source: "年間目安 合計 約26万円/台" },
  standard: { label: "普通車", gas: 12, insurance: 7.5, tax: 4, inspection: 4, other: 5, source: "年間目安 合計 約32.5万円/台" },
};
const CAR_SOURCE_NOTE = "任意保険・ガソリン代はSBI損保／イオン銀行の調査、税金は総排気量に応じた自動車税の目安値を参照。駐車場代は地域差が非常に大きいため含めていません。";

const HOUSE_REPAIR_FLAT_ANNUAL = 40; // 万円/年（戸建て30年総額 約1,200万円の目安から）
const HOUSE_REPAIR_SOURCE = "マンション修繕積立金の目安：専有面積1㎡あたり月200〜300円（国土交通省ガイドライン）。戸建て30年間の修繕総額の目安：500万〜1,200万円（年平均 約40万円。築10年目に給湯器・防蟻、築15〜20年目に外壁・屋根の出費が集中する傾向）。";

function PillChoice({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button key={String(o.value)} onClick={() => onChange(o.value)} style={{
          padding: "6px 10px", fontSize: 12, borderRadius: 4, cursor: "pointer", textAlign: "left",
          border: `1px solid ${value === o.value ? GOLD : PAPER_LINE}`,
          background: value === o.value ? GOLD_SOFT : "#fff", color: INK,
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function WizardRefBox({ children }) {
  return (
    <div style={{ fontSize: 11, color: INK_SOFT, background: GOLD_SOFT, borderLeft: `3px solid ${GOLD}`, borderRadius: "0 4px 4px 0", padding: "8px 10px", marginTop: 8 }}>
      {children}
    </div>
  );
}

function WizardAppliedNote({ text }) {
  if (!text) return null;
  return <div style={{ fontSize: 12, color: SUMI, background: SUMI_SOFT, borderRadius: 4, padding: "6px 10px", marginTop: 10 }}>{text}</div>;
}

function inferTuitionSelection(arr, yearStart, yearEnd, bandGroup) {
  const idxStart = YEARS.indexOf(yearStart);
  if (idxStart < 0) return null;
  const idxEnd = Math.min(N - 1, YEARS.indexOf(yearEnd) >= 0 ? YEARS.indexOf(yearEnd) : idxStart);
  const vals = [];
  for (let i = idxStart; i <= idxEnd; i++) vals.push(arr[i] || 0);
  if (vals.length === 0) return null;

  for (const [k, b] of Object.entries(bandGroup)) {
    if (b.perYear != null) {
      if (vals.every((v) => Math.abs(v - b.perYear) < 0.05)) return { mode: k };
    } else if (b.years) {
      const span = Math.min(b.years, vals.length);
      let matches = span > 0;
      for (let i = 0; i < span; i++) {
        const expected = i === 0 ? b.firstYear : b.laterYear;
        if (Math.abs(vals[i] - expected) > 0.05) { matches = false; break; }
      }
      if (matches) return { mode: k };
    }
  }
  const nonZero = vals.find((v) => v !== 0);
  return nonZero !== undefined ? { mode: "custom", customValue: nonZero } : null;
}

function TuitionStageSelector({ title, yearRangeLabel, bandGroup, refNote, sel, onChange }) {
  const mode = sel?.mode ?? null;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: INK_SOFT, marginBottom: 6 }}>{title}（{yearRangeLabel}）</div>
      <PillChoice
        value={mode}
        onChange={(v) => onChange({ mode: v })}
        options={[
          ...Object.entries(bandGroup).map(([k, b]) => ({ label: `${b.label}（${b.firstYear != null ? `初年度${fmt(b.firstYear, 1)}万円／以降年${fmt(b.laterYear, 1)}万円` : `年${fmt(b.perYear, 1)}万円`}）`, value: k })),
          { label: "自由入力（年額）", value: "custom" },
        ]}
      />
      {mode === "custom" && (
        <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12 }}>
          年額（万円）
          <input type="number" value={sel.customValue ?? ""} onChange={(e) => onChange({ mode: "custom", customValue: e.target.value === "" ? 0 : parseFloat(e.target.value) })}
            style={{ width: 100, padding: "5px 7px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" }} />
        </label>
      )}
      {refNote && <WizardRefBox>{refNote}</WizardRefBox>}
    </div>
  );
}

function TuitionWizardSlide({ sim, setSim, family }) {
  const thisYear = new Date().getFullYear();
  const supportedIds = ["child1", "child2", "child3"];
  const eligible = family.filter((m) => supportedIds.includes(m.id) && m.birthYear != null);
  const missing = family.filter((m) => supportedIds.includes(m.id) && m.birthYear == null);
  const [selections, setSelections] = useState(() => {
    const init = {};
    eligible.forEach((m) => {
      const by = m.birthYear;
      const arr = sim.expense.tuition[m.id];
      init[m.id] = {
        juniorhigh: inferTuitionSelection(arr, by + 12, by + 14, TUITION_BANDS.juniorhigh),
        highschool: inferTuitionSelection(arr, by + 15, by + 17, TUITION_BANDS.highschool),
        university: inferTuitionSelection(arr, by + 18, by + 23, TUITION_BANDS.university),
      };
    });
    return init;
  });
  const [applied, setApplied] = useState("");

  const setSel = (childId, stage, patch) => setSelections((prev) => ({
    ...prev, [childId]: { ...prev[childId], [stage]: { ...(prev[childId]?.[stage] || {}), ...patch } },
  }));

  const applyStage = (arr, sel, yearStart, yearEnd, thisYear, band) => {
    if (!sel || !sel.mode) return;
    if (sel.mode === "custom") {
      for (let y = yearStart; y <= yearEnd; y++) {
        const idx = YEARS.indexOf(y);
        if (idx >= 0 && y >= thisYear) arr[idx] = sel.customValue || 0;
      }
      return;
    }
    const b = band[sel.mode];
    if (!b) return;
    if (b.perYear != null) {
      for (let y = yearStart; y <= yearEnd; y++) {
        const idx = YEARS.indexOf(y);
        if (idx >= 0 && y >= thisYear) arr[idx] = b.perYear;
      }
    } else {
      for (let k = 0; k < b.years; k++) {
        const y = yearStart + k;
        const idx = YEARS.indexOf(y);
        if (idx >= 0 && y >= thisYear) arr[idx] = k === 0 ? b.firstYear : b.laterYear;
      }
    }
  };

  const apply = () => {
    setSim((prev) => {
      const next = clone(prev);
      const touched = new Set(next.wizardTouched || []);
      eligible.forEach((m) => {
        const sel = selections[m.id];
        if (!sel) return;
        const by = m.birthYear;
        const arr = next.expense.tuition[m.id];
        applyStage(arr, sel.juniorhigh, by + 12, by + 14, thisYear, TUITION_BANDS.juniorhigh);
        applyStage(arr, sel.highschool, by + 15, by + 17, thisYear, TUITION_BANDS.highschool);
        applyStage(arr, sel.university, by + 18, by + 18 + ((sel.university?.mode && TUITION_BANDS.university[sel.university.mode]?.years) || 4) - 1, thisYear, TUITION_BANDS.university);
        if (sel.juniorhigh?.mode || sel.highschool?.mode || sel.university?.mode) touched.add(`tuition.${m.id}`);
      });
      next.wizardTouched = [...touched];
      return next;
    });
    setApplied("反映しました。「一覧」タブで年ごとの数値を確認・微調整できます。");
    setTimeout(() => setApplied(""), 5000);
  };

  return (
    <div>
      <p style={{ fontSize: 12.5, color: INK_SOFT, margin: "0 0 14px" }}>
        子1〜子3（家族構成で生年を設定した場合）の中学・高校・大学の学費を、価格帯を選ぶか、自分で年額を入力して年別データに反映します。今年より前の年は変更しません。
      </p>
      {missing.length > 0 && (
        <div style={{ fontSize: 12, color: SEAL, background: SEAL_SOFT, borderRadius: 4, padding: "8px 10px", marginBottom: 14 }}>
          生年が未設定です：{missing.map((m) => m.label).join("、")}。先に「👪 家族構成」で生年を入力してください。
        </div>
      )}
      {eligible.map((m) => {
        const sel = selections[m.id] || {};
        return (
          <div key={m.id} style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 4 }}>{m.label}（{m.birthYear}年生まれ）</div>

            <TuitionStageSelector
              title="中学" yearRangeLabel={`${m.birthYear + 12}〜${m.birthYear + 14}年`}
              bandGroup={TUITION_BANDS.juniorhigh}
              refNote="参考：公立3年間 約162.6万円／私立3年間 約467.2万円（文部科学省 令和5年度 子供の学習費調査）"
              sel={sel.juniorhigh} onChange={(patch) => setSel(m.id, "juniorhigh", patch)}
            />
            <TuitionStageSelector
              title="高校" yearRangeLabel={`${m.birthYear + 15}〜${m.birthYear + 17}年`}
              bandGroup={TUITION_BANDS.highschool}
              refNote="参考：公立3年間 約178.7万円／私立3年間 約307.7万円（同調査）"
              sel={sel.highschool} onChange={(patch) => setSel(m.id, "highschool", patch)}
            />
            <TuitionStageSelector
              title="大学" yearRangeLabel={`${m.birthYear + 18}年〜`}
              bandGroup={TUITION_BANDS.university}
              refNote={TUITION_BANDS.privateMedicalNote}
              sel={sel.university} onChange={(patch) => setSel(m.id, "university", patch)}
            />
          </div>
        );
      })}
      {eligible.length > 0 && (
        <button onClick={apply} style={{ fontSize: 13, padding: "10px 18px", borderRadius: 5, border: "none", background: GOLD, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          学費の設定を反映
        </button>
      )}
      <WizardAppliedNote text={applied} />
    </div>
  );
}

function NumInput({ label, value, onChange, width = 110, suffix }) {
  const display = Number(value) === 0 ? "" : value;
  return (
    <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 4 }}>
      {label}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input type="number" value={display} placeholder="0"
          onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
          style={{ width, padding: "6px 8px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" }} />
        {suffix && <span style={{ fontSize: 11, color: INK_SOFT }}>{suffix}</span>}
      </div>
    </label>
  );
}

function PropertyLoanFields({ plan, setPlan, prefix }) {
  const p = (key) => plan[`${prefix}${key}`];
  const set = (key) => (v) => setPlan({ [`${prefix}${key}`]: v });
  const isVariable = p("RepaymentMode") === "variable";
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <PillChoice value={p("PropertyType")} onChange={set("PropertyType")}
          options={[{ label: "戸建て", value: "house" }, { label: "マンション", value: "condo" }]} />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
        <NumInput label="物件価格（または残債）" value={p("Price")} onChange={set("Price")} suffix="万円" />
        <NumInput label="頭金" value={p("DownPayment")} onChange={set("DownPayment")} suffix="万円" />
      </div>
      <div style={{ fontSize: 10.5, color: INK_SOFT, marginBottom: 10 }}>すでにローンを組んでいる場合は、物件価格の代わりに今の残債を入力し、頭金は0にしてください。</div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 4 }}>返済方式</div>
        <PillChoice value={p("RepaymentMode")} onChange={set("RepaymentMode")}
          options={[
            { label: "固定金利（借入時の金利のまま変わらない）", value: "fixed" },
            { label: "変動金利（毎年、その時点の金利で返済額を再計算）", value: "variable" },
          ]}
        />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10, marginBottom: 10 }}>
        <NumInput label="金利（初期・年率）" value={(p("Rate") * 100).toFixed(2)} onChange={(v) => set("Rate")(v / 100)} width={90} suffix="%" />
        {isVariable && (
          <>
            <NumInput label="金利上昇率（年率）" value={(p("RateIncrease") * 100).toFixed(2)} onChange={(v) => set("RateIncrease")(v / 100)} width={90} suffix="%/年" />
            <NumInput label="金利の上限" value={(p("RateCap") * 100).toFixed(2)} onChange={(v) => set("RateCap")(v / 100)} width={90} suffix="%" />
          </>
        )}
        <NumInput label="ローン年数" value={p("TermYears")} onChange={set("TermYears")} width={80} suffix="年" />
      </div>
      <NumInput label="その他年間費用（管理費・固定資産税等の概算）" value={p("OtherAnnual")} onChange={set("OtherAnnual")} suffix="万円/年" />
    </>
  );
}

function RentFields({ plan, setPlan, prefix }) {
  const p = (key) => plan[`${prefix}${key}`];
  const set = (key) => (v) => setPlan({ [`${prefix}${key}`]: v });
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <NumInput label="家賃（月額）" value={p("RentMonthly")} onChange={set("RentMonthly")} suffix="万円/月" />
        <NumInput label="家賃上昇率（年率）" value={(p("RentEscalation") * 100).toFixed(2)} onChange={(v) => set("RentEscalation")(v / 100)} width={90} suffix="%/年" />
      </div>
      <NumInput label="その他年間費用（更新料・共益費等の概算）" value={p("OtherAnnual")} onChange={set("OtherAnnual")} suffix="万円/年" />
    </>
  );
}

function AcquisitionFields({ plan, setPlan, prefix }) {
  const acqKey = `${prefix}AcquisitionType`;
  const acqType = plan[acqKey];
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <PillChoice value={acqType} onChange={(v) => setPlan({ [acqKey]: v })}
          options={[{ label: "購入", value: "buy" }, { label: "賃貸", value: "rent" }]} />
      </div>
      {acqType === "rent"
        ? <RentFields plan={plan} setPlan={setPlan} prefix={prefix} />
        : <PropertyLoanFields plan={plan} setPlan={setPlan} prefix={prefix} />}
    </>
  );
}

function HousingWizardSlide({ params, setParams, setSim }) {
  const thisYear = new Date().getFullYear();
  const [housingType, setHousingType] = useState(params.housingType);
  const [downPayment, setDownPayment] = useState(params.downPayment || 0);
  const [subsidy, setSubsidy] = useState(params.housingSubsidyAnnual || 0);
  const [resetRepair, setResetRepair] = useState(false);

  const [planEnabled, setPlanEnabled] = useState(params.housingPlanEnabled || false);
  const [plan, setPlanState] = useState(() => ({
    housingPlanAcquisitionType: params.housingPlanAcquisitionType,
    housingPlanPropertyType: params.housingPlanPropertyType, housingPlanCondition: params.housingPlanCondition,
    housingPlanPurchaseYear: params.housingPlanPurchaseYear, housingPlanPrice: params.housingPlanPrice,
    housingPlanDownPayment: params.housingPlanDownPayment, housingPlanRate: params.housingPlanRate,
    housingPlanRateIncrease: params.housingPlanRateIncrease, housingPlanRateCap: params.housingPlanRateCap,
    housingPlanRepaymentMode: params.housingPlanRepaymentMode,
    housingPlanTermYears: params.housingPlanTermYears, housingPlanOtherAnnual: params.housingPlanOtherAnnual,
    housingPlanRentMonthly: params.housingPlanRentMonthly, housingPlanRentEscalation: params.housingPlanRentEscalation,
    housingPlanMoveEnabled: params.housingPlanMoveEnabled, housingPlanMoveAcquisitionType: params.housingPlanMoveAcquisitionType,
    housingPlanMoveYear: params.housingPlanMoveYear,
    housingPlanMoveSaleProceeds: params.housingPlanMoveSaleProceeds, housingPlanMovePropertyType: params.housingPlanMovePropertyType,
    housingPlanMoveCondition: params.housingPlanMoveCondition, housingPlanMovePrice: params.housingPlanMovePrice,
    housingPlanMoveDownPayment: params.housingPlanMoveDownPayment, housingPlanMoveRate: params.housingPlanMoveRate,
    housingPlanMoveRateIncrease: params.housingPlanMoveRateIncrease, housingPlanMoveRateCap: params.housingPlanMoveRateCap,
    housingPlanMoveRepaymentMode: params.housingPlanMoveRepaymentMode,
    housingPlanMoveTermYears: params.housingPlanMoveTermYears, housingPlanMoveOtherAnnual: params.housingPlanMoveOtherAnnual,
    housingPlanMoveRentMonthly: params.housingPlanMoveRentMonthly, housingPlanMoveRentEscalation: params.housingPlanMoveRentEscalation,
  }));
  const setPlan = (patch) => setPlanState((prev) => ({ ...prev, ...patch }));
  const [applied, setApplied] = useState("");

  const apply = () => {
    setParams((p) => ({
      ...p, housingType, downPayment, housingSubsidyAnnual: subsidy,
      housingPlanEnabled: planEnabled, ...plan,
    }));
    if (!planEnabled && housingType === 1 && resetRepair) {
      setSim((prev) => {
        const next = clone(prev);
        YEARS.forEach((y, idx) => { if (y >= thisYear) next.expense.housing_opt1_repair[idx] = HOUSE_REPAIR_FLAT_ANNUAL; });
        return next;
      });
    }
    setApplied("反映しました。「シミュレーション」タブで確認できます。");
    setTimeout(() => setApplied(""), 5000);
  };

  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: INK, marginBottom: 14 }}>
        <input type="checkbox" checked={planEnabled} onChange={(e) => setPlanEnabled(e.target.checked)} />
        住宅ローンを試算する（価格・頭金・金利からこの画面で計算します）
      </label>

      {!planEnabled ? (
        <>
          <p style={{ fontSize: 12.5, color: INK_SOFT, margin: "0 0 14px" }}>
            住居プラン・頭金・会社の住宅補助を設定します。頭金はローンの借入額から差し引かれ、住宅補助は毎年の住宅費から差し引かれます。
          </p>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: INK_SOFT, marginBottom: 6 }}>住居プラン</div>
          <PillChoice
            value={housingType}
            onChange={setHousingType}
            options={[1, 2, 3, 4].map((v) => ({ label: HOUSING_LABELS[v], value: v }))}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <NumInput label={`頭金${housingType !== 1 ? "（戸建て購入時のみ反映）" : ""}`} value={downPayment} onChange={setDownPayment} suffix="万円" />
            <NumInput label="住宅補助" value={subsidy} onChange={setSubsidy} suffix="万円/年" />
          </div>
          {housingType === 1 && (
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 12.5, color: INK_SOFT }}>
              <input type="checkbox" checked={resetRepair} onChange={(e) => setResetRepair(e.target.checked)} />
              修繕費を目安値（今年以降 年{fmt(HOUSE_REPAIR_FLAT_ANNUAL)}万円）で一括設定する
            </label>
          )}
          <WizardRefBox>{HOUSE_REPAIR_SOURCE}</WizardRefBox>
        </>
      ) : (
        <>
          <p style={{ fontSize: 12.5, color: INK_SOFT, margin: "0 0 14px" }}>
            購入か賃貸かを選び、価格または家賃から住宅費を年別に計算して、既存の住居プラン設定を上書きします。
          </p>
          <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>今の住まい</div>
            <NumInput label={plan.housingPlanAcquisitionType === "rent" ? "入居年" : "購入年"} value={plan.housingPlanPurchaseYear} onChange={(v) => setPlan({ housingPlanPurchaseYear: v })} width={90} />
            <div style={{ height: 10 }} />
            <AcquisitionFields plan={plan} setPlan={setPlan} prefix="housingPlan" />
          </div>

          <NumInput label="住宅補助" value={subsidy} onChange={setSubsidy} suffix="万円/年" />

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: INK, margin: "16px 0 10px" }}>
            <input type="checkbox" checked={plan.housingPlanMoveEnabled} onChange={(e) => setPlan({ housingPlanMoveEnabled: e.target.checked })} />
            住み替えを設定する
          </label>
          {plan.housingPlanMoveEnabled && (() => {
            const ownsBeforeMove = plan.housingPlanAcquisitionType !== "rent";
            const moveIdx = YEARS.indexOf(plan.housingPlanMoveYear);
            const oldLoanAtMove = ownsBeforeMove && moveIdx > 0
              ? computeHousingPlan({ ...plan, housingPlanMoveEnabled: false }).loanBalance[moveIdx - 1]
              : 0;
            const suggestedProceeds = Math.max(0, (plan.housingPlanPrice || 0) - oldLoanAtMove);
            return (
              <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 14 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <NumInput label="住み替え年" value={plan.housingPlanMoveYear} onChange={(v) => setPlan({ housingPlanMoveYear: v })} width={90} />
                  {ownsBeforeMove && (
                    <NumInput label="今の家の売却代金（ローン残高引き後・手入力）" value={plan.housingPlanMoveSaleProceeds} onChange={(v) => setPlan({ housingPlanMoveSaleProceeds: v })} suffix="万円" />
                  )}
                </div>
                {ownsBeforeMove ? (
                  <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    参考値：<span style={{ fontSize: 14, fontWeight: 700, color: INK }}>約{fmt(suggestedProceeds)}万円</span>（購入価格－その時点のローン残高。値上がり・値下がりなしと仮定）
                    <button onClick={() => setPlan({ housingPlanMoveSaleProceeds: Math.round(suggestedProceeds) })}
                      style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, border: `1px solid ${GOLD}`, background: GOLD_SOFT, color: INK, cursor: "pointer" }}>
                      この値を使う
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 10 }}>今は賃貸のため、売却代金はありません。</div>
                )}
                <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>新しい住まい</div>
                <AcquisitionFields plan={plan} setPlan={setPlan} prefix="housingPlanMove" />
                <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>
                  {ownsBeforeMove
                    ? "売却代金は新居の頭金（購入の場合）にそのまま充当せず、差額をその年の住宅費として加減算します。実際の売却額は市況次第で変わるため、参考値は目安として自由に書き換えてください。"
                    : "賃貸から購入・別の賃貸に切り替える場合の設定です。"}
                </div>
              </div>
            );
          })()}
        </>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={apply} style={{ fontSize: 13, padding: "10px 18px", borderRadius: 5, border: "none", background: GOLD, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          住宅の設定を反映
        </button>
      </div>
      <WizardAppliedNote text={applied} />
    </div>
  );
}

function CarWizardSlide({ setSim }) {
  const thisYear = new Date().getFullYear();
  const [cls, setCls] = useState("compact");
  const [customTotal, setCustomTotal] = useState(30);
  const [count, setCount] = useState(1);
  const [parkingMonthly, setParkingMonthly] = useState("");

  const [acqType, setAcqType] = useState("lump");
  const [acqYear, setAcqYear] = useState(String(thisYear));
  const [lumpPrice, setLumpPrice] = useState("");
  const [loanPrice, setLoanPrice] = useState(0);
  const [loanDownPayment, setLoanDownPayment] = useState(0);
  const [loanRate, setLoanRate] = useState(3);
  const [loanTermYears, setLoanTermYears] = useState(6);
  const [subMonthly, setSubMonthly] = useState(0);

  const [applied, setApplied] = useState("");

  const apply = () => {
    setSim((prev) => {
      const next = clone(prev);
      YEARS.forEach((y, idx) => {
        if (y < thisYear) return;
        if (cls === "custom") {
          next.expense.car.gas[idx] = 0;
          next.expense.car.insurance[idx] = 0;
          next.expense.car.tax[idx] = 0;
          next.expense.car.inspection[idx] = 0;
          next.expense.car.other[idx] = (customTotal || 0) * count;
        } else {
          const band = CAR_BANDS[cls];
          next.expense.car.gas[idx] = band.gas * count;
          next.expense.car.insurance[idx] = band.insurance * count;
          next.expense.car.tax[idx] = band.tax * count;
          next.expense.car.inspection[idx] = band.inspection * count;
          next.expense.car.other[idx] = band.other * count;
        }
        if (parkingMonthly !== "") next.expense.car.parking[idx] = (parseFloat(parkingMonthly) || 0) * 12;
      });

      const touched = new Set(next.wizardTouched || []);
      ["car.gas", "car.insurance", "car.tax", "car.inspection", "car.other"].forEach((k) => touched.add(k));
      if (parkingMonthly !== "") touched.add("car.parking");

      const acqYearNum = parseInt(acqYear, 10);
      if (acqType === "lump") {
        if (!isNaN(acqYearNum) && lumpPrice !== "") {
          const idx = YEARS.indexOf(acqYearNum);
          if (idx >= 0 && YEARS[idx] >= thisYear) next.expense.car.body[idx] = parseFloat(lumpPrice) || 0;
        }
      } else if (acqType === "loan") {
        const payment = calcAnnuityPayment(Math.max(0, (loanPrice || 0) - (loanDownPayment || 0)), (loanRate || 0) / 100, loanTermYears || 1);
        YEARS.forEach((y, idx) => {
          if (y < thisYear) return;
          if (!isNaN(acqYearNum) && y >= acqYearNum && y < acqYearNum + (loanTermYears || 0)) {
            next.expense.car.body[idx] = payment;
          } else if (!isNaN(acqYearNum) && y >= acqYearNum) {
            next.expense.car.body[idx] = 0;
          }
        });
        touched.add("car.body");
      } else if (acqType === "subscription") {
        YEARS.forEach((y, idx) => {
          if (y < thisYear) return;
          next.expense.car.body[idx] = (subMonthly || 0) * 12;
          next.expense.car.insurance[idx] = 0;
          next.expense.car.tax[idx] = 0;
          next.expense.car.inspection[idx] = 0;
        });
        touched.add("car.body");
      }
      next.wizardTouched = [...touched];
      return next;
    });
    setApplied("反映しました。「一覧」タブで確認できます。");
    setTimeout(() => setApplied(""), 5000);
  };

  return (
    <div>
      <p style={{ fontSize: 12.5, color: INK_SOFT, margin: "0 0 14px" }}>
        車種区分と保有台数を選ぶと、今年以降のガソリン代・保険・税金・車検・その他費用を年別データに一括反映します。合わなければ「自由入力」で年間合計を直接指定できます。
      </p>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: INK_SOFT, marginBottom: 6 }}>車種区分（維持費）</div>
      <PillChoice
        value={cls}
        onChange={setCls}
        options={[
          ...Object.entries(CAR_BANDS).map(([k, b]) => ({ label: `${b.label}（${b.source}）`, value: k })),
          { label: "自由入力（年間合計）", value: "custom" },
        ]}
      />
      {cls === "custom" && (
        <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12 }}>
          1台あたり年間合計（万円）
          <input type="number" value={customTotal} onChange={(e) => setCustomTotal(e.target.value === "" ? 0 : parseFloat(e.target.value))}
            style={{ width: 100, padding: "5px 7px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" }} />
        </label>
      )}
      <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 4, marginTop: 14, width: 120 }}>
        保有台数
        <input type="number" min={1} value={count} onChange={(e) => setCount(e.target.value === "" ? 1 : parseInt(e.target.value, 10))}
          style={{ padding: "6px 8px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" }} />
      </label>
      <WizardRefBox>{CAR_SOURCE_NOTE}</WizardRefBox>

      <div style={{ fontSize: 11.5, fontWeight: 700, color: INK_SOFT, margin: "16px 0 6px" }}>車両の取得方法</div>
      <PillChoice
        value={acqType}
        onChange={setAcqType}
        options={[
          { label: "一括購入", value: "lump" },
          { label: "ローン購入", value: "loan" },
          { label: "サブスク・カーシェア", value: "subscription" },
        ]}
      />
      {acqType === "lump" && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 4 }}>
            買い替え年
            <input type="number" placeholder="例：2030" value={acqYear} onChange={(e) => setAcqYear(e.target.value)}
              style={{ width: 100, padding: "6px 8px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" }} />
          </label>
          <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 4 }}>
            車両本体価格（万円）
            <input type="number" value={lumpPrice} onChange={(e) => setLumpPrice(e.target.value)}
              style={{ width: 100, padding: "6px 8px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" }} />
          </label>
        </div>
      )}
      {acqType === "loan" && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 4 }}>
              購入年
              <input type="number" value={acqYear} onChange={(e) => setAcqYear(e.target.value)}
                style={{ width: 90, padding: "6px 8px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" }} />
            </label>
            <NumInput label="車両価格" value={loanPrice} onChange={setLoanPrice} suffix="万円" />
            <NumInput label="頭金" value={loanDownPayment} onChange={setLoanDownPayment} suffix="万円" />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <NumInput label="金利（年率）" value={loanRate} onChange={setLoanRate} width={90} suffix="%" />
            <NumInput label="ローン年数" value={loanTermYears} onChange={setLoanTermYears} width={80} suffix="年" />
          </div>
          <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>ローン完済後は車両費が0円になります（維持費は上の車種区分の設定が別途かかります）。</div>
        </div>
      )}
      {acqType === "subscription" && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <NumInput label="月額料金" value={subMonthly} onChange={setSubMonthly} suffix="万円/月" />
          </div>
          <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>サブスク・カーシェアは保険・税金・車検が月額に含まれる想定で、それらを0にします（ガソリン代は上の車種区分の設定のまま別途かかります）。</div>
        </div>
      )}

      <div style={{ fontSize: 11.5, fontWeight: 700, color: INK_SOFT, margin: "16px 0 6px" }}>駐車場（任意）</div>
      <NumInput label="月極駐車場" value={parkingMonthly === "" ? 0 : parkingMonthly} onChange={(v) => setParkingMonthly(v)} suffix="万円/月" />
      <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>駐車場は今年以降、毎年同額で反映します（地域差が大きいため目安は出していません）。</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={apply} style={{ fontSize: 13, padding: "10px 18px", borderRadius: 5, border: "none", background: GOLD, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          車の設定を反映
        </button>
      </div>
      <WizardAppliedNote text={applied} />
    </div>
  );
}

function CostWizardModal({ sim, setSim, params, setParams, family, onClose, initialStep }) {
  const [step, setStep] = useState(initialStep || "tuition");
  const steps = [
    { key: "tuition", label: "① 学費" },
    { key: "housing", label: "② 住宅" },
    { key: "car", label: "③ 車" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: PAPER, zIndex: 200, overflowY: "auto", fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif" }}>
      <div style={{ background: INK, color: PAPER, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 6 }}>
        <div style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 17 }}>費用自動試算ウィザード</div>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #4A5A75", color: PAPER, borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>閉じる ×</button>
      </div>
      <div style={{ display: "flex", borderBottom: `2px solid ${INK}`, background: CARD, position: "sticky", top: 49, zIndex: 5 }}>
        {steps.map((s) => (
          <button key={s.key} onClick={() => setStep(s.key)} style={{
            flex: 1, padding: "10px 4px", border: "none", cursor: "pointer",
            background: step === s.key ? INK : "transparent", color: step === s.key ? PAPER : INK_SOFT,
            fontSize: 13, fontWeight: 600,
          }}>{s.label}</button>
        ))}
      </div>
      <div style={{ padding: "16px 16px 60px" }}>
        {step === "tuition" && <TuitionWizardSlide sim={sim} setSim={setSim} family={family} />}
        {step === "housing" && <HousingWizardSlide params={params} setParams={setParams} setSim={setSim} />}
        {step === "car" && <CarWizardSlide setSim={setSim} />}
      </div>
    </div>
  );
}

/* ============================================================
   一覧タブ：全カテゴリ・全年を一枚のシートで見渡す（元ファイル相当）
   ============================================================ */
function SheetCell({ value, onChange, bold, readOnly }) {
  if (readOnly) {
    return (
      <div style={{
        width: 82, flexShrink: 0, textAlign: "right", padding: "5px 7px", fontSize: 11.5,
        fontWeight: bold ? 700 : 400, fontVariantNumeric: "tabular-nums", color: value < 0 ? SEAL : INK,
        borderRight: `1px solid ${PAPER_LINE}`, whiteSpace: "nowrap", overflow: "hidden",
      }}>{fmt(value)}</div>
    );
  }
  return (
    <div style={{ width: 82, flexShrink: 0, padding: "3px 3px", borderRight: `1px solid ${PAPER_LINE}` }}>
      <NumField value={value} onChange={onChange} width={74} />
    </div>
  );
}

function SheetRow({ label, arr, onChange, bold, highlight, indent, wizard }) {
  const bg = highlight ? GOLD_SOFT : wizard ? SUMI_SOFT : CARD;
  return (
    <div style={{ display: "flex", borderBottom: `1px solid ${PAPER_LINE}`, background: bg }}>
      <div style={{
        width: 128, flexShrink: 0, fontSize: 11.5, fontWeight: bold ? 700 : 400, color: INK,
        padding: "6px 8px 6px " + (indent ? "18px" : "8px"), position: "sticky", left: 0, zIndex: 2,
        background: bg, borderRight: `1px solid ${PAPER_LINE}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{label}{wizard && <span title="費用ウィザードで設定" style={{ marginLeft: 4 }}>🧮</span>}</div>
      <div style={{ display: "flex" }}>
        {YEARS.map((y, i) => (
          <SheetCell key={y} value={arr[i]} onChange={onChange ? (v) => onChange(i, v) : undefined} bold={bold} readOnly={!onChange} />
        ))}
      </div>
    </div>
  );
}

function SheetYearHeader() {
  return (
    <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 3, background: INK }}>
      <div style={{ width: 128, flexShrink: 0, position: "sticky", left: 0, background: INK, zIndex: 4, borderRight: "1px solid #3A4C6B" }} />
      {YEARS.map((y) => (
        <div key={y} style={{ width: 82, flexShrink: 0, textAlign: "center", color: PAPER, fontSize: 11, padding: "5px 0", borderRight: "1px solid #3A4C6B" }}>
          {y}
        </div>
      ))}
    </div>
  );
}

function SheetSectionLabel({ text }) {
  return (
    <div style={{ display: "flex" }}>
      <div style={{
        width: 128, flexShrink: 0, position: "sticky", left: 0, zIndex: 2, background: INK_SOFT, color: PAPER,
        fontSize: 11, fontWeight: 700, padding: "5px 8px", letterSpacing: "0.04em",
      }}>{text}</div>
      <div style={{ flex: 1, background: INK_SOFT }} />
    </div>
  );
}

function SheetAgeMemoRow({ member, onMemoChange }) {
  const by = member.birthYear;
  return (
    <div style={{ display: "flex", borderBottom: `1px solid ${PAPER_LINE}`, background: CARD }}>
      <div style={{
        width: 128, flexShrink: 0, fontSize: 11.5, fontWeight: 600, color: INK, padding: "6px 8px",
        position: "sticky", left: 0, zIndex: 2, background: CARD, borderRight: `1px solid ${PAPER_LINE}`,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{member.label}</div>
      <div style={{ display: "flex" }}>
        {YEARS.map((y) => {
          const age = by != null ? y - by : null;
          const memo = member.memos?.[y] ?? "";
          return (
            <div key={y} style={{ width: 82, flexShrink: 0, borderRight: `1px solid ${PAPER_LINE}`, padding: "3px 2px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: age != null && age >= 0 ? INK : PAPER_LINE, fontVariantNumeric: "tabular-nums" }}>
                {age != null && age >= 0 ? age : ""}
              </div>
              <input value={memo} onChange={(e) => onMemoChange(y, e.target.value)}
                style={{ width: "100%", fontSize: 8.5, textAlign: "center", border: "none", borderTop: `1px dotted ${PAPER_LINE}`, background: "transparent", color: GOLD, padding: "1px 0" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}


function SheetTab({ sim, setSim, params, setParams, family, setFamily }) {
  const model = useMemo(() => computeModel(sim, params), [sim, params]);
  const exp = sim.expense, inc = sim.income;

  const mk = (path) => (i, v) => {
    setSim((prev) => {
      const next = clone(prev);
      let obj = next.expense;
      const keys = path.split(".");
      for (let k = 0; k < keys.length - 1; k++) obj = obj[keys[k]];
      const arr = obj[keys[keys.length - 1]];
      if (NO_CASCADE_PATHS.has(keys[keys.length - 1])) arr[i] = v;
      else fillForward(arr, i, v);
      if (next.wizardTouched?.includes(path)) next.wizardTouched = next.wizardTouched.filter((p) => p !== path);
      return next;
    });
  };
  const mkInc = (key) => (i, v) => {
    setSim((prev) => { const next = clone(prev); fillForward(next.income[key], i, v); return next; });
  };

  const setRateOverride = (year, pct) => {
    setParams((p) => {
      const isMoveRegime = p.housingPlanMoveEnabled && year >= p.housingPlanMoveYear;
      const key = isMoveRegime ? "housingPlanMoveRateOverrides" : "housingPlanRateOverrides";
      return { ...p, [key]: { ...p[key], [year]: pct / 100 } };
    });
  };

  const isWizard = (path) => (sim.wizardTouched || []).includes(path);
  const childLabel = (id, fallback) => family.find((m) => m.id === id)?.label || fallback;
  const updateMemo = (memberId, year, text) => {
    setFamily((prev) => prev.map((m) => m.id === memberId ? { ...m, memos: { ...m.memos, [year]: text } } : m));
  };
  const membersWithAge = family.filter((m) => m.birthYear != null);

  return (
    <div style={{ paddingBottom: 40 }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .sheet-print-target, .sheet-print-target * { visibility: visible; }
          .sheet-print-target { position: absolute; left: 0; top: 0; width: 100%; }
          .sheet-print-target * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sheet-scroll-container { max-height: none !important; overflow: visible !important; }
          .sheet-print-target div { position: static !important; }
          .sheet-print-header { display: block !important; }
          .sheet-print-target input {
            border: none !important; border-radius: 0 !important; background: transparent !important;
            padding: 4px 2px !important; -webkit-appearance: none;
          }
          @page { size: A3 landscape; margin: 10mm; }
        }
      `}</style>
      <div style={{ padding: "0 16px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionHeader title="全体シート" sub="元のスプレッドシートのように、全項目を一枚で見渡せます（数値は直接編集できます）" />
        <button onClick={() => window.print()} style={{
          fontSize: 11.5, padding: "7px 12px", borderRadius: 5, border: "none", background: GOLD, color: "#fff",
          cursor: "pointer", whiteSpace: "nowrap", marginTop: 12, flexShrink: 0,
        }}>🖨 PDFとして保存</button>
      </div>
      <div className="sheet-print-target" style={{ padding: "0 16px 16px" }}>
        <div className="sheet-print-header" style={{ display: "none", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 20, color: INK }}>ライフポートフォリオ</div>
          <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 2 }}>
            資産・収支シミュレーション　全体シート（{YEARS[0]}〜{YEARS[N - 1]}年）　作成日：{new Date().toLocaleDateString("ja-JP")}
          </div>
        </div>
        <div className="sheet-scroll-container" style={{ overflow: "auto", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, maxHeight: "70vh" }}>
          <div style={{ minWidth: 128 + N * 82 }}>
            <SheetYearHeader />

            {membersWithAge.length > 0 && (
              <>
                <SheetSectionLabel text="家族の年齢・メモ" />
                {membersWithAge.map((m) => (
                  <SheetAgeMemoRow key={m.id} member={m} onMemoChange={(year, text) => updateMemo(m.id, year, text)} />
                ))}
              </>
            )}

            <SheetRow label="支出合計" arr={model.expenseTotal} bold highlight />
            <SheetSectionLabel text="学費" />
            <SheetRow label={childLabel("child1", "子1")} arr={exp.tuition.child1} onChange={mk("tuition.child1")} indent wizard={isWizard("tuition.child1")} />
            <SheetRow label="（習い事等）" arr={exp.tuition.child1_extra} onChange={mk("tuition.child1_extra")} indent />
            <SheetRow label={childLabel("child2", "子2")} arr={exp.tuition.child2} onChange={mk("tuition.child2")} indent wizard={isWizard("tuition.child2")} />
            <SheetRow label="（習い事等）" arr={exp.tuition.child2_extra} onChange={mk("tuition.child2_extra")} indent />
            <SheetRow label={childLabel("child3", "子3")} arr={exp.tuition.child3} onChange={mk("tuition.child3")} indent wizard={isWizard("tuition.child3")} />
            <SheetRow label="（習い事等）" arr={exp.tuition.child3_extra} onChange={mk("tuition.child3_extra")} indent />
            <SheetRow label="子供下宿" arr={exp.dorm} onChange={mk("dorm")} indent />

            <SheetSectionLabel text="医療・介護" />
            <SheetRow label={childLabel("father", "我々")} arr={exp.medical.us} onChange={mk("medical.us")} indent />
            <SheetRow label={childLabel("gfather_p", "父方祖父")} arr={exp.medical.gfather_p} onChange={mk("medical.gfather_p")} indent />
            <SheetRow label={childLabel("gmother_p", "父方祖母")} arr={exp.medical.gmother_p} onChange={mk("medical.gmother_p")} indent />
            <SheetRow label={childLabel("gfather_m", "母方祖父")} arr={exp.medical.gfather_m} onChange={mk("medical.gfather_m")} indent />
            <SheetRow label={childLabel("gmother_m", "母方祖母")} arr={exp.medical.gmother_m} onChange={mk("medical.gmother_m")} indent />

            <SheetSectionLabel text={params.housingPlanEnabled ? "住宅（費用ウィザードのローン試算）" : `住宅（${HOUSING_LABELS[params.housingType]}）`} />
            {params.housingPlanEnabled ? (
              <>
                <SheetRow label="住宅費（返済額＋その他）" arr={model.housingCost} indent />
                <SheetRow label="ローン残高" arr={model.loanBalance} indent />
                <SheetRow label="住宅資産（残存評価）" arr={model.realEstateAsset} indent />
                <SheetRow label="ローン金利（年率%）" arr={model.housingRate.map((r) => Math.round(r * 10000) / 100)}
                  onChange={(i, v) => setRateOverride(YEARS[i], v)} indent />
              </>
            ) : params.housingType === 1 ? (
              <>
                <SheetRow label="ローン支払" arr={exp.housing_opt1_loanPayment} onChange={mk("housing_opt1_loanPayment")} indent />
                <SheetRow label="ローン控除" arr={exp.housing_opt1_loanDeduction} onChange={mk("housing_opt1_loanDeduction")} indent />
                <SheetRow label="固定資産税" arr={exp.housing_opt1_propertyTax} onChange={mk("housing_opt1_propertyTax")} indent />
                <SheetRow label="保険" arr={exp.housing_opt1_insurance} onChange={mk("housing_opt1_insurance")} indent />
                <SheetRow label="修繕費" arr={exp.housing_opt1_repair} onChange={mk("housing_opt1_repair")} indent />
                <SheetRow label="ローン残高" arr={model.loanBalance} indent />
              </>
            ) : params.housingType === 2 ? (
              <SheetRow label="賃貸→住替え" arr={exp.housing_opt2_rent_relocate} onChange={mk("housing_opt2_rent_relocate")} indent />
            ) : params.housingType === 3 ? (
              <SheetRow label="分譲中古" arr={exp.housing_opt3_used_condo} onChange={mk("housing_opt3_used_condo")} indent />
            ) : (
              <SheetRow label="賃貸→分譲" arr={exp.housing_opt4_rent_to_condo} onChange={mk("housing_opt4_rent_to_condo")} indent />
            )}

            <SheetSectionLabel text="車" />
            <SheetRow label="本体" arr={exp.car.body} onChange={mk("car.body")} indent wizard={isWizard("car.body")} />
            <SheetRow label="駐車場" arr={exp.car.parking} onChange={mk("car.parking")} indent wizard={isWizard("car.parking")} />
            <SheetRow label="ガス代" arr={exp.car.gas} onChange={mk("car.gas")} indent wizard={isWizard("car.gas")} />
            <SheetRow label="保険" arr={exp.car.insurance} onChange={mk("car.insurance")} indent wizard={isWizard("car.insurance")} />
            <SheetRow label="税金" arr={exp.car.tax} onChange={mk("car.tax")} indent wizard={isWizard("car.tax")} />
            <SheetRow label="車検" arr={exp.car.inspection} onChange={mk("car.inspection")} indent wizard={isWizard("car.inspection")} />
            <SheetRow label="他経費" arr={exp.car.other} onChange={mk("car.other")} indent wizard={isWizard("car.other")} />

            <SheetSectionLabel text="他生活費" />
            <SheetRow label="食費" arr={exp.living.food} onChange={mk("living.food")} indent />
            <SheetRow label="光熱費" arr={exp.living.utilities} onChange={mk("living.utilities")} indent />
            <SheetRow label="通信費" arr={exp.living.communication} onChange={mk("living.communication")} indent />
            <SheetRow label="日用品・衣服" arr={exp.living.daily_goods} onChange={mk("living.daily_goods")} indent />

            <SheetSectionLabel text="その他支出" />
            <SheetRow label="交際費" arr={exp.social} onChange={mk("social")} indent />
            <SheetRow label="レジャー他" arr={exp.leisure} onChange={mk("leisure")} indent />
            <SheetRow label="その他" arr={exp.other} onChange={mk("other")} indent />
            <SheetRow label="突発" arr={exp.sudden} onChange={mk("sudden")} indent />

            <SheetRow label="収入合計" arr={model.incomeTotal} bold highlight />
            <SheetSectionLabel text="収入" />
            <SheetRow label={childLabel("father", "父")} arr={inc.father} onChange={mkInc("father")} indent />
            <SheetRow label={childLabel("mother", "母")} arr={inc.mother} onChange={mkInc("mother")} indent />
            <SheetRow label="税還付金他" arr={inc.taxRefund} onChange={mkInc("taxRefund")} indent />
            <SheetRow label="配当（自動計算）" arr={model.dividend} indent />
            <SheetRow label="子供手当等" arr={inc.other_childAllowance} onChange={mkInc("other_childAllowance")} indent />
            <SheetRow label="年金・退職金" arr={inc.pension_retirement} onChange={mkInc("pension_retirement")} indent />

            <SheetRow label="収支" arr={model.balance} bold highlight />
            <SheetSectionLabel text="資産推移（自動計算）" />
            <SheetRow label="金融資産" arr={model.securities} indent />
            <SheetRow label="現金" arr={model.cash} indent />
            <SheetRow label="不動産" arr={model.realEstateAsset} indent />
            <SheetRow label="総資産" arr={model.assetTotal} bold highlight />
          </div>
        </div>
        <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 8 }}>
          金色でハイライトした行は自動計算される合計・小計です。白い行は数値を直接編集できます（単位：万円）。1つの年に入力すると、それ以降の年も自動的に同じ金額になります。緑色の背景は費用ウィザードで設定した項目です。
        </div>
      </div>
    </div>
  );
}

function StartYearControl({ sim, setSim, params, setParams }) {
  const [input, setInput] = useState(String(params.simStartYear));
  const [note, setNote] = useState("");

  const apply = () => {
    const newStart = parseInt(input, 10);
    if (!Number.isFinite(newStart)) return;
    const shift = newStart - YEARS[0];
    if (shift === 0) return;
    const oldEnd = YEARS[0] + N - 1;
    const newEnd = newStart + N - 1;
    const lostRange = shift > 0 ? `${YEARS[0]}〜${Math.min(newStart - 1, oldEnd)}年` : `${Math.max(newStart, oldEnd + 1)}〜${oldEnd}年`;
    const ok = window.confirm(
      `シミュレーションの期間を${YEARS[0]}〜${oldEnd}年から${newStart}〜${newEnd}年に変更します（期間の長さは${N}年間のまま）。\n` +
      `実際の年（西暦）に紐づいたデータはそのままついてきますが、新しい期間から外れる${lostRange}のデータは失われます。元に戻しても復元されません。よろしいですか？`
    );
    if (!ok) return;
    const shiftedExpense = shiftYearArrays(sim.expense, shift);
    const shiftedIncome = shiftYearArrays(sim.income, shift);
    YEARS.splice(0, YEARS.length, ...Array.from({ length: N }, (_, i) => newStart + i));
    setSim((prev) => ({ ...prev, expense: shiftedExpense, income: shiftedIncome }));
    setParams((p) => ({ ...p, simStartYear: newStart }));
    setNote(`${newStart}年〜${newStart + N - 1}年に変更しました。`);
    setTimeout(() => setNote(""), 4000);
  };

  return (
    <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 12 }}>
      <div style={{ fontSize: 12.5, color: INK_SOFT, marginBottom: 6 }}>シミュレーション期間（{N}年間・固定）</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 3 }}>
          開始年
          <input type="number" value={input} onChange={(e) => setInput(e.target.value)}
            style={{ width: 90, padding: "5px 7px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" }} />
        </label>
        <div style={{ fontSize: 12, color: INK_SOFT }}>〜 {(parseInt(input, 10) || YEARS[0]) + N - 1}年</div>
        <button onClick={apply} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 4, border: "none", background: GOLD, color: "#fff", cursor: "pointer" }}>適用</button>
      </div>
      <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 6 }}>
        開始年を変えると、学費・支出などの各年のデータは実際の年（西暦）に紐づいたまま一緒に移動します。ただし新しい期間から外れる年のデータは失われるのでご注意ください（住宅ローン・家族の生年・保有銘柄などは年に依存しないのでそのまま残ります）。
      </div>
      {note && <div style={{ fontSize: 11.5, color: SUMI, marginTop: 6 }}>{note}</div>}
    </div>
  );
}

// 直近（最大5年分）の前年比の平均を実績データから計算する（0や未入力の年はスキップ）
function computeRecentGrowthRate(arr, currentIdx) {
  const samples = [];
  for (let i = Math.max(1, currentIdx - 5); i <= currentIdx && i < arr.length; i++) {
    const prev = arr[i - 1], cur = arr[i];
    if (prev > 0 && cur > 0) samples.push(cur / prev - 1);
  }
  if (samples.length === 0) return null;
  return samples.reduce((a, b) => a + b, 0) / samples.length;
}

function WageGrowthControl({ sim, setSim, params, setParams }) {
  const [note, setNote] = useState("");
  const currentYear = new Date().getFullYear();
  const currentIdx = Math.min(Math.max(currentYear - YEARS[0], 0), N - 1);
  const avgFather = computeRecentGrowthRate(sim.income.father, currentIdx);
  const avgMother = computeRecentGrowthRate(sim.income.mother, currentIdx);
  const fmtPct = (r) => (r == null ? "—" : `${(r * 100).toFixed(1)}%`);

  const apply = () => {
    const rate = params.wageGrowthRate || 0;
    if (!rate) { window.alert("上昇率が0%のままです。反映しても数値は変わりません。"); return; }
    const ok = window.confirm(
      `${currentYear}年の金額を基準に、${currentYear + 1}年以降の父・母の収入へ年${(rate * 100).toFixed(1)}%の上昇率を複利で反映します。\n` +
      `${currentYear + 1}年以降にすでに入力済みの金額は上書きされます。よろしいですか？`
    );
    if (!ok) return;
    setSim((prev) => {
      const next = clone(prev);
      ["father", "mother"].forEach((key) => {
        const arr = next.income[key];
        const base = arr[currentIdx];
        if (!base) return;
        for (let i = currentIdx + 1; i < N; i++) {
          arr[i] = Math.round(base * Math.pow(1 + rate, i - currentIdx) * 10) / 10;
        }
      });
      return next;
    });
    setNote(`${currentYear + 1}年以降の父・母の収入に反映しました。`);
    setTimeout(() => setNote(""), 4000);
  };

  return (
    <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <ParamField label="賃金上昇率（年率）" value={params.wageGrowthRate * 100} suffix="%"
          onChange={(v) => setParams((p) => ({ ...p, wageGrowthRate: v / 100 }))} />
        <button onClick={apply} style={{ fontSize: 11.5, padding: "8px 12px", borderRadius: 4, border: "none", background: GOLD, color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>
          {currentYear + 1}年以降の収入に反映
        </button>
      </div>
      <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 8 }}>
        参考：直近の実績から見た平均上昇率　父 {fmtPct(avgFather)} ／ 母 {fmtPct(avgMother)}
      </div>
      <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 4 }}>
        「反映」を押すと、{currentYear}年の金額を基準にこの上昇率で複利計算し、{currentYear + 1}年以降の父・母の収入欄に自動入力します（すでに入力済みの値は上書きされます）。
      </div>
      {note && <div style={{ fontSize: 11.5, color: SUMI, marginTop: 6 }}>{note}</div>}
    </div>
  );
}

const settingsBtnStyle = {
  fontSize: 11.5, padding: "7px 11px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
  background: CARD, color: INK, cursor: "pointer", whiteSpace: "nowrap",
};

function SettingsSection({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, borderLeft: `4px solid ${GOLD}`, paddingLeft: 8, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function SettingsModal({ sim, setSim, params, setParams, onOpenFamily, onOpenWizard, onExport, onImport, onReset, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: PAPER, zIndex: 200, overflowY: "auto",
      fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif",
    }}>
      <div style={{ background: INK, color: PAPER, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 17 }}>⚙ 設定</div>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #4A5A75", color: PAPER, borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>閉じる ×</button>
      </div>

      <div style={{ padding: "14px 16px 40px", display: "flex", flexDirection: "column", gap: 18 }}>
        <SettingsSection title="家族・費用の入力">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={onOpenFamily} style={settingsBtnStyle}>👪 家族構成を編集</button>
            <button onClick={onOpenWizard} style={settingsBtnStyle}>🧮 費用自動試算ウィザード</button>
          </div>
        </SettingsSection>

        <SettingsSection title="シミュレーション期間">
          <StartYearControl sim={sim} setSim={setSim} params={params} setParams={setParams} />
        </SettingsSection>

        <SettingsSection title="住居プラン">
          <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 12 }}>
            {params.housingPlanEnabled && (
              <div style={{ fontSize: 11.5, color: SUMI, background: SUMI_SOFT, borderRadius: 4, padding: "6px 8px", marginBottom: 8 }}>
                🧮 費用ウィザードのローン試算プランが有効なため、以下の選択は使われていません。変更するには「費用自動試算ウィザード」の「住宅」を開いてください。
              </div>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", opacity: params.housingPlanEnabled ? 0.4 : 1, pointerEvents: params.housingPlanEnabled ? "none" : "auto" }}>
              {[1, 2, 3, 4].map((v) => (
                <button key={v} onClick={() => setParams((p) => ({ ...p, housingType: v }))}
                  style={{
                    padding: "6px 10px", fontSize: 12, borderRadius: 4, cursor: "pointer",
                    border: `1px solid ${params.housingType === v ? GOLD : PAPER_LINE}`,
                    background: params.housingType === v ? GOLD_SOFT : "#fff", color: INK,
                  }}>{HOUSING_LABELS[v]}</button>
              ))}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="グローバル設定">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ParamField label="金融資産 年間成長率" value={(params.growthRate - 1) * 100} suffix="%"
                onChange={(v) => setParams((p) => ({ ...p, growthRate: 1 + v / 100 }))} />
              <ParamField label="配当利回り" value={params.dividendRate * 100} suffix="%"
                onChange={(v) => setParams((p) => ({ ...p, dividendRate: v / 100 }))} />
              <ParamField label="住宅ローン金利" value={params.loanRate * 100} suffix="%"
                onChange={(v) => setParams((p) => ({ ...p, loanRate: v / 100 }))}
                disabled={params.housingPlanEnabled}
                note={params.housingPlanEnabled ? "住宅ウィザードの金利を使用中" : undefined} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ParamField label={`初期金融資産(${YEARS[0]})`} value={params.securities0} suffix="万円"
                onChange={(v) => setParams((p) => ({ ...p, securities0: v }))} />
              <ParamField label={`初期現金(${YEARS[0]})`} value={params.cash0} suffix="万円"
                onChange={(v) => setParams((p) => ({ ...p, cash0: v }))} />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="賃金上昇率">
          <WageGrowthControl sim={sim} setSim={setSim} params={params} setParams={setParams} />
        </SettingsSection>

        <SettingsSection title="データの管理">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={onExport} style={settingsBtnStyle}>⬇ エクスポート</button>
            <button onClick={onImport} style={settingsBtnStyle}>⬆ インポート</button>
            <button onClick={onReset} style={{ ...settingsBtnStyle, color: SEAL, border: `1px solid ${SEAL}` }}>初期データにリセット</button>
          </div>
          <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 6 }}>
            「初期データにリセット」は、これまでの入力内容をすべて消して、アプリ最初のサンプルデータに戻します（元に戻せません。必要なら先にエクスポートで保存してください）。
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function SimulationTab({ sim, setSim, params, setParams, onOpenWizard, onOpenSheet }) {
  const model = useMemo(() => computeModel(sim, params), [sim, params]);
  const [activeMarker, setActiveMarker] = useState(null);

  const mk = (path) => (i, v) => {
    setSim((prev) => {
      const next = clone(prev);
      let obj = next.expense;
      const keys = path.split(".");
      for (let k = 0; k < keys.length - 1; k++) obj = obj[keys[k]];
      const arr = obj[keys[keys.length - 1]];
      if (NO_CASCADE_PATHS.has(keys[keys.length - 1])) arr[i] = v;
      else fillForward(arr, i, v);
      if (next.wizardTouched?.includes(path)) next.wizardTouched = next.wizardTouched.filter((p) => p !== path);
      return next;
    });
  };
  const mkInc = (key) => (i, v) => {
    setSim((prev) => { const next = clone(prev); fillForward(next.income[key], i, v); return next; });
  };
  const isWizard = (path) => (sim.wizardTouched || []).includes(path);

  const chartData = YEARS.map((y, i) => ({
    year: y,
    収入: Math.round(model.incomeTotal[i]),
    支出: Math.round(model.expenseTotal[i]),
    収支: Math.round(model.balance[i]),
    金融資産: Math.round(model.securities[i]),
    現金: Math.round(model.cash[i]),
    不動産: Math.round(model.realEstateAsset[i]),
    総資産: Math.round(model.assetTotal[i]),
  }));

  const peakAsset = Math.max(...model.assetTotal);
  const peakYear = YEARS[model.assetTotal.indexOf(peakAsset)];
  const negativeIdx = model.assetTotal.findIndex((v) => v < 0);

  const markerIcon = (emoji, key) => (props) => (
    <g style={{ cursor: "pointer" }} onClick={() => setActiveMarker((m) => (m === key ? null : key))}>
      <circle cx={props.cx} cy={props.cy} r={13} fill="#fff" stroke={PAPER_LINE} />
      <text x={props.cx} y={props.cy + 5} textAnchor="middle" fontSize={14}>{emoji}</text>
    </g>
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      <SectionHeader title="資産推移シミュレーション" />

      <div style={{ padding: "0 16px", height: 250, background: CARD, marginBottom: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 14, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={PAPER_LINE} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: INK_SOFT }} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: INK_SOFT }} />
            <Tooltip formatter={(v) => fmtMan(v)} labelFormatter={(l) => `${l}年`} contentStyle={{ fontSize: 12, borderRadius: 4 }} />
            <ReferenceLine y={0} stroke={INK} />
            <Area type="monotone" dataKey="金融資産" stackId="a" stroke={GOLD} fill={GOLD} fillOpacity={0.55} />
            <Area type="monotone" dataKey="現金" stackId="a" stroke={"#8FA6C7"} fill={"#8FA6C7"} fillOpacity={0.55} />
            <Area type="monotone" dataKey="不動産" stackId="a" stroke={SUMI} fill={SUMI} fillOpacity={0.4} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceDot x={peakYear} y={peakAsset} r={13} isFront shape={markerIcon("⭐", "peak")} />
            {negativeIdx >= 0 && (
              <ReferenceDot x={YEARS[negativeIdx]} y={model.assetTotal[negativeIdx]} r={13} isFront shape={markerIcon("❌", "depletion")} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {activeMarker === "peak" && (
        <div style={{ margin: "0 16px 10px", padding: "8px 10px", fontSize: 12, background: GOLD_SOFT, border: `1px solid ${GOLD}`, borderRadius: 4, color: INK }}>
          ⭐ 資産のピーク：{peakYear}年に総資産 {fmtMan(peakAsset)}
        </div>
      )}
      {activeMarker === "depletion" && (
        <div style={{ margin: "0 16px 10px", padding: "8px 10px", fontSize: 12, background: SEAL_SOFT, border: `1px solid ${SEAL}`, borderRadius: 4, color: INK }}>
          ❌ 資金ショート：{YEARS[negativeIdx]}年に総資産がマイナス（{fmtMan(model.assetTotal[negativeIdx])}）になります
        </div>
      )}
      <div style={{ padding: "4px 16px 0" }}>
        <RealEstateToggle params={params} setParams={setParams} />
      </div>
      <div style={{ padding: "8px 16px 0", height: 210, background: CARD, marginBottom: 18, marginTop: 10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barCategoryGap="10%" barGap={1}>
            <CartesianGrid stroke={PAPER_LINE} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: INK_SOFT }} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: INK_SOFT }} />
            <Tooltip formatter={(v) => fmtMan(v)} labelFormatter={(l) => `${l}年`} contentStyle={{ fontSize: 12, borderRadius: 4 }} />
            <ReferenceLine y={0} stroke={INK} />
            <Bar dataKey="収入" fill={SUMI} radius={[2, 2, 0, 0]} />
            <Bar dataKey="支出" fill={SEAL} radius={[2, 2, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionHeader title="支出の内訳を編集" sub="カテゴリをタップすると年ごとの金額（万円）を編集できます。1年に入力すると、それ以降も同じ金額が自動で続きます"
        rightSlot={
          <button onClick={onOpenSheet} style={{
            fontSize: 11.5, padding: "6px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
            background: CARD, color: INK, cursor: "pointer", whiteSpace: "nowrap",
          }}>📋 一覧を見る</button>
        }
      />
      <div style={{ padding: "0 16px" }}>
        <Accordion title="学費" colorKey="tuition" onWizard={() => onOpenWizard("tuition")} wizardLabel="学費ウィザード">
          <EditTable rows={[
            { label: "子供1", arr: sim.expense.tuition.child1, onChange: mk("tuition.child1"), wizard: isWizard("tuition.child1") },
            { label: "（習い事等）", arr: sim.expense.tuition.child1_extra, onChange: mk("tuition.child1_extra"), indent: true },
            { label: "子供2", arr: sim.expense.tuition.child2, onChange: mk("tuition.child2"), wizard: isWizard("tuition.child2") },
            { label: "（習い事等）", arr: sim.expense.tuition.child2_extra, onChange: mk("tuition.child2_extra"), indent: true },
            { label: "子供3", arr: sim.expense.tuition.child3, onChange: mk("tuition.child3"), wizard: isWizard("tuition.child3") },
            { label: "（習い事等）", arr: sim.expense.tuition.child3_extra, onChange: mk("tuition.child3_extra"), indent: true },
            { label: "子供下宿", arr: sim.expense.dorm, onChange: mk("dorm") },
          ]} />
        </Accordion>
        <Accordion title="医療・介護" colorKey="medical">
          <EditTable rows={[
            { label: "我々", arr: sim.expense.medical.us, onChange: mk("medical.us") },
            { label: "父方祖父", arr: sim.expense.medical.gfather_p, onChange: mk("medical.gfather_p") },
            { label: "父方祖母", arr: sim.expense.medical.gmother_p, onChange: mk("medical.gmother_p") },
            { label: "母方祖父", arr: sim.expense.medical.gfather_m, onChange: mk("medical.gfather_m") },
            { label: "母方祖母", arr: sim.expense.medical.gmother_m, onChange: mk("medical.gmother_m") },
          ]} />
        </Accordion>
        <Accordion title={params.housingPlanEnabled ? "住宅（ローン試算）" : `住宅（${HOUSING_LABELS[params.housingType]}）`} colorKey="housing" onWizard={() => onOpenWizard("housing")} wizardLabel="住宅ウィザード">
          {params.housingPlanEnabled ? (
            <div style={{ fontSize: 11.5, color: INK_SOFT }}>
              住宅ローン試算プランが有効です。返済額・ローン残高・金利は「住宅ウィザード」または「一覧」タブで確認・編集できます。
            </div>
          ) : params.housingType === 1 ? (
            <>
              <EditTable rows={[
                { label: "ローン支払", arr: sim.expense.housing_opt1_loanPayment, onChange: mk("housing_opt1_loanPayment") },
                { label: "ローン控除", arr: sim.expense.housing_opt1_loanDeduction, onChange: mk("housing_opt1_loanDeduction") },
                { label: "固定資産税", arr: sim.expense.housing_opt1_propertyTax, onChange: mk("housing_opt1_propertyTax") },
                { label: "保険", arr: sim.expense.housing_opt1_insurance, onChange: mk("housing_opt1_insurance") },
                { label: "修繕費", arr: sim.expense.housing_opt1_repair, onChange: mk("housing_opt1_repair") },
              ]} />
              <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 8 }}>
                借入 {fmtMan(params.loanInitial)}・建物 {fmtMan(params.buildingInitial)}・土地 {fmtMan(params.landInitial)}（2021年購入・ローン残高と資産価値は自動計算）
              </div>
            </>
          ) : params.housingType === 2 ? (
            <EditTable rows={[{ label: "賃貸→住替え費用", arr: sim.expense.housing_opt2_rent_relocate, onChange: mk("housing_opt2_rent_relocate") }]} />
          ) : params.housingType === 3 ? (
            <EditTable rows={[{ label: "分譲中古費用", arr: sim.expense.housing_opt3_used_condo, onChange: mk("housing_opt3_used_condo") }]} />
          ) : (
            <EditTable rows={[{ label: "賃貸→分譲費用", arr: sim.expense.housing_opt4_rent_to_condo, onChange: mk("housing_opt4_rent_to_condo") }]} />
          )}
        </Accordion>
        <Accordion title="車" colorKey="car" onWizard={() => onOpenWizard("car")} wizardLabel="車ウィザード">
          <EditTable rows={[
            { label: "本体", arr: sim.expense.car.body, onChange: mk("car.body"), wizard: isWizard("car.body") },
            { label: "駐車場", arr: sim.expense.car.parking, onChange: mk("car.parking"), wizard: isWizard("car.parking") },
            { label: "ガス代", arr: sim.expense.car.gas, onChange: mk("car.gas"), wizard: isWizard("car.gas") },
            { label: "保険", arr: sim.expense.car.insurance, onChange: mk("car.insurance"), wizard: isWizard("car.insurance") },
            { label: "税金", arr: sim.expense.car.tax, onChange: mk("car.tax"), wizard: isWizard("car.tax") },
            { label: "車検", arr: sim.expense.car.inspection, onChange: mk("car.inspection"), wizard: isWizard("car.inspection") },
            { label: "他経費", arr: sim.expense.car.other, onChange: mk("car.other"), wizard: isWizard("car.other") },
          ]} />
        </Accordion>
        <Accordion title="他生活費" colorKey="living">
          <EditTable rows={[
            { label: "食費", arr: sim.expense.living.food, onChange: mk("living.food") },
            { label: "光熱費", arr: sim.expense.living.utilities, onChange: mk("living.utilities") },
            { label: "通信費", arr: sim.expense.living.communication, onChange: mk("living.communication") },
            { label: "日用品・衣服", arr: sim.expense.living.daily_goods, onChange: mk("living.daily_goods") },
          ]} />
        </Accordion>
        <Accordion title="交際費・レジャー・その他・突発" colorKey="social">
          <EditTable rows={[
            { label: "交際費", arr: sim.expense.social, onChange: mk("social") },
            { label: "レジャー他", arr: sim.expense.leisure, onChange: mk("leisure") },
            { label: "その他", arr: sim.expense.other, onChange: mk("other") },
            { label: "突発", arr: sim.expense.sudden, onChange: mk("sudden") },
          ]} />
        </Accordion>
      </div>

      <SectionHeader title="収入の内訳を編集" />
      <div style={{ padding: "0 16px 8px" }}>
        <Accordion title="収入" colorKey="tuition" defaultOpen>
          <EditTable rows={[
            { label: "父", arr: sim.income.father, onChange: mkInc("father") },
            { label: "母", arr: sim.income.mother, onChange: mkInc("mother") },
            { label: "税還付金他", arr: sim.income.taxRefund, onChange: mkInc("taxRefund") },
            { label: "子供手当等", arr: sim.income.other_childAllowance, onChange: mkInc("other_childAllowance") },
            { label: "年金・退職金", arr: sim.income.pension_retirement, onChange: mkInc("pension_retirement") },
            { label: "配当収入（自動計算）", arr: model.dividend },
          ]} />
          <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 8 }}>配当収入 ＝ 前年末の金融資産 × 配当利回り</div>
        </Accordion>
      </div>
    </div>
  );
}

function ParamField({ label, value, suffix, onChange, digits = 1, disabled, note }) {
  const display = Math.round(value * 10 ** digits) / 10 ** digits;
  return (
    <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: "8px 12px", flex: "1 1 140px", opacity: disabled ? 0.45 : 1 }}>
      <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 3 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <input type="number" value={display} step={10 ** -digits} disabled={disabled}
          onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
          style={{ width: 70, fontSize: 15, fontWeight: 700, color: INK, border: "none", borderBottom: `1px solid ${PAPER_LINE}`, fontVariantNumeric: "tabular-nums", background: "transparent" }} />
        <span style={{ fontSize: 11, color: INK_SOFT }}>{suffix}</span>
      </div>
      {note && <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 3 }}>{note}</div>}
    </div>
  );
}

/* ============================================================
   タブ2：ポートフォリオ
   ============================================================ */
/* ============================================================
   銘柄検索・追加フォーム（Web検索でティッカーを同定）
   ============================================================ */
/* ============================================================
   家族タイムラインバー（生年から進学・年齢帯を色分け表示）
   ============================================================ */
function FamilyTimelineBar({ member }) {
  const segs = stagesFor(member, [YEARS[0], YEARS[N - 1]]);
  if (segs.length === 0) return (
    <div style={{ fontSize: 10.5, color: INK_SOFT, padding: "6px 0" }}>生年を入力するとタイムラインが表示されます</div>
  );
  const totalSpan = YEARS[N - 1] - YEARS[0] + 1;
  const thisYear = new Date().getFullYear();
  const markerPct = ((thisYear - YEARS[0]) / (totalSpan - 1)) * 100;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ position: "relative", display: "flex", height: 26, borderRadius: 4, overflow: "hidden", border: `1px solid ${PAPER_LINE}` }}>
        {segs.map((s, i) => {
          const span = s.end - s.start + 1;
          const wide = span >= 3;
          return (
            <div key={i} title={`${s.label} (${s.start}-${s.end})`} style={{
              flexGrow: span, flexBasis: 0, background: s.color, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 9, color: INK, borderRight: `1px solid ${PAPER}`, overflow: "hidden", whiteSpace: "nowrap",
            }}>{wide ? s.label : ""}</div>
          );
        })}
        {markerPct >= 0 && markerPct <= 100 && (
          <div style={{ position: "absolute", left: `${markerPct}%`, top: 0, bottom: 0, width: 2, background: SEAL }} title="現在" />
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: INK_SOFT, marginTop: 2 }}>
        <span>{YEARS[0]}</span><span>{YEARS[N - 1]}</span>
      </div>
    </div>
  );
}

function FamilyMemberCard({ member, onChange, onDelete, onRename }) {
  const [ageInput, setAgeInput] = useState("");
  const thisYear = new Date().getFullYear();
  const currentAge = member.birthYear != null ? thisYear - member.birthYear : null;
  const milestones = milestonesFor(member);
  const setBirthYear = (by) => onChange({ birthYear: by, memos: generateMemosFor(member, by) });

  return (
    <div style={{ border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 10, background: CARD, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <input value={member.label} onChange={(e) => onRename(e.target.value)}
          style={{ fontSize: 13, fontWeight: 600, color: INK, border: "none", borderBottom: `1px dashed ${PAPER_LINE}`, background: "transparent", flex: 1 }} />
        {member.custom && (
          <button onClick={onDelete} style={{ border: "none", background: "transparent", color: SEAL, fontSize: 14, cursor: "pointer" }}>×</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3 }}>
          生年（西暦）
          <input type="number" value={member.birthYear ?? ""} placeholder="例：1985"
            onChange={(e) => setBirthYear(e.target.value === "" ? null : parseInt(e.target.value, 10))}
            style={{ width: 90, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
        </label>
        <div style={{ fontSize: 11, color: INK_SOFT }}>または</div>
        <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3 }}>
          {`現在(${thisYear}年)の年齢`}
          <div style={{ display: "flex", gap: 4 }}>
            <input type="number" value={ageInput} onChange={(e) => setAgeInput(e.target.value)}
              style={{ width: 60, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
            <button onClick={() => { if (ageInput !== "") setBirthYear(thisYear - parseInt(ageInput, 10)); }}
              style={{ fontSize: 11, padding: "4px 8px", borderRadius: 3, border: "none", background: GOLD, color: "#fff", cursor: "pointer" }}>反映</button>
          </div>
        </label>
        {currentAge != null && (
          <div style={{ fontSize: 11, color: SUMI, fontWeight: 600 }}>現在 {currentAge}歳</div>
        )}
      </div>

      <FamilyTimelineBar member={member} />

      {milestones.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {milestones.map((m, i) => (
            <span key={i} style={{ fontSize: 10, background: GOLD_SOFT, color: INK, padding: "2px 7px", borderRadius: 10 }}>
              {m.label} {m.year}年
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FamilySetupModal({ family, setFamily, onClose }) {
  const updateMember = (idx, patch) => setFamily((prev) => { const next = [...prev]; next[idx] = { ...next[idx], ...patch }; return next; });
  const deleteMember = (idx) => setFamily((prev) => prev.filter((_, i) => i !== idx));
  const addMember = () => setFamily((prev) => [...prev, {
    id: `custom_${Date.now()}`, label: "新しい家族", group: "custom", birthYear: null, custom: true,
  }]);

  const groups = [
    { key: "parent", title: "親" },
    { key: "child", title: "子供" },
    { key: "grandparent", title: "祖父母" },
    { key: "custom", title: "その他" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: PAPER, zIndex: 200, overflowY: "auto",
      fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif",
    }}>
      <div style={{ background: INK, color: PAPER, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 17 }}>家族構成の設定</div>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #4A5A75", color: PAPER, borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>閉じる ×</button>
      </div>

      <div style={{ padding: "12px 16px 40px" }}>
        <p style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 0 }}>
          生年（西暦4桁）を入力すると、進学時期や年齢帯が自動計算されます。誕生月までは考慮していないため、実際の学年とは前後1年ずれる場合があります。ここで設定した内容は、次のフェーズで学費・医療費シミュレーションと連動する予定です。
        </p>
        {groups.map((g) => {
          const members = family.map((m, idx) => ({ ...m, idx })).filter((m) => m.group === g.key);
          if (members.length === 0 && g.key !== "custom") return null;
          return (
            <div key={g.key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, borderLeft: `4px solid ${GOLD}`, paddingLeft: 8, marginBottom: 8 }}>{g.title}</div>
              {members.map((m) => (
                <FamilyMemberCard key={m.id} member={m}
                  onChange={(patch) => updateMember(m.idx, patch)}
                  onDelete={() => deleteMember(m.idx)}
                  onRename={(label) => updateMember(m.idx, { label })}
                />
              ))}
              {g.key === "custom" && (
                <button onClick={addMember} style={{
                  fontSize: 11.5, padding: "6px 12px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
                  background: CARD, color: INK_SOFT, cursor: "pointer",
                }}>＋ 家族を追加</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddHoldingForm({ onAdd, fxRate }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState(null);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState(null); // 編集可能な属性の作業コピー
  const [qtyInput, setQtyInput] = useState("1");
  const [priceInput, setPriceInput] = useState(""); // 取得単価
  const [priceFetching, setPriceFetching] = useState(false);
  const [priceNote, setPriceNote] = useState("");
  const [open, setOpen] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true); setError(""); setCandidates(null); setPicked(null);
    try {
      const prompt = `A user wants to identify a specific tradable financial instrument matching this query: "${query}".
Use web search to confirm details. It could be a stock, ETF, cryptocurrency, or Japanese/global investment trust (投資信託).
Respond with ONLY JSON, no prose, no markdown fences, in this exact format:
{"candidates":[{"name":"<official name>","exchange":"<exchange code, e.g. NASDAQ, NYSEARCA, TYO — empty string if a mutual fund/investment trust with no exchange ticker>","ticker":"<ticker symbol, or empty string for a mutual fund>","instrumentType":"個別銘柄"|"ETF"|"仮想通貨"|"投信","currency":"USD"|"JPY","assetCat":"株式"|"コモディティ"|"債権"|"その他"}]}
Include up to 3 plausible candidates, best match first. If nothing plausible is found, return {"candidates":[]}.`;
      const res = await callClaudeWithSearch(prompt);
      const list = Array.isArray(res?.candidates) ? res.candidates : [];
      if (list.length === 0) setError("見つかりませんでした。名称やティッカーを変えて試してください。");
      setCandidates(list);
    } catch (e) {
      setError(e?.message || "検索に失敗しました。");
    } finally {
      setSearching(false);
    }
  };

  const pick = async (c) => {
    setPicked({ ...c });
    setQtyInput("1");
    setPriceInput("");
    setPriceNote("");
    // 選択直後に現在価格を検索して、取得単価のデフォルトに使う
    setPriceFetching(true);
    try {
      const isFund = c.instrumentType === "投信" || !c.exchange;
      const label = isFund ? c.name : `${c.exchange}:${c.ticker}`;
      const tag = isFund ? "[投資信託・基準価額を1万口あたりで]" : "[個別銘柄/ETF・1株あたりの価格]";
      const prompt = `Use web search to find the current/latest price for this item. For items tagged [投資信託], find the current 基準価額 (NAV) per 10,000 units in JPY. For items tagged [個別銘柄/ETF], find the current per-share price:\ni=0: ${tag} ${label}\n\nRespond with ONLY a JSON array, no prose, no markdown fences:\n[{"i":0,"price":<price as a plain number>,"currency":"USD" or "JPY","asOf":"<date found, YYYY-MM-DD>"}]\nIf not found, respond with [].`;
      const results = await callClaudeWithSearch(prompt);
      const r = Array.isArray(results) ? results[0] : null;
      if (r && typeof r.price === "number") {
        setPriceInput(String(r.price));
        setPriceNote(`現在価格を自動入力しました（${r.asOf || "取得日不明"}時点）。必要に応じて実際の取得単価に書き換えてください。`);
      } else {
        setPriceNote("現在価格が見つかりませんでした。取得単価を手入力してください。");
      }
    } catch (e) {
      setPriceNote(e?.message || "現在価格の取得に失敗しました。取得単価を手入力してください。");
    } finally {
      setPriceFetching(false);
    }
  };

  const addManually = () => {
    setPicked({
      name: query.trim() || "新しい銘柄", exchange: "", ticker: "",
      instrumentType: "個別銘柄", currency: "JPY", assetCat: "その他",
    });
    setQtyInput("1"); setPriceInput(""); setPriceNote("");
    setError(""); setCandidates(null);
  };

  const isFundPicked = picked && picked.instrumentType === "投信";

  const confirmAdd = () => {
    if (!picked) return;
    const isFund = isFundPicked;
    const qty = parseFloat(qtyInput) || 0;
    const unitPrice = parseFloat(priceInput) || 0;
    const fx = picked.currency === "USD" ? (fxRate || 150) : 1;
    // 取得額合計は「数量（または口数）× 取得単価」から自動算出
    const avgJpyTotal = isFund ? (qty / 10000) * unitPrice : qty * unitPrice * fx;
    const newHolding = {
      account: "", exchange: picked.exchange || "", ticker: picked.ticker || "",
      name: picked.name, qty: isFund ? 1 : qty,
      avgJpyTotal,
      priceUsdUnit: picked.currency === "USD" && !isFund ? unitPrice : null,
      priceJpyUnit: (picked.currency === "JPY" || isFund) ? unitPrice : null,
      valueJpy: avgJpyTotal, // 追加時点では取得単価＝評価額として初期化（後で価格取得により更新される）
      assetCat: picked.assetCat || "その他",
      stockType: picked.assetCat === "株式" ? (picked.instrumentType === "ETF" ? "ETF" : "個別銘柄") : null,
      commodityType: picked.assetCat === "コモディティ" ? picked.name : null,
      bondType: picked.assetCat === "債権" ? picked.name : null,
      instrumentType: picked.instrumentType || (picked.exchange ? "個別銘柄" : "投信"),
      currency: picked.currency === "USD" ? "ドル建" : "円建",
      autoFetchable: true,
      searchLabel: isFund ? picked.name : `${picked.exchange}:${picked.ticker}`,
      qtyMode: isFund ? "nav10000" : "shares",
      unitsImplied: isFund ? qty : null,
      lastUpdated: null,
    };
    onAdd(newHolding);
    setQuery(""); setCandidates(null); setPicked(null); setQtyInput("1"); setPriceInput(""); setOpen(false);
  };

  const selectStyle = {
    fontSize: 12, padding: "5px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, background: "#fff", color: INK,
  };

  return (
    <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 12, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>銘柄を検索して追加</div>
        <button onClick={() => setOpen((o) => !o)} style={{ fontSize: 11, color: INK_SOFT, background: "transparent", border: "none", cursor: "pointer" }}>
          {open ? "閉じる" : "開く"}
        </button>
      </div>
      {open && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="例：Apple, AAPL, eMAXIS 先進国, ビットコイン"
              onKeyDown={(e) => e.key === "Enter" && search()}
              style={{ flex: 1, fontSize: 12.5, padding: "7px 8px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4 }} />
            <button onClick={search} disabled={searching} style={{
              fontSize: 12.5, padding: "7px 14px", borderRadius: 4, border: "none",
              background: searching ? "#C9BFA5" : GOLD, color: "#fff", cursor: searching ? "default" : "pointer", whiteSpace: "nowrap",
            }}>{searching ? "検索中…" : "検索"}</button>
          </div>
          {error && <div style={{ fontSize: 11.5, color: SEAL, marginTop: 8 }}>{error}</div>}
          {!picked && (
            <button onClick={addManually} style={{
              fontSize: 11.5, marginTop: 8, padding: "6px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
              background: "transparent", color: INK_SOFT, cursor: "pointer",
            }}>見つからない場合は直接入力する</button>
          )}
          {candidates && candidates.length > 0 && !picked && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {candidates.map((c, i) => (
                <button key={i} onClick={() => pick(c)} style={{
                  textAlign: "left", padding: "8px 10px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4,
                  background: "#FFFDF9", cursor: "pointer",
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>{c.name}</div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 2 }}>
                    {c.exchange ? `${c.exchange}:${c.ticker}` : "投資信託（口数管理）"} ・ {c.instrumentType} ・ {c.assetCat} ・ {c.currency}
                  </div>
                </button>
              ))}
            </div>
          )}
          {picked && (
            <div style={{ marginTop: 10, border: `1px solid ${GOLD}`, borderRadius: 4, padding: 10, background: GOLD_SOFT }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, marginBottom: 8 }}>{picked.name}</div>

              <div style={{ fontSize: 10.5, color: INK_SOFT, marginBottom: 4 }}>属性（検索結果から自動判定・編集可）</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3 }}>
                  種別
                  <select value={picked.instrumentType} onChange={(e) => setPicked((p) => ({ ...p, instrumentType: e.target.value }))} style={selectStyle}>
                    <option value="個別銘柄">個別銘柄</option>
                    <option value="ETF">ETF</option>
                    <option value="仮想通貨">仮想通貨</option>
                    <option value="投信">投信</option>
                  </select>
                </label>
                <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3 }}>
                  資産クラス
                  <select value={picked.assetCat} onChange={(e) => setPicked((p) => ({ ...p, assetCat: e.target.value }))} style={selectStyle}>
                    <option value="株式">株式</option>
                    <option value="コモディティ">コモディティ</option>
                    <option value="債権">債権</option>
                    <option value="その他">その他</option>
                  </select>
                </label>
                <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3 }}>
                  通貨
                  <select value={picked.currency} onChange={(e) => setPicked((p) => ({ ...p, currency: e.target.value }))} style={selectStyle}>
                    <option value="JPY">JPY（円建）</option>
                    <option value="USD">USD（ドル建）</option>
                  </select>
                </label>
              </div>
              {!isFundPicked && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3 }}>
                    取引所
                    <input value={picked.exchange} onChange={(e) => setPicked((p) => ({ ...p, exchange: e.target.value }))}
                      style={{ ...selectStyle, width: 100 }} placeholder="例：NASDAQ" />
                  </label>
                  <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3 }}>
                    ティッカー
                    <input value={picked.ticker} onChange={(e) => setPicked((p) => ({ ...p, ticker: e.target.value }))}
                      style={{ ...selectStyle, width: 90 }} placeholder="例：AAPL" />
                  </label>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 3 }}>
                  {isFundPicked ? "保有口数" : "保有数量（株）"}
                  <input type="number" value={qtyInput} onChange={(e) => setQtyInput(e.target.value)}
                    style={{ width: 100, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
                </label>
                <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 3 }}>
                  取得単価{isFundPicked ? "（1万口あたり・円）" : `（${picked.currency === "USD" ? "$" : "¥"}）`}
                  <input type="number" value={priceInput} onChange={(e) => setPriceInput(e.target.value)}
                    placeholder={priceFetching ? "取得中…" : ""}
                    style={{ width: 120, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
                </label>
              </div>
              {priceNote && <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 6 }}>{priceNote}</div>}
              <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>
                取得額合計：{fmtYen(isFundPicked ? ((parseFloat(qtyInput) || 0) / 10000) * (parseFloat(priceInput) || 0) : (parseFloat(qtyInput) || 0) * (parseFloat(priceInput) || 0) * (picked.currency === "USD" ? (fxRate || 150) : 1))}
              </div>

              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button onClick={confirmAdd} disabled={priceFetching} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 4, border: "none", background: SUMI, color: "#fff", cursor: "pointer" }}>この内容で追加</button>
                <button onClick={() => setPicked(null)} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`, background: "transparent", cursor: "pointer" }}>戻る</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function PortfolioTab({ holdings, setHoldings, cashList, setCashList, params, setParams, asOfDate, setAsOfDate }) {
  const totalCash = cashList.reduce((s, c) => s + (c.amount || 0), 0);
  const totalValue = holdings.reduce((s, h) => s + (h.valueJpy || 0), 0) + totalCash;
  const totalCost = holdings.reduce((s, h) => s + (h.avgJpyTotal || 0), 0);
  const totalPl = holdings.reduce((s, h) => s + ((h.valueJpy || 0) - (h.avgJpyTotal || 0)), 0);

  const [fetchStatus, setFetchStatus] = useState("");
  const [fetching, setFetching] = useState(false);
  const paramsRef = useRef(params);
  useEffect(() => { paramsRef.current = params; }, [params]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isHistorical = asOfDate !== todayStr;

  const fetchLatestPrices = async () => {
    setFetching(true);
    try {
      const { fxRate, valueMap, updated, failed } = await fetchPricesAsOf(asOfDate, holdings, params.fxRate, setFetchStatus);
      setParams((p) => ({ ...p, fxRate }));
      setHoldings((prev) => prev.map((h, idx) => {
        const r = valueMap[idx];
        if (!r) return h;
        const next = { ...h, valueJpy: r.valueJpy, lastUpdated: r.asOf };
        if (h.qtyMode === "nav10000") next.priceJpyUnit = r.price;
        else if (r.currency === "USD") next.priceUsdUnit = r.price;
        else next.priceJpyUnit = r.price;
        return next;
      }));
      setFetchStatus(`完了：${updated}件更新${failed ? `（${failed}件失敗）` : ""}`);
    } catch (e) {
      setFetchStatus(e?.message || "取得に失敗しました。");
    } finally {
      setFetching(false);
      setTimeout(() => setFetchStatus(""), 5000);
    }
  };

  const groups = {};
  holdings.forEach((h, idx) => {
    const cat = h.assetCat || "その他";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(idx);
  });

  const updateHolding = (idx, field, value) => {
    setHoldings((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };
  const updateCash = (idx, value) => {
    setCashList((prev) => { const next = [...prev]; next[idx] = { ...next[idx], amount: value }; return next; });
  };
  const updateCashField = (idx, field, value) => {
    setCashList((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };
  const addCash = () => setCashList((prev) => [...prev, { bank: `口座${prev.length + 1}`, amount: 0 }]);
  const deleteCash = (idx) => setCashList((prev) => prev.filter((_, i) => i !== idx));
  const deleteHolding = (idx) => {
    if (!window.confirm("この銘柄を削除しますか？")) return;
    setHoldings((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <SectionHeader title="保有ポートフォリオ" sub="評価額・取得額を編集すると合計と集計に反映されます" />
      <div style={{ display: "flex", gap: 8, padding: "0 16px 14px", flexWrap: "wrap" }}>
        <StatCard label="評価額合計" value={fmtYen(totalValue)} tone="gold" />
        <StatCard label="含み損益" value={(totalPl >= 0 ? "+" : "") + fmtYen(totalPl)} tone={totalPl >= 0 ? "sumi" : "seal"} />
        <StatCard label="保有銘柄数" value={holdings.length + "件"} tone="ink" small />
      </div>

      <div style={{ padding: "0 16px" }}>
        <AddHoldingForm onAdd={(h) => setHoldings((prev) => [...prev, h])} fxRate={params.fxRate} />
      </div>

      <div style={{ padding: "0 16px 14px" }}>
        <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, marginBottom: 6 }}>時点指定で価格を取得</div>
          <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 10 }}>
            日付を指定すると、その日（休場日の場合は直近の取引日）の終値でETF・個別株・仮想通貨（{holdings.filter((h) => h.autoFetchable).length}件）の評価額を再計算します
          </div>
          <div style={{ fontSize: 11, color: SEAL, background: SEAL_SOFT, borderRadius: 4, padding: "6px 8px", marginBottom: 10 }}>
            ⚠ 価格の自動取得は現在準備中です。ボタンを押すと「失敗」になりますが正常な動作です。今は各銘柄の評価額を下の欄で手入力してください。
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <input type="date" value={asOfDate} max={todayStr} onChange={(e) => setAsOfDate(e.target.value)}
              style={{ padding: "6px 8px", fontSize: 13, border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" }} />
            <button onClick={fetchLatestPrices} disabled={fetching} style={{
              padding: "8px 14px", fontSize: 12.5, borderRadius: 5, border: "none", cursor: fetching ? "default" : "pointer",
              background: fetching ? "#C9BFA5" : GOLD, color: "#fff", fontWeight: 600, whiteSpace: "nowrap",
            }}>{fetching ? "取得中…" : isHistorical ? "この日付の価格を取得" : "現在の価格を取得"}</button>
            {isHistorical && (
              <button onClick={() => setAsOfDate(todayStr)} style={{
                fontSize: 11.5, color: INK_SOFT, background: "transparent", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, padding: "6px 8px", cursor: "pointer",
              }}>今日に戻す</button>
            )}
          </div>
          {fetchStatus && <div style={{ fontSize: 11.5, color: SUMI, marginTop: 8 }}>{fetchStatus}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11.5, color: INK_SOFT }}>
            USD/JPY レート:
            <input type="number" value={params.fxRate} step="0.01"
              onChange={(e) => setParams((p) => ({ ...p, fxRate: parseFloat(e.target.value) || p.fxRate }))}
              style={{ width: 70, padding: "3px 5px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
          </div>
          <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 6 }}>
            ※ 投資信託は元データの保有口数が不明なため、現在の評価額と基準価額から口数を逆算して概算しています（正確な口数ではありません）。過去日付はWeb検索による推定のため、実際の終値・基準価額と多少ずれる場合があります。
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <Accordion title={`現金 — ${fmtYen(totalCash)}`} colorKey="living" defaultOpen>
          {cashList.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${PAPER_LINE}`, gap: 6 }}>
              <input value={c.bank} onChange={(e) => updateCashField(i, "bank", e.target.value)} placeholder="口座名・メモ"
                style={{ flex: 1, fontSize: 13, color: INK, border: "none", borderBottom: `1px dashed ${PAPER_LINE}`, background: "transparent", padding: "2px 2px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 12, color: INK_SOFT }}>¥</span>
                <input type="number" value={c.amount} onChange={(e) => updateCash(i, parseFloat(e.target.value) || 0)}
                  style={{ width: 100, textAlign: "right", fontSize: 13, padding: "3px 5px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
              </div>
              <button onClick={() => deleteCash(i)} title="削除" style={{ border: "none", background: "transparent", color: SEAL, fontSize: 14, cursor: "pointer", padding: "0 2px" }}>×</button>
            </div>
          ))}
          <button onClick={addCash} style={{
            marginTop: 8, fontSize: 11.5, padding: "5px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
            background: "#FFFDF9", color: INK_SOFT, cursor: "pointer",
          }}>＋ 現金行を追加</button>
        </Accordion>

        {Object.entries(groups).map(([cat, idxs]) => {
          const subtotal = idxs.reduce((s, i) => s + (holdings[i].valueJpy || 0), 0);
          return (
            <Accordion key={cat} title={`${cat} — ${fmtYen(subtotal)}`} colorKey={cat === "株式" ? "tuition" : cat === "債権" ? "car" : "housing"}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {idxs.map((i) => {
                  const h = holdings[i];
                  const pl = (h.valueJpy || 0) - (h.avgJpyTotal || 0);
                  return (
                    <div key={i} style={{ border: `1px solid ${PAPER_LINE}`, borderRadius: 4, padding: "8px 10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, maxWidth: "70%" }}>
                          {h.ticker ? `${h.ticker} ` : ""}{h.name}
                        </div>
                        <div style={{ fontSize: 10.5, color: INK_SOFT, textAlign: "right" }}>
                          {h.stockType || h.commodityType || h.bondType || h.instrumentType}
                          {h.autoFetchable ? (
                            <div style={{ color: h.lastUpdated ? SUMI : "#B8A26A" }}>{h.lastUpdated ? `更新:${h.lastUpdated}` : "自動取得対象"}</div>
                          ) : (
                            <div style={{ color: "#B8A26A" }}>手動更新のみ</div>
                          )}
                        </div>
                        <button onClick={() => deleteHolding(i)} title="削除" style={{
                          marginLeft: 6, border: "none", background: "transparent", color: SEAL, fontSize: 14, cursor: "pointer", lineHeight: 1, padding: "0 2px",
                        }}>×</button>
                      </div>
                      <div style={{ display: "flex", gap: 10, fontSize: 11.5 }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          取得額(¥)
                          <input type="number" value={h.avgJpyTotal} onChange={(e) => updateHolding(i, "avgJpyTotal", parseFloat(e.target.value) || 0)}
                            style={{ width: 92, textAlign: "right", padding: "3px 5px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
                        </label>
                        <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          評価額(¥)
                          <input type="number" value={h.valueJpy} onChange={(e) => updateHolding(i, "valueJpy", parseFloat(e.target.value) || 0)}
                            style={{ width: 92, textAlign: "right", padding: "3px 5px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginLeft: "auto", alignItems: "flex-end" }}>
                          損益
                          <span style={{ fontWeight: 700, color: pl >= 0 ? SUMI : SEAL }}>{(pl >= 0 ? "+" : "") + fmtYen(pl)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   タブ3：資産集計
   ============================================================ */
const PIE_PALETTE = [GOLD, SUMI, "#5B7FA6", SEAL, "#8E6BA6", "#C77B4F", "#6B9B6E", "#8FA6C7", "#5CA0A0", "#8A8577"];

/* 円グラフのラベルが密集する小さい扇形どうしで重ならないよう、
   同じ側（左/右）に置いた既存の全ラベルとの距離を見て縦にずらしながら
   引き出し線（本体→折れ点→ラベル）を描く */
function renderPieLeaderLabel() {
  const placed = { left: [], right: [] };
  const MIN_GAP = 16;
  return (props) => {
    const { cx, cy, midAngle, outerRadius, percent, name, index } = props;
    if (!percent || percent < 0.001) return null;
    const RADIAN = Math.PI / 180;
    const cos = Math.cos(-RADIAN * midAngle);
    const sin = Math.sin(-RADIAN * midAngle);
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    const bendR = outerRadius + 10;
    const mx = cx + bendR * cos;
    let my = cy + bendR * sin;
    const isRight = cos >= 0;
    const arr = placed[isRight ? "right" : "left"];
    // 同じ側の直前のラベルより下にしか押し出さない一方向の調整なので、
    // 何度比較しても必ず収束する（往復して固まることがない）
    if (arr.length && my - arr[arr.length - 1] < MIN_GAP) {
      my = arr[arr.length - 1] + MIN_GAP;
    }
    arr.push(my);
    const legLen = 10;
    const ex = mx + (isRight ? legLen : -legLen);
    const color = PIE_PALETTE[index % PIE_PALETTE.length];
    const pct = `${(percent * 100).toFixed(percent < 0.03 ? 1 : 0)}%`;
    return (
      <g key={`pie-label-${name}`}>
        <path d={`M${sx},${sy} L${mx},${my} L${ex},${my}`} stroke={INK_SOFT} strokeWidth={1} fill="none" />
        <text x={ex + (isRight ? 3 : -3)} y={my} textAnchor={isRight ? "start" : "end"} dominantBaseline="middle" fontSize={10.5} fontWeight={600} fill={color}>
          {name} {pct}
        </text>
      </g>
    );
  };
}

function AggregationTab({ holdings, cashList, sim, params, setParams, asOfDate, yearSnapshots, setYearSnapshots }) {
  const totalCash = cashList.reduce((s, c) => s + (c.amount || 0), 0);
  const model = useMemo(() => computeModel(sim, params), [sim, params]);

  const anchorYear = parseInt((asOfDate || "").slice(0, 4), 10) || new Date().getFullYear();
  const currentIdx = Math.min(Math.max(anchorYear - YEARS[0], 0), N - 1);
  const [yearIdx, setYearIdx] = useState(currentIdx);
  useEffect(() => { setYearIdx(currentIdx); }, [currentIdx]);
  const isNow = yearIdx === currentIdx;
  const selectedYear = YEARS[yearIdx];
  const snapshot = yearSnapshots[selectedYear];
  const isPast = selectedYear < anchorYear;
  const [snapFetching, setSnapFetching] = useState(false);
  const [snapStatus, setSnapStatus] = useState("");

  const fetchYearSnapshot = async () => {
    setSnapFetching(true);
    try {
      const dateStr = `${selectedYear}-12-31`;
      const { fxRate, valueMap, updated, failed } = await fetchPricesAsOf(dateStr, holdings, params.fxRate, setSnapStatus);
      setYearSnapshots((prev) => ({ ...prev, [selectedYear]: { valueMap, fxRate, fetchedAt: new Date().toISOString().slice(0, 10) } }));
      setSnapStatus(`完了：${updated}件取得${failed ? `（${failed}件失敗）` : ""}`);
    } catch (e) {
      setSnapStatus(e?.message || "取得に失敗しました。");
    } finally {
      setSnapFetching(false);
      setTimeout(() => setSnapStatus(""), 5000);
    }
  };

  // 「現在」時点：実際の保有ポートフォリオから内訳を作る
  const subMapNow = {};
  let securitiesLikeTotalNow = 0;
  holdings.forEach((h) => {
    const cat = h.assetCat || "その他";
    const sub = h.stockType || h.commodityType || h.bondType || "その他";
    const key = `${cat} / ${sub}`;
    subMapNow[key] = (subMapNow[key] || 0) + (h.valueJpy || 0);
    securitiesLikeTotalNow += h.valueJpy || 0;
  });
  const subWeights = Object.fromEntries(
    Object.entries(subMapNow).map(([k, v]) => [k, securitiesLikeTotalNow > 0 ? v / securitiesLikeTotalNow : 0])
  );

  let subRows, total, cashPortion, mode;
  if (isNow) {
    const map = { ...subMapNow, "現金 / 現金": totalCash };
    subRows = Object.entries(map).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    total = securitiesLikeTotalNow + totalCash;
    cashPortion = totalCash;
    mode = "now";
  } else if (snapshot) {
    // 過去の実勢価格（Web検索で取得済み）を反映
    const map = {};
    holdings.forEach((h, idx) => {
      const v = snapshot.valueMap[idx];
      if (!v) return;
      const cat = h.assetCat || "その他";
      const sub = h.stockType || h.commodityType || h.bondType || "その他";
      const key = `${cat} / ${sub}`;
      map[key] = (map[key] || 0) + v.valueJpy;
    });
    const secTotal = Object.values(map).reduce((a, b) => a + b, 0);
    if (totalCash > 0) map["現金 / 現金（現在の残高で代用）"] = totalCash;
    subRows = Object.entries(map).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    total = secTotal + totalCash;
    cashPortion = totalCash;
    mode = "snapshot";
  } else {
    // 実データのない年：現在の資産配分比率を、その年のシミュレーション結果に適用した試算値
    const secVal = model.securities[yearIdx];
    const cashVal = model.cash[yearIdx];
    const reVal = model.realEstateAsset[yearIdx];
    const map = {};
    Object.entries(subWeights).forEach(([k, w]) => { if (w > 0) map[k] = w * secVal; });
    if (cashVal > 0) map["現金 / 現金"] = cashVal;
    if (reVal > 0) map["不動産 / 自宅"] = reVal;
    subRows = Object.entries(map).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    total = secVal + cashVal + reVal;
    cashPortion = cashVal;
    mode = "estimate";
  }
  const pieData = subRows.map(([k, v]) => ({ name: k, value: Math.round(v) }));

  const currencyMap = {};
  if (isNow) {
    holdings.forEach((h) => { const cur = h.currency || "円建"; currencyMap[cur] = (currencyMap[cur] || 0) + (h.valueJpy || 0); });
    currencyMap["円建"] = (currencyMap["円建"] || 0) + totalCash;
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <SectionHeader title="資産集計" sub={
        mode === "now" ? `${asOfDate} 時点の保有ポートフォリオ・現金の内訳` :
        mode === "snapshot" ? `${selectedYear}年末の実勢価格（Web検索取得・${snapshot.fetchedAt}に取得）に基づく内訳` :
        "試算：その年の資産配分（指定時点の保有比率をシミュレーション結果に適用した推計）"
      } />

      <div style={{ padding: "0 16px 6px" }}>
        <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 22, color: INK }}>{selectedYear}年</span>
            {mode === "now" ? (
              <span style={{ fontSize: 11, background: SUMI_SOFT, color: SUMI, padding: "2px 8px", borderRadius: 10 }}>実績（{asOfDate}時点）</span>
            ) : mode === "snapshot" ? (
              <span style={{ fontSize: 11, background: SUMI_SOFT, color: SUMI, padding: "2px 8px", borderRadius: 10 }}>実勢価格（取得済み）</span>
            ) : (
              <span style={{ fontSize: 11, background: GOLD_SOFT, color: GOLD, padding: "2px 8px", borderRadius: 10 }}>シミュレーション試算</span>
            )}
          </div>
          <input
            type="range" min={0} max={N - 1} step={1} value={yearIdx}
            onChange={(e) => setYearIdx(parseInt(e.target.value, 10))}
            style={{ width: "100%", accentColor: GOLD }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: INK_SOFT, marginTop: 2 }}>
            <span>{YEARS[0]}年</span>
            <span>{YEARS[N - 1]}年</span>
          </div>
          {isPast && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${PAPER_LINE}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <button onClick={fetchYearSnapshot} disabled={snapFetching} style={{
                  fontSize: 11.5, padding: "6px 12px", borderRadius: 4, border: "none", cursor: snapFetching ? "default" : "pointer",
                  background: snapFetching ? "#C9BFA5" : GOLD, color: "#fff", fontWeight: 600,
                }}>{snapFetching ? "取得中…" : snapshot ? "この年を再取得" : "この年末の実勢価格を取得"}</button>
                {snapStatus && <span style={{ fontSize: 11, color: SUMI }}>{snapStatus}</span>}
              </div>
              <div style={{ fontSize: 11, color: SEAL, background: SEAL_SOFT, borderRadius: 4, padding: "6px 8px", marginTop: 6 }}>
                ⚠ 価格の自動取得は現在準備中です。ボタンを押すと「失敗」になりますが正常な動作です。
              </div>
              <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 6 }}>
                {selectedYear}年12月31日（休場日ならその直前の取引日）の終値・基準価額をWeb検索で取得し、現在保有している銘柄で当時の資産配分を再現します。現金残高は当時の記録がないため現在の残高で代用しています。
              </div>
            </div>
          )}
        </div>
      </div>


      <div style={{ display: "flex", gap: 8, padding: "10px 16px 14px", flexWrap: "wrap" }}>
        <StatCard label="資産評価額" value={fmtYen(total)} tone="gold" />
        <StatCard label="現金比率" value={total > 0 ? fmt((cashPortion / total) * 100, 1) + "%" : "-"} tone="ink" />
      </div>
      <div style={{ padding: "0 16px 10px" }}>
        <RealEstateToggle params={params} setParams={setParams} />
      </div>

      <div style={{ padding: "0 16px", height: 360, background: CARD }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={74} label={renderPieLeaderLabel()} labelLine={false} isAnimationActive={false}>
              {pieData.map((_, i) => <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => fmtYen(v)} contentStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {mode === "estimate" && (
        <div style={{ padding: "6px 16px 0", fontSize: 10.5, color: INK_SOFT }}>
          ※ この年の実際の保有記録はデータ上ないため、現在の資産配分比率をシミュレーション上の金額に当てはめた推計値です。上のボタンで実勢価格を取得すると、実際の銘柄データに基づく内訳に切り替わります。
        </div>
      )}
      {mode === "snapshot" && (
        <div style={{ padding: "6px 16px 0", fontSize: 10.5, color: INK_SOFT }}>
          ※ Web検索による取得のため、実際の終値・基準価額と多少ずれる場合があります。現金残高は当時の記録がなく現在の残高を代用しています。
        </div>
      )}

      <SectionHeader title="内訳明細" />
      <div style={{ padding: "0 16px" }}>
        <div style={{ border: `1px solid ${PAPER_LINE}`, borderRadius: 5, overflow: "hidden", background: CARD }}>
          {subRows.map(([k, v], i) => (
            <div key={k} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px",
              borderBottom: i < subRows.length - 1 ? `1px solid ${PAPER_LINE}` : "none", fontSize: 12.5,
            }}>
              <span style={{ color: INK, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_PALETTE[i % PIE_PALETTE.length], flexShrink: 0 }} />
                {k}
              </span>
              <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: "tabular-nums" }}>{fmtYen(v)} <span style={{ color: INK_SOFT, fontWeight: 400 }}>（{fmt((v / total) * 100, 1)}%）</span></span>
            </div>
          ))}
        </div>
      </div>

      {isNow && (
        <>
          <SectionHeader title="通貨別内訳" />
          <div style={{ padding: "0 16px" }}>
            <div style={{ border: `1px solid ${PAPER_LINE}`, borderRadius: 5, overflow: "hidden", background: CARD }}>
              {Object.entries(currencyMap).filter(([, v]) => v > 0).map(([k, v], i, arr) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 12px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${PAPER_LINE}` : "none", fontSize: 12.5,
                }}>
                  <span style={{ color: INK }}>{k}</span>
                  <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: "tabular-nums" }}>{fmtYen(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   家計簿（実績入力・集計）
   ============================================================ */
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function defaultLedgerState() {
  return {
    entries: [],
    categories: [
      { id: "food", name: "食費", type: "expense", linkPath: "living.food" },
      { id: "eatout", name: "外食", type: "expense", linkPath: null },
      { id: "daily", name: "日用品・衣服", type: "expense", linkPath: "living.daily_goods" },
      { id: "utilities", name: "光熱費", type: "expense", linkPath: "living.utilities" },
      { id: "communication", name: "通信費", type: "expense", linkPath: "living.communication" },
      { id: "car", name: "車関連", type: "expense", linkPath: null },
      { id: "housing", name: "住宅", type: "expense", linkPath: null },
      { id: "medical", name: "医療費", type: "expense", linkPath: null },
      { id: "education", name: "教育費", type: "expense", linkPath: null },
      { id: "social", name: "交際費", type: "expense", linkPath: "social" },
      { id: "leisure", name: "レジャー", type: "expense", linkPath: "leisure" },
      { id: "other_exp", name: "その他支出", type: "expense", linkPath: "other" },
      { id: "salary", name: "給料", type: "income", linkPath: "father" },
      { id: "bonus", name: "賞与", type: "income", linkPath: null },
      { id: "child_allowance", name: "児童手当", type: "income", linkPath: "other_childAllowance" },
      { id: "other_inc", name: "その他収入", type: "income", linkPath: null },
    ],
  };
}

// 現在の住宅設定（費用ウィザードのローン試算プランは計算結果のため紐付け対象にできない）に応じて、
// 家計簿の費目から紐付けられるシミュレーション上の項目一覧を返す
function getLinkableFields(params) {
  const expense = [
    { group: "学費", path: "tuition.child1", label: "子1" },
    { group: "学費", path: "tuition.child1_extra", label: "子1（習い事等）" },
    { group: "学費", path: "tuition.child2", label: "子2" },
    { group: "学費", path: "tuition.child2_extra", label: "子2（習い事等）" },
    { group: "学費", path: "tuition.child3", label: "子3" },
    { group: "学費", path: "tuition.child3_extra", label: "子3（習い事等）" },
    { group: "学費", path: "dorm", label: "子供下宿" },
    { group: "医療・介護", path: "medical.us", label: "我々" },
    { group: "医療・介護", path: "medical.gfather_p", label: "父方祖父" },
    { group: "医療・介護", path: "medical.gmother_p", label: "父方祖母" },
    { group: "医療・介護", path: "medical.gfather_m", label: "母方祖父" },
    { group: "医療・介護", path: "medical.gmother_m", label: "母方祖母" },
    { group: "車", path: "car.body", label: "本体" },
    { group: "車", path: "car.parking", label: "駐車場" },
    { group: "車", path: "car.gas", label: "ガス代" },
    { group: "車", path: "car.insurance", label: "保険" },
    { group: "車", path: "car.tax", label: "税金" },
    { group: "車", path: "car.inspection", label: "車検" },
    { group: "車", path: "car.other", label: "他経費" },
    { group: "他生活費", path: "living.food", label: "食費" },
    { group: "他生活費", path: "living.utilities", label: "光熱費" },
    { group: "他生活費", path: "living.communication", label: "通信費" },
    { group: "他生活費", path: "living.daily_goods", label: "日用品・衣服" },
    { group: "交際費・レジャー・その他・突発", path: "social", label: "交際費" },
    { group: "交際費・レジャー・その他・突発", path: "leisure", label: "レジャー他" },
    { group: "交際費・レジャー・その他・突発", path: "other", label: "その他" },
    { group: "交際費・レジャー・その他・突発", path: "sudden", label: "突発" },
  ];
  if (!params.housingPlanEnabled) {
    if (params.housingType === 1) {
      expense.push(
        { group: "住宅", path: "housing_opt1_loanPayment", label: "ローン支払" },
        { group: "住宅", path: "housing_opt1_loanDeduction", label: "ローン控除" },
        { group: "住宅", path: "housing_opt1_propertyTax", label: "固定資産税" },
        { group: "住宅", path: "housing_opt1_insurance", label: "保険" },
        { group: "住宅", path: "housing_opt1_repair", label: "修繕費" },
      );
    } else if (params.housingType === 2) {
      expense.push({ group: "住宅", path: "housing_opt2_rent_relocate", label: "賃貸→住替え" });
    } else if (params.housingType === 3) {
      expense.push({ group: "住宅", path: "housing_opt3_used_condo", label: "分譲中古" });
    } else if (params.housingType === 4) {
      expense.push({ group: "住宅", path: "housing_opt4_rent_to_condo", label: "賃貸→分譲" });
    }
  }
  const income = [
    { group: "収入", path: "father", label: "父" },
    { group: "収入", path: "mother", label: "母" },
    { group: "収入", path: "taxRefund", label: "税還付金他" },
    { group: "収入", path: "other_childAllowance", label: "子供手当等" },
    { group: "収入", path: "pension_retirement", label: "年金・退職金" },
  ];
  return { expense, income };
}

function getSimValueAtPath(sim, type, path, idx) {
  const keys = path.split(".");
  let obj = type === "income" ? sim.income : sim.expense;
  for (let k = 0; k < keys.length - 1; k++) obj = obj[keys[k]];
  return obj[keys[keys.length - 1]][idx] ?? 0;
}
function setSimValueAtPath(simDraft, type, path, idx, value) {
  const keys = path.split(".");
  let obj = type === "income" ? simDraft.income : simDraft.expense;
  for (let k = 0; k < keys.length - 1; k++) obj = obj[keys[k]];
  obj[keys[keys.length - 1]][idx] = value;
}

function LedgerCategoryEditor({ ledger, setLedger, params }) {
  const { expense: expenseFields, income: incomeFields } = getLinkableFields(params);
  const fieldsFor = (type) => (type === "income" ? incomeFields : expenseFields);

  const updateCat = (id, patch) => setLedger((prev) => ({
    ...prev, categories: prev.categories.map((c) => c.id === id ? { ...c, ...patch } : c),
  }));
  const deleteCat = (id) => {
    const inUse = ledger.entries.some((e) => e.categoryId === id);
    if (inUse && !window.confirm("この費目を使っている入力データがあります。費目を削除すると、その入力データもまとめて削除されます。よろしいですか？")) return;
    setLedger((prev) => ({
      categories: prev.categories.filter((c) => c.id !== id),
      entries: prev.entries.filter((e) => e.categoryId !== id),
    }));
  };
  const addCat = (type) => {
    const id = `cat_${Date.now()}`;
    setLedger((prev) => ({ ...prev, categories: [...prev.categories, { id, name: "新しい費目", type, linkPath: null }] }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {["expense", "income"].map((type) => (
        <div key={type}>
          <div style={{ fontSize: 12, fontWeight: 600, color: INK_SOFT, marginBottom: 6 }}>{type === "expense" ? "支出の費目" : "収入の費目"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ledger.categories.filter((c) => c.type === type).map((c) => (
              <div key={c.id} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 4, padding: "6px 8px" }}>
                <input value={c.name} onChange={(e) => updateCat(c.id, { name: e.target.value })}
                  style={{ width: 100, fontSize: 12.5, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
                <select value={c.linkPath || ""} onChange={(e) => updateCat(c.id, { linkPath: e.target.value || null })}
                  style={{ fontSize: 11.5, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, flex: "1 1 160px", color: c.linkPath ? INK : INK_SOFT }}>
                  <option value="">紐付けなし</option>
                  {fieldsFor(type).map((f) => (
                    <option key={f.path} value={f.path}>{f.group} ＞ {f.label}</option>
                  ))}
                </select>
                <button onClick={() => deleteCat(c.id)} style={{ border: "none", background: "transparent", color: SEAL, fontSize: 14, cursor: "pointer" }}>×</button>
              </div>
            ))}
            <button onClick={() => addCat(type)} style={{
              fontSize: 11.5, padding: "5px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
              background: "#FFFDF9", color: INK_SOFT, cursor: "pointer", alignSelf: "flex-start",
            }}>＋ {type === "expense" ? "支出" : "収入"}の費目を追加</button>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 10.5, color: INK_SOFT }}>
        「紐付け」を設定すると、集計・グラフタブの「実績を転記」でこの費目の年間合計をシミュレーションの該当項目に書き込めます（単位は円→万円に自動換算されます）。
      </div>
    </div>
  );
}

function LedgerInputTab({ ledger, setLedger, params }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);

  const yearEntries = ledger.entries.filter((e) => e.year === year).sort((a, b) => a.month - b.month);

  const addRow = () => {
    const firstCat = ledger.categories[0];
    setLedger((prev) => ({
      ...prev,
      entries: [...prev.entries, {
        id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        year, month: new Date().getMonth() + 1, categoryId: firstCat?.id || "", amount: 0, memo: "",
      }],
    }));
  };
  const updateRow = (id, patch) => setLedger((prev) => ({ ...prev, entries: prev.entries.map((e) => e.id === id ? { ...e, ...patch } : e) }));
  const deleteRow = (id) => setLedger((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));

  return (
    <div style={{ paddingBottom: 40 }}>
      <SectionHeader title="実績入力" sub="月ごとの実際の支出・収入を、スプレッドシートのように行を追加して記録します（単位：円）" />
      <div style={{ padding: "0 16px 12px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          対象年
          <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
            style={{ width: 80, padding: "5px 7px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4 }} />
        </label>
        <button onClick={() => setShowCategoryEditor((s) => !s)} style={{
          fontSize: 11.5, padding: "6px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`, background: CARD, color: INK, cursor: "pointer",
        }}>{showCategoryEditor ? "費目の設定を閉じる" : "⚙ 費目の設定"}</button>
      </div>
      {showCategoryEditor && (
        <div style={{ padding: "0 16px 14px" }}>
          <LedgerCategoryEditor ledger={ledger} setLedger={setLedger} params={params} />
        </div>
      )}

      <div style={{ padding: "0 16px" }}>
        <div style={{ border: `1px solid ${PAPER_LINE}`, borderRadius: 5, overflow: "hidden", background: CARD }}>
          <div style={{ display: "flex", background: INK, color: PAPER, fontSize: 11 }}>
            <div style={{ width: 52, padding: "6px 4px", textAlign: "center" }}>月</div>
            <div style={{ flex: "1 1 120px", padding: "6px 6px" }}>費目</div>
            <div style={{ width: 92, padding: "6px 6px", textAlign: "right" }}>金額</div>
            <div style={{ flex: "1 1 100px", padding: "6px 6px" }}>メモ</div>
            <div style={{ width: 30 }} />
          </div>
          {yearEntries.length === 0 && (
            <div style={{ padding: "14px 10px", fontSize: 12, color: INK_SOFT, textAlign: "center" }}>{year}年の入力はまだありません</div>
          )}
          {yearEntries.map((e) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${PAPER_LINE}` }}>
              <select value={e.month} onChange={(ev) => updateRow(e.id, { month: parseInt(ev.target.value, 10) })}
                style={{ width: 52, padding: "5px 2px", fontSize: 11.5, border: "none", background: "transparent" }}>
                {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
              </select>
              <select value={e.categoryId} onChange={(ev) => updateRow(e.id, { categoryId: ev.target.value })}
                style={{ flex: "1 1 120px", padding: "5px 4px", fontSize: 11.5, border: "none", background: "transparent" }}>
                <optgroup label="支出">
                  {ledger.categories.filter((c) => c.type === "expense").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
                <optgroup label="収入">
                  {ledger.categories.filter((c) => c.type === "income").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              </select>
              <input type="number" value={e.amount} onChange={(ev) => updateRow(e.id, { amount: ev.target.value === "" ? 0 : parseFloat(ev.target.value) })}
                style={{ width: 92, padding: "5px 6px", fontSize: 11.5, textAlign: "right", border: "none", background: "transparent", fontVariantNumeric: "tabular-nums" }} />
              <input value={e.memo} onChange={(ev) => updateRow(e.id, { memo: ev.target.value })} placeholder="メモ"
                style={{ flex: "1 1 100px", padding: "5px 6px", fontSize: 11.5, border: "none", background: "transparent" }} />
              <button onClick={() => deleteRow(e.id)} title="削除" style={{ width: 30, border: "none", background: "transparent", color: SEAL, fontSize: 14, cursor: "pointer" }}>×</button>
            </div>
          ))}
        </div>
        <button onClick={addRow} style={{
          marginTop: 8, fontSize: 11.5, padding: "7px 12px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
          background: "#FFFDF9", color: INK_SOFT, cursor: "pointer",
        }}>＋ 行を追加</button>
      </div>
    </div>
  );
}

function LedgerSummaryTab({ ledger, setLedger, sim, setSim, params }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [note, setNote] = useState("");
  const { expense: expenseFields, income: incomeFields } = getLinkableFields(params);
  const fieldLabel = (type, path) => {
    const f = (type === "income" ? incomeFields : expenseFields).find((x) => x.path === path);
    return f ? `${f.group} ＞ ${f.label}` : path;
  };

  const yearEntries = ledger.entries.filter((e) => e.year === year);

  const monthlyByCategory = {};
  ledger.categories.forEach((c) => { monthlyByCategory[c.id] = Array(12).fill(0); });
  yearEntries.forEach((e) => {
    if (!monthlyByCategory[e.categoryId]) return;
    monthlyByCategory[e.categoryId][e.month - 1] += e.amount || 0;
  });
  const yearTotalByCategory = {};
  ledger.categories.forEach((c) => { yearTotalByCategory[c.id] = monthlyByCategory[c.id].reduce((a, b) => a + b, 0); });

  const expenseCats = ledger.categories.filter((c) => c.type === "expense");
  const incomeCats = ledger.categories.filter((c) => c.type === "income");
  const monthlyExpenseTotal = Array(12).fill(0);
  const monthlyIncomeTotal = Array(12).fill(0);
  expenseCats.forEach((c) => monthlyByCategory[c.id].forEach((v, i) => { monthlyExpenseTotal[i] += v; }));
  incomeCats.forEach((c) => monthlyByCategory[c.id].forEach((v, i) => { monthlyIncomeTotal[i] += v; }));
  const yearExpenseTotal = monthlyExpenseTotal.reduce((a, b) => a + b, 0);
  const yearIncomeTotal = monthlyIncomeTotal.reduce((a, b) => a + b, 0);

  const chartData = MONTHS.map((m, i) => ({ month: `${m}月`, 収入: Math.round(monthlyIncomeTotal[i]), 支出: Math.round(monthlyExpenseTotal[i]) }));

  const yearIdx = year - YEARS[0];
  const inRange = yearIdx >= 0 && yearIdx < N;

  // その年に1件も入力のない費目は転記対象から外す
  // （紐付けだけ設定してまだ記録していない費目のせいで、既存のシミュレーション値を
  //   0円で上書きしてしまわないようにするため）
  const categoriesWithEntries = new Set(yearEntries.map((e) => e.categoryId));
  const previewByPath = {};
  ledger.categories.forEach((c) => {
    if (!c.linkPath || !categoriesWithEntries.has(c.id)) return;
    const key = `${c.type}:${c.linkPath}`;
    previewByPath[key] = previewByPath[key] || { type: c.type, path: c.linkPath, yen: 0 };
    previewByPath[key].yen += yearTotalByCategory[c.id] || 0;
  });
  const previewList = Object.values(previewByPath);

  const postActuals = () => {
    if (!inRange || previewList.length === 0) return;
    const lines = previewList.map((p) => {
      const before = getSimValueAtPath(sim, p.type, p.path, yearIdx);
      const after = Math.round((p.yen / 10000) * 10) / 10;
      return `・${fieldLabel(p.type, p.path)}：${fmt(before)} → ${fmt(after)} 万円`;
    });
    const ok = window.confirm(`${year}年の実績をシミュレーションに転記します。\n${lines.join("\n")}\n\nよろしいですか？`);
    if (!ok) return;
    setSim((prev) => {
      const next = clone(prev);
      previewList.forEach((p) => {
        const after = Math.round((p.yen / 10000) * 10) / 10;
        setSimValueAtPath(next, p.type, p.path, yearIdx, after);
      });
      return next;
    });
    setNote(`${year}年の実績を反映しました。`);
    setTimeout(() => setNote(""), 4000);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <SectionHeader title="集計・グラフ" sub="月ごとの費目別合計と、収入・支出の推移を確認できます" />
      <div style={{ padding: "0 16px 12px" }}>
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          対象年
          <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
            style={{ width: 80, padding: "5px 7px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4 }} />
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 16px 14px", flexWrap: "wrap" }}>
        <StatCard label="収入合計" value={`¥${Math.round(yearIncomeTotal).toLocaleString()}`} tone="sumi" />
        <StatCard label="支出合計" value={`¥${Math.round(yearExpenseTotal).toLocaleString()}`} tone="seal" />
        <StatCard label="収支" value={`¥${Math.round(yearIncomeTotal - yearExpenseTotal).toLocaleString()}`} tone={yearIncomeTotal >= yearExpenseTotal ? "gold" : "seal"} />
      </div>

      <div style={{ padding: "0 16px", height: 220, background: CARD, marginBottom: 14 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={PAPER_LINE} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: INK_SOFT }} />
            <YAxis tick={{ fontSize: 10, fill: INK_SOFT }} />
            <Tooltip formatter={(v) => `¥${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="収入" fill={SUMI} radius={[2, 2, 0, 0]} />
            <Bar dataKey="支出" fill={SEAL} radius={[2, 2, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ overflowX: "auto", border: `1px solid ${PAPER_LINE}`, borderRadius: 5 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11.5, minWidth: "100%" }}>
            <thead>
              <tr style={{ background: INK, color: PAPER }}>
                <th style={{ padding: "6px 8px", textAlign: "left", position: "sticky", left: 0, background: INK }}>費目</th>
                {MONTHS.map((m) => <th key={m} style={{ padding: "6px 6px", textAlign: "right", minWidth: 56 }}>{m}月</th>)}
                <th style={{ padding: "6px 8px", textAlign: "right" }}>合計</th>
              </tr>
            </thead>
            <tbody>
              {["expense", "income"].map((type) => (
                <React.Fragment key={type}>
                  <tr style={{ background: INK_SOFT }}>
                    <td colSpan={14} style={{ padding: "4px 8px", color: PAPER, fontWeight: 700, position: "sticky", left: 0, background: INK_SOFT }}>{type === "expense" ? "支出" : "収入"}</td>
                  </tr>
                  {ledger.categories.filter((c) => c.type === type).map((c) => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${PAPER_LINE}`, background: CARD }}>
                      <td style={{ padding: "5px 8px", position: "sticky", left: 0, background: CARD, whiteSpace: "nowrap" }}>
                        {c.name}{c.linkPath && <span title="シミュレーションに紐付け済み" style={{ marginLeft: 4 }}>🔗</span>}
                      </td>
                      {monthlyByCategory[c.id].map((v, i) => (
                        <td key={i} style={{ padding: "5px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: v ? INK : "#C9C2B0" }}>{Math.round(v).toLocaleString()}</td>
                      ))}
                      <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{Math.round(yearTotalByCategory[c.id]).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ borderBottom: `2px solid ${INK}`, background: GOLD_SOFT }}>
                    <td style={{ padding: "5px 8px", fontWeight: 700, position: "sticky", left: 0, background: GOLD_SOFT }}>{type === "expense" ? "支出合計" : "収入合計"}</td>
                    {(type === "expense" ? monthlyExpenseTotal : monthlyIncomeTotal).map((v, i) => (
                      <td key={i} style={{ padding: "5px 6px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{Math.round(v).toLocaleString()}</td>
                    ))}
                    <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 700 }}>{Math.round(type === "expense" ? yearExpenseTotal : yearIncomeTotal).toLocaleString()}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, marginBottom: 6 }}>実績をシミュレーションに転記</div>
          {!inRange ? (
            <div style={{ fontSize: 11.5, color: SEAL }}>{year}年はシミュレーションの期間（{YEARS[0]}〜{YEARS[N - 1]}年）の外なので転記できません。</div>
          ) : previewList.length === 0 ? (
            <div style={{ fontSize: 11.5, color: INK_SOFT }}>紐付けされている費目がまだありません。「実績入力」タブの「費目の設定」から紐付けてください。</div>
          ) : (
            <>
              <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 8 }}>
                {previewList.map((p) => (
                  <div key={`${p.type}:${p.path}`}>・{fieldLabel(p.type, p.path)}：{fmt(getSimValueAtPath(sim, p.type, p.path, yearIdx))} → {fmt(Math.round((p.yen / 10000) * 10) / 10)} 万円</div>
                ))}
              </div>
              <button onClick={postActuals} style={{
                fontSize: 12, padding: "8px 14px", borderRadius: 4, border: "none", background: GOLD, color: "#fff", cursor: "pointer",
              }}>{year}年の実績を転記する</button>
            </>
          )}
          <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 8 }}>
            紐付けた費目のうち、{year}年に入力がある費目だけを対象に、その年間合計額（円→万円に自動換算）でシミュレーションのその年の値を上書きします。まだ入力していない費目やその他の年には影響しません。
          </div>
          {note && <div style={{ fontSize: 11.5, color: SUMI, marginTop: 6 }}>{note}</div>}
        </div>
      </div>
    </div>
  );
}

function LedgerApp({ sim, setSim, params, ledger, setLedger, onBack }) {
  const [ledgerTab, setLedgerTab] = useState("input");
  return (
    <div style={{ fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif", background: PAPER, minHeight: "100%", color: INK }}>
      <div style={{ background: INK, color: PAPER, padding: "14px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 18, letterSpacing: "0.06em" }}>家計簿</div>
          <div style={{ fontSize: 10.5, color: "#AEB9CC", marginTop: 2 }}>実績の記録・集計</div>
        </div>
        <button onClick={onBack} style={{
          fontSize: 11, color: "#D8C089", background: "transparent", border: "1px solid #4A5A75",
          borderRadius: 4, padding: "6px 10px", cursor: "pointer", whiteSpace: "nowrap",
        }}>⬅ ライフポートフォリオへ</button>
      </div>
      <TabBar tabs={[{ key: "input", label: "入力" }, { key: "summary", label: "集計・グラフ" }]} active={ledgerTab} onChange={setLedgerTab} />
      {ledgerTab === "input" && <LedgerInputTab ledger={ledger} setLedger={setLedger} params={params} />}
      {ledgerTab === "summary" && <LedgerSummaryTab ledger={ledger} setLedger={setLedger} sim={sim} setSim={setSim} params={params} />}
    </div>
  );
}

/* ============================================================
   ルートアプリ
   ============================================================ */
const STORAGE_KEY = "kakeibo_sim_state_v1";

export default function App() {
  const [tab, setTab] = useState("sim");
  const [sim, setSim] = useState(defaultSimState);
  const [params, setParams] = useState(defaultParamsState);
  const [holdings, setHoldings] = useState(defaultPortfolioState);
  const [cashList, setCashList] = useState(defaultCashState);
  const [loaded, setLoaded] = useState(false);
  const [saveNote, setSaveNote] = useState("");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [yearSnapshots, setYearSnapshots] = useState({});
  const [family, setFamily] = useState(defaultFamilyState);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showCostWizard, setShowCostWizard] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [costWizardStep, setCostWizardStep] = useState("tuition");
  const [ledger, setLedger] = useState(defaultLedgerState);
  const [appMode, setAppMode] = useState("sim");
  const openCostWizard = (step) => { setCostWizardStep(step); setShowCostWizard(true); };
  const saveTimer = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.sim) setSim(migrateSimFoodFields({ wizardTouched: [], ...parsed.sim }));
        if (parsed.params) setParams({ ...defaultParamsState(), ...parsed.params });
        if (parsed.holdings) setHoldings(parsed.holdings);
        if (parsed.cashList) setCashList(parsed.cashList);
        if (parsed.yearSnapshots) setYearSnapshots(parsed.yearSnapshots);
        if (parsed.family) setFamily(parsed.family);
        if (parsed.ledger) setLedger(migrateLedgerLinks({ ...defaultLedgerState(), ...parsed.ledger }));
      }
    } catch (e) { /* no saved state yet */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ sim, params, holdings, cashList, yearSnapshots, family, ledger }));
        setSaveNote("保存済み");
        setTimeout(() => setSaveNote(""), 1500);
      } catch (e) { /* storage unavailable */ }
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [sim, params, holdings, cashList, yearSnapshots, family, ledger, loaded]);

  const resetAll = () => {
    if (!window.confirm("編集内容をすべて元のデータに戻しますか？（家計簿の入力データも消えます）")) return;
    setSim(defaultSimState());
    setParams(defaultParamsState());
    setHoldings(defaultPortfolioState());
    setCashList(defaultCashState());
    setYearSnapshots({});
    setFamily(defaultFamilyState());
    setLedger(defaultLedgerState());
  };

  const fileInputRef = useRef(null);
  const exportData = () => {
    const payload = { sim, params, holdings, cashList, yearSnapshots, family, ledger, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeportfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const triggerImport = () => fileInputRef.current?.click();
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!window.confirm("このファイルの内容で、今の編集内容を上書きします。よろしいですか？")) return;
        if (parsed.sim) setSim(migrateSimFoodFields({ wizardTouched: [], ...parsed.sim }));
        if (parsed.params) setParams({ ...defaultParamsState(), ...parsed.params });
        if (parsed.holdings) setHoldings(parsed.holdings);
        if (parsed.cashList) setCashList(parsed.cashList);
        if (parsed.yearSnapshots) setYearSnapshots(parsed.yearSnapshots);
        if (parsed.family) setFamily(parsed.family);
        if (parsed.ledger) setLedger(migrateLedgerLinks({ ...defaultLedgerState(), ...parsed.ledger }));
        setSaveNote("読み込み完了");
        setTimeout(() => setSaveNote(""), 1500);
      } catch (err) {
        window.alert("ファイルを読み込めませんでした。正しいバックアップファイルか確認してください。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (appMode === "ledger") {
    return <LedgerApp sim={sim} setSim={setSim} params={params} ledger={ledger} setLedger={setLedger} onBack={() => setAppMode("sim")} />;
  }

  return (
    <div style={{ fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif", background: PAPER, minHeight: "100%", color: INK }}>
      <div style={{ background: INK, color: PAPER, padding: "14px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 18, letterSpacing: "0.06em" }}>ライフポートフォリオ</div>
          <div style={{ fontSize: 10.5, color: "#AEB9CC", marginTop: 2 }}>{YEARS[0]}–{YEARS[N - 1]} 年 資産・収支プラン</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setAppMode("ledger")} aria-label="家計簿" style={{
            fontSize: 11, color: "#D8C089", background: "transparent", border: "1px solid #4A5A75",
            borderRadius: 4, padding: "5px 9px", cursor: "pointer", whiteSpace: "nowrap",
          }}>📔 家計簿</button>
          <button onClick={() => setShowSettings(true)} aria-label="設定" style={{
            fontSize: 18, color: "#D8C089", background: "transparent", border: "1px solid #4A5A75",
            borderRadius: 4, padding: "5px 9px", cursor: "pointer", lineHeight: 1,
          }}>⚙</button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} style={{ display: "none" }} />
      {showSettings && (
        <SettingsModal sim={sim} setSim={setSim} params={params} setParams={setParams}
          onOpenFamily={() => { setShowSettings(false); setShowFamilyModal(true); }}
          onOpenWizard={() => { setShowSettings(false); setShowCostWizard(true); }}
          onExport={exportData} onImport={triggerImport} onReset={resetAll}
          onClose={() => setShowSettings(false)} />
      )}
      {showFamilyModal && <FamilySetupModal family={family} setFamily={setFamily} onClose={() => setShowFamilyModal(false)} />}
      {showCostWizard && (
        <CostWizardModal sim={sim} setSim={setSim} params={params} setParams={setParams} family={family}
          onClose={() => setShowCostWizard(false)} initialStep={costWizardStep} />
      )}
      {saveNote && (
        <div style={{ position: "fixed", top: 8, right: 8, background: SUMI, color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 12, zIndex: 100 }}>
          {saveNote}
        </div>
      )}

      <TabBar
        tabs={[
          { key: "sim", label: "シミュレーション" },
          { key: "portfolio", label: "ポートフォリオ" },
          { key: "aggregate", label: "資産集計" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "sim" && <SimulationTab sim={sim} setSim={setSim} params={params} setParams={setParams} onOpenWizard={openCostWizard} onOpenSheet={() => setShowSheet(true)} />}
      {tab === "portfolio" && <PortfolioTab holdings={holdings} setHoldings={setHoldings} cashList={cashList} setCashList={setCashList} params={params} setParams={setParams} asOfDate={asOfDate} setAsOfDate={setAsOfDate} />}
      {tab === "aggregate" && <AggregationTab holdings={holdings} cashList={cashList} sim={sim} params={params} setParams={setParams} asOfDate={asOfDate} yearSnapshots={yearSnapshots} setYearSnapshots={setYearSnapshots} />}
      {showSheet && (
        <div style={{ position: "fixed", inset: 0, background: PAPER, zIndex: 200, overflowY: "auto", fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif" }}>
          <div style={{ background: INK, color: PAPER, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 6 }}>
            <div style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 17 }}>一覧</div>
            <button onClick={() => setShowSheet(false)} style={{ background: "transparent", border: "1px solid #4A5A75", color: PAPER, borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>閉じる ×</button>
          </div>
          <SheetTab sim={sim} setSim={setSim} params={params} setParams={setParams} family={family} setFamily={setFamily} />
        </div>
      )}
    </div>
  );
}
/* ============================================================ */
