import os
import pandas as pd
import joblib

from sklearn.metrics import mean_absolute_error, mean_squared_error
from xgboost import XGBRegressor


# =========================
# 1. LOAD DATA
# =========================

DATA_PATH = "dummy_weather_training.csv"

df = pd.read_csv(DATA_PATH)

print("\nDataset loaded successfully!")
print("Rows:", len(df))
print("Columns:", list(df.columns))


# =========================
# 2. SORT BY DATE
# =========================

df["date"] = pd.to_datetime(df["date"])
df = df.sort_values("date").reset_index(drop=True)


# =========================
# 3. FEATURES & TARGET
# =========================

features = [
    "coarse_rain_forecast_mm",
    "temperature_c",
    "humidity_pct",
    "wind_speed_ms",
    "soil_moisture",
    "satellite_rain_mm",
    "elevation_m",
    "latitude",
    "longitude"
]

target = "rainfall_target_mm"

X = df[features]
y = df[target]


# =========================
# 4. TIME-BASED SPLIT
# =========================

n = len(df)

train_end = int(n * 0.70)
val_end = int(n * 0.85)

X_train = X.iloc[:train_end]
y_train = y.iloc[:train_end]

X_val = X.iloc[train_end:val_end]
y_val = y.iloc[train_end:val_end]

X_test = X.iloc[val_end:]
y_test = y.iloc[val_end:]


print("\nData Split:")
print("Training:", len(X_train))
print("Validation:", len(X_val))
print("Testing:", len(X_test))


# =========================
# 5. BASELINE MODEL
# =========================

baseline_prediction = X_test["coarse_rain_forecast_mm"]

baseline_mae = mean_absolute_error(
    y_test,
    baseline_prediction
)

baseline_rmse = mean_squared_error(
    y_test,
    baseline_prediction
) ** 0.5


print("\n==============================")
print("BASELINE RESULT")
print("==============================")

print(f"Baseline MAE  : {baseline_mae:.4f} mm")
print(f"Baseline RMSE : {baseline_rmse:.4f} mm")


# =========================
# 6. XGBOOST MODEL
# =========================

model = XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=42,
    n_jobs=-1
)


print("\nTraining XGBoost model...")

model.fit(
    X_train,
    y_train,
    eval_set=[(X_val, y_val)],
    verbose=False
)


print("Training completed!")


# =========================
# 7. TEST PREDICTION
# =========================

prediction = model.predict(X_test)


# =========================
# 8. MODEL EVALUATION
# =========================

mae = mean_absolute_error(
    y_test,
    prediction
)

rmse = mean_squared_error(
    y_test,
    prediction
) ** 0.5


print("\n==============================")
print("XGBOOST RESULT")
print("==============================")

print(f"XGBoost MAE  : {mae:.4f} mm")
print(f"XGBoost RMSE : {rmse:.4f} mm")


# =========================
# 9. IMPROVEMENT
# =========================

if baseline_mae != 0:

    improvement = (
        (baseline_mae - mae)
        / baseline_mae
    ) * 100

    print(
        f"\nMAE improvement over baseline: "
        f"{improvement:.2f}%"
    )


# =========================
# 10. SAVE MODEL
# =========================

os.makedirs("models", exist_ok=True)

model_path = "models/xgb_rainfall_downscaler.joblib"

joblib.dump(model, model_path)

print("\nModel saved at:")
print(model_path)


# =========================
# 11. SAVE PREDICTIONS
# =========================

os.makedirs("data/processed", exist_ok=True)

results = df.iloc[val_end:].copy()

results["predicted_rainfall_mm"] = prediction

results["baseline_rainfall_mm"] = (
    results["coarse_rain_forecast_mm"]
)

output_path = "data/processed/dummy_predictions.csv"

results.to_csv(
    output_path,
    index=False
)

print("\nPredictions saved at:")
print(output_path)

print("\n==============================")
print("PHASE 2 MODEL TEST COMPLETE")
print("==============================")