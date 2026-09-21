import json
import pandas as pd
import os


# ==========================================
# FILE PATHS
# ==========================================

GRID_FILE = "madhepura_4km_grid_dummy.geojson"
PREDICTION_FILE = "data/processed/dummy_predictions.csv"

OUTPUT_FILE = "data/processed/madhepura_xgb_prediction_latest.geojson"


# ==========================================
# LOAD PREDICTIONS
# ==========================================

predictions = pd.read_csv(PREDICTION_FILE)

predictions["date"] = pd.to_datetime(predictions["date"])

print("Prediction file loaded!")
print("Rows:", len(predictions))


# ==========================================
# SELECT LATEST TEST DATE
# ==========================================

latest_date = predictions["date"].max()

latest_predictions = predictions[
    predictions["date"] == latest_date
].copy()

print("\nLatest prediction date:")
print(latest_date.date())

print(
    "Grid predictions:",
    len(latest_predictions)
)


# ==========================================
# LOAD GRID GEOJSON
# ==========================================

with open(GRID_FILE, "r") as f:
    grid_geojson = json.load(f)

print("\nGrid GeoJSON loaded!")

print(
    "Grid cells:",
    len(grid_geojson["features"])
)


# ==========================================
# CREATE GRID → PREDICTION LOOKUP
# ==========================================

prediction_lookup = dict(
    zip(
        latest_predictions["grid_id"].astype(str),
        latest_predictions["predicted_rainfall_mm"]
    )
)


# ==========================================
# ADD PREDICTION TO GRID
# ==========================================

matched = 0

for feature in grid_geojson["features"]:

    properties = feature.setdefault(
        "properties",
        {}
    )

    grid_id = str(
        properties.get("grid_id")
    )

    predicted_value = prediction_lookup.get(
        grid_id
    )

    if predicted_value is not None:

        properties[
            "predicted_rainfall_mm"
        ] = round(
            float(predicted_value),
            2
        )

        properties[
            "prediction_date"
        ] = str(
            latest_date.date()
        )

        matched += 1


# ==========================================
# SAVE OUTPUT
# ==========================================

os.makedirs(
    "data/processed",
    exist_ok=True
)

with open(
    OUTPUT_FILE,
    "w"
) as f:

    json.dump(
        grid_geojson,
        f,
        indent=2
    )


# ==========================================
# RESULT
# ==========================================

print("\n==============================")
print("GRID PREDICTION COMPLETE")
print("==============================")

print(
    "Matched grid cells:",
    matched
)

print(
    "Output:",
    OUTPUT_FILE
)