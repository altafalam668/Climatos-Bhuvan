import json
import os

from shapely.geometry import shape, mapping
from shapely.ops import transform
from pyproj import Transformer


# ==========================================
# FILES
# ==========================================

PANCHAYAT_FILE = "madhepura_dummy_panchayats.geojson"

GRID_FILE = "data/processed/madhepura_xgb_prediction_latest.geojson"

OUTPUT_FILE = "data/processed/madhepura_panchayat_rainfall.geojson"


# ==========================================
# LOAD GEOJSON
# ==========================================

with open(PANCHAYAT_FILE, "r") as f:
    panchayat_data = json.load(f)

with open(GRID_FILE, "r") as f:
    grid_data = json.load(f)


print("Panchayat layer loaded!")
print("Panchayats:", len(panchayat_data["features"]))

print("\nGrid prediction layer loaded!")
print("Grid cells:", len(grid_data["features"]))


# ==========================================
# TRANSFORMER
# WGS84 → UTM 45N
# ==========================================

to_utm = Transformer.from_crs(
    "EPSG:4326",
    "EPSG:32645",
    always_xy=True
).transform


# ==========================================
# PREPARE GRID
# ==========================================

grid_cells = []

for feature in grid_data["features"]:

    properties = feature.get("properties", {})

    rainfall = properties.get(
        "predicted_rainfall_mm"
    )

    if rainfall is None:
        continue

    geometry = shape(feature["geometry"])

    geometry_utm = transform(
        to_utm,
        geometry
    )

    grid_cells.append({
        "geometry": geometry,
        "geometry_utm": geometry_utm,
        "rainfall": float(rainfall)
    })


print("\nUsable grid cells:", len(grid_cells))


# ==========================================
# PROCESS PANCHAYATS
# ==========================================

output_features = []

for index, panchayat in enumerate(
    panchayat_data["features"],
    start=1
):

    properties = panchayat.get(
        "properties",
        {}
    )

    panchayat_geometry = shape(
        panchayat["geometry"]
    )

    panchayat_utm = transform(
        to_utm,
        panchayat_geometry
    )

    weighted_rainfall = 0.0
    total_intersection_area = 0.0

    # --------------------------------------
    # INTERSECT WITH EVERY GRID CELL
    # --------------------------------------

    for grid in grid_cells:

        intersection = panchayat_utm.intersection(
            grid["geometry_utm"]
        )

        if intersection.is_empty:
            continue

        area = intersection.area

        weighted_rainfall += (
            grid["rainfall"] * area
        )

        total_intersection_area += area

    # --------------------------------------
    # AREA-WEIGHTED AVERAGE
    # --------------------------------------

    if total_intersection_area > 0:

        panchayat_rainfall = (
            weighted_rainfall
            / total_intersection_area
        )

    else:

        panchayat_rainfall = None

    # --------------------------------------
    # SAVE RESULT
    # --------------------------------------

    new_properties = properties.copy()

    new_properties[
        "predicted_rainfall_mm"
    ] = (
        round(panchayat_rainfall, 2)
        if panchayat_rainfall is not None
        else None
    )

    new_properties[
        "aggregation_method"
    ] = "Area-weighted grid rainfall"

    new_properties[
        "grid_resolution"
    ] = "4 km x 4 km"

    output_features.append({

        "type": "Feature",

        "geometry": mapping(
            panchayat_geometry
        ),

        "properties": new_properties

    })

    print(
        f"Panchayat {index}: "
        f"{panchayat_rainfall:.2f} mm"
        if panchayat_rainfall is not None
        else f"Panchayat {index}: No grid overlap"
    )


# ==========================================
# CREATE OUTPUT GEOJSON
# ==========================================

output_geojson = {

    "type": "FeatureCollection",

    "features": output_features

}


# ==========================================
# SAVE
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
        output_geojson,
        f,
        indent=2
    )


# ==========================================
# FINAL RESULT
# ==========================================

print("\n================================")
print("PANCHAYAT AGGREGATION COMPLETE")
print("================================")

print(
    "Output file:"
)

print(
    OUTPUT_FILE
)

print(
    "\nPanchayat-level rainfall is ready!"
)