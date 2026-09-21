 # 🌦️ Climatos

### Panchayat-Level Weather, Climate Risk & Agricultural Advisory Dashboard

Climatos is a web-based weather and climate dashboard designed to provide
localized Panchayat-level environmental information using weather data,
geospatial mapping, machine-learning-based rainfall downscaling and
agricultural advisory features.

The project combines a **FastAPI backend** with an HTML/CSS/JavaScript
frontend and **Leaflet** for interactive geospatial visualization.

---

## 🚀 What Makes the Current Version Different?

The current Climatos version adds an experimental **AI rainfall downscaling
pipeline**.

Instead of displaying only a coarse weather value for a large area, the
system generates a spatial rainfall field on an approximately **4 km × 4 km
grid** and visualizes the grid over the selected area.

### Core pipeline

```text
Coarse Weather Data
        +
Weather / Environmental Features
        ↓
XGBoost Spatial Downscaling Model
        ↓
~4 km × 4 km Rainfall Grid
        ↓
Panchayat / Area Aggregation
        ↓
Localized Rainfall Visualization
        ↓
Weather & Agricultural Decision Support
```

The current implementation uses **Madhepura, Bihar** as the development
pilot area.

> ⚠️ **Important:** The current ML training dataset and boundary/grid data are
> synthetic development data. The displayed model values and development
> metrics must not be treated as real-world forecast accuracy. Real scientific
> validation requires historical observations and suitable high-resolution
> reference data.

---

## ✨ Main Features

### 📍 Panchayat-Level Location Selection

Users can select:

- State
- District
- Block / Tehsil
- Gram Panchayat

The selected Panchayat is displayed on the interactive map with its available
coordinates.

---

### 🗺️ Interactive GIS & Bhuvan Map

Climatos uses Leaflet for interactive mapping.

Available map options include:

- OpenStreetMap
- Satellite imagery
- Bhuvan Roads
- Bhuvan Settlements
- Bhuvan Land Use / Land Cover
- Bhuvan Water Bodies / Drainage

Bhuvan Panchayat services are integrated through the relevant NRSC/ISRO Bhuvan
WMS services.

---

## 🤖 AI 4-km Rainfall Downscaling

The current frontend contains a dedicated **AI 4-km Rainfall** layer.

When enabled, the map displays the downscaled rainfall grid using a color
scale.

Each grid cell can show:

- Grid ID
- Approximate resolution
- Predicted rainfall in mm
- Prediction date
- Model method
- Data status

Example:

```text
AI Downscaled Rainfall
Grid: G0001
Resolution: ~4×4 km
Predicted Rainfall: 12.93 mm
Prediction Date: 2026-09-28
Method: XGBoost Spatial Downscaling
```

The frontend consumes the clipped GeoJSON through:

```text
GET /api/downscaled/grid-clipped
```

The clipped grid is used so that the displayed 4-km cells follow the
development boundary rather than showing the entire raw grid.

---

## 🧠 Machine Learning Pipeline

The experimental downscaling model is based on **XGBoost**.

### Development features

The development dataset contains fields such as:

- Coarse rainfall forecast
- Temperature
- Humidity
- Wind speed
- Soil moisture
- Satellite rainfall
- Elevation
- Latitude
- Longitude
- Date / temporal information

The model predicts:

```text
rainfall_target_mm
```

and can also be used to derive rainfall-event information.

### Model workflow

```text
Training Dataset
      ↓
Time-aware Train / Validation / Test Split
      ↓
Baseline Model
      ↓
XGBoost Regressor
      ↓
Rainfall Prediction
      ↓
4-km Grid GeoJSON
      ↓
Map Visualization
```

---

## 📊 Development Model Test

On the current **synthetic development dataset**, the model test produced:

| Model | MAE | RMSE |
|---|---:|---:|
| Baseline | 4.1701 mm | 5.2309 mm |
| XGBoost | 2.4062 mm | 3.0008 mm |

The development run showed a calculated MAE improvement of approximately
**42.3% over the baseline**.

> ⚠️ This is a **synthetic development result only**. It is not a claim of
> 42.3% real-world forecast improvement. Real performance must be measured
> using independent historical observations and a properly designed
> time-based validation setup.

---

## 🧮 Panchayat / Area Aggregation

The project also contains an experimental spatial aggregation workflow.

Multiple 4-km grid cells can contribute to an area or Panchayat result using
an **area-weighted rainfall aggregation** approach.

Conceptually:

```text
4-km Grid Cells
      ↓
Intersect with Panchayat / Area
      ↓
Calculate Area Contribution
      ↓
Area-Weighted Rainfall
      ↓
Localized Panchayat Result
```

This makes it possible to move from a spatial rainfall field to a
Panchayat-level summary.

---

## 🌤️ Weather Dashboard

After selecting a Panchayat, Climatos retrieves weather information through
the FastAPI backend.

The dashboard displays:

- Current temperature
- Humidity
- Wind speed
- Soil moisture
- 7-day weather forecast
- Daily rainfall
- Minimum temperature
- Maximum temperature
- Weather conditions

---

## 📊 Interactive Weather Charts

Climatos uses Chart.js to display weather trends.

### Temperature Trend

The dashboard displays:

- Maximum temperature
- Minimum temperature
- 7-day trend

### Rainfall Trend

A rainfall bar chart displays expected rainfall for each forecast day.

---

## ⚠️ Climate Risk Dashboard

The Climate Risk Dashboard provides weather-based indicators for the
selected Panchayat.

It includes:

- Rainfall Risk
- Heat Risk
- Agricultural Risk
- Soil Condition
- Today's Rainfall
- 7-Day Rainfall
- Maximum Forecast Temperature

---

## 🌾 Crop Advisory

Climatos includes a Panchayat Crop Advisory module.

Users can select a crop and receive a weather-based recommendation using the
latest weather data retrieved for the selected Panchayat.

### Supported Crops

- Rice
- Wheat
- Maize
- Potato
- Mustard
- Vegetables

### Advisory Information

The Crop Advisory section displays:

- Crop Condition
- Weather-based Recommendation
- Current Temperature
- 7-Day Rainfall
- Soil Moisture

> Note: The current crop recommendations are simple weather-based project
> logic intended for dashboard demonstration. They are not a replacement
> for official agricultural or agrometeorological advice.

---

## 🌱 Agromet Advisory

The dashboard also displays an agricultural weather advisory returned by
the backend.

The advisory includes:

- Advisory status
- Advisory message

---

## 🌐 Multi-Language Support

Climatos includes language selection for:

- English
- Hindi

The interface can translate major dashboard labels and controls.

---

# 🛠️ Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Leaflet.js
- Chart.js

## Backend

- Python
- FastAPI
- Uvicorn

## Machine Learning / Geospatial

- XGBoost
- GeoJSON
- Shapely
- NumPy
- Joblib

## Weather Data

- Open-Meteo API

## Mapping

- Leaflet
- OpenStreetMap
- Esri Satellite
- Bhuvan Panchayat / NRSC-ISRO WMS

## Version Control / Deployment

- Git
- GitHub
- Vercel

---

# 📁 Current Project Structure

```text
Climatos/
│
├── app.py
├── app_backup.py
├── index.html
├── script.js
├── style.css
├── translations.js
├── requirements.txt
├── vercel.json
├── README.md
│
├── boundaries/
│   └── panchayats.geojson
│
├── data/
│   └── processed/
│       ├── dummy_predictions.csv
│       ├── madhepura_panchayat_rainfall.geojson
│       └── madhepura_xgb_prediction_latest.geojson
│
├── ml/
│   ├── train.py
│   ├── create_grid_prediction.py
│   └── panchayat_aggregation.py
│
├── models/
│   └── xgb_rainfall_downscaler.joblib
│
└── madhepura_*.geojson
```

---

# 🔌 Important API Endpoints

### Health Check

```text
GET /api/health
```

Used to check whether the backend is running.

### Panchayat Forecast

```text
GET /api/forecast/panchayat?lat=LATITUDE&lon=LONGITUDE
```

Returns weather, forecast, agricultural advisory and climate-risk information
for the supplied coordinates.

### Downscaled Rainfall Grid

```text
GET /api/downscaled/grid-clipped
```

Returns the clipped GeoJSON rainfall grid used by the frontend AI 4-km
rainfall layer.

---

# 🧪 Local Development

## 1. Create / activate virtual environment

macOS / Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

If working with the current geospatial clipping workflow, Shapely is required:

```bash
pip install shapely
```

## 3. Start FastAPI

```bash
uvicorn app:app --reload
```

Then open:

```text
http://127.0.0.1:8000
```

---

# 🧪 Testing Workflow

For local development:

1. Start the FastAPI server.
2. Open the Climatos website.
3. Select **Bihar**.
4. Select **Madhepura**.
5. Select a Block.
6. Select a Panchayat.
7. Click **Get Forecast Data**.
8. Verify current weather.
9. Verify the 7-day forecast.
10. Verify temperature and rainfall charts.
11. Verify the Climate Risk Dashboard.
12. Verify Crop Advisory.
13. Enable **AI 4-km Rainfall**.
14. Verify that the downscaled grid appears on the map.
15. Click grid cells and verify rainfall, date and model information.

---

# 📦 Development Data Status

The current Madhepura ML pipeline is a **development prototype**.

Current development assets include:

- Synthetic Madhepura boundary
- Synthetic Panchayat polygons
- Synthetic ~4-km grid
- Synthetic weather training data
- XGBoost development model
- Generated rainfall prediction GeoJSON

These assets are useful for testing the complete software pipeline:

```text
DATA
 ↓
MODEL
 ↓
PREDICTION
 ↓
4-km GRID
 ↓
SPATIAL CLIPPING
 ↓
PANCHAYAT / AREA AGGREGATION
 ↓
LEAFLET VISUALIZATION
```

They should not be presented as official Madhepura observations or as
validated operational forecasts.

---

# 🔬 Planned Scientific Validation

The next research stage is to replace the synthetic development data with
appropriate real historical datasets.

The validation workflow should compare:

```text
Coarse Forecast
      VS
XGBoost Downscaled Forecast
      VS
Independent Reference / Observation
```

Potential evaluation metrics include:

- MAE
- RMSE
- Bias
- Correlation
- R²
- Probability of Detection
- False Alarm Ratio
- Critical Success Index

Time-based train/validation/test splits should be used for forecasting
experiments to reduce temporal leakage.

---

# 🔮 Future Improvements

Planned improvements include:

- Real historical weather observations
- Real high-resolution precipitation/reference datasets
- Scientific validation of the downscaling model
- Coarse forecast vs AI-downscaled rainfall comparison
- Panchayat-wise downscaled rainfall summaries
- Improved temporal/spatial ML models
- More crop-specific advisory logic
- Official Panchayat boundary datasets
- Historical climate trend analysis
- Additional Indian languages
- Improved mobile responsiveness
- More detailed agricultural risk indicators

---

# 🔄 Development Workflow

Recommended workflow:

```text
Modify Code
    ↓
Run / Test on Localhost
    ↓
Check API Endpoints
    ↓
Check AI 4-km Rainfall Layer
    ↓
git status
    ↓
git add .
    ↓
git commit
    ↓
git push
    ↓
GitHub
    ↓
Vercel Automatic Deployment
    ↓
Test Live Website
```

---

# 👨‍💻 Project

## Climatos

**Panchayat-Level Weather, Climate Risk & Agricultural Advisory Dashboard**

The current development direction focuses on combining weather forecasting,
machine learning, geospatial processing and Panchayat-level visualization
into one decision-support platform.

> Built as an experimental engineering project with a focus on localized
> weather intelligence and spatial rainfall downscaling.
