import React, { useState, useMemo, useEffect, useRef, useId } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot
} from "recharts";
import { isFirebaseConfigured } from "./firebase";
import { watchAuthState, signUp, signIn, signOut } from "./auth";
import {
  getMyHouseholdId, createHousehold, joinHouseholdByCode, leaveHousehold,
  getHouseholdInfo, subscribeHouseholdData, saveHouseholdData,
} from "./household";

/* ============================================================
   埋め込みデータ（元エクセルファイルから抽出）
   ============================================================ */
const RAW = {"sim": {"years": [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050, 2051, 2052, 2053, 2054, 2055, 2056, 2057, 2058, 2059, 2060], "params": {"housingType": 1.0, "loanInitial": 6000.0, "loanRate": 0.01, "buildingInitial": 2000.0, "landInitial": 4000.0, "dividendRate": 0.01, "growthRate": 1.03, "realEstateFlag": "無", "initAssetSecurities2019": null, "repairNotes": null}, "expense": {"tuition": {"child1": [15.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 200.0, 200.0, 200.0, 200.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "child1_extra": [0.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 20.0, 20.0, 35.0, 50.0, 50.0, 70.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "child2": [0.0, 0.0, 15.0, 15.0, 15.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 200.0, 200.0, 200.0, 200.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "child2_extra": [0.0, 0.0, 0.0, 0.0, 0.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 20.0, 20.0, 35.0, 50.0, 50.0, 70.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "child3": [0.0, 0.0, 0.0, 0.0, 15.0, 15.0, 15.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 50.0, 50.0, 50.0, 50.0, 100.0, 100.0, 200.0, 200.0, 200.0, 200.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "child3_extra": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 20.0, 20.0, 35.0, 50.0, 50.0, 70.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]}, "dorm": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 60.0, 60.0, 120.0, 120.0, 60.0, 60.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "medical": {"us": [0.0, 0.0, 0.0, 53.6, 3.0, 31.5, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0], "gfather_p": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 100.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0], "gmother_p": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 100.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0], "gfather_m": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 100.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0], "gmother_m": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 100.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0]}, "housing_opt1_loanPayment": [0.0, 0.0, 140.4, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 183.0, 0.0, 0.0, 0.0, 0.0], "housing_opt1_loanDeduction": [0.0, 0.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 40.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "housing_opt1_propertyTax": [0.0, 0.0, 15.0, 13.0, 13.4, 13.5, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0], "housing_opt1_insurance": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "housing_opt1_repair": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 200.0, 0.0, 0.0, 0.0, 0.0, 20.0, 0.0, 0.0, 0.0, 0.0, 200.0, 0.0, 0.0, 0.0, 0.0, 20.0], "housing_opt2_rent_relocate": [39.6, 39.6, 39.6, 39.6, 39.6, 39.6, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0, 154.0], "housing_opt3_used_condo": [39.6, 39.6, 39.6, 39.6, 39.6, 39.6, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0, 216.0], "housing_opt4_rent_to_condo": [39.6, 39.6, 39.6, 39.6, 39.6, 39.6, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 210.0, 3000.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0, 36.0], "car": {"body": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 500.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "parking": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "gas": [6.0, 6.0, 6.0, 6.0, 6.0, 4.2, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0], "insurance": [8.0, 8.0, 8.0, 8.0, 8.0, 2.8, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0], "tax": [4.0, 4.0, 4.0, 4.0, 4.0, 3.5, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0], "inspection": [0.0, 8.0, 0.0, 8.0, 0.0, 0.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0], "other": [1.0, 1.0, 1.0, 1.0, 1.0, 14.2, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]}, "living": {"food": [43.2, 48.0, 48.0, 39.5, 50.0, 62.7, 57.6, 63.6, 74.0, 83.0, 98.4, 110.1, 113.1, 113.1, 123.0, 123.0, 130.8, 106.8, 106.8, 106.8, 106.8, 70.8, 70.8, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0], "utilities": [30.0, 30.0, 30.0, 25.2, 30.0, 29.0, 35.0, 35.0, 35.0, 35.0, 35.0, 35.0, 35.0, 35.0, 35.0, 35.0, 35.0, 35.0, 35.0, 30.0, 30.0, 30.0, 30.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0], "communication": [12.0, 12.0, 12.0, 8.9, 7.0, 7.1, 12.0, 18.0, 18.0, 18.0, 18.0, 24.0, 24.0, 30.0, 30.0, 30.0, 30.0, 24.0, 24.0, 24.0, 24.0, 18.0, 18.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0], "daily_goods": [20.0, 20.0, 20.0, 35.6, 35.0, 41.2, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 20.0, 20.0, 20.0, 20.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0]}, "social": [72.0, 72.0, 72.0, 79.1, 67.6, 56.7, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 96.0, 196.0, 96.0, 96.0, 96.0, 96.0, 96.0, 0.0, 0.0, 100.0, 0.0, 100.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "leisure": [30.0, 30.0, 30.0, 7.0, 11.0, 11.3, 30.0, 30.0, 30.0, 30.0, 100.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 100.0, 30.0, 30.0, 30.0, 30.0, 100.0, 50.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0], "other": [12.0, 14.4, 14.4, 12.0, 26.4, 33.0, 18.0, 20.4, 22.8, 24.0, 31.2, 33.6, 33.6, 36.0, 42.0, 42.0, 48.0, 36.0, 36.0, 36.0, 36.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0, 24.0], "sudden": [0.0, 0.0, 50.0, 0.0, 0.0, 0.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0, 50.0, 0.0, 0.0]}, "income": {"father": [650.0, 650.0, 650.0, 652.4, 699.0, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 721.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "mother": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "taxRefund": [0.0, 0.0, 0.0, 51.2, 0.0, 25.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "other_childAllowance": [0.0, 0.0, 0.0, 125.9, 131.0, 196.3, 170.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 48.0, 48.0, 48.0, 48.0, 36.0, 36.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "pension_retirement": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2000.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]}, "unitScaleFixedV1": true}, "portfolio": {"usdjpy": 153.239, "holdings": [{"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "VYM", "name": "Vanguard High Dividend Yield Index Fund ETF", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": 163.52, "priceJpyUnit": 25057.641280000003, "valueJpy": 0, "assetCat": "株式", "subClass": "米国", "tags": ["ETF", "高配当", "コア資産"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:VYM", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "VHT", "name": "Vanguard Health Care Index Fund ETF", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": 314.61, "priceJpyUnit": 48210.521790000006, "valueJpy": 0, "assetCat": "株式", "subClass": "米国", "tags": ["ETF", "ディフェンシブ"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:VHT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "SPYD", "name": "State Street SPDR Portfolio S&P 500 High Dvd ETF", "qty": 16.0, "avgJpyTotal": 57236, "priceUsdUnit": 49.18, "priceJpyUnit": 7536.29402, "valueJpy": 120580.7043, "assetCat": "株式", "subClass": "米国", "tags": ["ETF", "高配当"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:SPYD", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NASDAQ", "ticker": "IBB", "name": "iShares Biotechnology ETF", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": 207.33, "priceJpyUnit": 31771.041870000005, "valueJpy": 0, "assetCat": "株式", "subClass": "米国", "tags": ["ETF", "グロース", "ハイテク"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:IBB", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "HDV", "name": "iShares Core High Dividend ETF", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": 29.19, "priceJpyUnit": 4473.04641, "valueJpy": 0, "assetCat": "株式", "subClass": "米国", "tags": ["ETF", "高配当", "連続増配"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:HDV", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 667.0, "avgJpyTotal": 10308124.82, "priceUsdUnit": 82.2, "priceJpyUnit": 12596.2458, "valueJpy": 8401695.949, "assetCat": "債権", "subClass": "米国債", "tags": ["ETF", "ディフェンシブ"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI父", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 76, "avgJpyTotal": 1037172, "priceUsdUnit": 82.2, "priceJpyUnit": 12596.2458, "valueJpy": 957314.6808, "assetCat": "債権", "subClass": "米国債", "tags": ["ETF", "ディフェンシブ"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "GLD", "name": "SPDR Gold Trust", "qty": 189.0, "avgJpyTotal": 3534553.26, "priceUsdUnit": 399.72, "priceJpyUnit": 61252.693080000005, "valueJpy": 11576758.99, "assetCat": "コモディティ", "subClass": "貴金属", "tags": ["ETF", "インフレ耐性", "ディフェンシブ"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:GLD", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NASDAQ", "ticker": "BND", "name": "Vanguard Total Bond Market Index Fund ETF", "qty": 365.0, "avgJpyTotal": 3736125.4, "priceUsdUnit": 71.89, "priceJpyUnit": 11016.35171, "valueJpy": 4020968.374, "assetCat": "債権", "subClass": "米国債", "tags": ["ETF", "ディフェンシブ", "コア資産"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:BND", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "DBA", "name": "Invesco DB Agriculture Fund", "qty": 610.0, "avgJpyTotal": 1054055.6, "priceUsdUnit": 29.13, "priceJpyUnit": 4463.85207, "valueJpy": 2722949.763, "assetCat": "コモディティ", "subClass": "農作物", "tags": ["ETF", "インフレ耐性"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:DBA", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "EIDO", "name": "iShares MSCI Indonesia ETF", "qty": 445.0, "avgJpyTotal": 1048624.7, "priceUsdUnit": 13.22, "priceJpyUnit": 2025.81958, "valueJpy": 901489.7131, "assetCat": "株式", "subClass": "新興国", "tags": ["ETF", "サテライト資産"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:EIDO", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "EPI", "name": "WisdomTree India Earnings Fund", "qty": 107.0, "avgJpyTotal": 374321.31, "priceUsdUnit": 42.68, "priceJpyUnit": 6540.24052, "valueJpy": 699805.7356, "assetCat": "株式", "subClass": "新興国", "tags": ["ETF", "サテライト資産", "グロース"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:EPI", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NASDAQ", "ticker": "VCIT", "name": "Vanguard Intermediate-Term Corp Bond Idx Fund ETF", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": 80.46, "priceJpyUnit": 12329.60994, "valueJpy": 0, "assetCat": "債権", "subClass": "社債", "tags": ["ETF", "ディフェンシブ"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:VCIT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "VWO", "name": "Vanguard Emerging Markets Stock Index Fund ETF", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": 61.23, "priceJpyUnit": 9382.82397, "valueJpy": 0, "assetCat": "株式", "subClass": "新興国", "tags": ["ETF", "サテライト資産"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:VWO", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSEARCA", "ticker": "AFK", "name": "VanEck Africa Index ETF", "qty": 150.0, "avgJpyTotal": 366495, "priceUsdUnit": 29.94, "priceJpyUnit": 4587.97566, "valueJpy": 688196.349, "assetCat": "株式", "subClass": "新興国", "tags": ["ETF", "サテライト資産"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:AFK", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "NYSE", "ticker": "HES", "name": "#N/A", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": null, "priceJpyUnit": null, "valueJpy": 0, "assetCat": "株式", "subClass": "米国", "tags": ["個別銘柄", "インフレ耐性"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSE:HES", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "TYO", "ticker": 1628.0, "name": "TYO:1628", "qty": 220.0, "avgJpyTotal": 3151099.6, "priceUsdUnit": 22115, "priceJpyUnit": 22115, "valueJpy": 4865300, "assetCat": "株式", "subClass": "国内", "tags": ["ETF"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:1628.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "TYO", "ticker": 1628.0, "name": "TYO:1628", "qty": 35000.0, "avgJpyTotal": 3045000, "priceUsdUnit": 274, "priceJpyUnit": 274, "valueJpy": 9590000, "assetCat": "株式", "subClass": "国内", "tags": ["ETF"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:1628.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "TYO", "ticker": 2288.0, "name": "TYO:2288", "qty": 300.0, "avgJpyTotal": 507534, "priceUsdUnit": 2254, "priceJpyUnit": 2254, "valueJpy": 676200, "assetCat": "株式", "subClass": "国内", "tags": ["個別銘柄"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2288.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI父", "exchange": "TYO", "ticker": 1655.0, "name": "TYO:1655", "qty": 3000.0, "avgJpyTotal": 1980000, "priceUsdUnit": 843.3, "priceJpyUnit": 843.3, "valueJpy": 2529900, "assetCat": "株式", "subClass": "米国", "tags": ["個別銘柄", "コア資産"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:1655.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI父", "exchange": "TYO", "ticker": 2222.0, "name": "TYO:2222", "qty": 100.0, "avgJpyTotal": 219000, "priceUsdUnit": 1983.5, "priceJpyUnit": 1983.5, "valueJpy": 198350, "assetCat": "株式", "subClass": "国内", "tags": ["個別銘柄"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2222.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI父", "exchange": "TYO", "ticker": 3139.0, "name": "TYO:3139", "qty": 100.0, "avgJpyTotal": 298000, "priceUsdUnit": 3210, "priceJpyUnit": 3210, "valueJpy": 321000, "assetCat": "株式", "subClass": "国内", "tags": ["個別銘柄"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:3139.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI母", "exchange": "TYO", "ticker": 4967.0, "name": "TYO:4967", "qty": 200.0, "avgJpyTotal": 1177000, "priceUsdUnit": 5515, "priceJpyUnit": 5515, "valueJpy": 1103000, "assetCat": "株式", "subClass": "国内", "tags": ["個別銘柄"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:4967.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI母", "exchange": "TYO", "ticker": 7202.0, "name": "TYO:7202", "qty": 200.0, "avgJpyTotal": 405800, "priceUsdUnit": 2163, "priceJpyUnit": 2163, "valueJpy": 432600, "assetCat": "株式", "subClass": "国内", "tags": ["個別銘柄"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:7202.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI母", "exchange": "TYO", "ticker": 9003.0, "name": "TYO:9003", "qty": 200.0, "avgJpyTotal": 487600, "priceUsdUnit": 2422, "priceJpyUnit": 2422, "valueJpy": 484400, "assetCat": "株式", "subClass": "国内", "tags": ["個別銘柄"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:9003.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI父", "exchange": "TYO", "ticker": 3281.0, "name": "TYO:3281", "qty": 14.0, "avgJpyTotal": 34132, "priceUsdUnit": 133700, "priceJpyUnit": 133700, "valueJpy": 1871800, "assetCat": "株式", "subClass": "国内", "tags": ["個別銘柄"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:3281.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*父", "exchange": "TYO", "ticker": 2621.0, "name": "TYO:2621", "qty": 4500.0, "avgJpyTotal": 5130000, "priceUsdUnit": 1050, "priceJpyUnit": 1050, "valueJpy": 4725000, "assetCat": "債権", "subClass": "米国債", "tags": ["個別銘柄", "ディフェンシブ"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2621.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "楽天*母", "exchange": "TYO", "ticker": 2621.0, "name": "TYO:2621", "qty": 4000.0, "avgJpyTotal": 4560000, "priceUsdUnit": 1050, "priceJpyUnit": 1050, "valueJpy": 4200000, "assetCat": "債権", "subClass": "米国債", "tags": ["個別銘柄", "ディフェンシブ"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2621.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI母", "exchange": "TYO", "ticker": 2621.0, "name": "TYO:2621", "qty": 2061.0, "avgJpyTotal": 2349540, "priceUsdUnit": 1050, "priceJpyUnit": 1050, "valueJpy": 2164050, "assetCat": "債権", "subClass": "米国債", "tags": ["個別銘柄", "ディフェンシブ"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "TYO:2621.0", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI父", "exchange": "", "ticker": "eMAXIS 国内TPX", "name": "eMAXIS 国内TPX", "qty": 1.0, "avgJpyTotal": 1000097.663, "priceUsdUnit": 31175, "priceJpyUnit": 31175, "valueJpy": 3061774.0, "assetCat": "株式", "subClass": "国内", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS 国内TPX", "qtyMode": "nav10000", "unitsImplied": 982124.7795, "lastUpdated": null}, {"account": "SBI父", "exchange": "", "ticker": "eMAXIS 先進国", "name": "eMAXIS 先進国", "qty": 1.0, "avgJpyTotal": 7248889.742, "priceUsdUnit": 43436, "priceJpyUnit": 43436, "valueJpy": 17269788.0, "assetCat": "株式", "subClass": "先進国", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS 先進国", "qtyMode": "nav10000", "unitsImplied": 3975915.83, "lastUpdated": null}, {"account": "SBI父", "exchange": "", "ticker": "eMAXIS 米国", "name": "eMAXIS 米国", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": null, "priceJpyUnit": null, "valueJpy": 0, "assetCat": "株式", "subClass": "米国", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": false, "searchLabel": null, "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI父", "exchange": "", "ticker": "eMAXIS 米国", "name": "eMAXIS 米国", "qty": 1.0, "avgJpyTotal": 638725.6509, "priceUsdUnit": 42853, "priceJpyUnit": 42853, "valueJpy": 821320.0, "assetCat": "株式", "subClass": "米国", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS 米国", "qtyMode": "nav10000", "unitsImplied": 191659.8605, "lastUpdated": null}, {"account": "SBI父", "exchange": "", "ticker": "eMAXIS 先進国", "name": "eMAXIS 先進国", "qty": 0.0, "avgJpyTotal": 0, "priceUsdUnit": null, "priceJpyUnit": null, "valueJpy": 0, "assetCat": "株式", "subClass": "先進国", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": false, "searchLabel": null, "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI母", "exchange": "", "ticker": "SP500", "name": "SP500", "qty": 1.0, "avgJpyTotal": 466672.038, "priceUsdUnit": 3.9775, "priceJpyUnit": 3.9775, "valueJpy": 665157.325, "assetCat": "株式", "subClass": "米国", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "SP500", "qtyMode": "nav10000", "unitsImplied": 1672300000, "lastUpdated": null}, {"account": "SBI母", "exchange": "", "ticker": "SP500", "name": "SP500", "qty": 1.0, "avgJpyTotal": 1533349.671, "priceUsdUnit": 3.9775, "priceJpyUnit": 3.9775, "valueJpy": 4044898.738, "assetCat": "株式", "subClass": "米国", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "SP500", "qtyMode": "nav10000", "unitsImplied": 10169450000.0, "lastUpdated": null}, {"account": "SBI母", "exchange": "", "ticker": "eMAXIS 米国", "name": "eMAXIS 米国", "qty": 1.0, "avgJpyTotal": 40000.8731, "priceUsdUnit": 4.3497, "priceJpyUnit": 4.3497, "valueJpy": 58255.5321, "assetCat": "株式", "subClass": "米国", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS 米国", "qtyMode": "nav10000", "unitsImplied": 133930000.0, "lastUpdated": null}, {"account": "SBI母", "exchange": "", "ticker": "eMAXIS オルカン", "name": "eMAXIS オルカン", "qty": 1.0, "avgJpyTotal": 500004.494, "priceUsdUnit": 3.7227, "priceJpyUnit": 3.7227, "valueJpy": 538901.7747, "assetCat": "株式", "subClass": "米国", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS オルカン", "qtyMode": "nav10000", "unitsImplied": 1447610000.0, "lastUpdated": null}, {"account": "SBI父", "exchange": "", "ticker": "eMAXIS オルカン", "name": "eMAXIS オルカン", "qty": 1.0, "avgJpyTotal": 500004.494, "priceUsdUnit": 3.7227, "priceJpyUnit": 3.7227, "valueJpy": 538901.7747, "assetCat": "株式", "subClass": "米国", "tags": ["投信", "コア資産", "積立中"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "eMAXIS オルカン", "qtyMode": "nav10000", "unitsImplied": 1447610000.0, "lastUpdated": null}, {"account": "SBI子供1", "exchange": "NYSEARCA", "ticker": "SPY", "name": "State Street SPDR S&P 500 ETF Trust", "qty": 17.0, "avgJpyTotal": 60813.25, "priceUsdUnit": 765.96, "priceJpyUnit": 117374.94444, "valueJpy": 1995374.055, "assetCat": "株式", "subClass": "米国", "tags": ["ETF", "コア資産"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:SPY", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI子供1", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 30.0, "avgJpyTotal": 409410, "priceUsdUnit": 82.2, "priceJpyUnit": 12596.2458, "valueJpy": 377887.374, "assetCat": "債権", "subClass": "米国債", "tags": ["ETF", "ディフェンシブ"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI子供2", "exchange": "NYSEARCA", "ticker": "SPY", "name": "State Street SPDR S&P 500 ETF Trust", "qty": 17.0, "avgJpyTotal": 60813.25, "priceUsdUnit": 765.96, "priceJpyUnit": 117374.94444, "valueJpy": 1995374.055, "assetCat": "株式", "subClass": "米国", "tags": ["ETF", "コア資産"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:SPY", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI子供2", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 30.0, "avgJpyTotal": 409410, "priceUsdUnit": 82.2, "priceJpyUnit": 12596.2458, "valueJpy": 377887.374, "assetCat": "債権", "subClass": "米国債", "tags": ["ETF", "ディフェンシブ"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI子供3", "exchange": "NYSEARCA", "ticker": "SPY", "name": "State Street SPDR S&P 500 ETF Trust", "qty": 17.0, "avgJpyTotal": 60813.25, "priceUsdUnit": 765.96, "priceJpyUnit": 117374.94444, "valueJpy": 1995374.055, "assetCat": "株式", "subClass": "米国", "tags": ["ETF", "コア資産"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NYSEARCA:SPY", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "SBI子供3", "exchange": "NASDAQ", "ticker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "qty": 30.0, "avgJpyTotal": 409410, "priceUsdUnit": 82.2, "priceJpyUnit": 12596.2458, "valueJpy": 377887.374, "assetCat": "債権", "subClass": "米国債", "tags": ["ETF", "ディフェンシブ"], "memo": "", "currency": "ドル建", "autoFetchable": true, "searchLabel": "NASDAQ:TLT", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "ｺｲﾝﾁｪｯｸ", "exchange": "", "ticker": "BTC", "name": "BTC", "qty": 0.6158491, "avgJpyTotal": 2000000, "priceUsdUnit": 12175243.1, "priceJpyUnit": 12175243.1, "valueJpy": 7498112.505, "assetCat": "仮想通貨", "subClass": null, "tags": ["仮想通貨", "サテライト資産"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "BTC", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "ｺｲﾝﾁｪｯｸ", "exchange": "", "ticker": "ETH", "name": "ETH", "qty": 5.2632, "avgJpyTotal": 1000000, "priceUsdUnit": 385589.9488, "priceJpyUnit": 385589.9488, "valueJpy": 2029437.019, "assetCat": "仮想通貨", "subClass": null, "tags": ["仮想通貨", "サテライト資産"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "ETH", "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}, {"account": "iDeco", "exchange": "", "ticker": "", "name": "iDeco", "qty": 1.0, "avgJpyTotal": 0, "priceUsdUnit": 1600000, "priceJpyUnit": 1600000, "valueJpy": 1600000, "assetCat": "株式", "subClass": "先進国", "tags": ["投信", "積立中", "コア資産"], "memo": "", "currency": "円建", "autoFetchable": true, "searchLabel": "iDeco", "qtyMode": "nav10000", "unitsImplied": 10000.0, "lastUpdated": null}, {"account": "楽天*父", "exchange": "", "ticker": "ちゃいかぶ", "name": "ちゃいかぶ", "qty": 1.0, "avgJpyTotal": 1000000, "priceUsdUnit": 2540000.0, "priceJpyUnit": 389227060.0, "valueJpy": 2540000, "assetCat": "株式", "subClass": "新興国", "tags": ["ETF", "サテライト資産"], "memo": "", "currency": "ドル建", "autoFetchable": false, "searchLabel": null, "qtyMode": "shares", "unitsImplied": null, "lastUpdated": null}]}, "cash": [{"bank": "住信SBI", "amount": 4000000}, {"bank": "", "amount": 100000}, {"bank": "住信SBI", "amount": 1313714}, {"bank": "楽天銀行", "amount": 6730000}, {"bank": "ゆうちょ", "amount": 2260000}, {"bank": "みずほローン口座", "amount": 5568000}, {"bank": "買い付け余力", "amount": 2006062}, {"bank": "買い付け余力", "amount": 1476000}, {"bank": "買い付け余力", "amount": 600000}, {"bank": "買い付け余力", "amount": 600000}, {"bank": "買い付け余力", "amount": 600000}], "init": {"securities0": 3800.0, "cash0": 1700.0}};

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

/* 長押し→ドラッグで、リストの行を好きな位置に並べ替えるための共通フック。
   「キー」は各行を一意に識別する値（多くの場合、元の配列上の絶対インデックス）とし、
   同じ並べ替えグループに属する行の現在の表示順（キーの配列）を order として渡す。
   onReorder(order, fromPos, toPos) が確定時に呼ばれる。 */
function useDragReorder(onReorder) {
  const itemRefs = useRef(new Map());
  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);
  const drag = useRef({ active: false, key: null, order: [], startX: 0, startY: 0, timer: null, overKey: null, frozenRects: null });
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const setItemRef = (key) => (el) => {
    if (el) itemRefs.current.set(key, el);
    else itemRefs.current.delete(key);
  };

  // ドラッグ中に見た目の並びがその場で入れ替わっても判定がぶれないよう、
  // ドラッグ開始時点の各行の位置を凍結して使う（毎回DOMから取り直すと、
  // プレビューで動いた行につられて判定が振動してしまうため）
  const keyAtY = (order, frozenRects, clientY) => {
    for (const k of order) {
      const rect = frozenRects.get(k);
      if (!rect) continue;
      if (clientY < rect.top + rect.height / 2) return k;
    }
    return order[order.length - 1];
  };

  const handlersRef = useRef(null);
  if (!handlersRef.current) {
    const onMove = (e) => {
      const d = drag.current;
      if (!d.active) {
        if (Math.abs(e.clientX - d.startX) > 8 || Math.abs(e.clientY - d.startY) > 8) {
          if (d.timer) { clearTimeout(d.timer); d.timer = null; }
        }
        return;
      }
      e.preventDefault();
      const k = keyAtY(d.order, d.frozenRects, e.clientY);
      d.overKey = k;
      setOverKey(k);
    };
    const endDrag = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      const d = drag.current;
      if (d.timer) clearTimeout(d.timer);
      if (d.active) {
        const from = d.order.indexOf(d.key);
        const to = d.order.indexOf(d.overKey);
        if (from !== -1 && to !== -1 && from !== to) onReorderRef.current(d.order, from, to);
      }
      drag.current = { active: false, key: null, order: [], startX: 0, startY: 0, timer: null, overKey: null, frozenRects: null };
      setDragKey(null);
      setOverKey(null);
    };
    const onUp = () => endDrag();
    handlersRef.current = { onMove, onUp };
  }

  const bindHandle = (key, order) => ({
    onPointerDown: (e) => {
      e.stopPropagation();
      e.preventDefault();
      const { onMove, onUp } = handlersRef.current;
      drag.current.key = key;
      drag.current.order = order;
      drag.current.startX = e.clientX;
      drag.current.startY = e.clientY;
      drag.current.overKey = key;
      drag.current.timer = setTimeout(() => {
        const frozenRects = new Map();
        order.forEach((k) => {
          const el = itemRefs.current.get(k);
          if (el) frozenRects.set(k, el.getBoundingClientRect());
        });
        drag.current.frozenRects = frozenRects;
        drag.current.active = true;
        setDragKey(key);
        setOverKey(key);
        if (navigator.vibrate) navigator.vibrate(12);
      }, 420);
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
  });

  // ドラッグ中はプレビュー用に、現在の並びをその場で組み替えて返す
  const getRenderOrder = (order) => {
    if (dragKey == null || !order.includes(dragKey)) return order;
    const from = order.indexOf(dragKey);
    const to = overKey != null && order.includes(overKey) ? order.indexOf(overKey) : from;
    if (from === to) return order;
    const seq = [...order];
    const [moved] = seq.splice(from, 1);
    seq.splice(to, 0, moved);
    return seq;
  };

  return { bindHandle, setItemRef, dragKey, getRenderOrder };
}

// order（現在その並びを占めている絶対インデックスの列）に沿って、
// fromPos番目とtoPos番目を入れ替えた新しい配列を返す（他の要素の絶対位置は変えない）
function reorderArrayBySlots(fullArray, order, fromPos, toPos) {
  const seq = [...order];
  const [moved] = seq.splice(fromPos, 1);
  seq.splice(toPos, 0, moved);
  const values = seq.map((absIdx) => fullArray[absIdx]);
  const next = [...fullArray];
  order.forEach((slot, i) => { next[slot] = values[i]; });
  return next;
}

function DragHandle({ dragProps, active }) {
  return (
    <span {...dragProps} style={{
      flexShrink: 0, cursor: "grab", touchAction: "none", color: INK_SOFT, fontSize: 14,
      padding: "0 4px", userSelect: "none", opacity: active ? 1 : 0.6,
    }} title="長押しでドラッグして並べ替え">≡</span>
  );
}

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

function divideNumbersBy10(node) {
  if (Array.isArray(node)) return node.map(divideNumbersBy10);
  if (node && typeof node === "object") {
    const out = {};
    for (const k of Object.keys(node)) out[k] = divideNumbersBy10(node[k]);
    return out;
  }
  if (typeof node === "number") return node / 10;
  return node;
}
const UNIT_SCALE_FIX_PARAM_KEYS = ["loanInitial", "buildingInitial", "landInitial", "securities0", "cash0"];

// 2026年9月にアップロードされたExcelのシミュレーションシートが実は千円単位だったため、
// 支出・収入・住宅ローン初期値・初期資産が実際の10倍の値で保存されてしまっていた分の
// 一回限りの補正。sim.unitScaleFixedV1 が立っていれば、ユーザーがその後入力した値を
// 誤って再び10で割らないよう何もしない。
function migrateUnitScaleV1(sim, params) {
  if (!sim || sim.unitScaleFixedV1) return { sim, params };
  const nextSim = {
    ...clone(sim),
    expense: divideNumbersBy10(sim.expense),
    income: divideNumbersBy10(sim.income),
    unitScaleFixedV1: true,
  };
  const nextParams = { ...params };
  UNIT_SCALE_FIX_PARAM_KEYS.forEach((k) => {
    if (typeof nextParams[k] === "number") nextParams[k] = nextParams[k] / 10;
  });
  return { sim: nextSim, params: nextParams };
}

// localStorage・バックアップファイル・クラウド（Firestore）のいずれから読み込んだ場合でも
// 同じマイグレーション処理を通すための共通ヘルパー
function migrateLoadedState(parsed) {
  const loadedSim = parsed.sim ? migrateSimFoodFields({ wizardTouched: [], ...parsed.sim }) : null;
  const loadedParams = parsed.params ? { ...defaultParamsState(), ...parsed.params } : null;
  let fixedSim = loadedSim, fixedParams = loadedParams;
  if (loadedSim || loadedParams) {
    const r = migrateUnitScaleV1(loadedSim || defaultSimState(), loadedParams || defaultParamsState());
    fixedSim = loadedSim ? r.sim : null;
    fixedParams = loadedParams ? r.params : null;
  }
  return {
    sim: fixedSim,
    params: fixedParams,
    holdings: parsed.holdings ? migrateHoldingFields(parsed.holdings) : null,
    cashList: parsed.cashList || null,
    portfolioLogs: parsed.portfolioLogs || null,
    family: parsed.family || null,
    ledger: parsed.ledger ? migrateLedgerLinks({ ...defaultLedgerState(), ...parsed.ledger }) : null,
    scenario: parsed.scenario ? { ...defaultScenarioState(), ...parsed.scenario } : null,
  };
}
function applyMigratedState(migrated, setters) {
  if (migrated.sim) setters.setSim(migrated.sim);
  if (migrated.params) setters.setParams(migrated.params);
  if (migrated.holdings) setters.setHoldings(migrated.holdings);
  if (migrated.cashList) setters.setCashList(migrated.cashList);
  if (migrated.portfolioLogs) setters.setPortfolioLogs(migrated.portfolioLogs);
  if (migrated.family) setters.setFamily(migrated.family);
  if (migrated.ledger) setters.setLedger(migrated.ledger);
  if (migrated.scenario) setters.setScenario(migrated.scenario);
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

// 種別（個別銘柄／ETF／投信／仮想通貨）を単独フィールドではなく複数タグの1つとして扱い、
// 株式・コモディティ・債権に分かれていたサブ分類を単一のsubClassにまとめ、
// 仮想通貨を「コモディティ」の一種ではなく独立した資産クラスに引き上げる移行処理
function migrateHoldingFields(holdings) {
  if (!Array.isArray(holdings)) return holdings;
  return holdings.map((h) => {
    if (h.tags) return h;
    let assetCat = h.assetCat === "ｺﾓﾃﾞｨﾃｨ" ? "コモディティ" : (h.assetCat || "その他");
    let subClass = h.subClass ?? (h.stockType || h.commodityType || h.bondType || null);
    if (assetCat === "コモディティ" && (subClass === "仮想通貨" || h.instrumentType === "仮想通貨")) {
      assetCat = "仮想通貨";
      subClass = null;
    }
    const tags = [h.instrumentType].filter(Boolean);
    const { stockType, commodityType, bondType, instrumentType, ...rest } = h;
    return { ...rest, assetCat, subClass, tags, memo: h.memo ?? "" };
  });
}

function defaultPortfolioState() { return migrateHoldingFields(clone(RAW.portfolio.holdings)); }
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
   シミュレーションの「戻る地点」と保存パターン
   ============================================================ */
function defaultScenarioState() {
  return { checkpoint: null, patterns: [] };
}

/* ============================================================
   価格自動取得
   フロントエンドとは別にRenderへデプロイする、専用の価格取得API
   （price-server/、yfinanceベース・無料）から為替レート・株価/ETF
   価格を取得する。投資信託（qtyMode: "nav10000"）はYahoo Finance
   にティッカーが存在しないため対象外（引き続き手入力が必要）。
   ============================================================ */
const PRICE_API_BASE = (import.meta.env.VITE_PRICE_API_URL || "").replace(/\/$/, "");

// 保有銘柄の取引所・ティッカーから、yfinance互換のシンボルを組み立てる
// （投資信託や、取引所・ティッカーが不明な銘柄はnullを返し取得対象外にする）
function yfSymbolFor(h) {
  if (h.qtyMode === "nav10000") return null;
  const ticker = h.ticker;
  if (ticker === null || ticker === undefined || ticker === "") return null;
  if (h.exchange === "TYO") {
    const t = String(ticker).replace(/\.0$/, "");
    return `${t}.T`;
  }
  if (!h.exchange) {
    if (["BTC", "ETH"].includes(String(ticker).toUpperCase())) return `${ticker}-USD`;
    return null;
  }
  return String(ticker);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`価格取得サーバーへの接続に失敗しました（${res.status}）`);
  return res.json();
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
  if (!PRICE_API_BASE) {
    throw new Error("価格取得サーバーが設定されていません。しばらくお待ちいただくか、今は手入力をご利用ください。");
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const isHistorical = dateStr !== todayStr;
  let fxRate = fallbackFx;

  onStatus?.(isHistorical ? `${dateStr}時点の為替レートを取得中…` : "現在の為替レートを取得中…");
  try {
    const fxUrl = `${PRICE_API_BASE}/fx${isHistorical ? `?date=${dateStr}` : ""}`;
    const fx = await fetchJson(fxUrl);
    if (fx && typeof fx.usdjpy === "number") fxRate = fx.usdjpy;
  } catch (e) { /* keep fallback fx */ }

  const targets = holdings
    .map((h, idx) => ({ ...h, idx, symbol: yfSymbolFor(h) }))
    .filter((h) => h.symbol);
  const batches = chunk(targets, 20);
  const valueMap = {};
  let updated = 0, failed = 0;

  for (let b = 0; b < batches.length; b++) {
    onStatus?.(`${isHistorical ? dateStr + "時点の" : ""}銘柄価格を取得中… (${b + 1}/${batches.length})`);
    const batch = batches[b];
    try {
      const symbolsParam = [...new Set(batch.map((h) => h.symbol))].join(",");
      const url = `${PRICE_API_BASE}/prices?symbols=${encodeURIComponent(symbolsParam)}${isHistorical ? `&date=${dateStr}` : ""}`;
      const results = await fetchJson(url);
      const bySymbol = {};
      if (Array.isArray(results)) results.forEach((r) => { bySymbol[r.symbol] = r; });
      batch.forEach((h) => {
        const r = bySymbol[h.symbol];
        if (!r || typeof r.price !== "number") { failed++; return; }
        const valueJpy = r.currency === "USD" ? h.qty * r.price * fxRate : h.qty * r.price;
        valueMap[h.idx] = { valueJpy, price: r.price, currency: r.currency, asOf: r.asOf || dateStr };
        updated++;
      });
    } catch (e) {
      failed += batch.length;
    }
  }
  return { fxRate, valueMap, updated, failed };
}

// 日本の銘柄（.T）のうち、まだ日本語名称が未取得のものだけ取得する
async function fetchJaNames(holdings, onStatus) {
  if (!PRICE_API_BASE) return {};
  const targets = holdings
    .map((h, idx) => ({ idx, symbol: yfSymbolFor(h) }))
    .filter((h) => h.symbol && h.symbol.endsWith(".T") && !holdings[h.idx].nameJa);
  if (targets.length === 0) return {};

  onStatus?.("日本語名称を取得中…");
  const nameMap = {};
  for (const batch of chunk(targets, 20)) {
    try {
      const symbolsParam = [...new Set(batch.map((h) => h.symbol))].join(",");
      const res = await fetchJson(`${PRICE_API_BASE}/names?symbols=${encodeURIComponent(symbolsParam)}`);
      const names = res?.names || {};
      batch.forEach((h) => { if (names[h.symbol]) nameMap[h.idx] = names[h.symbol]; });
    } catch (e) { /* この分だけスキップし、他は継続 */ }
  }
  return nameMap;
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
// ユーザーが追加したカスタム行（項目ごとに自由に追加できる行）の年別合計
function sumCustomAt(rows, i) {
  if (!rows) return 0;
  let s = 0;
  for (const r of rows) s += (r.arr?.[i] ?? 0);
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

  const cr = exp.customRows || {};
  for (let i = 0; i < N; i++) {
    tuition[i] = sumArrAt(exp.tuition, tuitionKeys, i) + sumCustomAt(cr.tuition, i);
    medical[i] = sumArrAt(exp.medical, medicalKeys, i) + sumCustomAt(cr.medical, i);
    carTotal[i] = sumArrAt(exp.car, carKeys, i) + sumCustomAt(cr.car, i);
    livingTotal[i] = sumArrAt(exp.living, livingKeys, i) + sumCustomAt(cr.living, i);

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
    expenseTotal[i] = tuition[i] + (exp.dorm[i] ?? 0) + medical[i] + housingCost[i] + sumCustomAt(cr.housing, i) + carTotal[i] +
      livingTotal[i] + (exp.social[i] ?? 0) + (exp.leisure[i] ?? 0) + (exp.other[i] ?? 0) + (exp.sudden[i] ?? 0) + sumCustomAt(cr.social, i);

    dividend[i] = i === 0 ? 0 : securities[i - 1] * params.dividendRate;

    incomeTotal[i] = (inc.father[i] ?? 0) + (inc.mother[i] ?? 0) + (inc.taxRefund[i] ?? 0) +
      dividend[i] + (inc.other_childAllowance[i] ?? 0) + (inc.pension_retirement[i] ?? 0) + sumCustomAt(inc.customRows, i);

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
      <div style={{ flex: 1, minWidth: 0 }}>
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

function StatCard({ label, value, tone = "ink", small, corner }) {
  const color = tone === "seal" ? SEAL : tone === "sumi" ? SUMI : tone === "gold" ? GOLD : INK;
  return (
    <div style={{
      background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 4, padding: "12px 14px",
      flex: 1, minWidth: 0, position: "relative",
    }}>
      <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      <div style={{ fontSize: small ? 14 : 16, fontWeight: 700, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.25, wordBreak: "break-word" }}>{value}</div>
      {corner && <div style={{ position: "absolute", right: 8, bottom: 6, fontSize: 9.5, color: INK_SOFT }}>{corner}</div>}
    </div>
  );
}

// カンマ区切り表示のできない <input type="number"> の代わりに使う、
// 金額入力用の共通コンポーネント。編集中も数字はそのまま伝え、
// 表示だけをカンマ区切りにする（フォーカスが外れたタイミングで整形し直す）
function formatNumForInput(v) {
  if (v === null || v === undefined || v === "") return "";
  const num = typeof v === "number" ? v : parseFloat(v);
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("ja-JP", { maximumFractionDigits: 10 });
}
function parseNumFromInput(raw) {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
}
function CommaNumberInput({ value, onChange, style, readOnly, ...rest }) {
  const committed = value ?? 0;
  const [text, setText] = useState(() => formatNumForInput(committed));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setText(formatNumForInput(committed)); }, [committed, focused]);

  return (
    <input
      type="text" inputMode="decimal"
      value={text}
      readOnly={readOnly}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); setText(formatNumForInput(committed)); }}
      onChange={readOnly ? undefined : (e) => {
        const raw = e.target.value;
        if (!/^-?[0-9,]*\.?[0-9]*$/.test(raw)) return;
        setText(raw);
        const n = parseNumFromInput(raw);
        if (n !== null) onChange(n);
      }}
      style={style}
      {...rest}
    />
  );
}

function NumField({ value, onChange, width = 74, suffix, readOnly }) {
  return (
    <div style={{ position: "relative" }}>
      <CommaNumberInput
        value={value === 0 ? 0 : Math.round((value ?? 0) * 100) / 100}
        readOnly={readOnly}
        onChange={readOnly ? undefined : (v) => onChange(v ?? 0)}
        style={{
          width, padding: "4px 4px", fontSize: 12.5, textAlign: "right", border: `1px solid ${PAPER_LINE}`,
          borderRadius: 3, fontVariantNumeric: "tabular-nums", color: readOnly ? INK_SOFT : INK,
          background: readOnly ? PAPER : "#FFFDF9",
        }}
      />
    </div>
  );
}

function Accordion({ title, colorKey, defaultOpen, children, rightSlot, onWizard, wizardLabel, open: openProp, onToggle }) {
  const [openState, setOpenState] = useState(!!defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openState;
  const toggle = () => (isControlled ? onToggle?.(!open) : setOpenState((o) => !o));
  const color = CAT_COLORS[colorKey] || INK;
  return (
    <div style={{ border: `1px solid ${PAPER_LINE}`, borderRadius: 5, marginBottom: 10, overflow: "hidden", background: CARD }}>
      <div style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px", background: "#FFFEFC", borderLeft: `5px solid ${color}`,
      }}>
        <button onClick={toggle} style={{
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
          <button onClick={toggle} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: INK_SOFT, padding: 0 }}>
            {open ? "▲" : "▼"}
          </button>
        </span>
      </div>
      {open && <div style={{ padding: "10px 12px 14px" }}>{children}</div>}
    </div>
  );
}

// 横スクロール・年次編集テーブル（帳簿の見開きページ風）
const EDIT_TABLE_LABEL_WIDTH = 128;

function YearRow({ label, arr, onChange, indent, wizard, custom, onLabelChange, onDelete, onMoveUp, onMoveDown }) {
  const bg = wizard ? SUMI_SOFT : CARD;
  return (
    <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${PAPER_LINE}` }}>
      <div style={{
        width: EDIT_TABLE_LABEL_WIDTH, flexShrink: 0, display: "flex", alignItems: "center", gap: 2,
        padding: "4px 6px 4px " + (indent ? "16px" : "6px"),
        position: "sticky", left: 0, background: bg, zIndex: 2, borderRight: `1px solid ${PAPER_LINE}`,
      }}>
        {custom ? (
          <>
            <input value={label} onChange={(e) => onLabelChange(e.target.value)} placeholder="項目名"
              style={{ flex: 1, minWidth: 0, fontSize: 11, border: "none", background: "transparent", borderBottom: `1px dashed ${PAPER_LINE}`, padding: "2px 0", color: INK }} />
            {onMoveUp && <button onClick={onMoveUp} title="上へ移動" style={{ flexShrink: 0, border: "none", background: "transparent", color: INK_SOFT, fontSize: 10, cursor: "pointer", padding: 0 }}>▲</button>}
            {onMoveDown && <button onClick={onMoveDown} title="下へ移動" style={{ flexShrink: 0, border: "none", background: "transparent", color: INK_SOFT, fontSize: 10, cursor: "pointer", padding: 0 }}>▼</button>}
            <button onClick={onDelete} title="削除" style={{ flexShrink: 0, border: "none", background: "transparent", color: SEAL, fontSize: 13, cursor: "pointer", padding: 0 }}>×</button>
          </>
        ) : (
          <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: indent ? INK_SOFT : INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label}{wizard && <span title="費用ウィザードで設定" style={{ marginLeft: 4 }}>🧮</span>}
          </div>
        )}
      </div>
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

const UNIT_LABEL_COLOR = "#FFD84D";

function YearHeader() {
  return (
    <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 3, background: INK }}>
      <div style={{
        width: EDIT_TABLE_LABEL_WIDTH, flexShrink: 0, position: "sticky", left: 0, background: INK, zIndex: 4,
        display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
        color: UNIT_LABEL_COLOR, fontSize: 10, fontWeight: 700, padding: "2px 2px", lineHeight: 1.2,
      }}>単位：万円</div>
      {YEARS.map((y) => (
        <div key={y} style={{ width: 82, flexShrink: 0, textAlign: "center", color: PAPER, fontSize: 11.5, padding: "5px 0", borderRight: "1px solid #3A4C6B" }}>
          '{String(y).slice(2)}
        </div>
      ))}
    </div>
  );
}

function EditTable({ rows, addButton }) {
  return (
    <div>
      <div style={{ overflowX: "auto", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, maxHeight: 320 }}>
        <div style={{ minWidth: EDIT_TABLE_LABEL_WIDTH + N * 82 }}>
          <YearHeader />
          {rows.map((r) => (
            <YearRow key={r.id || r.label} label={r.label} arr={r.arr} onChange={r.onChange} indent={r.indent} wizard={r.wizard}
              custom={r.custom} onLabelChange={r.onLabelChange} onDelete={r.onDelete} onMoveUp={r.onMoveUp} onMoveDown={r.onMoveDown} />
          ))}
        </div>
      </div>
      {addButton}
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
          <CommaNumberInput value={sel.customValue ?? ""} onChange={(v) => onChange({ mode: "custom", customValue: v ?? 0 })}
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

function NumInput({ label, value, onChange, width = 110, suffix, noComma }) {
  const display = Number(value) === 0 ? "" : value;
  const style = { width, padding: "6px 8px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, fontVariantNumeric: "tabular-nums" };
  return (
    <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 4 }}>
      {label}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {noComma ? (
          <input type="number" value={display} placeholder="0"
            onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
            style={style} />
        ) : (
          <CommaNumberInput value={display === "" ? "" : display} placeholder="0"
            onChange={(v) => onChange(v ?? 0)}
            style={style} />
        )}
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
            <NumInput label={plan.housingPlanAcquisitionType === "rent" ? "入居年" : "購入年"} value={plan.housingPlanPurchaseYear} onChange={(v) => setPlan({ housingPlanPurchaseYear: v })} width={90} noComma />
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
                  <NumInput label="住み替え年" value={plan.housingPlanMoveYear} onChange={(v) => setPlan({ housingPlanMoveYear: v })} width={90} noComma />
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
          <CommaNumberInput value={customTotal} onChange={(v) => setCustomTotal(v ?? 0)}
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
      <div style={{
        width: 128, flexShrink: 0, position: "sticky", left: 0, background: INK, zIndex: 4, borderRight: "1px solid #3A4C6B",
        display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
        color: UNIT_LABEL_COLOR, fontSize: 10.5, fontWeight: 700, padding: "2px 2px", lineHeight: 1.2,
      }}>単位：万円</div>
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

function ShareModal({ authLoading, user, householdId, householdInfo, onHouseholdIdChange, onClose }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [createdCode, setCreatedCode] = useState("");

  const runAuth = async () => {
    setError(""); setBusy(true);
    try {
      if (mode === "signup") await signUp(email.trim(), password);
      else await signIn(email.trim(), password);
    } catch (e) {
      setError(e.message || "エラーが発生しました。");
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    setError(""); setBusy(true);
    try {
      const { householdId: newId, inviteCode } = await createHousehold(user.uid);
      setCreatedCode(inviteCode);
      onHouseholdIdChange(newId);
    } catch (e) {
      setError(e.message || "世帯の作成に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteInput.trim()) return;
    setError(""); setBusy(true);
    try {
      const joinedId = await joinHouseholdByCode(user.uid, inviteInput);
      onHouseholdIdChange(joinedId);
    } catch (e) {
      setError(e.message || "参加に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("この世帯の共有をやめて、ローカル保存のみに戻しますか？（他のメンバーのデータは残ります）")) return;
    setBusy(true);
    try {
      await leaveHousehold(user.uid, householdId);
      onHouseholdIdChange(null);
    } catch (e) {
      setError(e.message || "退出に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: PAPER, zIndex: 200, overflowY: "auto",
      fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif",
    }}>
      <div style={{ background: INK, color: PAPER, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 17 }}>🔗 誰かと共有する</div>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #4A5A75", color: PAPER, borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>閉じる ×</button>
      </div>

      <div style={{ padding: "14px 16px 40px", display: "flex", flexDirection: "column", gap: 18 }}>
        {authLoading ? (
          <div style={{ fontSize: 13, color: INK_SOFT }}>読み込み中…</div>
        ) : !user ? (
          <SettingsSection title={mode === "signup" ? "新規登録" : "ログイン"}>
            <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 10 }}>
              家族や配偶者とデータをリアルタイムで共有するには、まずログインしてください（メールアドレスとパスワードだけで登録できます）。
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス"
                style={{ padding: "8px 10px", fontSize: 13, border: `1px solid ${PAPER_LINE}`, borderRadius: 4 }} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード（6文字以上）"
                style={{ padding: "8px 10px", fontSize: 13, border: `1px solid ${PAPER_LINE}`, borderRadius: 4 }} />
              {error && <div style={{ fontSize: 11.5, color: SEAL }}>{error}</div>}
              <button onClick={runAuth} disabled={busy || !email.trim() || password.length < 6} style={{
                ...settingsBtnStyle, border: `1px solid ${GOLD}`, background: GOLD_SOFT,
                opacity: busy || !email.trim() || password.length < 6 ? 0.5 : 1,
              }}>{mode === "signup" ? "新規登録する" : "ログインする"}</button>
              <button onClick={() => { setMode((m) => m === "signup" ? "signin" : "signup"); setError(""); }} style={{
                border: "none", background: "transparent", color: INK_SOFT, fontSize: 11.5, cursor: "pointer", textAlign: "left", textDecoration: "underline",
              }}>{mode === "signup" ? "すでにアカウントをお持ちの方はこちら" : "初めての方はこちら（新規登録）"}</button>
            </div>
          </SettingsSection>
        ) : !householdId ? (
          <>
            <SettingsSection title="世帯を作る、または参加する">
              <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 10 }}>
                ログイン中：{user.email}
              </div>
              {createdCode ? (
                <div style={{ background: GOLD_SOFT, border: `1px solid ${GOLD}`, borderRadius: 5, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 6 }}>世帯を作成しました。この招待コードを共有したい相手に伝えてください。</div>
                  <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.15em", color: INK, fontVariantNumeric: "tabular-nums" }}>{createdCode}</div>
                </div>
              ) : (
                <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 12 }}>
                  <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 8 }}>今のデータをこの世帯の共有データとして使います。</div>
                  <button onClick={handleCreate} disabled={busy} style={{ ...settingsBtnStyle, border: `1px solid ${GOLD}`, background: GOLD_SOFT }}>📍 新しく世帯を作成する</button>
                </div>
              )}
            </SettingsSection>
            {!createdCode && (
              <SettingsSection title="招待コードで参加する">
                <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 8 }}>
                  相手から受け取った招待コードを入力してください。参加すると、今この端末にある編集内容は世帯の共有データに置き換わります。
                </div>
                <div style={{ display: "flex", gap: 8, maxWidth: 300 }}>
                  <input value={inviteInput} onChange={(e) => setInviteInput(e.target.value.toUpperCase())} placeholder="例：AB12CD"
                    style={{ flex: 1, padding: "8px 10px", fontSize: 14, letterSpacing: "0.1em", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, textTransform: "uppercase" }} />
                  <button onClick={handleJoin} disabled={busy || !inviteInput.trim()} style={{ ...settingsBtnStyle, border: `1px solid ${GOLD}`, background: GOLD_SOFT }}>参加</button>
                </div>
                {error && <div style={{ fontSize: 11.5, color: SEAL, marginTop: 8 }}>{error}</div>}
              </SettingsSection>
            )}
            <button onClick={() => signOut()} style={{ border: "none", background: "transparent", color: INK_SOFT, fontSize: 11.5, cursor: "pointer", textAlign: "left", textDecoration: "underline" }}>ログアウト</button>
          </>
        ) : (
          <SettingsSection title="共有中">
            <div style={{ background: SUMI_SOFT, border: `1px solid ${SUMI}`, borderRadius: 5, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 12.5, color: INK, marginBottom: 4 }}>✓ この世帯のデータをリアルタイムで共有しています</div>
              <div style={{ fontSize: 11, color: INK_SOFT }}>メンバー数：{householdInfo?.members?.length ?? "-"}人</div>
              {householdInfo?.inviteCode && (
                <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4 }}>
                  招待コード：<b style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.1em" }}>{householdInfo.inviteCode}</b>（他のメンバーを招待するときに使えます）
                </div>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 10 }}>ログイン中：{user.email}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={handleLeave} disabled={busy} style={{ ...settingsBtnStyle, color: SEAL, border: `1px solid ${SEAL}` }}>この世帯の共有をやめる</button>
              <button onClick={() => signOut()} style={settingsBtnStyle}>ログアウト</button>
            </div>
            {error && <div style={{ fontSize: 11.5, color: SEAL, marginTop: 8 }}>{error}</div>}
          </SettingsSection>
        )}
      </div>
    </div>
  );
}

function ScenarioModal({ sim, params, setSim, setParams, scenario, setScenario, onClose }) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");

  const setCheckpoint = () => {
    setScenario((prev) => ({ ...prev, checkpoint: { sim: clone(sim), params: clone(params), savedAt: new Date().toISOString() } }));
  };
  const restoreCheckpoint = () => {
    if (!scenario.checkpoint) return;
    if (!window.confirm("戻る地点の状態に戻します。現在の編集内容は失われます。よろしいですか？")) return;
    setSim(clone(scenario.checkpoint.sim));
    setParams(clone(scenario.checkpoint.params));
  };
  const clearCheckpoint = () => {
    if (!window.confirm("戻る地点を削除します。よろしいですか？")) return;
    setScenario((prev) => ({ ...prev, checkpoint: null }));
  };

  const savePattern = () => {
    const n = name.trim();
    if (!n) return;
    setScenario((prev) => ({
      ...prev,
      patterns: [...prev.patterns, {
        id: `pat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: n, memo: memo.trim(), sim: clone(sim), params: clone(params), savedAt: new Date().toISOString(),
      }],
    }));
    setName(""); setMemo(""); setShowSaveForm(false);
  };
  const applyPattern = (p) => {
    if (!window.confirm(`パターン「${p.name}」を適用します。現在の編集内容は失われます。よろしいですか？`)) return;
    setSim(clone(p.sim));
    setParams(clone(p.params));
  };
  const deletePattern = (id) => {
    if (!window.confirm("このパターンを削除します。よろしいですか？")) return;
    setScenario((prev) => ({ ...prev, patterns: prev.patterns.filter((p) => p.id !== id) }));
  };
  const clearPatterns = () => {
    if (!scenario.patterns.length) return;
    if (!window.confirm("保存したパターンをすべて削除します。よろしいですか？")) return;
    setScenario((prev) => ({ ...prev, patterns: [] }));
  };

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: PAPER, zIndex: 200, overflowY: "auto",
      fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif",
    }}>
      <div style={{ background: INK, color: PAPER, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ fontFamily: "'Shippori Mincho','Noto Serif JP',serif", fontSize: 17 }}>📌 シナリオ</div>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #4A5A75", color: PAPER, borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>閉じる ×</button>
      </div>

      <div style={{ padding: "14px 16px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        <SettingsSection title="戻る地点">
          <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 8 }}>
            今の内容を1つだけ「戻る地点」として登録しておけます。数値をいろいろ試したあと、ワンタップでこの地点に戻せます。
          </div>
          <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 12 }}>
            {scenario.checkpoint ? (
              <>
                <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 8 }}>登録日時：{fmtDate(scenario.checkpoint.savedAt)}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={restoreCheckpoint} style={{ ...settingsBtnStyle, border: `1px solid ${GOLD}`, background: GOLD_SOFT }}>↩ この地点に戻る</button>
                  <button onClick={setCheckpoint} style={settingsBtnStyle}>📍 今の内容で上書き登録</button>
                  <button onClick={clearCheckpoint} style={{ ...settingsBtnStyle, color: SEAL, border: `1px solid ${SEAL}` }}>戻る地点を削除</button>
                </div>
              </>
            ) : (
              <button onClick={setCheckpoint} style={{ ...settingsBtnStyle, border: `1px solid ${GOLD}`, background: GOLD_SOFT }}>📍 今の内容を戻る地点として登録</button>
            )}
          </div>
        </SettingsSection>

        <SettingsSection title="保存したシミュレーションパターン">
          <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 8 }}>
            編集した内容に名前とメモをつけて、複数のパターンとして保存できます（例：子供2人の場合／1人の場合、国公立／私立、戸建て／賃貸）。
          </div>
          {!showSaveForm ? (
            <button onClick={() => setShowSaveForm(true)} style={{ ...settingsBtnStyle, marginBottom: 10 }}>＋ 今の内容を新しいパターンとして保存</button>
          ) : (
            <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 10, marginBottom: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="パターン名（例：子供2人の場合）"
                style={{ padding: "6px 8px", fontSize: 12.5, border: `1px solid ${PAPER_LINE}`, borderRadius: 4 }} />
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="メモ（任意）" rows={2}
                style={{ padding: "6px 8px", fontSize: 12, border: `1px solid ${PAPER_LINE}`, borderRadius: 4, resize: "vertical", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={savePattern} disabled={!name.trim()} style={{ ...settingsBtnStyle, border: `1px solid ${GOLD}`, background: name.trim() ? GOLD_SOFT : CARD, opacity: name.trim() ? 1 : 0.5, cursor: name.trim() ? "pointer" : "default" }}>保存</button>
                <button onClick={() => { setShowSaveForm(false); setName(""); setMemo(""); }} style={settingsBtnStyle}>キャンセル</button>
              </div>
            </div>
          )}

          {scenario.patterns.length === 0 ? (
            <div style={{ fontSize: 12, color: INK_SOFT, textAlign: "center", padding: "10px 0" }}>保存されたパターンはまだありません</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scenario.patterns.map((p) => (
                <div key={p.id} style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{p.name}</div>
                  {p.memo && <div style={{ fontSize: 11.5, color: INK_SOFT, margin: "4px 0", whiteSpace: "pre-wrap" }}>{p.memo}</div>}
                  <div style={{ fontSize: 10.5, color: INK_SOFT, marginBottom: 8 }}>保存日時：{fmtDate(p.savedAt)}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => applyPattern(p)} style={{ ...settingsBtnStyle, border: `1px solid ${GOLD}`, background: GOLD_SOFT }}>適用してシミュレーションに反映</button>
                    <button onClick={() => deletePattern(p.id)} style={{ ...settingsBtnStyle, color: SEAL, border: `1px solid ${SEAL}` }}>削除</button>
                  </div>
                </div>
              ))}
              <button onClick={clearPatterns} style={{ ...settingsBtnStyle, color: SEAL, border: `1px solid ${SEAL}`, alignSelf: "flex-start" }}>すべてのパターンを削除</button>
            </div>
          )}
        </SettingsSection>
      </div>
    </div>
  );
}

function AssetChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, padding: "8px 10px", fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: INK, marginBottom: 4 }}>{label}年</div>
      <div style={{ color: INK, fontWeight: 600, marginBottom: 4 }}>総資産：{fmtMan(row.総資産)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.dataKey}：{fmtMan(p.value)}</div>
      ))}
    </div>
  );
}

function SimulationTab({ sim, setSim, params, setParams, scenario, setScenario, onOpenWizard, onOpenSheet }) {
  const model = useMemo(() => computeModel(sim, params), [sim, params]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [showScenario, setShowScenario] = useState(false);

  // 支出／収入の内訳編集用の元に戻す・やり直す（最大5件、このタブでの編集のみが対象）
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const recordHistory = () => {
    setUndoStack((stack) => [...stack, clone(sim)].slice(-5));
    setRedoStack([]);
  };
  const undo = () => {
    if (undoStack.length === 0) return;
    const prevSim = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, clone(sim)].slice(-5));
    setUndoStack((stack) => stack.slice(0, -1));
    setSim(prevSim);
  };
  const redo = () => {
    if (redoStack.length === 0) return;
    const nextSim = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, clone(sim)].slice(-5));
    setRedoStack((r) => r.slice(0, -1));
    setSim(nextSim);
  };
  const UndoRedoControls = () => (
    <div style={{ display: "flex", gap: 4 }}>
      <button onClick={undo} disabled={undoStack.length === 0} title="元に戻す" style={{
        border: `1px solid ${PAPER_LINE}`, background: "#fff", borderRadius: 4, padding: "5px 8px",
        fontSize: 13, cursor: undoStack.length === 0 ? "default" : "pointer", opacity: undoStack.length === 0 ? 0.35 : 1,
      }}>↩️</button>
      <button onClick={redo} disabled={redoStack.length === 0} title="やり直す" style={{
        border: `1px solid ${PAPER_LINE}`, background: "#fff", borderRadius: 4, padding: "5px 8px",
        fontSize: 13, cursor: redoStack.length === 0 ? "default" : "pointer", opacity: redoStack.length === 0 ? 0.35 : 1,
      }}>↪️</button>
    </div>
  );

  const mk = (path) => (i, v) => {
    recordHistory();
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
    recordHistory();
    setSim((prev) => { const next = clone(prev); fillForward(next.income[key], i, v); return next; });
  };
  const isWizard = (path) => (sim.wizardTouched || []).includes(path);

  // 各項目（学費・医療・車 等）ごとに自由に追加できるカスタム行
  const customRowsFor = (kind, sectionKey) => (kind === "income" ? sim.income.customRows : sim.expense.customRows?.[sectionKey]) || [];
  const addCustomRow = (kind, sectionKey) => {
    recordHistory();
    setSim((prev) => {
      const next = clone(prev);
      const newRow = { id: `cr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, label: "", arr: zeros() };
      if (kind === "income") next.income.customRows = [...(next.income.customRows || []), newRow];
      else {
        next.expense.customRows = next.expense.customRows || {};
        next.expense.customRows[sectionKey] = [...(next.expense.customRows[sectionKey] || []), newRow];
      }
      return next;
    });
  };
  const renameCustomRow = (kind, sectionKey, id) => (label) => {
    setSim((prev) => {
      const next = clone(prev);
      const list = kind === "income" ? next.income.customRows : next.expense.customRows?.[sectionKey];
      const row = (list || []).find((r) => r.id === id);
      if (row) row.label = label;
      return next;
    });
  };
  const updateCustomRowValue = (kind, sectionKey, id) => (i, v) => {
    recordHistory();
    setSim((prev) => {
      const next = clone(prev);
      const list = kind === "income" ? next.income.customRows : next.expense.customRows?.[sectionKey];
      const row = (list || []).find((r) => r.id === id);
      if (row) fillForward(row.arr, i, v);
      return next;
    });
  };
  const deleteCustomRow = (kind, sectionKey, id, label) => () => {
    if (!window.confirm(`「${label || "この行"}」を削除します。入力したデータは元に戻せません。よろしいですか？`)) return;
    recordHistory();
    setSim((prev) => {
      const next = clone(prev);
      if (kind === "income") next.income.customRows = (next.income.customRows || []).filter((r) => r.id !== id);
      else next.expense.customRows[sectionKey] = (next.expense.customRows[sectionKey] || []).filter((r) => r.id !== id);
      return next;
    });
  };
  const moveCustomRow = (kind, sectionKey, id, dir) => () => {
    recordHistory();
    setSim((prev) => {
      const next = clone(prev);
      const list = kind === "income" ? next.income.customRows : next.expense.customRows?.[sectionKey];
      if (!list) return prev;
      const idx = list.findIndex((r) => r.id === id);
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (idx === -1 || swapIdx < 0 || swapIdx >= list.length) return prev;
      [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
      return next;
    });
  };
  // 学費・医療・車・他生活費・交際費等・収入の各セクションに、カスタム行の編集用の行データと
  // 「＋ 行を追加」ボタンを付け足す
  const customRowsBlock = (kind, sectionKey) => {
    const rows = customRowsFor(kind, sectionKey);
    return {
      rows: rows.map((r, i) => ({
        id: r.id, label: r.label, arr: r.arr, onChange: updateCustomRowValue(kind, sectionKey, r.id),
        custom: true, onLabelChange: renameCustomRow(kind, sectionKey, r.id),
        onDelete: deleteCustomRow(kind, sectionKey, r.id, r.label),
        onMoveUp: i > 0 ? moveCustomRow(kind, sectionKey, r.id, "up") : null,
        onMoveDown: i < rows.length - 1 ? moveCustomRow(kind, sectionKey, r.id, "down") : null,
      })),
      addButton: (
        <button onClick={() => addCustomRow(kind, sectionKey)} style={{
          marginTop: 6, fontSize: 11, padding: "5px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
          background: "#FFFDF9", color: INK_SOFT, cursor: "pointer",
        }}>＋ 行を追加</button>
      ),
    };
  };

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
      <SectionHeader title="資産推移シミュレーション" rightSlot={
        <button onClick={() => setShowScenario(true)} style={{
          fontSize: 11.5, padding: "6px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
          background: CARD, color: INK, cursor: "pointer", whiteSpace: "nowrap",
        }}>📌 シナリオ</button>
      } />
      {showScenario && (
        <ScenarioModal sim={sim} params={params} setSim={setSim} setParams={setParams}
          scenario={scenario} setScenario={setScenario} onClose={() => setShowScenario(false)} />
      )}

      <div style={{ padding: "0 16px", height: 250, background: CARD, marginBottom: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 14, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={PAPER_LINE} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: INK_SOFT }} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: INK_SOFT }} />
            <Tooltip content={<AssetChartTooltip />} />
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
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <UndoRedoControls />
            <button onClick={onOpenSheet} style={{
              fontSize: 11.5, padding: "6px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
              background: CARD, color: INK, cursor: "pointer", whiteSpace: "nowrap",
            }}>📋 一覧を見る</button>
          </div>
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
            ...customRowsBlock("expense", "tuition").rows,
          ]} addButton={customRowsBlock("expense", "tuition").addButton} />
        </Accordion>
        <Accordion title="医療・介護" colorKey="medical">
          <EditTable rows={[
            { label: "我々", arr: sim.expense.medical.us, onChange: mk("medical.us") },
            { label: "父方祖父", arr: sim.expense.medical.gfather_p, onChange: mk("medical.gfather_p") },
            { label: "父方祖母", arr: sim.expense.medical.gmother_p, onChange: mk("medical.gmother_p") },
            { label: "母方祖父", arr: sim.expense.medical.gfather_m, onChange: mk("medical.gfather_m") },
            { label: "母方祖母", arr: sim.expense.medical.gmother_m, onChange: mk("medical.gmother_m") },
            ...customRowsBlock("expense", "medical").rows,
          ]} addButton={customRowsBlock("expense", "medical").addButton} />
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
          <EditTable rows={customRowsBlock("expense", "housing").rows} addButton={customRowsBlock("expense", "housing").addButton} />
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
            ...customRowsBlock("expense", "car").rows,
          ]} addButton={customRowsBlock("expense", "car").addButton} />
        </Accordion>
        <Accordion title="他生活費" colorKey="living">
          <EditTable rows={[
            { label: "食費", arr: sim.expense.living.food, onChange: mk("living.food") },
            { label: "光熱費", arr: sim.expense.living.utilities, onChange: mk("living.utilities") },
            { label: "通信費", arr: sim.expense.living.communication, onChange: mk("living.communication") },
            { label: "日用品・衣服", arr: sim.expense.living.daily_goods, onChange: mk("living.daily_goods") },
            ...customRowsBlock("expense", "living").rows,
          ]} addButton={customRowsBlock("expense", "living").addButton} />
        </Accordion>
        <Accordion title="交際費・レジャー・その他・突発" colorKey="social">
          <EditTable rows={[
            { label: "交際費", arr: sim.expense.social, onChange: mk("social") },
            { label: "レジャー他", arr: sim.expense.leisure, onChange: mk("leisure") },
            { label: "その他", arr: sim.expense.other, onChange: mk("other") },
            { label: "突発", arr: sim.expense.sudden, onChange: mk("sudden") },
            ...customRowsBlock("expense", "social").rows,
          ]} addButton={customRowsBlock("expense", "social").addButton} />
        </Accordion>
      </div>

      <SectionHeader title="収入の内訳を編集" rightSlot={<UndoRedoControls />} />
      <div style={{ padding: "0 16px 8px" }}>
        <Accordion title="収入" colorKey="tuition" defaultOpen>
          <EditTable rows={[
            { label: "父", arr: sim.income.father, onChange: mkInc("father") },
            { label: "母", arr: sim.income.mother, onChange: mkInc("mother") },
            { label: "税還付金他", arr: sim.income.taxRefund, onChange: mkInc("taxRefund") },
            { label: "子供手当等", arr: sim.income.other_childAllowance, onChange: mkInc("other_childAllowance") },
            { label: "年金・退職金", arr: sim.income.pension_retirement, onChange: mkInc("pension_retirement") },
            { label: "配当収入（自動計算）", arr: model.dividend },
            ...customRowsBlock("income", null).rows,
          ]} addButton={customRowsBlock("income", null).addButton} />
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
        <CommaNumberInput value={display} disabled={disabled}
          onChange={(v) => onChange(v ?? 0)}
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

const ASSET_CLASSES = ["株式", "債権", "コモディティ", "仮想通貨", "不動産", "その他"];
const SUBCLASS_SUGGESTIONS = {
  "株式": ["米国株式", "先進国株式", "日本株式", "新興国株式"],
  "債権": ["米国債", "先進国債券", "日本国債", "社債", "新興国債券"],
  "コモディティ": ["貴金属", "エネルギー", "農作物", "その他コモディティ"],
  "仮想通貨": ["ビットコイン", "アルトコイン", "ステーブルコイン"],
  "不動産": ["自宅", "投資用不動産", "REIT"],
};
const TYPE_TAGS = ["個別銘柄", "ETF", "投信", "仮想通貨"];
const THEME_TAGS = [
  "高配当", "連続増配", "低ボラ", "グロース", "バリュー", "AI関連", "ハイテク",
  "インフレ耐性", "ディフェンシブ", "コア資産", "サテライト資産", "積立中",
];
const TAG_SUGGESTIONS = [...TYPE_TAGS, ...THEME_TAGS];
// 資産クラスから、既存銘柄と同じ粒度でテーマタグの初期候補を補う
// （種別タグ1つだけだと新規登録した銘柄だけタグが少なくなってしまうため）
const STARTER_THEME_TAGS_BY_ASSET_CAT = {
  "債権": ["ディフェンシブ"],
  "コモディティ": ["インフレ耐性"],
  "仮想通貨": ["サテライト資産"],
  "不動産": ["インフレ耐性"],
};
function starterTagsFor(assetCat, instrumentType) {
  const tags = [instrumentType].filter(Boolean);
  (STARTER_THEME_TAGS_BY_ASSET_CAT[assetCat] || []).forEach((t) => { if (!tags.includes(t)) tags.push(t); });
  return tags;
}

function TagPicker({ tags, onChange, suggestions = TAG_SUGGESTIONS }) {
  const [custom, setCustom] = useState("");
  const toggle = (t) => onChange(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  const addCustom = () => {
    const t = custom.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setCustom("");
  };
  const extra = tags.filter((t) => !suggestions.includes(t));
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {[...suggestions, ...extra].map((t) => (
          <button key={t} type="button" onClick={() => toggle(t)} style={{
            fontSize: 11, padding: "4px 9px", borderRadius: 12, cursor: "pointer",
            border: `1px solid ${tags.includes(t) ? GOLD : PAPER_LINE}`,
            background: tags.includes(t) ? GOLD_SOFT : "#fff", color: INK,
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <input value={custom} onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="タグを追加（自由入力）"
          style={{ flex: 1, fontSize: 11, padding: "4px 7px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
        <button type="button" onClick={addCustom} style={{
          fontSize: 11, padding: "4px 9px", borderRadius: 3, border: `1px solid ${PAPER_LINE}`, background: "#FFFDF9", color: INK_SOFT, cursor: "pointer",
        }}>＋追加</button>
      </div>
    </div>
  );
}

// 銘柄詳細では候補を全部並べず、実際に付いているタグだけをチップで表示する
// （追加は下の入力欄から、候補は入力補完で出す）
function TagChipsEditable({ tags, onChange, suggestions = TAG_SUGGESTIONS }) {
  const listId = useId();
  const [input, setInput] = useState("");
  const remove = (t) => onChange(tags.filter((x) => x !== t));
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: tags.length ? 6 : 0 }}>
        {tags.map((t) => (
          <span key={t} style={{
            fontSize: 11, padding: "3px 6px 3px 10px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 4,
            border: `1px solid ${GOLD}`, background: GOLD_SOFT, color: INK,
          }}>
            {t}
            <button type="button" onClick={() => remove(t)} style={{ border: "none", background: "transparent", color: INK_SOFT, cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input list={listId} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="タグを追加" style={{ flex: 1, fontSize: 11, padding: "4px 7px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
        <datalist id={listId}>
          {suggestions.filter((s) => !tags.includes(s)).map((s) => <option key={s} value={s} />)}
        </datalist>
        <button type="button" onClick={add} style={{
          fontSize: 11, padding: "4px 9px", borderRadius: 3, border: `1px solid ${PAPER_LINE}`, background: "#FFFDF9", color: INK_SOFT, cursor: "pointer",
        }}>＋追加</button>
      </div>
    </div>
  );
}

function SubClassField({ assetCat, value, onChange }) {
  const listId = "subclass-suggestions";
  return (
    <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3 }}>
      サブクラス
      <input list={listId} value={value || ""} onChange={(e) => onChange(e.target.value || null)}
        placeholder="例：米国株式" style={{ fontSize: 12, padding: "5px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, width: 130 }} />
      <datalist id={listId}>
        {(SUBCLASS_SUGGESTIONS[assetCat] || []).map((s) => <option key={s} value={s} />)}
      </datalist>
    </label>
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
    if (!PRICE_API_BASE) {
      setError("銘柄検索サーバーが設定されていません。今は「銘柄を手入力する」をご利用ください。");
      return;
    }
    setSearching(true); setError(""); setCandidates(null); setPicked(null);
    try {
      const res = await fetchJson(`${PRICE_API_BASE}/search?q=${encodeURIComponent(query.trim())}`);
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
    setPicked({ ...c, tags: starterTagsFor(c.assetCat, c.instrumentType), subClass: null, memo: "" });
    setQtyInput("1");
    setPriceInput("");
    setPriceNote("");
    const isFund = c.instrumentType === "投信" || !c.exchange;
    if (isFund) {
      // 投資信託はyfinanceに基準価額データが無いため自動取得の対象外
      setPriceNote("投資信託は現在価格の自動取得に対応していません。取得単価を手入力してください。");
      return;
    }
    const symbol = yfSymbolFor({ qtyMode: null, ticker: c.ticker, exchange: c.exchange });
    if (!symbol || !PRICE_API_BASE) {
      setPriceNote("現在価格が見つかりませんでした。取得単価を手入力してください。");
      return;
    }
    // 選択直後に現在価格を検索して、取得単価のデフォルトに使う
    setPriceFetching(true);
    try {
      const results = await fetchJson(`${PRICE_API_BASE}/prices?symbols=${encodeURIComponent(symbol)}`);
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
      currency: "JPY", assetCat: "その他", tags: starterTagsFor("その他", "個別銘柄"), subClass: null, memo: "",
    });
    setQtyInput("1"); setPriceInput(""); setPriceNote("");
    setError(""); setCandidates(null);
  };

  const isFundPicked = !!picked?.tags?.includes("投信");

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
      subClass: picked.subClass || null,
      tags: picked.tags && picked.tags.length ? picked.tags : (picked.exchange ? ["個別銘柄"] : ["投信"]),
      memo: picked.memo || "",
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
                  資産クラス
                  <select value={picked.assetCat} onChange={(e) => {
                    const nextCat = e.target.value;
                    setPicked((p) => {
                      const merged = [...(p.tags || [])];
                      (STARTER_THEME_TAGS_BY_ASSET_CAT[nextCat] || []).forEach((t) => { if (!merged.includes(t)) merged.push(t); });
                      return { ...p, assetCat: nextCat, tags: merged };
                    });
                  }} style={selectStyle}>
                    {ASSET_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <SubClassField assetCat={picked.assetCat} value={picked.subClass} onChange={(v) => setPicked((p) => ({ ...p, subClass: v }))} />
                <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3 }}>
                  通貨
                  <select value={picked.currency} onChange={(e) => setPicked((p) => ({ ...p, currency: e.target.value }))} style={selectStyle}>
                    <option value="JPY">JPY（円建）</option>
                    <option value="USD">USD（ドル建）</option>
                  </select>
                </label>
              </div>
              <div style={{ fontSize: 10.5, color: INK_SOFT, marginBottom: 4 }}>タグ（種別・テーマなど複数選択可）</div>
              <div style={{ marginBottom: 10 }}>
                <TagPicker tags={picked.tags || []} onChange={(tags) => setPicked((p) => ({ ...p, tags }))} />
              </div>
              <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
                メモ
                <input value={picked.memo || ""} onChange={(e) => setPicked((p) => ({ ...p, memo: e.target.value }))}
                  placeholder="例：NISA枠、積立設定あり" style={{ fontSize: 12, padding: "5px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
              </label>
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
                  <CommaNumberInput value={qtyInput} onChange={(v) => setQtyInput(v === null ? "" : String(v))}
                    style={{ width: 100, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
                </label>
                <label style={{ fontSize: 11.5, display: "flex", flexDirection: "column", gap: 3 }}>
                  取得単価{isFundPicked ? "（1万口あたり・円）" : `（${picked.currency === "USD" ? "$" : "¥"}）`}
                  <CommaNumberInput value={priceInput} onChange={(v) => setPriceInput(v === null ? "" : String(v))}
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

function assetCatColorKey(cat) {
  return { "株式": "tuition", "債権": "car", "コモディティ": "housing", "仮想通貨": "social", "不動産": "medical" }[cat] || "other";
}

function TradeForm({ kind, idx, h, fxRate, cashList, cashLink, onRequestCashPick, onApplyWithCash, onCancel }) {
  const isFund = h.qtyMode === "nav10000";
  const currentQty = isFund ? (h.unitsImplied || 0) : (h.qty || 0);
  const [qtyInput, setQtyInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [reflectCash, setReflectCash] = useState(false);
  const fx = h.currency === "ドル建" ? (fxRate || 150) : 1;
  const qty = parseFloat(qtyInput) || 0;
  const amountJpy = isFund ? (qty / 10000) * (parseFloat(priceInput) || 0) : qty * (parseFloat(priceInput) || 0) * fx;

  const isLinkedHere = cashLink && cashLink.holdingIdx === idx;
  const selectedCashIdx = isLinkedHere ? cashLink.cashIdx : null;
  const selectedCashRow = selectedCashIdx != null ? cashList[selectedCashIdx] : null;

  const apply = () => {
    if (!qty) return;
    let patch;
    if (kind === "buy") {
      patch = { avgJpyTotal: (h.avgJpyTotal || 0) + amountJpy };
      if (isFund) patch.unitsImplied = currentQty + qty; else patch.qty = currentQty + qty;
    } else {
      const ratio = currentQty > 0 ? Math.min(1, qty / currentQty) : 0;
      patch = {
        avgJpyTotal: Math.max(0, (h.avgJpyTotal || 0) - (h.avgJpyTotal || 0) * ratio),
        valueJpy: Math.max(0, (h.valueJpy || 0) - (h.valueJpy || 0) * ratio),
      };
      if (isFund) patch.unitsImplied = Math.max(0, currentQty - qty); else patch.qty = Math.max(0, currentQty - qty);
    }
    const cashDelta = reflectCash && selectedCashIdx != null ? (kind === "buy" ? -amountJpy : amountJpy) : 0;
    onApplyWithCash(idx, patch, cashDelta);
  };

  const canApply = qty > 0 && (!reflectCash || selectedCashIdx != null);

  return (
    <div style={{ marginTop: 8, padding: 8, border: `1px dashed ${GOLD}`, borderRadius: 4, background: GOLD_SOFT }}>
      <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 6 }}>
        {kind === "buy"
          ? `買い増し：追加した${isFund ? "口数" : "数量"}と購入単価を入れると、保有数量・取得額に合算します（評価額は自動更新されないので、あとで「評価額」欄も更新してください）`
          : `売却：売った${isFund ? "口数" : "数量"}と売却単価を入れると、保有数量・取得額・評価額から按分して差し引きます`}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 2 }}>
          {kind === "buy" ? "追加" : "売却"}{isFund ? "口数" : "数量"}
          <CommaNumberInput value={qtyInput} onChange={(v) => setQtyInput(v === null ? "" : String(v))}
            style={{ width: 90, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
        </label>
        <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 2 }}>
          {kind === "buy" ? "購入単価" : "売却単価"}{isFund ? "（1万口あたり・円）" : `（${h.currency === "ドル建" ? "$" : "¥"}）`}
          <CommaNumberInput value={priceInput} onChange={(v) => setPriceInput(v === null ? "" : String(v))}
            style={{ width: 100, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
        </label>
      </div>
      <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 6 }}>{kind === "buy" ? "追加取得額" : "売却代金"}：{fmtYen(amountJpy)}</div>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, marginTop: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={reflectCash} onChange={(e) => setReflectCash(e.target.checked)} />
        現金データにも反映する（{kind === "buy" ? "選んだ口座から購入額を減らす" : "選んだ口座に売却代金を追加する"}）
      </label>
      {reflectCash && (
        <div style={{ marginTop: 6 }}>
          {selectedCashRow ? (
            <div style={{ fontSize: 11, color: INK }}>
              選択中の口座：<b>No.{selectedCashIdx + 1}</b>{selectedCashRow.bank ? `（${selectedCashRow.bank}）` : ""}
              <button onClick={() => onRequestCashPick(idx)} style={{ marginLeft: 8, fontSize: 10.5, padding: "2px 8px", borderRadius: 10, border: `1px solid ${PAPER_LINE}`, background: "#fff", color: INK_SOFT, cursor: "pointer" }}>変更</button>
            </div>
          ) : (
            <button onClick={() => onRequestCashPick(idx)} style={{ fontSize: 11.5, padding: "5px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`, background: "#fff", color: INK, cursor: "pointer" }}>
              現金口座を選ぶ →
            </button>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button onClick={apply} disabled={!canApply} style={{
          fontSize: 11.5, padding: "5px 10px", borderRadius: 4, border: "none",
          background: canApply ? SUMI : "#C9BFA5", color: "#fff", cursor: canApply ? "pointer" : "default",
        }}>反映・閉じる</button>
        <button onClick={onCancel} style={{ fontSize: 11.5, padding: "5px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`, background: "transparent", cursor: "pointer" }}>キャンセル</button>
      </div>
    </div>
  );
}

function HoldingCard({ h, idx, onUpdate, onDelete, fxRate, fmtCur = fmtYen, cashList, cashLink, onRequestCashPick, onApplyWithCash, onCardRef, dragHandleProps, isDragging, setDragRef }) {
  const [expanded, setExpanded] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(null); // null | "buy" | "sell"
  const pl = (h.valueJpy || 0) - (h.avgJpyTotal || 0);
  const displayQty = h.qtyMode === "nav10000" ? h.unitsImplied : h.qty;

  return (
    <div ref={(el) => { onCardRef?.(idx, el); setDragRef?.(el); }} style={{
      border: `1px solid ${PAPER_LINE}`, borderRadius: 4, overflow: "hidden", background: "#fff",
      boxShadow: isDragging ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {dragHandleProps && <DragHandle dragProps={dragHandleProps} active={isDragging} />}
        <button onClick={() => setExpanded((e) => !e)} style={{
          flex: 1, minWidth: 0, textAlign: "left", padding: "8px 10px", border: "none", background: "transparent", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8,
        }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {h.ticker ? `${h.ticker} ` : ""}{h.name}
          </div>
          {h.nameJa && (
            <div style={{ fontSize: 10.5, color: INK_SOFT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.nameJa}</div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 3 }}>
            {h.subClass && <span style={{ fontSize: 9.5, background: PAPER, border: `1px solid ${PAPER_LINE}`, borderRadius: 8, padding: "1px 6px", color: INK_SOFT }}>{h.subClass}</span>}
            {(h.tags || []).map((t) => (
              <span key={t} style={{ fontSize: 9.5, background: GOLD_SOFT, borderRadius: 8, padding: "1px 6px", color: INK }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, fontVariantNumeric: "tabular-nums" }}>{fmtCur(h.valueJpy)}</div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: pl >= 0 ? SUMI : SEAL, fontVariantNumeric: "tabular-nums" }}>{(pl >= 0 ? "+" : "") + fmtCur(pl)}</div>
          </div>
          <span style={{ color: INK_SOFT, fontSize: 11, marginTop: 2 }}>{expanded ? "▲" : "▼"}</span>
        </div>
        </button>
      </div>
      {expanded && (
        <div style={{ padding: 10, borderTop: `1px solid ${PAPER_LINE}`, background: CARD }}>
          {h.memo && (
            <div style={{ fontSize: 10.5, color: INK_SOFT, fontStyle: "italic", marginBottom: 8 }}>{h.memo}</div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 2 }}>
              資産クラス
              <select value={h.assetCat} onChange={(e) => onUpdate({ assetCat: e.target.value })}
                style={{ fontSize: 12, padding: "4px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }}>
                {ASSET_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <SubClassField assetCat={h.assetCat} value={h.subClass} onChange={(v) => onUpdate({ subClass: v })} />
          </div>
          <div style={{ fontSize: 10.5, color: INK_SOFT, marginBottom: 4 }}>タグ</div>
          <div style={{ marginBottom: 8 }}>
            <TagChipsEditable tags={h.tags || []} onChange={(tags) => onUpdate({ tags })} />
          </div>
          <label style={{ fontSize: 11, display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 }}>
            メモ
            <input value={h.memo || ""} onChange={(e) => onUpdate({ memo: e.target.value })}
              style={{ fontSize: 12, padding: "5px 6px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
          </label>
          <div style={{ display: "flex", gap: 10, fontSize: 11.5, flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {h.qtyMode === "nav10000" ? "保有口数" : "保有数量"}
              <CommaNumberInput value={displayQty ?? 0}
                onChange={(v) => onUpdate(h.qtyMode === "nav10000" ? { unitsImplied: v ?? 0 } : { qty: v ?? 0 })}
                style={{ width: 92, textAlign: "right", padding: "3px 5px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              取得額(¥)
              <CommaNumberInput value={h.avgJpyTotal} onChange={(v) => onUpdate({ avgJpyTotal: v ?? 0 })}
                style={{ width: 92, textAlign: "right", padding: "3px 5px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              評価額(¥)
              <CommaNumberInput value={h.valueJpy} onChange={(v) => onUpdate({ valueJpy: v ?? 0 })}
                style={{ width: 92, textAlign: "right", padding: "3px 5px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setTradeOpen((o) => (o === "buy" ? null : "buy"))} style={{
              fontSize: 11.5, padding: "6px 10px", borderRadius: 4, border: `1px solid ${GOLD}`, background: tradeOpen === "buy" ? GOLD_SOFT : "#fff", color: INK, cursor: "pointer",
            }}>＋ 買い増し</button>
            <button onClick={() => setTradeOpen((o) => (o === "sell" ? null : "sell"))} style={{
              fontSize: 11.5, padding: "6px 10px", borderRadius: 4, border: `1px solid ${SEAL}`, background: tradeOpen === "sell" ? SEAL_SOFT : "#fff", color: INK, cursor: "pointer",
            }}>－ 売却</button>
            {h.autoFetchable ? (
              <span style={{ fontSize: 10.5, color: h.lastUpdated ? SUMI : "#B8A26A" }}>{h.lastUpdated ? `更新:${h.lastUpdated}` : "自動取得対象"}</span>
            ) : (
              <span style={{ fontSize: 10.5, color: "#B8A26A" }}>手動更新のみ</span>
            )}
            <button onClick={onDelete} style={{
              marginLeft: "auto", border: "none", background: "transparent", color: SEAL, fontSize: 11.5, cursor: "pointer",
            }}>この銘柄を削除</button>
          </div>
          {tradeOpen && (
            <TradeForm kind={tradeOpen} idx={idx} h={h} fxRate={fxRate} cashList={cashList} cashLink={cashLink}
              onRequestCashPick={onRequestCashPick}
              onApplyWithCash={(i, patch, cashDelta) => { onApplyWithCash(i, patch, cashDelta); setTradeOpen(null); }}
              onCancel={() => setTradeOpen(null)} />
          )}
        </div>
      )}
    </div>
  );
}

function holdingMatchesFilter(h, filter) {
  if (filter.assetCat.length && !filter.assetCat.includes(h.assetCat || "その他")) return false;
  if (filter.subClass.length && !filter.subClass.includes(h.subClass || "")) return false;
  if (filter.tags.length && !(h.tags || []).some((t) => filter.tags.includes(t))) return false;
  return true;
}

// 資産クラス→サブクラスの親子関係（保有データから実際に使われている組み合わせを拾う）
function buildSubClassByCat(holdings) {
  const map = {};
  holdings.forEach((h) => {
    if (!h.subClass) return;
    const cat = h.assetCat || "その他";
    (map[cat] || (map[cat] = new Set())).add(h.subClass);
  });
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]]));
}

function PortfolioFilterPopup({ filter, setFilter, availAssetCats, subClassByCat, availTags, matchedCount, totalCount, onClose }) {
  const [openSlicer, setOpenSlicer] = useState("assetCat");
  const allSubClasses = [...new Set(Object.values(subClassByCat).flat())];
  const availSubClasses = filter.assetCat.length
    ? [...new Set(filter.assetCat.flatMap((c) => subClassByCat[c] || []))]
    : allSubClasses;

  const toggleAssetCat = (v) => {
    setFilter((f) => {
      const nextArr = f.assetCat.includes(v) ? f.assetCat.filter((x) => x !== v) : [...f.assetCat, v];
      const validSub = new Set(nextArr.length ? nextArr.flatMap((c) => subClassByCat[c] || []) : allSubClasses);
      return { ...f, assetCat: nextArr, subClass: f.subClass.filter((s) => validSub.has(s)) };
    });
  };
  const toggle = (key, v) => setFilter((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));
  const selectAll = (key, options) => setFilter((f) => (key === "assetCat" ? { ...f, assetCat: options } : { ...f, [key]: options }));
  const clearOne = (key) => setFilter((f) => ({ ...f, [key]: [] }));

  const slicers = [
    { key: "assetCat", label: "資産クラス", options: availAssetCats, onToggle: toggleAssetCat },
    { key: "subClass", label: "サブクラス", options: availSubClasses, onToggle: (v) => toggle("subClass", v) },
    { key: "tags", label: "タグ", options: availTags, onToggle: (v) => toggle("tags", v) },
  ];
  const active = slicers.find((s) => s.key === openSlicer);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(30,26,20,0.35)", zIndex: 190 }} />
      <div style={{
        position: "fixed", left: 12, right: 12, top: 88, zIndex: 191, background: "#fff", borderRadius: 8,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)", border: `1px solid ${PAPER_LINE}`, maxHeight: "76vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: INK }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: PAPER }}>🔍 フィルター</div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", color: PAPER, fontSize: 12, cursor: "pointer" }}>閉じる ×</button>
        </div>
        <div style={{ display: "flex", gap: 6, padding: 10 }}>
          {slicers.map((s) => (
            <button key={s.key} onClick={() => setOpenSlicer(openSlicer === s.key ? null : s.key)} style={{
              flex: 1, fontSize: 12, padding: "8px 4px", borderRadius: 4, cursor: "pointer",
              border: `1px solid ${openSlicer === s.key ? INK : (filter[s.key].length ? GOLD : PAPER_LINE)}`,
              background: filter[s.key].length ? GOLD_SOFT : "#fff", color: INK, fontWeight: openSlicer === s.key ? 700 : 400,
            }}>{s.label}{filter[s.key].length ? `（${filter[s.key].length}）` : ""}</button>
          ))}
        </div>
        {active && (
          <div style={{ padding: "0 12px 12px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              {active.key === "subClass" && (
                <div style={{ fontSize: 10.5, color: INK_SOFT }}>
                  {filter.assetCat.length ? `${filter.assetCat.join("・")}のサブクラス` : "すべてのサブクラス"}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                <button onClick={() => selectAll(active.key, active.options)} style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 3, border: `1px solid ${PAPER_LINE}`, background: "#fff", color: INK_SOFT, cursor: "pointer" }}>全選択</button>
                <button onClick={() => clearOne(active.key)} style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 3, border: `1px solid ${PAPER_LINE}`, background: "#fff", color: INK_SOFT, cursor: "pointer" }}>全解除</button>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {active.options.length === 0 && (
                <div style={{ fontSize: 11, color: INK_SOFT }}>
                  {active.key === "subClass" && filter.assetCat.length ? "選択中の資産クラスにサブクラスの登録がありません" : "該当なし"}
                </div>
              )}
              {active.options.map((o) => (
                <button key={o} onClick={() => active.onToggle(o)} style={{
                  fontSize: 11.5, padding: "5px 10px", borderRadius: 12, cursor: "pointer",
                  border: `1px solid ${filter[active.key].includes(o) ? GOLD : PAPER_LINE}`,
                  background: filter[active.key].includes(o) ? GOLD_SOFT : "#fff", color: INK,
                }}>{o}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ padding: "8px 12px", borderTop: `1px solid ${PAPER_LINE}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11.5, color: INK }}>{matchedCount} / {totalCount} 件</div>
          <button onClick={() => setFilter({ assetCat: [], subClass: [], tags: [] })} style={{
            fontSize: 11, padding: "4px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`, background: "#FFFDF9", color: INK_SOFT, cursor: "pointer",
          }}>フィルターをリセット</button>
        </div>
      </div>
    </>
  );
}

function PortfolioTab({ holdings, setHoldings, cashList, setCashList, params, setParams, asOfDate, setAsOfDate }) {
  const totalCash = cashList.reduce((s, c) => s + (c.amount || 0), 0);
  const totalValue = holdings.reduce((s, h) => s + (h.valueJpy || 0), 0) + totalCash;
  const totalCost = holdings.reduce((s, h) => s + (h.avgJpyTotal || 0), 0);
  const totalPl = holdings.reduce((s, h) => s + ((h.valueJpy || 0) - (h.avgJpyTotal || 0)), 0);

  const [displayCurrency, setDisplayCurrency] = useState("JPY");
  const fmtCur = (jpy) => displayCurrency === "USD" ? "$" + fmt((jpy || 0) / (params.fxRate || 150), 2) : fmtYen(jpy);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({ assetCat: [], subClass: [], tags: [] });
  const isFiltering = filter.assetCat.length > 0 || filter.subClass.length > 0 || filter.tags.length > 0;
  const availAssetCats = [...new Set(holdings.map((h) => h.assetCat || "その他"))];
  const subClassByCat = buildSubClassByCat(holdings);
  const availTags = [...new Set(holdings.flatMap((h) => h.tags || []))];
  const matchedIdxs = new Set(holdings.map((h, i) => i).filter((i) => holdingMatchesFilter(holdings[i], filter)));
  const shownValue = isFiltering ? holdings.reduce((s, h, i) => s + (matchedIdxs.has(i) ? (h.valueJpy || 0) : 0), 0) : totalValue;
  const shownCost = isFiltering ? holdings.reduce((s, h, i) => s + (matchedIdxs.has(i) ? (h.avgJpyTotal || 0) : 0), 0) : totalCost;
  const shownPl = shownValue - shownCost;
  const shownCount = isFiltering ? matchedIdxs.size : holdings.length;
  const pctOfTotal = (v, base) => base > 0 ? `全体の${fmt((v / base) * 100, 1)}%` : "";

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
      const nameMap = await fetchJaNames(holdings, setFetchStatus);
      setHoldings((prev) => prev.map((h, idx) => {
        const r = valueMap[idx];
        const nameJa = nameMap[idx];
        if (!r && !nameJa) return h;
        const next = { ...h };
        if (r) {
          next.valueJpy = r.valueJpy; next.lastUpdated = r.asOf;
          if (h.qtyMode === "nav10000") next.priceJpyUnit = r.price;
          else if (r.currency === "USD") next.priceUsdUnit = r.price;
          else next.priceJpyUnit = r.price;
        }
        if (nameJa) next.nameJa = nameJa;
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
    if (!matchedIdxs.has(idx)) return;
    const cat = h.assetCat || "その他";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(idx);
  });

  const updateHoldingPatch = (idx, patch) => {
    setHoldings((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };
  const updateCash = (idx, value) => {
    setCashList((prev) => { const next = [...prev]; next[idx] = { ...next[idx], amount: value }; return next; });
  };
  const updateCashField = (idx, field, value) => {
    setCashList((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };
  const addCash = () => setCashList((prev) => [...prev, { bank: "", amount: 0 }]);
  const cashDrag = useDragReorder((order, from, to) => setCashList((prev) => reorderArrayBySlots(prev, order, from, to)));
  const holdingDrag = useDragReorder((order, from, to) => setHoldings((prev) => reorderArrayBySlots(prev, order, from, to)));
  const deleteCash = (idx) => setCashList((prev) => prev.filter((_, i) => i !== idx));
  const deleteHolding = (idx) => {
    if (!window.confirm("この銘柄を削除しますか？")) return;
    setHoldings((prev) => prev.filter((_, i) => i !== idx));
  };

  // 買い増し・売却を現金口座に反映するための「口座選び」の受け渡し
  const [cashLink, setCashLink] = useState(null); // { holdingIdx, cashIdx: number|null }
  const [cashOpen, setCashOpen] = useState(true);
  const cashSectionRef = useRef(null);
  const holdingRefs = useRef({});
  const requestCashPick = (holdingIdx) => {
    setCashLink({ holdingIdx, cashIdx: null });
    setCashOpen(true);
    requestAnimationFrame(() => cashSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const pickCashRow = (cashIdx) => {
    if (!cashLink) return;
    const holdingIdx = cashLink.holdingIdx;
    setCashLink({ holdingIdx, cashIdx });
    requestAnimationFrame(() => holdingRefs.current[holdingIdx]?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };
  const applyTradeWithCash = (holdingIdx, patch, cashDelta) => {
    updateHoldingPatch(holdingIdx, patch);
    if (cashLink && cashLink.holdingIdx === holdingIdx && cashLink.cashIdx != null && cashDelta) {
      const ci = cashLink.cashIdx;
      setCashList((prev) => {
        const next = [...prev];
        next[ci] = { ...next[ci], amount: (next[ci].amount || 0) + cashDelta };
        return next;
      });
    }
    setCashLink(null);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <SectionHeader title="保有ポートフォリオ" sub="評価額・取得額を編集すると合計と集計に反映されます" rightSlot={
        <button onClick={() => setFilterOpen(true)} style={{
          fontSize: 11.5, padding: "6px 10px", borderRadius: 4, border: `1px solid ${isFiltering ? GOLD : PAPER_LINE}`,
          background: isFiltering ? GOLD_SOFT : CARD, color: INK, cursor: "pointer", whiteSpace: "nowrap",
        }}>🔍 フィルター{isFiltering ? `（${shownCount}件）` : ""}</button>
      } />
      <div style={{ padding: "0 16px 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: INK_SOFT }}>表示通貨</span>
        <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", border: `1px solid ${PAPER_LINE}` }}>
          {["JPY", "USD"].map((c) => (
            <button key={c} onClick={() => setDisplayCurrency(c)} style={{
              fontSize: 11.5, padding: "4px 12px", border: "none", cursor: "pointer",
              background: displayCurrency === c ? GOLD : "#fff", color: displayCurrency === c ? "#fff" : INK,
            }}>{c === "JPY" ? "円" : "ドル"}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 16px 14px", flexWrap: "wrap" }}>
        <div style={{
          background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 4, padding: "10px 14px",
          flex: 2, minWidth: 200, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 11, color: INK_SOFT, flexShrink: 0 }}>評価額合計{isFiltering && ` (${pctOfTotal(shownValue, totalValue)})`}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: GOLD, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtCur(shownValue)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 11, color: INK_SOFT, flexShrink: 0 }}>含み損益{isFiltering && ` (${pctOfTotal(shownPl, totalPl)})`}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: shownPl >= 0 ? SUMI : SEAL, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{(shownPl >= 0 ? "+" : "") + fmtCur(shownPl)}</span>
          </div>
        </div>
        <StatCard label="保有銘柄数" value={shownCount + "件"} tone="ink" small corner={isFiltering ? pctOfTotal(shownCount, holdings.length) : undefined} />
      </div>
      {filterOpen && (
        <PortfolioFilterPopup filter={filter} setFilter={setFilter}
          availAssetCats={availAssetCats} subClassByCat={subClassByCat} availTags={availTags}
          matchedCount={shownCount} totalCount={holdings.length}
          onClose={() => setFilterOpen(false)} />
      )}

      <div style={{ padding: "0 16px" }}>
        <AddHoldingForm onAdd={(h) => setHoldings((prev) => [...prev, h])} fxRate={params.fxRate} />
      </div>

      <div style={{ padding: "0 16px 14px" }}>
        <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, marginBottom: 6 }}>時点指定で価格を取得</div>
          <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 10 }}>
            日付を指定すると、その日（休場日の場合は直近の取引日）の終値でETF・個別株・仮想通貨（{holdings.filter((h) => h.autoFetchable).length}件）の評価額を再計算します
          </div>
          {!PRICE_API_BASE && (
            <div style={{ fontSize: 11, color: SEAL, background: SEAL_SOFT, borderRadius: 4, padding: "6px 8px", marginBottom: 10 }}>
              ⚠ 価格自動取得サーバーが未設定のため、ボタンを押すと「失敗」になります。各銘柄の評価額を下の欄で手入力してください。
            </div>
          )}
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
            ※ 投資信託は元データの保有口数が不明なため、現在の評価額と基準価額から口数を逆算して概算しています（正確な口数ではありません）。過去日付の価格は取得先データの都合上、実際の終値・基準価額と多少ずれる場合があります。
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div ref={cashSectionRef}>
          {cashLink && cashLink.cashIdx === null && (
            <div style={{ fontSize: 11.5, color: INK, background: GOLD_SOFT, border: `1px solid ${GOLD}`, borderRadius: 4, padding: "6px 8px", marginBottom: 8 }}>
              反映する現金口座をタップして選んでください。
            </div>
          )}
          <Accordion title={`現金 — ${fmtCur(totalCash)}`} colorKey="living" open={cashOpen} onToggle={setCashOpen}>
            {(() => {
              const order = cashDrag.getRenderOrder(cashList.map((_, i) => i));
              return order.map((i, pos) => {
                const c = cashList[i];
                const picking = cashLink && cashLink.cashIdx === null;
                const isSelected = cashLink && cashLink.cashIdx === i;
                return (
                  <div key={i} ref={cashDrag.setItemRef(i)} onClick={picking ? () => pickCashRow(i) : undefined} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 4px", borderBottom: `1px solid ${PAPER_LINE}`, gap: 6,
                    cursor: picking ? "pointer" : "default",
                    background: isSelected ? GOLD_SOFT : cashDrag.dragKey === i ? GOLD_SOFT : picking ? "#FFFDF9" : "transparent",
                    borderRadius: picking ? 4 : 0,
                    boxShadow: cashDrag.dragKey === i ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                  }}>
                    <DragHandle dragProps={cashDrag.bindHandle(i, cashList.map((_, k) => k))} active={cashDrag.dragKey === i} />
                    <span style={{ fontSize: 10.5, color: INK_SOFT, flexShrink: 0, minWidth: 26 }}>No.{pos + 1}</span>
                    <input value={c.bank} onChange={(e) => updateCashField(i, "bank", e.target.value)} placeholder="口座名・メモ" disabled={picking}
                      style={{ flex: 1, fontSize: 13, color: INK, border: "none", borderBottom: `1px dashed ${PAPER_LINE}`, background: "transparent", padding: "2px 2px" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 12, color: INK_SOFT }}>¥</span>
                      <CommaNumberInput value={c.amount} onChange={(v) => updateCash(i, v ?? 0)} disabled={picking}
                        style={{ width: 100, textAlign: "right", fontSize: 13, padding: "3px 5px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
                    </div>
                    {!picking && (
                      <button onClick={() => deleteCash(i)} title="削除" style={{ border: "none", background: "transparent", color: SEAL, fontSize: 14, cursor: "pointer", padding: "0 2px" }}>×</button>
                    )}
                  </div>
                );
              });
            })()}
            <button onClick={addCash} style={{
              marginTop: 8, fontSize: 11.5, padding: "5px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
              background: "#FFFDF9", color: INK_SOFT, cursor: "pointer",
            }}>＋ 現金行を追加</button>
          </Accordion>
        </div>

        {Object.entries(groups).map(([cat, idxs]) => {
          const subtotal = idxs.reduce((s, i) => s + (holdings[i].valueJpy || 0), 0);
          const renderIdxs = holdingDrag.getRenderOrder(idxs);
          return (
            <Accordion key={cat} title={`${cat} — ${fmtCur(subtotal)}`} colorKey={assetCatColorKey(cat)}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {renderIdxs.map((i) => (
                  <HoldingCard key={i} idx={i} h={holdings[i]} fxRate={params.fxRate} fmtCur={fmtCur}
                    cashList={cashList} cashLink={cashLink}
                    onRequestCashPick={requestCashPick} onApplyWithCash={applyTradeWithCash}
                    onCardRef={(idx, el) => { holdingRefs.current[idx] = el; }}
                    onUpdate={(patch) => updateHoldingPatch(i, patch)}
                    onDelete={() => deleteHolding(i)}
                    dragHandleProps={holdingDrag.bindHandle(i, idxs)}
                    isDragging={holdingDrag.dragKey === i}
                    setDragRef={holdingDrag.setItemRef(i)} />
                ))}
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

// 円グラフはアセットクラス単位で色分けする（サブクラスは同じ色のまま隣り合わせ、
// 境界線で内訳のおよその割合が読み取れるようにする）
const ASSET_CLASS_COLORS = {
  "現金": SUMI, "株式": GOLD, "債権": "#5B7FA6", "コモディティ": "#C77B4F",
  "仮想通貨": "#8E6BA6", "不動産": "#6B9B6E", "その他": "#8A8577",
};
function colorForAssetCat(cat) { return ASSET_CLASS_COLORS[cat] || "#8A8577"; }

/* 円グラフのラベルが密集する小さい扇形どうしで重ならないよう、
   同じ側（左/右）に置いた既存の全ラベルとの距離を見て縦にずらしながら
   引き出し線（本体→折れ点→ラベル）を描く */
function renderPieLeaderLabel(colors) {
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
    const color = (colors && colors[index]) || PIE_PALETTE[index % PIE_PALETTE.length];
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

function AggregationTab({ holdings, cashList, asOfDate, portfolioLogs, setPortfolioLogs }) {
  const totalCash = cashList.reduce((s, c) => s + (c.amount || 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);

  // 「現在」時点：実際の保有ポートフォリオから内訳を作る
  const subMapNow = {};
  let securitiesLikeTotalNow = 0;
  holdings.forEach((h) => {
    const cat = h.assetCat || "その他";
    const sub = h.subClass || "その他";
    const key = `${cat} / ${sub}`;
    subMapNow[key] = (subMapNow[key] || 0) + (h.valueJpy || 0);
    securitiesLikeTotalNow += h.valueJpy || 0;
  });
  const nowMap = { ...subMapNow, "現金 / 現金": totalCash };
  const nowSubRows = Object.entries(nowMap).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const nowTotal = securitiesLikeTotalNow + totalCash;
  const nowCurrencyMap = {};
  holdings.forEach((h) => { const cur = h.currency || "円建"; nowCurrencyMap[cur] = (nowCurrencyMap[cur] || 0) + (h.valueJpy || 0); });
  nowCurrencyMap["円建"] = (nowCurrencyMap["円建"] || 0) + totalCash;

  const [selectedLogId, setSelectedLogId] = useState(null);
  const selectedLog = selectedLogId ? portfolioLogs.find((l) => l.id === selectedLogId) : null;
  const isNow = !selectedLog;

  const subRows = isNow ? nowSubRows : selectedLog.subRows;
  const total = isNow ? nowTotal : selectedLog.total;
  const cashPortion = isNow ? totalCash : selectedLog.cashPortion;
  const currencyMap = isNow ? nowCurrencyMap : (selectedLog.currencyMap || {});

  const [recording, setRecording] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const startRecording = () => { setLabelInput(todayStr); setRecording(true); };
  const saveLog = () => {
    const newLog = {
      id: `log_${Date.now()}`,
      label: labelInput.trim() || todayStr,
      createdAt: todayStr,
      subRows: nowSubRows, total: nowTotal, cashPortion: totalCash, currencyMap: nowCurrencyMap,
    };
    setPortfolioLogs((prev) => [...prev, newLog]);
    setRecording(false);
    setSelectedLogId(newLog.id);
  };
  const deleteLog = (id) => {
    if (!window.confirm("この記録を削除しますか？元に戻せません。")) return;
    setPortfolioLogs((prev) => prev.filter((l) => l.id !== id));
    if (selectedLogId === id) setSelectedLogId(null);
  };
  const sortedLogs = [...portfolioLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));

  // アセットクラスの合計が大きい順にグループ化し、同じクラスの扇形が隣り合うようにする
  // （クラス内はサブクラスの大きい順）。色はクラス単位で塗り、境界線でサブクラスを見分ける。
  const pieRows = subRows.map(([k, v]) => {
    const sepIdx = k.indexOf(" / ");
    const cat = sepIdx >= 0 ? k.slice(0, sepIdx) : k;
    return { name: k, value: Math.round(v), cat };
  });
  const catTotals = {};
  pieRows.forEach((r) => { catTotals[r.cat] = (catTotals[r.cat] || 0) + r.value; });
  pieRows.sort((a, b) => (catTotals[b.cat] - catTotals[a.cat]) || (b.value - a.value));
  const pieData = pieRows;
  const pieColors = pieData.map((r) => colorForAssetCat(r.cat));
  const colorForKey = (k) => {
    const sepIdx = k.indexOf(" / ");
    return colorForAssetCat(sepIdx >= 0 ? k.slice(0, sepIdx) : k);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <SectionHeader title="資産集計" sub={
        isNow ? `${asOfDate} 時点の保有ポートフォリオ・現金の内訳` : `記録「${selectedLog.label}」（${selectedLog.createdAt}保存）の内訳`
      } />

      <div style={{ padding: "0 16px 6px" }}>
        <div style={{ background: CARD, border: `1px solid ${PAPER_LINE}`, borderRadius: 5, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <select value={selectedLogId || ""} onChange={(e) => setSelectedLogId(e.target.value || null)}
              style={{ fontSize: 13, padding: "6px 8px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, flex: 1, minWidth: 140 }}>
              <option value="">現在</option>
              {sortedLogs.map((l) => <option key={l.id} value={l.id}>{l.label}（{l.createdAt}）</option>)}
            </select>
            {!isNow && (
              <button onClick={() => setSelectedLogId(null)} style={{
                fontSize: 11.5, padding: "6px 10px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`, background: "transparent", cursor: "pointer",
              }}>現在に戻る</button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {!recording ? (
              <button onClick={startRecording} style={{
                fontSize: 11.5, padding: "6px 12px", borderRadius: 4, border: "none", cursor: "pointer",
                background: GOLD, color: "#fff", fontWeight: 600,
              }}>📌 現在の状態を記録する</button>
            ) : (
              <>
                <input value={labelInput} onChange={(e) => setLabelInput(e.target.value)} placeholder="記録の名前"
                  style={{ fontSize: 12.5, padding: "6px 8px", border: `1px solid ${PAPER_LINE}`, borderRadius: 4, flex: 1, minWidth: 120 }} />
                <button onClick={saveLog} style={{
                  fontSize: 11.5, padding: "6px 12px", borderRadius: 4, border: "none", cursor: "pointer", background: GOLD, color: "#fff", fontWeight: 600,
                }}>保存</button>
                <button onClick={() => setRecording(false)} style={{
                  fontSize: 11.5, padding: "6px 12px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`, background: "transparent", cursor: "pointer",
                }}>キャンセル</button>
              </>
            )}
            {!isNow && !recording && (
              <button onClick={() => deleteLog(selectedLogId)} style={{
                fontSize: 11.5, padding: "6px 12px", borderRadius: 4, border: `1px solid ${SEAL}`, background: "transparent", color: SEAL, cursor: "pointer",
              }}>この記録を削除</button>
            )}
          </div>
          <div style={{ fontSize: 10, color: INK_SOFT, marginTop: 8 }}>
            現在の保有状況をいつでも「地点」として記録し、あとから見返せます（記録後は当時の評価額のまま固定され、以降の編集の影響を受けません）。
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "10px 16px 14px", flexWrap: "wrap" }}>
        <StatCard label="資産評価額" value={fmtYen(total)} tone="gold" />
        <StatCard label="現金比率" value={total > 0 ? fmt((cashPortion / total) * 100, 1) + "%" : "-"} tone="ink" />
      </div>

      <div style={{ padding: "0 16px", height: 360, background: CARD }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={74} label={renderPieLeaderLabel(pieColors)} labelLine={false} isAnimationActive={false}>
              {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} stroke={CARD} strokeWidth={1.5} />)}
            </Pie>
            <Tooltip formatter={(v) => fmtYen(v)} contentStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <SectionHeader title="内訳明細" />
      <div style={{ padding: "0 16px" }}>
        <div style={{ border: `1px solid ${PAPER_LINE}`, borderRadius: 5, overflow: "hidden", background: CARD }}>
          {(() => {
            // アセットクラス（"株式 / 米国"の"株式"部分）ごとにグループ化し、
            // クラスの合計が大きい順に、見出し行に全体に占める割合を表示する
            const groups = {};
            const order = [];
            subRows.forEach(([k, v]) => {
              const sepIdx = k.indexOf(" / ");
              const cat = sepIdx >= 0 ? k.slice(0, sepIdx) : k;
              if (!groups[cat]) { groups[cat] = []; order.push(cat); }
              groups[cat].push([k, v]);
            });
            const groupedRows = order
              .map((cat) => ({ cat, rows: groups[cat], catTotal: groups[cat].reduce((s, [, v]) => s + v, 0) }))
              .sort((a, b) => b.catTotal - a.catTotal);
            return groupedRows.map((g, gi) => (
              <div key={g.cat}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px",
                  background: PAPER, borderTop: gi > 0 ? `1px solid ${PAPER_LINE}` : "none", borderBottom: `1px solid ${PAPER_LINE}`,
                  fontSize: 11.5, fontWeight: 700, color: INK,
                }}>
                  <span>{g.cat}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt((g.catTotal / total) * 100, 1)}%</span>
                </div>
                {g.rows.map(([k, v], i) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px 8px 22px",
                    borderBottom: i < g.rows.length - 1 ? `1px solid ${PAPER_LINE}` : "none", fontSize: 12.5,
                  }}>
                    <span style={{ color: INK, display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: colorForKey(k), flexShrink: 0 }} />
                      {k}
                    </span>
                    <span style={{ fontWeight: 600, color: INK, fontVariantNumeric: "tabular-nums" }}>{fmtYen(v)} <span style={{ color: INK_SOFT, fontWeight: 400 }}>（{fmt((v / total) * 100, 1)}%）</span></span>
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>
      </div>

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
    </div>
  );
}

/* ============================================================
   家計簿（実績入力・集計）
   ============================================================ */
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const SEED_LEDGER_ENTRIES = [{"id": "e_seed_1", "year": 2026, "month": 1, "categoryId": "eatout", "amount": 3810.0, "memo": "ガスト"}, {"id": "e_seed_2", "year": 2026, "month": 1, "categoryId": "other_inc", "amount": 13000.0, "memo": "[特別] 子供お年玉"}, {"id": "e_seed_3", "year": 2026, "month": 1, "categoryId": "other_inc", "amount": 20000.0, "memo": "[特別] 大人お年玉"}, {"id": "e_seed_4", "year": 2026, "month": 1, "categoryId": "daily", "amount": 2885.0, "memo": "[日用品] 本"}, {"id": "e_seed_5", "year": 2026, "month": 1, "categoryId": "daily", "amount": 1100.0, "memo": "[日用品] 本"}, {"id": "e_seed_6", "year": 2026, "month": 1, "categoryId": "daily", "amount": 2529.0, "memo": "[日用品] おもちゃ"}, {"id": "e_seed_7", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 3000.0, "memo": "[P!] 図書カード"}, {"id": "e_seed_8", "year": 2026, "month": 1, "categoryId": "daily", "amount": 1800.0, "memo": "[日用品] お守り1200おみくじ600"}, {"id": "e_seed_9", "year": 2026, "month": 1, "categoryId": "car", "amount": 500.0, "memo": "[車　他経費] 駐車場"}, {"id": "e_seed_10", "year": 2026, "month": 1, "categoryId": "car", "amount": 977.0, "memo": "[車　他経費] 駐車場"}, {"id": "e_seed_11", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 1000.0, "memo": "[その他支出] 募金"}, {"id": "e_seed_12", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 5000.0, "memo": "[その他支出] お祓い"}, {"id": "e_seed_13", "year": 2026, "month": 1, "categoryId": "eatout", "amount": 1850.0, "memo": "神社和菓子"}, {"id": "e_seed_14", "year": 2026, "month": 1, "categoryId": "food", "amount": 816.0, "memo": ""}, {"id": "e_seed_15", "year": 2026, "month": 1, "categoryId": "daily", "amount": 3013.0, "memo": "[日用品]"}, {"id": "e_seed_16", "year": 2026, "month": 1, "categoryId": "eatout", "amount": 3290.0, "memo": "山田うどん"}, {"id": "e_seed_17", "year": 2026, "month": 1, "categoryId": "food", "amount": 2205.0, "memo": "わいわい市"}, {"id": "e_seed_18", "year": 2026, "month": 1, "categoryId": "daily", "amount": 999.0, "memo": "[日用品] 多肉"}, {"id": "e_seed_19", "year": 2026, "month": 1, "categoryId": "daily", "amount": 363.0, "memo": "[日用品] ビオラ"}, {"id": "e_seed_20", "year": 2026, "month": 1, "categoryId": "daily", "amount": 1630.0, "memo": "[日用品] 車ベルト"}, {"id": "e_seed_21", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 1520.0, "memo": "[P!]"}, {"id": "e_seed_22", "year": 2026, "month": 1, "categoryId": "food", "amount": 6548.0, "memo": ""}, {"id": "e_seed_23", "year": 2026, "month": 1, "categoryId": "education", "amount": 2280.0, "memo": ""}, {"id": "e_seed_24", "year": 2026, "month": 1, "categoryId": "daily", "amount": 440.0, "memo": "[日用品]"}, {"id": "e_seed_25", "year": 2026, "month": 1, "categoryId": "daily", "amount": 6234.0, "memo": "[衣服] ヒラキ　子供靴"}, {"id": "e_seed_26", "year": 2026, "month": 1, "categoryId": "daily", "amount": 302.0, "memo": "[日用品]"}, {"id": "e_seed_27", "year": 2026, "month": 1, "categoryId": "car", "amount": 2520.0, "memo": "[車　ガス代]"}, {"id": "e_seed_28", "year": 2026, "month": 1, "categoryId": "food", "amount": 550.0, "memo": ""}, {"id": "e_seed_29", "year": 2026, "month": 1, "categoryId": "eatout", "amount": 2200.0, "memo": ""}, {"id": "e_seed_30", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 1013.0, "memo": "[その他支出] お土産"}, {"id": "e_seed_31", "year": 2026, "month": 1, "categoryId": "food", "amount": 6050.0, "memo": ""}, {"id": "e_seed_32", "year": 2026, "month": 1, "categoryId": "medical", "amount": 3070.0, "memo": "り歯医者"}, {"id": "e_seed_33", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 432.0, "memo": "[その他支出] お土産"}, {"id": "e_seed_34", "year": 2026, "month": 1, "categoryId": "daily", "amount": 550.0, "memo": "[日用品]"}, {"id": "e_seed_35", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 5500.0, "memo": "[その他支出] 柴田両親かばん"}, {"id": "e_seed_36", "year": 2026, "month": 1, "categoryId": "daily", "amount": 1650.0, "memo": "[日用品]"}, {"id": "e_seed_37", "year": 2026, "month": 1, "categoryId": "food", "amount": 2981.0, "memo": ""}, {"id": "e_seed_38", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 400.0, "memo": "[P!]"}, {"id": "e_seed_39", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 2310.0, "memo": "[P!] 時計ベルト"}, {"id": "e_seed_40", "year": 2026, "month": 1, "categoryId": "daily", "amount": 220.0, "memo": "[日用品]"}, {"id": "e_seed_41", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 1080.0, "memo": "[その他支出] 宅配"}, {"id": "e_seed_42", "year": 2026, "month": 1, "categoryId": "education", "amount": 1900.0, "memo": ""}, {"id": "e_seed_43", "year": 2026, "month": 1, "categoryId": "daily", "amount": 660.0, "memo": "[日用品]"}, {"id": "e_seed_44", "year": 2026, "month": 1, "categoryId": "food", "amount": 5959.0, "memo": ""}, {"id": "e_seed_45", "year": 2026, "month": 1, "categoryId": "education", "amount": 500.0, "memo": ""}, {"id": "e_seed_46", "year": 2026, "month": 1, "categoryId": "food", "amount": 436.0, "memo": ""}, {"id": "e_seed_47", "year": 2026, "month": 1, "categoryId": "food", "amount": 850.0, "memo": ""}, {"id": "e_seed_48", "year": 2026, "month": 1, "categoryId": "car", "amount": 410.0, "memo": "[車　他経費]"}, {"id": "e_seed_49", "year": 2026, "month": 1, "categoryId": "car", "amount": 44500.0, "memo": "[車　保険・税金] 車検"}, {"id": "e_seed_50", "year": 2026, "month": 1, "categoryId": "daily", "amount": 4337.0, "memo": "[衣服] こども靴"}, {"id": "e_seed_51", "year": 2026, "month": 1, "categoryId": "food", "amount": 4652.0, "memo": ""}, {"id": "e_seed_52", "year": 2026, "month": 1, "categoryId": "other_inc", "amount": 5725.0, "memo": "[立替戻り]"}, {"id": "e_seed_53", "year": 2026, "month": 1, "categoryId": "salary", "amount": 252093.0, "memo": ""}, {"id": "e_seed_54", "year": 2026, "month": 1, "categoryId": "salary", "amount": 155000.0, "memo": ""}, {"id": "e_seed_55", "year": 2026, "month": 1, "categoryId": "daily", "amount": 5409.0, "memo": "[日用品] マットレス"}, {"id": "e_seed_56", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 1108.0, "memo": "[P!]"}, {"id": "e_seed_57", "year": 2026, "month": 1, "categoryId": "car", "amount": 55584.0, "memo": "[車　他経費] 点検"}, {"id": "e_seed_58", "year": 2026, "month": 1, "categoryId": "daily", "amount": 1118.0, "memo": "[日用品] シーツ"}, {"id": "e_seed_59", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 550.0, "memo": "[P!]"}, {"id": "e_seed_60", "year": 2026, "month": 1, "categoryId": "food", "amount": 5184.0, "memo": "米"}, {"id": "e_seed_61", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 1796.0, "memo": "[P!]"}, {"id": "e_seed_62", "year": 2026, "month": 1, "categoryId": "food", "amount": 3344.0, "memo": ""}, {"id": "e_seed_63", "year": 2026, "month": 1, "categoryId": "leisure", "amount": 3200.0, "memo": "映画"}, {"id": "e_seed_64", "year": 2026, "month": 1, "categoryId": "food", "amount": 1343.0, "memo": ""}, {"id": "e_seed_65", "year": 2026, "month": 1, "categoryId": "daily", "amount": 968.0, "memo": "[日用品] 本"}, {"id": "e_seed_66", "year": 2026, "month": 1, "categoryId": "daily", "amount": 1338.0, "memo": "[日用品] 無印"}, {"id": "e_seed_67", "year": 2026, "month": 1, "categoryId": "food", "amount": 1188.0, "memo": "カルディ"}, {"id": "e_seed_68", "year": 2026, "month": 1, "categoryId": "food", "amount": 499.0, "memo": "アイス"}, {"id": "e_seed_69", "year": 2026, "month": 1, "categoryId": "food", "amount": 349.0, "memo": "ドーナツ"}, {"id": "e_seed_70", "year": 2026, "month": 1, "categoryId": "daily", "amount": 660.0, "memo": "[日用品]"}, {"id": "e_seed_71", "year": 2026, "month": 1, "categoryId": "daily", "amount": 6604.0, "memo": "[衣服] 体操服、こ靴２"}, {"id": "e_seed_72", "year": 2026, "month": 1, "categoryId": "daily", "amount": 3778.0, "memo": "[日用品]"}, {"id": "e_seed_73", "year": 2026, "month": 1, "categoryId": "eatout", "amount": 1460.0, "memo": "丸亀"}, {"id": "e_seed_74", "year": 2026, "month": 1, "categoryId": "daily", "amount": 2770.0, "memo": "[衣服] りGU"}, {"id": "e_seed_75", "year": 2026, "month": 1, "categoryId": "medical", "amount": 2920.0, "memo": ""}, {"id": "e_seed_76", "year": 2026, "month": 1, "categoryId": "food", "amount": 5111.0, "memo": ""}, {"id": "e_seed_77", "year": 2026, "month": 1, "categoryId": "daily", "amount": 1290.0, "memo": "[日用品]"}, {"id": "e_seed_78", "year": 2026, "month": 1, "categoryId": "food", "amount": 898.0, "memo": ""}, {"id": "e_seed_79", "year": 2026, "month": 1, "categoryId": "daily", "amount": 880.0, "memo": "[日用品]"}, {"id": "e_seed_80", "year": 2026, "month": 1, "categoryId": "daily", "amount": 5440.0, "memo": "[衣服] GU下着"}, {"id": "e_seed_81", "year": 2026, "month": 1, "categoryId": "daily", "amount": 3143.0, "memo": "[衣服] バッグ"}, {"id": "e_seed_82", "year": 2026, "month": 1, "categoryId": "food", "amount": 3044.0, "memo": ""}, {"id": "e_seed_83", "year": 2026, "month": 1, "categoryId": "daily", "amount": 845.0, "memo": "[日用品] インク"}, {"id": "e_seed_84", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 103.0, "memo": "[P!]"}, {"id": "e_seed_85", "year": 2026, "month": 2, "categoryId": "daily", "amount": 5377.0, "memo": "[日用品]"}, {"id": "e_seed_86", "year": 2026, "month": 2, "categoryId": "food", "amount": 3112.0, "memo": ""}, {"id": "e_seed_87", "year": 2026, "month": 2, "categoryId": "medical", "amount": 6920.0, "memo": "か歯医者"}, {"id": "e_seed_88", "year": 2026, "month": 2, "categoryId": "food", "amount": 5115.0, "memo": ""}, {"id": "e_seed_89", "year": 2026, "month": 2, "categoryId": "daily", "amount": 110.0, "memo": "[日用品]"}, {"id": "e_seed_90", "year": 2026, "month": 2, "categoryId": "other_inc", "amount": 3860.0, "memo": "[立替戻り]"}, {"id": "e_seed_91", "year": 2026, "month": 1, "categoryId": "car", "amount": 11370.0, "memo": "[車　他経費] etc"}, {"id": "e_seed_92", "year": 2026, "month": 1, "categoryId": "education", "amount": 550.0, "memo": ""}, {"id": "e_seed_93", "year": 2026, "month": 1, "categoryId": "communication", "amount": 4785.0, "memo": "[ネット]"}, {"id": "e_seed_94", "year": 2026, "month": 1, "categoryId": "utilities", "amount": 16593.0, "memo": "[電気・ガス]"}, {"id": "e_seed_95", "year": 2026, "month": 1, "categoryId": "utilities", "amount": 15958.0, "memo": "[水道]"}, {"id": "e_seed_96", "year": 2026, "month": 1, "categoryId": "other_exp", "amount": 22286.0, "memo": "[かず小遣い]"}, {"id": "e_seed_97", "year": 2026, "month": 1, "categoryId": "communication", "amount": 1691.0, "memo": "[スマホ]"}, {"id": "e_seed_98", "year": 2026, "month": 1, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_99", "year": 2026, "month": 2, "categoryId": "daily", "amount": 2370.0, "memo": "[衣服] りブーツ"}, {"id": "e_seed_100", "year": 2026, "month": 2, "categoryId": "daily", "amount": 880.0, "memo": "[日用品]"}, {"id": "e_seed_101", "year": 2026, "month": 2, "categoryId": "daily", "amount": 780.0, "memo": "[衣服]"}, {"id": "e_seed_102", "year": 2026, "month": 2, "categoryId": "daily", "amount": 550.0, "memo": "[衣服]"}, {"id": "e_seed_103", "year": 2026, "month": 1, "categoryId": "education", "amount": 2280.0, "memo": "幼給食"}, {"id": "e_seed_104", "year": 2026, "month": 2, "categoryId": "food", "amount": 3280.0, "memo": "梅干し"}, {"id": "e_seed_105", "year": 2026, "month": 2, "categoryId": "daily", "amount": 1000.0, "memo": "[日用品]"}, {"id": "e_seed_106", "year": 2026, "month": 2, "categoryId": "food", "amount": 2020.0, "memo": ""}, {"id": "e_seed_107", "year": 2026, "month": 1, "categoryId": "education", "amount": 3140.0, "memo": "幼3140"}, {"id": "e_seed_108", "year": 2026, "month": 2, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_109", "year": 2026, "month": 3, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_110", "year": 2026, "month": 4, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_111", "year": 2026, "month": 5, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_112", "year": 2026, "month": 6, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_113", "year": 2026, "month": 7, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_114", "year": 2026, "month": 8, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_115", "year": 2026, "month": 9, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_116", "year": 2026, "month": 10, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_117", "year": 2026, "month": 11, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_118", "year": 2026, "month": 12, "categoryId": "education", "amount": 3140.0, "memo": ""}, {"id": "e_seed_119", "year": 2026, "month": 2, "categoryId": "daily", "amount": 660.0, "memo": "[日用品]"}, {"id": "e_seed_120", "year": 2026, "month": 2, "categoryId": "food", "amount": 1204.0, "memo": ""}, {"id": "e_seed_121", "year": 2026, "month": 2, "categoryId": "daily", "amount": 330.0, "memo": "[日用品]"}, {"id": "e_seed_122", "year": 2026, "month": 2, "categoryId": "daily", "amount": 264.0, "memo": "[日用品]"}, {"id": "e_seed_123", "year": 2026, "month": 2, "categoryId": "medical", "amount": 1850.0, "memo": "和　歯医者"}, {"id": "e_seed_124", "year": 2026, "month": 2, "categoryId": "daily", "amount": 5590.0, "memo": "[日用品] 古本"}, {"id": "e_seed_125", "year": 2026, "month": 2, "categoryId": "food", "amount": 7540.0, "memo": ""}, {"id": "e_seed_126", "year": 2026, "month": 2, "categoryId": "other_inc", "amount": 60000.0, "memo": "[還付金] 子供特別手当"}, {"id": "e_seed_127", "year": 2026, "month": 2, "categoryId": "leisure", "amount": 2000.0, "memo": "北鎌倉"}, {"id": "e_seed_128", "year": 2026, "month": 2, "categoryId": "eatout", "amount": 2000.0, "memo": ""}, {"id": "e_seed_129", "year": 2026, "month": 2, "categoryId": "leisure", "amount": 650.0, "memo": "タロキチ博物館　入館料"}, {"id": "e_seed_130", "year": 2026, "month": 2, "categoryId": "leisure", "amount": 1000.0, "memo": "タロキチ博物館　ソフト2個"}, {"id": "e_seed_131", "year": 2026, "month": 2, "categoryId": "leisure", "amount": 3198.0, "memo": "タロキチ博物館　お土産"}, {"id": "e_seed_132", "year": 2026, "month": 2, "categoryId": "leisure", "amount": 1225.0, "memo": "タロキチ博物館　昼🍙他"}, {"id": "e_seed_133", "year": 2026, "month": 2, "categoryId": "leisure", "amount": 2000.0, "memo": "パスモチャージ"}, {"id": "e_seed_134", "year": 2026, "month": 2, "categoryId": "food", "amount": 4519.0, "memo": ""}, {"id": "e_seed_135", "year": 2026, "month": 2, "categoryId": "child_allowance", "amount": 100000.0, "memo": ""}, {"id": "e_seed_136", "year": 2026, "month": 4, "categoryId": "child_allowance", "amount": 100000.0, "memo": ""}, {"id": "e_seed_137", "year": 2026, "month": 6, "categoryId": "child_allowance", "amount": 100000.0, "memo": ""}, {"id": "e_seed_138", "year": 2026, "month": 8, "categoryId": "child_allowance", "amount": 100000.0, "memo": ""}, {"id": "e_seed_139", "year": 2026, "month": 10, "categoryId": "child_allowance", "amount": 100000.0, "memo": ""}, {"id": "e_seed_140", "year": 2026, "month": 12, "categoryId": "child_allowance", "amount": 100000.0, "memo": ""}, {"id": "e_seed_141", "year": 2026, "month": 2, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_142", "year": 2026, "month": 3, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_143", "year": 2026, "month": 4, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_144", "year": 2026, "month": 5, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_145", "year": 2026, "month": 6, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_146", "year": 2026, "month": 7, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_147", "year": 2026, "month": 8, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_148", "year": 2026, "month": 9, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_149", "year": 2026, "month": 10, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_150", "year": 2026, "month": 11, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_151", "year": 2026, "month": 12, "categoryId": "housing", "amount": 152457.0, "memo": "[住宅ローン]"}, {"id": "e_seed_152", "year": 2026, "month": 2, "categoryId": "car", "amount": 1955.0, "memo": "[車　他経費] 駐車場"}, {"id": "e_seed_153", "year": 2026, "month": 2, "categoryId": "education", "amount": 1400.0, "memo": ""}, {"id": "e_seed_154", "year": 2026, "month": 2, "categoryId": "daily", "amount": 550.0, "memo": "[日用品]"}, {"id": "e_seed_155", "year": 2026, "month": 2, "categoryId": "food", "amount": 847.0, "memo": ""}, {"id": "e_seed_156", "year": 2026, "month": 2, "categoryId": "daily", "amount": 400.0, "memo": "[日用品]"}, {"id": "e_seed_157", "year": 2026, "month": 2, "categoryId": "medical", "amount": 2000.0, "memo": "和　歯医者"}, {"id": "e_seed_158", "year": 2026, "month": 2, "categoryId": "daily", "amount": 132.0, "memo": "[日用品] ゴジラ"}, {"id": "e_seed_159", "year": 2026, "month": 2, "categoryId": "other_exp", "amount": 599.0, "memo": "[P!]"}, {"id": "e_seed_160", "year": 2026, "month": 2, "categoryId": "car", "amount": 2339.0, "memo": "[車　ガス代]"}, {"id": "e_seed_161", "year": 2026, "month": 2, "categoryId": "food", "amount": 2288.0, "memo": ""}, {"id": "e_seed_162", "year": 2026, "month": 2, "categoryId": "food", "amount": 1942.0, "memo": ""}, {"id": "e_seed_163", "year": 2026, "month": 2, "categoryId": "daily", "amount": 589.0, "memo": "[日用品]"}, {"id": "e_seed_164", "year": 2026, "month": 2, "categoryId": "food", "amount": 3154.0, "memo": ""}, {"id": "e_seed_165", "year": 2026, "month": 2, "categoryId": "food", "amount": 1590.0, "memo": ""}, {"id": "e_seed_166", "year": 2026, "month": 2, "categoryId": "other_exp", "amount": 2390.0, "memo": "[P!]"}, {"id": "e_seed_167", "year": 2026, "month": 2, "categoryId": "food", "amount": 3490.0, "memo": "こめ"}, {"id": "e_seed_168", "year": 2026, "month": 2, "categoryId": "food", "amount": 4271.0, "memo": ""}, {"id": "e_seed_169", "year": 2026, "month": 2, "categoryId": "car", "amount": 37550.0, "memo": "[車　保険・税金]"}, {"id": "e_seed_170", "year": 2026, "month": 2, "categoryId": "salary", "amount": 221481.0, "memo": ""}, {"id": "e_seed_171", "year": 2026, "month": 2, "categoryId": "salary", "amount": 155000.0, "memo": ""}, {"id": "e_seed_172", "year": 2026, "month": 2, "categoryId": "food", "amount": 868.0, "memo": ""}, {"id": "e_seed_173", "year": 2026, "month": 2, "categoryId": "education", "amount": 500.0, "memo": ""}, {"id": "e_seed_174", "year": 2026, "month": 2, "categoryId": "food", "amount": 226.0, "memo": ""}, {"id": "e_seed_175", "year": 2026, "month": 2, "categoryId": "eatout", "amount": 2220.0, "memo": "りランチ"}, {"id": "e_seed_176", "year": 2026, "month": 2, "categoryId": "leisure", "amount": 1000.0, "memo": ""}, {"id": "e_seed_177", "year": 2026, "month": 2, "categoryId": "food", "amount": 1750.0, "memo": "三鷹"}, {"id": "e_seed_178", "year": 2026, "month": 2, "categoryId": "eatout", "amount": 2607.0, "memo": "弁当"}, {"id": "e_seed_179", "year": 2026, "month": 2, "categoryId": "eatout", "amount": 672.0, "memo": "アイス"}, {"id": "e_seed_180", "year": 2026, "month": 2, "categoryId": "car", "amount": 600.0, "memo": "[車　他経費]"}, {"id": "e_seed_181", "year": 2026, "month": 2, "categoryId": "food", "amount": 6315.0, "memo": ""}, {"id": "e_seed_182", "year": 2026, "month": 2, "categoryId": "daily", "amount": 4592.0, "memo": "[日用品] ヨドバシ"}, {"id": "e_seed_183", "year": 2026, "month": 2, "categoryId": "other_exp", "amount": 532.0, "memo": "[P!]"}, {"id": "e_seed_184", "year": 2026, "month": 2, "categoryId": "food", "amount": 116.0, "memo": ""}, {"id": "e_seed_185", "year": 2026, "month": 2, "categoryId": "food", "amount": 2997.0, "memo": ""}, {"id": "e_seed_186", "year": 2026, "month": 2, "categoryId": "daily", "amount": 4795.0, "memo": "[日用品]"}, {"id": "e_seed_187", "year": 2026, "month": 2, "categoryId": "daily", "amount": 4399.0, "memo": "[日用品]"}, {"id": "e_seed_188", "year": 2026, "month": 2, "categoryId": "other_exp", "amount": 97.0, "memo": "[P!]"}, {"id": "e_seed_189", "year": 2026, "month": 2, "categoryId": "eatout", "amount": 1000.0, "memo": "和徳昼飯"}, {"id": "e_seed_190", "year": 2026, "month": 2, "categoryId": "medical", "amount": 4250.0, "memo": "和徳歯医者"}, {"id": "e_seed_191", "year": 2026, "month": 2, "categoryId": "daily", "amount": 833.0, "memo": "[日用品]"}, {"id": "e_seed_192", "year": 2026, "month": 2, "categoryId": "food", "amount": 1783.0, "memo": ""}, {"id": "e_seed_193", "year": 2026, "month": 2, "categoryId": "daily", "amount": 330.0, "memo": "[日用品]"}, {"id": "e_seed_194", "year": 2026, "month": 3, "categoryId": "medical", "amount": 1788.0, "memo": "花粉症薬"}, {"id": "e_seed_195", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 542.0, "memo": "[P!]"}, {"id": "e_seed_196", "year": 2026, "month": 3, "categoryId": "food", "amount": 1820.0, "memo": ""}, {"id": "e_seed_197", "year": 2026, "month": 3, "categoryId": "food", "amount": 5980.0, "memo": "こめ"}, {"id": "e_seed_198", "year": 2026, "month": 3, "categoryId": "food", "amount": 3746.0, "memo": ""}, {"id": "e_seed_199", "year": 2026, "month": 2, "categoryId": "education", "amount": 2660.0, "memo": "幼給食"}, {"id": "e_seed_200", "year": 2026, "month": 3, "categoryId": "daily", "amount": 550.0, "memo": "[日用品]"}, {"id": "e_seed_201", "year": 2026, "month": 3, "categoryId": "other_inc", "amount": 86524.0, "memo": "[還付金]"}, {"id": "e_seed_202", "year": 2026, "month": 2, "categoryId": "other_exp", "amount": 26052.0, "memo": "[かず小遣い] 立替？"}, {"id": "e_seed_203", "year": 2026, "month": 3, "categoryId": "daily", "amount": 3075.0, "memo": "[衣服]"}, {"id": "e_seed_204", "year": 2026, "month": 3, "categoryId": "daily", "amount": 6600.0, "memo": "[日用品] か本"}, {"id": "e_seed_205", "year": 2026, "month": 3, "categoryId": "food", "amount": 5880.0, "memo": "米"}, {"id": "e_seed_206", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 24800.0, "memo": "[その他支出] 3500P"}, {"id": "e_seed_207", "year": 2026, "month": 3, "categoryId": "food", "amount": 2142.0, "memo": ""}, {"id": "e_seed_208", "year": 2026, "month": 3, "categoryId": "daily", "amount": 440.0, "memo": "[日用品]"}, {"id": "e_seed_209", "year": 2026, "month": 3, "categoryId": "eatout", "amount": 2600.0, "memo": ""}, {"id": "e_seed_210", "year": 2026, "month": 3, "categoryId": "daily", "amount": 3575.0, "memo": "[日用品]"}, {"id": "e_seed_211", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 180.0, "memo": "[P!]"}, {"id": "e_seed_212", "year": 2026, "month": 3, "categoryId": "food", "amount": 2590.0, "memo": ""}, {"id": "e_seed_213", "year": 2026, "month": 3, "categoryId": "daily", "amount": 1367.0, "memo": "[日用品]"}, {"id": "e_seed_214", "year": 2026, "month": 3, "categoryId": "daily", "amount": 1456.0, "memo": "[日用品] 園芸用品"}, {"id": "e_seed_215", "year": 2026, "month": 3, "categoryId": "food", "amount": 6979.0, "memo": ""}, {"id": "e_seed_216", "year": 2026, "month": 3, "categoryId": "education", "amount": 860.0, "memo": "けしゃしん"}, {"id": "e_seed_217", "year": 2026, "month": 3, "categoryId": "education", "amount": 183.0, "memo": ""}, {"id": "e_seed_218", "year": 2026, "month": 3, "categoryId": "education", "amount": 16000.0, "memo": "幼稚園教材"}, {"id": "e_seed_219", "year": 2026, "month": 3, "categoryId": "daily", "amount": 2454.0, "memo": "[日用品] にとり"}, {"id": "e_seed_220", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 88.0, "memo": "[P!]"}, {"id": "e_seed_221", "year": 2026, "month": 3, "categoryId": "education", "amount": 1140.0, "memo": "幼給食"}, {"id": "e_seed_222", "year": 2026, "month": 3, "categoryId": "daily", "amount": 397.0, "memo": "[日用品]"}, {"id": "e_seed_223", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 111.0, "memo": "[P!]"}, {"id": "e_seed_224", "year": 2026, "month": 3, "categoryId": "food", "amount": 2541.0, "memo": ""}, {"id": "e_seed_225", "year": 2026, "month": 3, "categoryId": "medical", "amount": 1849.0, "memo": "花粉症薬"}, {"id": "e_seed_226", "year": 2026, "month": 3, "categoryId": "daily", "amount": 990.0, "memo": "[日用品]"}, {"id": "e_seed_227", "year": 2026, "month": 3, "categoryId": "food", "amount": 1047.0, "memo": ""}, {"id": "e_seed_228", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 5000.0, "memo": "[かず小遣い] 現金"}, {"id": "e_seed_229", "year": 2026, "month": 3, "categoryId": "daily", "amount": 7330.0, "memo": "[衣服] 西松屋"}, {"id": "e_seed_230", "year": 2026, "month": 3, "categoryId": "daily", "amount": 765.0, "memo": "[日用品]"}, {"id": "e_seed_231", "year": 2026, "month": 3, "categoryId": "food", "amount": 2924.0, "memo": "弁当"}, {"id": "e_seed_232", "year": 2026, "month": 3, "categoryId": "daily", "amount": 657.0, "memo": "[日用品]"}, {"id": "e_seed_233", "year": 2026, "month": 3, "categoryId": "food", "amount": 1395.0, "memo": ""}, {"id": "e_seed_234", "year": 2026, "month": 3, "categoryId": "car", "amount": 410.0, "memo": "[車　他経費]"}, {"id": "e_seed_235", "year": 2026, "month": 2, "categoryId": "communication", "amount": 4785.0, "memo": "[ネット]"}, {"id": "e_seed_236", "year": 2026, "month": 2, "categoryId": "education", "amount": 550.0, "memo": ""}, {"id": "e_seed_237", "year": 2026, "month": 2, "categoryId": "other_exp", "amount": 28052.0, "memo": "[かず小遣い]"}, {"id": "e_seed_238", "year": 2026, "month": 2, "categoryId": "communication", "amount": 1686.0, "memo": "[スマホ]"}, {"id": "e_seed_239", "year": 2026, "month": 2, "categoryId": "other_exp", "amount": 2200.0, "memo": "[その他支出]"}, {"id": "e_seed_240", "year": 2026, "month": 2, "categoryId": "utilities", "amount": 17301.0, "memo": "[電気・ガス]"}, {"id": "e_seed_241", "year": 2026, "month": 3, "categoryId": "food", "amount": 400.0, "memo": ""}, {"id": "e_seed_242", "year": 2026, "month": 3, "categoryId": "food", "amount": 3018.0, "memo": ""}, {"id": "e_seed_243", "year": 2026, "month": 3, "categoryId": "daily", "amount": 440.0, "memo": "[日用品]"}, {"id": "e_seed_244", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 33000.0, "memo": "[かず小遣い] デザフェス"}, {"id": "e_seed_245", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 3311.0, "memo": "[かず小遣い] 逸見さんプレゼント"}, {"id": "e_seed_246", "year": 2026, "month": 3, "categoryId": "salary", "amount": 224067.0, "memo": ""}, {"id": "e_seed_247", "year": 2026, "month": 3, "categoryId": "salary", "amount": 155000.0, "memo": ""}, {"id": "e_seed_248", "year": 2026, "month": 3, "categoryId": "food", "amount": 10593.0, "memo": ""}, {"id": "e_seed_249", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 10800.0, "memo": "[その他支出] まま美容院"}, {"id": "e_seed_250", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 5885.0, "memo": "[かず小遣い] 田村さんプレゼント"}, {"id": "e_seed_251", "year": 2026, "month": 3, "categoryId": "daily", "amount": 4103.0, "memo": "[日用品] 子供　本"}, {"id": "e_seed_252", "year": 2026, "month": 3, "categoryId": "food", "amount": 1676.0, "memo": ""}, {"id": "e_seed_253", "year": 2026, "month": 3, "categoryId": "daily", "amount": 658.0, "memo": "[日用品]"}, {"id": "e_seed_254", "year": 2026, "month": 3, "categoryId": "food", "amount": 2531.0, "memo": ""}, {"id": "e_seed_255", "year": 2026, "month": 3, "categoryId": "daily", "amount": 1598.0, "memo": "[日用品]"}, {"id": "e_seed_256", "year": 2026, "month": 3, "categoryId": "daily", "amount": 2061.0, "memo": "[日用品]"}, {"id": "e_seed_257", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 359.0, "memo": "[P!]"}, {"id": "e_seed_258", "year": 2026, "month": 3, "categoryId": "food", "amount": 7919.0, "memo": ""}, {"id": "e_seed_259", "year": 2026, "month": 4, "categoryId": "food", "amount": 5280.0, "memo": "こめ"}, {"id": "e_seed_260", "year": 2026, "month": 3, "categoryId": "daily", "amount": 1340.0, "memo": "[日用品]"}, {"id": "e_seed_261", "year": 2026, "month": 3, "categoryId": "food", "amount": 2541.0, "memo": ""}, {"id": "e_seed_262", "year": 2026, "month": 3, "categoryId": "car", "amount": 2200.0, "memo": "[車　ガス代]"}, {"id": "e_seed_263", "year": 2026, "month": 3, "categoryId": "car", "amount": 410.0, "memo": "[車　他経費]"}, {"id": "e_seed_264", "year": 2026, "month": 4, "categoryId": "daily", "amount": 440.0, "memo": "[日用品]"}, {"id": "e_seed_265", "year": 2026, "month": 4, "categoryId": "food", "amount": 6130.0, "memo": ""}, {"id": "e_seed_266", "year": 2026, "month": 3, "categoryId": "other_exp", "amount": 37999.0, "memo": "[かず小遣い] 3/29まで"}, {"id": "e_seed_267", "year": 2026, "month": 3, "categoryId": "education", "amount": 550.0, "memo": ""}, {"id": "e_seed_268", "year": 2026, "month": 3, "categoryId": "communication", "amount": 4785.0, "memo": "[ネット]"}, {"id": "e_seed_269", "year": 2026, "month": 3, "categoryId": "utilities", "amount": 19945.0, "memo": "[電気・ガス]"}, {"id": "e_seed_270", "year": 2026, "month": 3, "categoryId": "utilities", "amount": 13939.0, "memo": "[水道]"}, {"id": "e_seed_271", "year": 2026, "month": 3, "categoryId": "communication", "amount": 1686.0, "memo": "[スマホ]"}, {"id": "e_seed_272", "year": 2026, "month": 4, "categoryId": "daily", "amount": 2553.0, "memo": "[日用品]"}, {"id": "e_seed_273", "year": 2026, "month": 4, "categoryId": "leisure", "amount": 4860.0, "memo": "れすとらん"}, {"id": "e_seed_274", "year": 2026, "month": 4, "categoryId": "leisure", "amount": 520.0, "memo": "みやげ"}, {"id": "e_seed_275", "year": 2026, "month": 4, "categoryId": "leisure", "amount": 2450.0, "memo": "みやげ"}, {"id": "e_seed_276", "year": 2026, "month": 4, "categoryId": "leisure", "amount": 4100.0, "memo": "牧場"}, {"id": "e_seed_277", "year": 2026, "month": 4, "categoryId": "leisure", "amount": 14400.0, "memo": "宿"}, {"id": "e_seed_278", "year": 2026, "month": 4, "categoryId": "leisure", "amount": 1060.0, "memo": "みやげ"}, {"id": "e_seed_279", "year": 2026, "month": 4, "categoryId": "leisure", "amount": 5225.0, "memo": "うどん"}, {"id": "e_seed_280", "year": 2026, "month": 4, "categoryId": "food", "amount": 170.0, "memo": ""}, {"id": "e_seed_281", "year": 2026, "month": 4, "categoryId": "food", "amount": 920.0, "memo": "クリエイト"}, {"id": "e_seed_282", "year": 2026, "month": 4, "categoryId": "food", "amount": 6479.0, "memo": ""}, {"id": "e_seed_283", "year": 2026, "month": 4, "categoryId": "daily", "amount": 5213.0, "memo": "[衣服] 西松屋"}, {"id": "e_seed_284", "year": 2026, "month": 4, "categoryId": "daily", "amount": 3993.0, "memo": "[日用品] 写真"}, {"id": "e_seed_285", "year": 2026, "month": 4, "categoryId": "daily", "amount": 658.0, "memo": "[日用品]"}, {"id": "e_seed_286", "year": 2026, "month": 4, "categoryId": "food", "amount": 374.0, "memo": ""}, {"id": "e_seed_287", "year": 2026, "month": 4, "categoryId": "other_inc", "amount": 4203.0, "memo": "[その他収入] 預金利息"}, {"id": "e_seed_288", "year": 2026, "month": 4, "categoryId": "education", "amount": 2743.0, "memo": "幼稚園写真"}, {"id": "e_seed_289", "year": 2026, "month": 4, "categoryId": "other_exp", "amount": 367.0, "memo": "[P!]"}, {"id": "e_seed_290", "year": 2026, "month": 4, "categoryId": "car", "amount": 4400.0, "memo": "[車　他経費] タイヤ交換"}, {"id": "e_seed_291", "year": 2026, "month": 4, "categoryId": "car", "amount": 2949.0, "memo": "[車　ガス代]"}, {"id": "e_seed_292", "year": 2026, "month": 4, "categoryId": "food", "amount": 2780.0, "memo": "梅干し"}, {"id": "e_seed_293", "year": 2026, "month": 4, "categoryId": "food", "amount": 6332.0, "memo": ""}, {"id": "e_seed_294", "year": 2026, "month": 4, "categoryId": "food", "amount": 5980.0, "memo": "こめ"}, {"id": "e_seed_295", "year": 2026, "month": 4, "categoryId": "daily", "amount": 545.0, "memo": "[日用品]"}, {"id": "e_seed_296", "year": 2026, "month": 4, "categoryId": "food", "amount": 1290.0, "memo": ""}, {"id": "e_seed_297", "year": 2026, "month": 4, "categoryId": "daily", "amount": 220.0, "memo": "[日用品]"}, {"id": "e_seed_298", "year": 2026, "month": 4, "categoryId": "food", "amount": 2990.0, "memo": "コープ"}, {"id": "e_seed_299", "year": 2026, "month": 4, "categoryId": "food", "amount": 4524.0, "memo": ""}, {"id": "e_seed_300", "year": 2026, "month": 4, "categoryId": "other_exp", "amount": 9582.0, "memo": "[P!]"}, {"id": "e_seed_301", "year": 2026, "month": 4, "categoryId": "daily", "amount": 318.0, "memo": "[日用品]"}, {"id": "e_seed_302", "year": 2026, "month": 4, "categoryId": "food", "amount": 888.0, "memo": ""}, {"id": "e_seed_303", "year": 2026, "month": 4, "categoryId": "daily", "amount": 880.0, "memo": "[日用品]"}, {"id": "e_seed_304", "year": 2026, "month": 4, "categoryId": "education", "amount": 1500.0, "memo": ""}, {"id": "e_seed_305", "year": 2026, "month": 4, "categoryId": "salary", "amount": 246236.0, "memo": ""}, {"id": "e_seed_306", "year": 2026, "month": 4, "categoryId": "other_inc", "amount": 2829.0, "memo": "[立替戻り]"}, {"id": "e_seed_307", "year": 2026, "month": 4, "categoryId": "salary", "amount": 155000.0, "memo": ""}, {"id": "e_seed_308", "year": 2026, "month": 4, "categoryId": "food", "amount": 1368.0, "memo": ""}, {"id": "e_seed_309", "year": 2026, "month": 4, "categoryId": "daily", "amount": 567.0, "memo": "[日用品]"}, {"id": "e_seed_310", "year": 2026, "month": 4, "categoryId": "food", "amount": 6615.0, "memo": ""}, {"id": "e_seed_311", "year": 2026, "month": 4, "categoryId": "daily", "amount": 658.0, "memo": "[日用品]"}, {"id": "e_seed_312", "year": 2026, "month": 4, "categoryId": "daily", "amount": 550.0, "memo": "[日用品]"}, {"id": "e_seed_313", "year": 2026, "month": 5, "categoryId": "utilities", "amount": 13939.0, "memo": "[水道]"}, {"id": "e_seed_314", "year": 2026, "month": 4, "categoryId": "daily", "amount": 183.0, "memo": "[日用品]"}, {"id": "e_seed_315", "year": 2026, "month": 4, "categoryId": "daily", "amount": 220.0, "memo": "[日用品]"}, {"id": "e_seed_316", "year": 2026, "month": 4, "categoryId": "food", "amount": 2488.0, "memo": ""}, {"id": "e_seed_317", "year": 2026, "month": 4, "categoryId": "car", "amount": 300.0, "memo": "[車　他経費]"}, {"id": "e_seed_318", "year": 2026, "month": 4, "categoryId": "daily", "amount": 740.0, "memo": "[日用品]"}, {"id": "e_seed_319", "year": 2026, "month": 5, "categoryId": "other_inc", "amount": 25000.0, "memo": "[還付金] 藤沢市"}, {"id": "e_seed_320", "year": 2026, "month": 4, "categoryId": "food", "amount": 6396.0, "memo": ""}, {"id": "e_seed_321", "year": 2026, "month": 4, "categoryId": "daily", "amount": 990.0, "memo": "[日用品]"}, {"id": "e_seed_322", "year": 2026, "month": 5, "categoryId": "food", "amount": 5980.0, "memo": "米"}, {"id": "e_seed_323", "year": 2026, "month": 5, "categoryId": "daily", "amount": 550.0, "memo": "[日用品]"}, {"id": "e_seed_324", "year": 2026, "month": 5, "categoryId": "daily", "amount": 3980.0, "memo": "[衣服] か服"}, {"id": "e_seed_325", "year": 2026, "month": 5, "categoryId": "daily", "amount": 3980.0, "memo": "[衣服]"}, {"id": "e_seed_326", "year": 2026, "month": 5, "categoryId": "eatout", "amount": 2760.0, "memo": ""}, {"id": "e_seed_327", "year": 2026, "month": 5, "categoryId": "food", "amount": 4149.0, "memo": ""}, {"id": "e_seed_328", "year": 2026, "month": 5, "categoryId": "other_exp", "amount": 287.0, "memo": "[P!]"}, {"id": "e_seed_329", "year": 2026, "month": 5, "categoryId": "daily", "amount": 315.0, "memo": "[日用品]"}, {"id": "e_seed_330", "year": 2026, "month": 4, "categoryId": "car", "amount": 4120.0, "memo": "[車　他経費]"}, {"id": "e_seed_331", "year": 2026, "month": 4, "categoryId": "education", "amount": 550.0, "memo": ""}, {"id": "e_seed_332", "year": 2026, "month": 4, "categoryId": "communication", "amount": 4787.0, "memo": "[ネット]"}, {"id": "e_seed_333", "year": 2026, "month": 4, "categoryId": "utilities", "amount": 14714.0, "memo": "[電気・ガス]"}, {"id": "e_seed_334", "year": 2026, "month": 4, "categoryId": "other_exp", "amount": 2200.0, "memo": "[その他支出]"}, {"id": "e_seed_335", "year": 2026, "month": 4, "categoryId": "other_exp", "amount": 18025.0, "memo": "[かず小遣い] 4/27まで"}, {"id": "e_seed_336", "year": 2026, "month": 4, "categoryId": "communication", "amount": 1686.0, "memo": "[スマホ]"}, {"id": "e_seed_337", "year": 2026, "month": 5, "categoryId": "car", "amount": 300.0, "memo": "[車　他経費]"}, {"id": "e_seed_338", "year": 2026, "month": 5, "categoryId": "food", "amount": 1393.0, "memo": ""}, {"id": "e_seed_339", "year": 2026, "month": 5, "categoryId": "daily", "amount": 749.0, "memo": "[日用品]"}, {"id": "e_seed_340", "year": 2026, "month": 5, "categoryId": "eatout", "amount": 2600.0, "memo": ""}, {"id": "e_seed_341", "year": 2026, "month": 5, "categoryId": "leisure", "amount": 600.0, "memo": ""}, {"id": "e_seed_342", "year": 2026, "month": 5, "categoryId": "food", "amount": 5007, "memo": ""}, {"id": "e_seed_343", "year": 2026, "month": 5, "categoryId": "leisure", "amount": 1500.0, "memo": ""}, {"id": "e_seed_344", "year": 2026, "month": 5, "categoryId": "eatout", "amount": 970.0, "memo": ""}, {"id": "e_seed_345", "year": 2026, "month": 5, "categoryId": "car", "amount": 300.0, "memo": "[車　他経費]"}, {"id": "e_seed_346", "year": 2026, "month": 5, "categoryId": "leisure", "amount": 7750.0, "memo": "釣り"}, {"id": "e_seed_347", "year": 2026, "month": 5, "categoryId": "eatout", "amount": 5040.0, "memo": "スシロー"}, {"id": "e_seed_348", "year": 2026, "month": 5, "categoryId": "car", "amount": 600.0, "memo": "[車　他経費]"}, {"id": "e_seed_349", "year": 2026, "month": 5, "categoryId": "car", "amount": 3050.0, "memo": "[車　ガス代]"}, {"id": "e_seed_350", "year": 2026, "month": 5, "categoryId": "food", "amount": 6684.0, "memo": ""}, {"id": "e_seed_351", "year": 2026, "month": 5, "categoryId": "daily", "amount": 110.0, "memo": "[日用品]"}, {"id": "e_seed_352", "year": 2026, "month": 5, "categoryId": "education", "amount": 1140.0, "memo": ""}, {"id": "e_seed_353", "year": 2026, "month": 5, "categoryId": "education", "amount": 8025.0, "memo": "小学校集金二人分"}, {"id": "e_seed_354", "year": 2026, "month": 5, "categoryId": "daily", "amount": 6154.0, "memo": "[衣服] 靴三足"}, {"id": "e_seed_355", "year": 2026, "month": 5, "categoryId": "eatout", "amount": 1600.0, "memo": ""}, {"id": "e_seed_356", "year": 2026, "month": 5, "categoryId": "food", "amount": 1166.0, "memo": "コーヒー豆"}, {"id": "e_seed_357", "year": 2026, "month": 6, "categoryId": "education", "amount": 66950.0, "memo": "チャレンジ"}, {"id": "e_seed_358", "year": 2026, "month": 5, "categoryId": "food", "amount": 1040.0, "memo": ""}, {"id": "e_seed_359", "year": 2026, "month": 5, "categoryId": "daily", "amount": 985.0, "memo": "[日用品]"}, {"id": "e_seed_360", "year": 2026, "month": 5, "categoryId": "food", "amount": 6039.0, "memo": ""}, {"id": "e_seed_361", "year": 2026, "month": 5, "categoryId": "food", "amount": 5062.0, "memo": ""}, {"id": "e_seed_362", "year": 2026, "month": 5, "categoryId": "other_exp", "amount": 1718.0, "memo": "[P!] スマホケース米"}, {"id": "e_seed_363", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 65455.0, "memo": "[その他支出] りスマホ"}, {"id": "e_seed_364", "year": 2026, "month": 5, "categoryId": "food", "amount": 551.0, "memo": ""}, {"id": "e_seed_365", "year": 2026, "month": 5, "categoryId": "daily", "amount": 2679.0, "memo": "[日用品] スコップ棚板"}, {"id": "e_seed_366", "year": 2026, "month": 5, "categoryId": "education", "amount": 1000.0, "memo": ""}, {"id": "e_seed_367", "year": 2026, "month": 5, "categoryId": "food", "amount": 952.0, "memo": ""}, {"id": "e_seed_368", "year": 2026, "month": 5, "categoryId": "other_exp", "amount": 400.0, "memo": "[P!]"}, {"id": "e_seed_369", "year": 2026, "month": 5, "categoryId": "food", "amount": 220.0, "memo": ""}, {"id": "e_seed_370", "year": 2026, "month": 5, "categoryId": "daily", "amount": 4000.0, "memo": "[衣服] かずのり無印"}, {"id": "e_seed_371", "year": 2026, "month": 5, "categoryId": "food", "amount": 8405.0, "memo": ""}, {"id": "e_seed_372", "year": 2026, "month": 5, "categoryId": "salary", "amount": 239558.0, "memo": ""}, {"id": "e_seed_373", "year": 2026, "month": 5, "categoryId": "salary", "amount": 155000.0, "memo": ""}, {"id": "e_seed_374", "year": 2026, "month": 5, "categoryId": "other_inc", "amount": 5988.0, "memo": "[立替戻り]"}, {"id": "e_seed_375", "year": 2026, "month": 5, "categoryId": "food", "amount": 2558.0, "memo": ""}, {"id": "e_seed_376", "year": 2026, "month": 6, "categoryId": "housing", "amount": 48700.0, "memo": "[固定資産税]"}, {"id": "e_seed_377", "year": 2026, "month": 6, "categoryId": "car", "amount": 34500.0, "memo": "[車　保険・税金]"}, {"id": "e_seed_378", "year": 2026, "month": 5, "categoryId": "daily", "amount": 858, "memo": "[衣服] かず古着"}, {"id": "e_seed_379", "year": 2026, "month": 5, "categoryId": "other_exp", "amount": 5918.0, "memo": "[その他支出] 自転車修理"}, {"id": "e_seed_380", "year": 2026, "month": 5, "categoryId": "daily", "amount": 770.0, "memo": "[日用品]"}, {"id": "e_seed_381", "year": 2026, "month": 5, "categoryId": "daily", "amount": 495.0, "memo": "[日用品]"}, {"id": "e_seed_382", "year": 2026, "month": 5, "categoryId": "eatout", "amount": 1650.0, "memo": ""}, {"id": "e_seed_383", "year": 2026, "month": 5, "categoryId": "eatout", "amount": 540.0, "memo": ""}, {"id": "e_seed_384", "year": 2026, "month": 5, "categoryId": "leisure", "amount": 1000.0, "memo": ""}, {"id": "e_seed_385", "year": 2026, "month": 5, "categoryId": "daily", "amount": 2861.0, "memo": "[日用品]"}, {"id": "e_seed_386", "year": 2026, "month": 5, "categoryId": "food", "amount": 1218.0, "memo": ""}, {"id": "e_seed_387", "year": 2026, "month": 5, "categoryId": "food", "amount": 1200.0, "memo": "和菓子"}, {"id": "e_seed_388", "year": 2026, "month": 5, "categoryId": "food", "amount": 436.0, "memo": ""}, {"id": "e_seed_389", "year": 2026, "month": 5, "categoryId": "food", "amount": 7386.0, "memo": ""}, {"id": "e_seed_390", "year": 2026, "month": 5, "categoryId": "education", "amount": 500.0, "memo": ""}, {"id": "e_seed_391", "year": 2026, "month": 5, "categoryId": "daily", "amount": 1453.0, "memo": "[日用品]"}, {"id": "e_seed_392", "year": 2026, "month": 5, "categoryId": "food", "amount": 1821.0, "memo": ""}, {"id": "e_seed_393", "year": 2026, "month": 5, "categoryId": "daily", "amount": 550.0, "memo": "[日用品]"}, {"id": "e_seed_394", "year": 2026, "month": 5, "categoryId": "daily", "amount": 2771.0, "memo": "[日用品]"}, {"id": "e_seed_395", "year": 2026, "month": 5, "categoryId": "education", "amount": 960.0, "memo": ""}, {"id": "e_seed_396", "year": 2026, "month": 6, "categoryId": "daily", "amount": 990.0, "memo": "[日用品]"}, {"id": "e_seed_397", "year": 2026, "month": 6, "categoryId": "food", "amount": 984.0, "memo": ""}, {"id": "e_seed_398", "year": 2026, "month": 6, "categoryId": "daily", "amount": 440.0, "memo": "[日用品]"}, {"id": "e_seed_399", "year": 2026, "month": 5, "categoryId": "education", "amount": 550.0, "memo": ""}, {"id": "e_seed_400", "year": 2026, "month": 5, "categoryId": "other_exp", "amount": 33766.0, "memo": "[かず小遣い]"}, {"id": "e_seed_401", "year": 2026, "month": 5, "categoryId": "communication", "amount": 1686.0, "memo": "[スマホ]"}, {"id": "e_seed_402", "year": 2026, "month": 5, "categoryId": "communication", "amount": 4785.0, "memo": "[ネット]"}, {"id": "e_seed_403", "year": 2026, "month": 5, "categoryId": "utilities", "amount": 14774.0, "memo": "[電気・ガス]"}, {"id": "e_seed_404", "year": 2026, "month": 6, "categoryId": "food", "amount": 5532.0, "memo": ""}, {"id": "e_seed_405", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 148.0, "memo": "[P!]"}, {"id": "e_seed_406", "year": 2026, "month": 6, "categoryId": "food", "amount": 1061.0, "memo": ""}, {"id": "e_seed_407", "year": 2026, "month": 6, "categoryId": "food", "amount": 521.0, "memo": ""}, {"id": "e_seed_408", "year": 2026, "month": 6, "categoryId": "food", "amount": 599.0, "memo": ""}, {"id": "e_seed_409", "year": 2026, "month": 5, "categoryId": "education", "amount": 2280.0, "memo": "幼給食"}, {"id": "e_seed_410", "year": 2026, "month": 6, "categoryId": "food", "amount": 8757.0, "memo": ""}, {"id": "e_seed_411", "year": 2026, "month": 6, "categoryId": "daily", "amount": 3833.0, "memo": "[日用品]"}, {"id": "e_seed_412", "year": 2026, "month": 6, "categoryId": "daily", "amount": 550.0, "memo": "[日用品]"}, {"id": "e_seed_413", "year": 2026, "month": 6, "categoryId": "daily", "amount": 1421.0, "memo": "[日用品]"}, {"id": "e_seed_414", "year": 2026, "month": 6, "categoryId": "eatout", "amount": 5820.0, "memo": ""}, {"id": "e_seed_415", "year": 2026, "month": 6, "categoryId": "food", "amount": 1377.0, "memo": ""}, {"id": "e_seed_416", "year": 2026, "month": 6, "categoryId": "bonus", "amount": 1197427.0, "memo": ""}, {"id": "e_seed_417", "year": 2026, "month": 6, "categoryId": "food", "amount": 7431.0, "memo": ""}, {"id": "e_seed_418", "year": 2026, "month": 6, "categoryId": "food", "amount": 887.0, "memo": ""}, {"id": "e_seed_419", "year": 2026, "month": 6, "categoryId": "daily", "amount": 4359.0, "memo": "[衣服] 子水着"}, {"id": "e_seed_420", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 18437.0, "memo": "[かず小遣い] 現金"}, {"id": "e_seed_421", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 256.0, "memo": "[P!]"}, {"id": "e_seed_422", "year": 2026, "month": 6, "categoryId": "daily", "amount": 651.0, "memo": "[日用品]"}, {"id": "e_seed_423", "year": 2026, "month": 6, "categoryId": "food", "amount": 1231.0, "memo": ""}, {"id": "e_seed_424", "year": 2026, "month": 6, "categoryId": "daily", "amount": 3034.0, "memo": "[日用品]"}, {"id": "e_seed_425", "year": 2026, "month": 6, "categoryId": "daily", "amount": 4598.0, "memo": "[日用品] 自転車"}, {"id": "e_seed_426", "year": 2026, "month": 6, "categoryId": "daily", "amount": 660.0, "memo": "[日用品]"}, {"id": "e_seed_427", "year": 2026, "month": 6, "categoryId": "daily", "amount": 2400.0, "memo": "[日用品] マルシェ"}, {"id": "e_seed_428", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 13000.0, "memo": "[ふるさと納税] ふるさと納税"}, {"id": "e_seed_429", "year": 2026, "month": 6, "categoryId": "education", "amount": 900.0, "memo": "幼稚園写真"}, {"id": "e_seed_430", "year": 2026, "month": 6, "categoryId": "food", "amount": 5380.0, "memo": "米"}, {"id": "e_seed_431", "year": 2026, "month": 6, "categoryId": "daily", "amount": 2619.0, "memo": "[衣服] 靴"}, {"id": "e_seed_432", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 1380.0, "memo": "[P!]"}, {"id": "e_seed_433", "year": 2026, "month": 6, "categoryId": "food", "amount": 5110.0, "memo": ""}, {"id": "e_seed_434", "year": 2026, "month": 6, "categoryId": "daily", "amount": 3301.0, "memo": "[日用品]"}, {"id": "e_seed_435", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 398.0, "memo": "[P!]"}, {"id": "e_seed_436", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 1760.0, "memo": "[かず小遣い]"}, {"id": "e_seed_437", "year": 2026, "month": 6, "categoryId": "food", "amount": 1000.0, "memo": ""}, {"id": "e_seed_438", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 293.0, "memo": "[P!]"}, {"id": "e_seed_439", "year": 2026, "month": 6, "categoryId": "education", "amount": 2800.0, "memo": "お泊り保育"}, {"id": "e_seed_440", "year": 2026, "month": 6, "categoryId": "daily", "amount": 220.0, "memo": "[日用品]"}, {"id": "e_seed_441", "year": 2026, "month": 6, "categoryId": "salary", "amount": 277780.0, "memo": ""}, {"id": "e_seed_442", "year": 2026, "month": 6, "categoryId": "salary", "amount": 155000.0, "memo": ""}, {"id": "e_seed_443", "year": 2026, "month": 6, "categoryId": "other_inc", "amount": 3000.0, "memo": "[立替戻り]"}, {"id": "e_seed_444", "year": 2026, "month": 6, "categoryId": "education", "amount": 3500.0, "memo": ""}, {"id": "e_seed_445", "year": 2026, "month": 6, "categoryId": "food", "amount": 1368.0, "memo": "クエン酸"}, {"id": "e_seed_446", "year": 2026, "month": 6, "categoryId": "food", "amount": 8561.0, "memo": ""}, {"id": "e_seed_447", "year": 2026, "month": 6, "categoryId": "eatout", "amount": 3200.0, "memo": ""}, {"id": "e_seed_448", "year": 2026, "month": 6, "categoryId": "education", "amount": 31000.0, "memo": "こ修学旅行"}, {"id": "e_seed_449", "year": 2026, "month": 6, "categoryId": "daily", "amount": 990.0, "memo": "[衣服]"}, {"id": "e_seed_450", "year": 2026, "month": 6, "categoryId": "daily", "amount": 550.0, "memo": "[日用品]"}, {"id": "e_seed_451", "year": 2026, "month": 6, "categoryId": "daily", "amount": 770.0, "memo": "[衣服]"}, {"id": "e_seed_452", "year": 2026, "month": 6, "categoryId": "daily", "amount": 1210.0, "memo": "[衣服]"}, {"id": "e_seed_453", "year": 2026, "month": 6, "categoryId": "education", "amount": 6600.0, "memo": "プール教室"}, {"id": "e_seed_454", "year": 2026, "month": 7, "categoryId": "utilities", "amount": 16361.0, "memo": "[水道]"}, {"id": "e_seed_455", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 5500.0, "memo": "[その他支出] り美容院"}, {"id": "e_seed_456", "year": 2026, "month": 6, "categoryId": "food", "amount": 997.0, "memo": ""}, {"id": "e_seed_457", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 400.0, "memo": "[P!]"}, {"id": "e_seed_458", "year": 2026, "month": 6, "categoryId": "food", "amount": 7598.0, "memo": ""}, {"id": "e_seed_459", "year": 2026, "month": 6, "categoryId": "car", "amount": 1900.0, "memo": "[車　ガス代]"}, {"id": "e_seed_460", "year": 2026, "month": 6, "categoryId": "daily", "amount": 4884.0, "memo": "[衣服]"}, {"id": "e_seed_461", "year": 2026, "month": 6, "categoryId": "daily", "amount": 440.0, "memo": "[日用品]"}, {"id": "e_seed_462", "year": 2026, "month": 6, "categoryId": "daily", "amount": 393.0, "memo": "[日用品]"}, {"id": "e_seed_463", "year": 2026, "month": 6, "categoryId": "food", "amount": 1013.0, "memo": ""}, {"id": "e_seed_464", "year": 2026, "month": 6, "categoryId": "other_inc", "amount": 3240.0, "memo": "[特別] 古着買取"}, {"id": "e_seed_465", "year": 2026, "month": 6, "categoryId": "medical", "amount": 2820.0, "memo": ""}, {"id": "e_seed_466", "year": 2026, "month": 6, "categoryId": "education", "amount": 3040.0, "memo": "幼給食"}, {"id": "e_seed_467", "year": 2026, "month": 7, "categoryId": "food", "amount": 954.0, "memo": ""}, {"id": "e_seed_468", "year": 2026, "month": 7, "categoryId": "other_exp", "amount": 285.0, "memo": "[P!]"}, {"id": "e_seed_469", "year": 2026, "month": 7, "categoryId": "daily", "amount": 220.0, "memo": "[日用品]"}, {"id": "e_seed_470", "year": 2026, "month": 6, "categoryId": "education", "amount": 550.0, "memo": ""}, {"id": "e_seed_471", "year": 2026, "month": 6, "categoryId": "communication", "amount": 4785.0, "memo": "[ネット]"}, {"id": "e_seed_472", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 32339.0, "memo": "[かず小遣い] カード"}, {"id": "e_seed_473", "year": 2026, "month": 6, "categoryId": "utilities", "amount": 11214.0, "memo": "[電気・ガス]"}, {"id": "e_seed_474", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 2200.0, "memo": "[その他支出]"}, {"id": "e_seed_475", "year": 2026, "month": 6, "categoryId": "communication", "amount": 1686.0, "memo": "[スマホ]"}, {"id": "e_seed_476", "year": 2026, "month": 6, "categoryId": "car", "amount": 440.0, "memo": "[車　他経費]"}, {"id": "e_seed_477", "year": 2026, "month": 7, "categoryId": "leisure", "amount": 1300.0, "memo": ""}, {"id": "e_seed_478", "year": 2026, "month": 7, "categoryId": "car", "amount": 400.0, "memo": "[車　他経費]"}, {"id": "e_seed_479", "year": 2026, "month": 7, "categoryId": "food", "amount": 7767.0, "memo": ""}, {"id": "e_seed_480", "year": 2026, "month": 7, "categoryId": "daily", "amount": 2079.0, "memo": "[日用品]"}, {"id": "e_seed_481", "year": 2026, "month": 7, "categoryId": "other_exp", "amount": 1311.0, "memo": "[P!]"}, {"id": "e_seed_482", "year": 2026, "month": 7, "categoryId": "education", "amount": 1720.0, "memo": ""}, {"id": "e_seed_483", "year": 2026, "month": 7, "categoryId": "food", "amount": 535.0, "memo": ""}, {"id": "e_seed_484", "year": 2026, "month": 7, "categoryId": "daily", "amount": 315.0, "memo": "[日用品]"}, {"id": "e_seed_485", "year": 2026, "month": 7, "categoryId": "daily", "amount": 770.0, "memo": "[日用品]"}, {"id": "e_seed_486", "year": 2026, "month": 7, "categoryId": "food", "amount": 437.0, "memo": ""}, {"id": "e_seed_487", "year": 2026, "month": 7, "categoryId": "daily", "amount": 660.0, "memo": "[日用品]"}, {"id": "e_seed_488", "year": 2026, "month": 7, "categoryId": "food", "amount": 8656.0, "memo": ""}, {"id": "e_seed_489", "year": 2026, "month": 7, "categoryId": "food", "amount": 536.0, "memo": ""}, {"id": "e_seed_490", "year": 2026, "month": 7, "categoryId": "eatout", "amount": 3080.0, "memo": ""}, {"id": "e_seed_491", "year": 2026, "month": 7, "categoryId": "food", "amount": 870.0, "memo": ""}, {"id": "e_seed_492", "year": 2026, "month": 7, "categoryId": "food", "amount": 257.0, "memo": ""}, {"id": "e_seed_493", "year": 2026, "month": 7, "categoryId": "daily", "amount": 1100.0, "memo": "[日用品]"}, {"id": "e_seed_494", "year": 2026, "month": 7, "categoryId": "daily", "amount": 890.0, "memo": "[日用品]"}, {"id": "e_seed_495", "year": 2026, "month": 7, "categoryId": "food", "amount": 2086.0, "memo": ""}, {"id": "e_seed_496", "year": 2026, "month": 7, "categoryId": "daily", "amount": 1307.0, "memo": "[日用品]"}, {"id": "e_seed_497", "year": 2026, "month": 7, "categoryId": "food", "amount": 5074.0, "memo": ""}, {"id": "e_seed_498", "year": 2026, "month": 7, "categoryId": "other_exp", "amount": 306.0, "memo": "[P!]"}, {"id": "e_seed_499", "year": 2026, "month": 7, "categoryId": "daily", "amount": 2750.0, "memo": "[衣服] か、こ服"}, {"id": "e_seed_500", "year": 2026, "month": 7, "categoryId": "daily", "amount": 2000.0, "memo": "[日用品] こ本"}, {"id": "e_seed_501", "year": 2026, "month": 7, "categoryId": "car", "amount": 1250.0, "memo": "[車　他経費]"}, {"id": "e_seed_502", "year": 2026, "month": 7, "categoryId": "daily", "amount": 1080.0, "memo": "[日用品]"}, {"id": "e_seed_503", "year": 2026, "month": 7, "categoryId": "food", "amount": 6768.0, "memo": ""}, {"id": "e_seed_504", "year": 2026, "month": 7, "categoryId": "car", "amount": 500.0, "memo": "[車　他経費]"}, {"id": "e_seed_505", "year": 2026, "month": 7, "categoryId": "housing", "amount": 47000.0, "memo": "[固定資産税]"}, {"id": "e_seed_506", "year": 2026, "month": 7, "categoryId": "food", "amount": 1604.0, "memo": ""}, {"id": "e_seed_507", "year": 2026, "month": 7, "categoryId": "daily", "amount": 2200.0, "memo": "[日用品]"}, {"id": "e_seed_508", "year": 2026, "month": 7, "categoryId": "other_inc", "amount": 4782.0, "memo": "[配当]"}, {"id": "e_seed_509", "year": 2026, "month": 7, "categoryId": "salary", "amount": 238213.0, "memo": ""}, {"id": "e_seed_510", "year": 2026, "month": 7, "categoryId": "salary", "amount": 155000.0, "memo": ""}, {"id": "e_seed_511", "year": 2026, "month": 7, "categoryId": "food", "amount": 1233.0, "memo": ""}, {"id": "e_seed_512", "year": 2026, "month": 7, "categoryId": "car", "amount": 3608.0, "memo": "[車　ガス代]"}, {"id": "e_seed_513", "year": 2026, "month": 7, "categoryId": "leisure", "amount": 1240.0, "memo": "オオムラサキセンター"}, {"id": "e_seed_514", "year": 2026, "month": 7, "categoryId": "leisure", "amount": 900.0, "memo": "化石"}, {"id": "e_seed_515", "year": 2026, "month": 7, "categoryId": "leisure", "amount": 600.0, "memo": "ジュース"}, {"id": "e_seed_516", "year": 2026, "month": 7, "categoryId": "leisure", "amount": 4190.0, "memo": "お土産"}, {"id": "e_seed_517", "year": 2026, "month": 7, "categoryId": "leisure", "amount": 1400.0, "memo": "かき氷　駐車場"}, {"id": "e_seed_518", "year": 2026, "month": 7, "categoryId": "leisure", "amount": 3000.0, "memo": "昼"}, {"id": "e_seed_519", "year": 2026, "month": 7, "categoryId": "food", "amount": 7308.0, "memo": ""}, {"id": "e_seed_520", "year": 2026, "month": 7, "categoryId": "daily", "amount": 330.0, "memo": "[日用品]"}, {"id": "e_seed_521", "year": 2026, "month": 7, "categoryId": "car", "amount": 3171.0, "memo": "[車　ガス代]"}, {"id": "e_seed_522", "year": 2026, "month": 7, "categoryId": "other_exp", "amount": 10318.0, "memo": "[その他支出] 自転車修理"}, {"id": "e_seed_523", "year": 2026, "month": 6, "categoryId": "other_exp", "amount": 70000.0, "memo": "[かず小遣い] 現金振込６〜７月"}, {"id": "e_seed_524", "year": 2026, "month": 7, "categoryId": "leisure", "amount": 500.0, "memo": "こども館"}, {"id": "e_seed_525", "year": 2026, "month": 7, "categoryId": "leisure", "amount": 400.0, "memo": ""}, {"id": "e_seed_526", "year": 2026, "month": 7, "categoryId": "daily", "amount": 880.0, "memo": "[日用品] セリア"}, {"id": "e_seed_527", "year": 2026, "month": 7, "categoryId": "food", "amount": 479.0, "memo": ""}, {"id": "e_seed_528", "year": 2026, "month": 7, "categoryId": "daily", "amount": 1210.0, "memo": "[日用品] セリア"}, {"id": "e_seed_529", "year": 2026, "month": 7, "categoryId": "food", "amount": 4330.0, "memo": ""}, {"id": "e_seed_530", "year": 2026, "month": 7, "categoryId": "daily", "amount": 2410.0, "memo": "[日用品]"}, {"id": "e_seed_531", "year": 2026, "month": 7, "categoryId": "food", "amount": 2807.0, "memo": ""}, {"id": "e_seed_532", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 800.0, "memo": "プール"}, {"id": "e_seed_533", "year": 2026, "month": 8, "categoryId": "car", "amount": 500.0, "memo": "[車　他経費]"}, {"id": "e_seed_534", "year": 2026, "month": 8, "categoryId": "food", "amount": 7305.0, "memo": ""}, {"id": "e_seed_535", "year": 2026, "month": 7, "categoryId": "education", "amount": 550.0, "memo": ""}, {"id": "e_seed_536", "year": 2026, "month": 7, "categoryId": "communication", "amount": 4785.0, "memo": "[ネット]"}, {"id": "e_seed_537", "year": 2026, "month": 7, "categoryId": "other_exp", "amount": 20439.0, "memo": "[かず小遣い] カード"}, {"id": "e_seed_538", "year": 2026, "month": 7, "categoryId": "utilities", "amount": 12097.0, "memo": "[電気・ガス]"}, {"id": "e_seed_539", "year": 2026, "month": 8, "categoryId": "food", "amount": 5380.0, "memo": ""}, {"id": "e_seed_540", "year": 2026, "month": 7, "categoryId": "communication", "amount": 1686.0, "memo": "[スマホ]"}, {"id": "e_seed_541", "year": 2026, "month": 8, "categoryId": "daily", "amount": 2677.0, "memo": "[日用品]"}, {"id": "e_seed_542", "year": 2026, "month": 8, "categoryId": "other_exp", "amount": 288.0, "memo": "[P!]"}, {"id": "e_seed_543", "year": 2026, "month": 8, "categoryId": "daily", "amount": 6180.0, "memo": "[衣服] ヒラキ"}, {"id": "e_seed_544", "year": 2026, "month": 8, "categoryId": "education", "amount": 2750.0, "memo": "子　本"}, {"id": "e_seed_545", "year": 2026, "month": 8, "categoryId": "daily", "amount": 990.0, "memo": "[衣服]"}, {"id": "e_seed_546", "year": 2026, "month": 8, "categoryId": "food", "amount": 933.0, "memo": ""}, {"id": "e_seed_547", "year": 2026, "month": 8, "categoryId": "other_exp", "amount": 100.0, "memo": "[P!]"}, {"id": "e_seed_548", "year": 2026, "month": 8, "categoryId": "other_exp", "amount": 3050.0, "memo": "[P!]"}, {"id": "e_seed_549", "year": 2026, "month": 8, "categoryId": "daily", "amount": 2027.0, "memo": "[日用品] ﾏﾝｶﾞ"}, {"id": "e_seed_550", "year": 2026, "month": 8, "categoryId": "food", "amount": 12168.0, "memo": ""}, {"id": "e_seed_551", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 1800.0, "memo": ""}, {"id": "e_seed_552", "year": 2026, "month": 8, "categoryId": "food", "amount": 2118.0, "memo": ""}, {"id": "e_seed_553", "year": 2026, "month": 8, "categoryId": "daily", "amount": 656.0, "memo": "[日用品]"}, {"id": "e_seed_554", "year": 2026, "month": 8, "categoryId": "daily", "amount": 440.0, "memo": "[日用品]"}, {"id": "e_seed_555", "year": 2026, "month": 8, "categoryId": "daily", "amount": 2839.0, "memo": "[日用品] ｱﾐｰｺﾞ"}, {"id": "e_seed_556", "year": 2026, "month": 8, "categoryId": "other_exp", "amount": 515.0, "memo": "[P!]"}, {"id": "e_seed_557", "year": 2026, "month": 8, "categoryId": "education", "amount": 2794.0, "memo": "子　本"}, {"id": "e_seed_558", "year": 2026, "month": 8, "categoryId": "education", "amount": 2200.0, "memo": ""}, {"id": "e_seed_559", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 1930.0, "memo": "科学館"}, {"id": "e_seed_560", "year": 2026, "month": 8, "categoryId": "car", "amount": 2377.0, "memo": "[車　ガス代]"}, {"id": "e_seed_561", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 3480.0, "memo": "須賀川昼"}, {"id": "e_seed_562", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 1109.0, "memo": "土産"}, {"id": "e_seed_563", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 1640.0, "memo": "アイス"}, {"id": "e_seed_564", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 2900.0, "memo": "温泉"}, {"id": "e_seed_565", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 19800.0, "memo": "宿"}, {"id": "e_seed_566", "year": 2026, "month": 8, "categoryId": "car", "amount": 2808.0, "memo": "[車　ガス代]"}, {"id": "e_seed_567", "year": 2026, "month": 8, "categoryId": "other_inc", "amount": 16000.0, "memo": "[特別] ﾉｰﾘｰより"}, {"id": "e_seed_568", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 4500.0, "memo": "夕飯"}, {"id": "e_seed_569", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 3651.0, "memo": "土産"}, {"id": "e_seed_570", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 460.0, "memo": ""}, {"id": "e_seed_571", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 3670.0, "memo": "那須　お昼"}, {"id": "e_seed_572", "year": 2026, "month": 8, "categoryId": "food", "amount": 650.0, "memo": ""}, {"id": "e_seed_573", "year": 2026, "month": 8, "categoryId": "daily", "amount": 4222.0, "memo": "[日用品]"}, {"id": "e_seed_574", "year": 2026, "month": 8, "categoryId": "other_exp", "amount": 240.0, "memo": "[P!]"}, {"id": "e_seed_575", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 2190.0, "memo": "帰り高速昼メシ"}, {"id": "e_seed_576", "year": 2026, "month": 8, "categoryId": "food", "amount": 6528.0, "memo": ""}, {"id": "e_seed_577", "year": 2026, "month": 8, "categoryId": "daily", "amount": 330.0, "memo": "[日用品]"}, {"id": "e_seed_578", "year": 2026, "month": 8, "categoryId": "salary", "amount": 241023.0, "memo": ""}, {"id": "e_seed_579", "year": 2026, "month": 8, "categoryId": "other_inc", "amount": 5535.0, "memo": "[立替戻り]"}, {"id": "e_seed_580", "year": 2026, "month": 8, "categoryId": "salary", "amount": 155000.0, "memo": ""}, {"id": "e_seed_581", "year": 2026, "month": 12, "categoryId": "other_exp", "amount": 11500.0, "memo": "[ふるさと納税] ふるさと納税　８月"}, {"id": "e_seed_582", "year": 2026, "month": 8, "categoryId": "leisure", "amount": 920.0, "memo": "お土産郵送"}, {"id": "e_seed_583", "year": 2026, "month": 8, "categoryId": "daily", "amount": 700.0, "memo": "[日用品]"}, {"id": "e_seed_584", "year": 2026, "month": 8, "categoryId": "food", "amount": 1617.0, "memo": ""}, {"id": "e_seed_585", "year": 2026, "month": 8, "categoryId": "food", "amount": 5103.0, "memo": ""}, {"id": "e_seed_586", "year": 2026, "month": 8, "categoryId": "daily", "amount": 220.0, "memo": "[日用品]"}, {"id": "e_seed_587", "year": 2026, "month": 8, "categoryId": "daily", "amount": 5606.0, "memo": "[日用品]"}, {"id": "e_seed_588", "year": 2026, "month": 8, "categoryId": "other_exp", "amount": 426.0, "memo": "[P!]"}, {"id": "e_seed_589", "year": 2026, "month": 8, "categoryId": "daily", "amount": 550.0, "memo": "[日用品]"}, {"id": "e_seed_590", "year": 2026, "month": 8, "categoryId": "daily", "amount": 1368.0, "memo": "[日用品]"}, {"id": "e_seed_591", "year": 2026, "month": 8, "categoryId": "other_exp", "amount": 552.0, "memo": "[P!]"}, {"id": "e_seed_592", "year": 2026, "month": 8, "categoryId": "car", "amount": 200.0, "memo": "[車　他経費]"}, {"id": "e_seed_593", "year": 2026, "month": 8, "categoryId": "food", "amount": 1955.0, "memo": ""}, {"id": "e_seed_594", "year": 2026, "month": 8, "categoryId": "daily", "amount": 3694.0, "memo": "[衣服]"}, {"id": "e_seed_595", "year": 2026, "month": 8, "categoryId": "food", "amount": 297.0, "memo": ""}, {"id": "e_seed_596", "year": 2026, "month": 8, "categoryId": "daily", "amount": 330.0, "memo": "[日用品]"}, {"id": "e_seed_597", "year": 2026, "month": 8, "categoryId": "education", "amount": 902.0, "memo": "本"}, {"id": "e_seed_598", "year": 2026, "month": 8, "categoryId": "education", "amount": 2244.0, "memo": "本"}, {"id": "e_seed_599", "year": 2026, "month": 8, "categoryId": "food", "amount": 7952.0, "memo": ""}, {"id": "e_seed_600", "year": 2026, "month": 8, "categoryId": "car", "amount": 2496.0, "memo": "[車　ガス代]"}, {"id": "e_seed_601", "year": 2026, "month": 8, "categoryId": "daily", "amount": 1962.0, "memo": "[日用品] 石板"}, {"id": "e_seed_602", "year": 2026, "month": 8, "categoryId": "education", "amount": 550.0, "memo": ""}, {"id": "e_seed_603", "year": 2026, "month": 8, "categoryId": "communication", "amount": 4785.0, "memo": "[ネット]"}, {"id": "e_seed_604", "year": 2026, "month": 8, "categoryId": "utilities", "amount": 12285.0, "memo": "[電気・ガス]"}, {"id": "e_seed_605", "year": 2026, "month": 8, "categoryId": "other_exp", "amount": 2200.0, "memo": "[その他支出]"}, {"id": "e_seed_606", "year": 2026, "month": 8, "categoryId": "communication", "amount": 293.0, "memo": "[スマホ]"}, {"id": "e_seed_607", "year": 2026, "month": 8, "categoryId": "communication", "amount": 1393.0, "memo": "[スマホ]"}, {"id": "e_seed_608", "year": 2026, "month": 8, "categoryId": "car", "amount": 11920.0, "memo": "[車　他経費] 7月ETC"}, {"id": "e_seed_609", "year": 2026, "month": 7, "categoryId": "education", "amount": 1520.0, "memo": "幼稚園給食"}, {"id": "e_seed_610", "year": 2026, "month": 8, "categoryId": "other_exp", "amount": 22949.0, "memo": "[かず小遣い] カード8/29まで"}, {"id": "e_seed_611", "year": 2026, "month": 7, "categoryId": "daily", "amount": 11990.0, "memo": "[日用品] スピーカー"}, {"id": "e_seed_612", "year": 2026, "month": 6, "categoryId": "housing", "amount": 15090.0, "memo": "[住宅修繕] 照明"}, {"id": "e_seed_613", "year": 2026, "month": 6, "categoryId": "food", "amount": 2560.0, "memo": ""}, {"id": "e_seed_614", "year": 2026, "month": 8, "categoryId": "daily", "amount": 440.0, "memo": "[日用品]"}, {"id": "e_seed_615", "year": 2026, "month": 12, "categoryId": "other_exp", "amount": 11000.0, "memo": "[ふるさと納税] ふるさと納税"}, {"id": "e_seed_616", "year": 2026, "month": 8, "categoryId": "daily", "amount": 22759.0, "memo": "[日用品] 掃除機"}, {"id": "e_seed_617", "year": 2026, "month": 9, "categoryId": "eatout", "amount": 3350.0, "memo": "牛丼"}, {"id": "e_seed_618", "year": 2026, "month": 9, "categoryId": "food", "amount": 9070.0, "memo": ""}, {"id": "e_seed_619", "year": 2026, "month": 9, "categoryId": "food", "amount": 1829.0, "memo": ""}, {"id": "e_seed_620", "year": 2026, "month": 9, "categoryId": "daily", "amount": 110.0, "memo": "[日用品]"}];
function defaultLedgerState() {
  return {
    entries: clone(SEED_LEDGER_ENTRIES),
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

  // 新しく追加した行ほど上に表示する（元配列内の位置が新しいものほど先）
  const yearOrder = ledger.entries
    .map((e, idx) => idx)
    .filter((idx) => ledger.entries[idx].year === year)
    .sort((a, b) => b - a);

  const entryDrag = useDragReorder((order, from, to) => setLedger((prev) => ({
    ...prev, entries: reorderArrayBySlots(prev.entries, order, from, to),
  })));
  const renderOrder = entryDrag.getRenderOrder(yearOrder);

  const addRow = () => {
    setLedger((prev) => ({
      ...prev,
      entries: [...prev.entries, {
        id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        year, month: "", categoryId: "", amount: 0, memo: "",
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
        <button onClick={addRow} style={{
          marginBottom: 8, fontSize: 11.5, padding: "7px 12px", borderRadius: 4, border: `1px solid ${PAPER_LINE}`,
          background: "#FFFDF9", color: INK_SOFT, cursor: "pointer",
        }}>＋ 行を追加（一番上に新しい行を入力）</button>
        <div style={{ border: `1px solid ${PAPER_LINE}`, borderRadius: 5, background: CARD }}>
          {renderOrder.length === 0 && (
            <div style={{ padding: "14px 10px", fontSize: 12, color: INK_SOFT, textAlign: "center" }}>{year}年の入力はまだありません</div>
          )}
          {renderOrder.map((idx) => {
            const e = ledger.entries[idx];
            return (
              <div key={e.id} ref={entryDrag.setItemRef(idx)} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 6px", borderBottom: `1px solid ${PAPER_LINE}`,
                background: entryDrag.dragKey === idx ? GOLD_SOFT : "transparent",
                boxShadow: entryDrag.dragKey === idx ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
              }}>
                <DragHandle dragProps={entryDrag.bindHandle(idx, yearOrder)} active={entryDrag.dragKey === idx} />
                <select value={e.month} onChange={(ev) => updateRow(e.id, { month: ev.target.value === "" ? "" : parseInt(ev.target.value, 10) })}
                  style={{ flexShrink: 0, width: 50, padding: "4px 1px", fontSize: 11.5, border: `1px solid ${PAPER_LINE}`, borderRadius: 3, background: "#fff", color: INK }}>
                  {!e.month && <option value="">月</option>}
                  {MONTHS.map((m) => <option key={m} value={m}>{m}月</option>)}
                </select>
                <select value={e.categoryId} onChange={(ev) => updateRow(e.id, { categoryId: ev.target.value })}
                  style={{ flex: "1 1 70px", minWidth: 0, padding: "4px 2px", fontSize: 11.5, border: `1px solid ${PAPER_LINE}`, borderRadius: 3, background: "#fff", color: INK }}>
                  {!e.categoryId && <option value="">費目</option>}
                  <optgroup label="支出">
                    {ledger.categories.filter((c) => c.type === "expense").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </optgroup>
                  <optgroup label="収入">
                    {ledger.categories.filter((c) => c.type === "income").map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </optgroup>
                </select>
                <CommaNumberInput value={e.amount} onChange={(v) => updateRow(e.id, { amount: v ?? 0 })}
                  style={{ flexShrink: 0, width: 72, textAlign: "right", fontSize: 11.5, padding: "4px 4px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3, fontVariantNumeric: "tabular-nums" }} />
                <input value={e.memo} onChange={(ev) => updateRow(e.id, { memo: ev.target.value })} placeholder="メモ"
                  style={{ flex: "1 1 50px", minWidth: 0, fontSize: 11.5, padding: "4px 5px", border: `1px solid ${PAPER_LINE}`, borderRadius: 3 }} />
                <button onClick={() => deleteRow(e.id)} title="削除" style={{ flexShrink: 0, border: "none", background: "transparent", color: SEAL, fontSize: 15, cursor: "pointer", padding: "0 2px" }}>×</button>
              </div>
            );
          })}
        </div>
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
  const [portfolioLogs, setPortfolioLogs] = useState([]);
  const [family, setFamily] = useState(defaultFamilyState);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showCostWizard, setShowCostWizard] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [costWizardStep, setCostWizardStep] = useState("tuition");
  const [ledger, setLedger] = useState(defaultLedgerState);
  const [scenario, setScenario] = useState(defaultScenarioState);
  const [appMode, setAppMode] = useState("sim");
  const openCostWizard = (step) => { setCostWizardStep(step); setShowCostWizard(true); };
  const saveTimer = useRef(null);

  // 誰かとリアルタイムで共有する機能（Firebase）。未設定の環境では一切動かず、
  // 今まで通りローカル保存のみで動作する
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [user, setUser] = useState(null);
  const [householdId, setHouseholdId] = useState(null);
  const [householdInfo, setHouseholdInfo] = useState(null);
  const [cloudDataLoaded, setCloudDataLoaded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const skipNextCloudSaveRef = useRef(false);
  const cloudSaveTimer = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        applyMigratedState(migrateLoadedState(parsed), {
          setSim, setParams, setHoldings, setCashList, setPortfolioLogs, setFamily, setLedger, setScenario,
        });
      }
    } catch (e) { /* no saved state yet */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = watchAuthState((u) => { setUser(u); setAuthLoading(false); });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) { setHouseholdId(null); return; }
    let cancelled = false;
    getMyHouseholdId(user.uid).then((id) => { if (!cancelled) setHouseholdId(id); });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    setCloudDataLoaded(false);
    setHouseholdInfo(null);
    if (!householdId) return;
    getHouseholdInfo(householdId).then((info) => setHouseholdInfo(info));
    const unsub = subscribeHouseholdData(householdId, (data, hasPendingWrites) => {
      if (hasPendingWrites) return; // 自分がこの端末で書いた分の反響は無視する
      if (data) {
        skipNextCloudSaveRef.current = true;
        applyMigratedState(migrateLoadedState(data), {
          setSim, setParams, setHoldings, setCashList, setPortfolioLogs, setFamily, setLedger, setScenario,
        });
      }
      setCloudDataLoaded(true);
    });
    return unsub;
  }, [householdId]);

  useEffect(() => {
    if (!householdId || !cloudDataLoaded) return;
    if (skipNextCloudSaveRef.current) { skipNextCloudSaveRef.current = false; return; }
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(() => {
      saveHouseholdData(householdId, { sim, params, holdings, cashList, portfolioLogs, family, ledger, scenario })
        .catch(() => { /* オフライン等：次の変更時に再送される */ });
    }, 700);
    return () => clearTimeout(cloudSaveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim, params, holdings, cashList, portfolioLogs, family, ledger, scenario, householdId, cloudDataLoaded]);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ sim, params, holdings, cashList, portfolioLogs, family, ledger, scenario }));
        setSaveNote("保存済み");
        setTimeout(() => setSaveNote(""), 1500);
      } catch (e) { /* storage unavailable */ }
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [sim, params, holdings, cashList, portfolioLogs, family, ledger, scenario, loaded]);

  const resetAll = () => {
    if (!window.confirm("編集内容をすべて元のデータに戻しますか？（家計簿の入力データも消えます）")) return;
    setSim(defaultSimState());
    setParams(defaultParamsState());
    setHoldings(defaultPortfolioState());
    setCashList(defaultCashState());
    setPortfolioLogs([]);
    setFamily(defaultFamilyState());
    setLedger(defaultLedgerState());
    setScenario(defaultScenarioState());
  };

  const fileInputRef = useRef(null);
  const exportData = () => {
    const payload = { sim, params, holdings, cashList, portfolioLogs, family, ledger, scenario, exportedAt: new Date().toISOString() };
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
        applyMigratedState(migrateLoadedState(parsed), {
          setSim, setParams, setHoldings, setCashList, setPortfolioLogs, setFamily, setLedger, setScenario,
        });
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
          {isFirebaseConfigured && (
            <button onClick={() => setShowShareModal(true)} aria-label="共有" style={{
              fontSize: 11, color: householdId ? "#8FD9B6" : "#D8C089", background: "transparent", border: "1px solid #4A5A75",
              borderRadius: 4, padding: "5px 9px", cursor: "pointer", whiteSpace: "nowrap",
            }}>🔗 {householdId ? "共有中" : "共有"}</button>
          )}
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
      {showShareModal && (
        <ShareModal authLoading={authLoading} user={user} householdId={householdId} householdInfo={householdInfo}
          onHouseholdIdChange={setHouseholdId}
          onClose={() => setShowShareModal(false)} />
      )}
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

      {tab === "sim" && <SimulationTab sim={sim} setSim={setSim} params={params} setParams={setParams} scenario={scenario} setScenario={setScenario} onOpenWizard={openCostWizard} onOpenSheet={() => setShowSheet(true)} />}
      {tab === "portfolio" && <PortfolioTab holdings={holdings} setHoldings={setHoldings} cashList={cashList} setCashList={setCashList} params={params} setParams={setParams} asOfDate={asOfDate} setAsOfDate={setAsOfDate} />}
      {tab === "aggregate" && <AggregationTab holdings={holdings} cashList={cashList} asOfDate={asOfDate} portfolioLogs={portfolioLogs} setPortfolioLogs={setPortfolioLogs} />}
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
