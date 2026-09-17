# 🌦️ Climatos

### Panchayat-Level Weather, Climate Risk & Agricultural Advisory Dashboard

Climatos is a web-based weather and climate dashboard designed to provide
Panchayat-level environmental information using weather data, mapping
services and agricultural advisory features.

The project combines a FastAPI backend with a responsive HTML/CSS/JavaScript
frontend.

---

## 🚀 Features

### 📍 Panchayat-Level Location Selection

Users can select:

- State
- District
- Block
- Panchayat

The selected Panchayat is displayed on the interactive map along with its
available coordinates.

---

### 🗺️ Interactive Map

Climatos uses Leaflet for interactive mapping.

Available map options include:

- OpenStreetMap
- Satellite imagery
- Bhuvan Roads
- Bhuvan Settlements
- Bhuvan Land Use / Land Cover
- Bhuvan Drainage & Water Bodies

Bhuvan Panchayat services are provided through the official NRSC/ISRO
Bhuvan Panchayat WMS service.

---

### 🧭 Panchayat Boundary Support

The frontend contains a GeoJSON-based Panchayat boundary system.

The application can:

- Display a Panchayat boundary
- Remove the previous boundary when the Panchayat changes
- Automatically fit the map to the boundary
- Display the Panchayat location marker

Actual Panchayat boundary GeoJSON data can be connected when the official
boundary dataset is available.

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

# 🌾 Crop Advisory

Climatos now includes a Panchayat Crop Advisory module.

Users can select a crop and receive a weather-based recommendation using
the latest weather data retrieved for the selected Panchayat.

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

The crop selection updates the recommendation without requiring another
weather API request.

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

# 🌐 Multi-Language Support

Climatos includes a language selection system for:

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

## Weather Data

- Open-Meteo API

## Mapping

- Leaflet
- OpenStreetMap
- Esri Satellite
- Bhuvan Panchayat / NRSC-ISRO WMS

## Deployment

- GitHub
- Vercel

---

# 📁 Project Structure

```text
Climatos/
│
├── app.py
├── index.html
├── script.js
├── style.css
├── translations.js
├── requirements.txt
├── vercel.json
├── README.md
│
└── boundaries/
    └── panchayats.geojson

    API Endpoints
Health Check
GET /api/health

Used to check whether the backend is running.

Panchayat Forecast
GET /api/forecast/panchayat?lat=LATITUDE&lon=LONGITUDE

The endpoint returns weather, forecast, agricultural advisory and climate
risk information for the supplied coordinates.

🧪 Testing Workflow

For local development:

Start the FastAPI server.
Open the Climatos website.
Select a State.
Select a District.
Select a Block.
Select a Panchayat.
Click Get Forecast Data.
Verify current weather.
Verify the 7-day forecast.
Verify weather charts.
Verify Climate Risk Dashboard.
Scroll to Crop Advisory.
Select a crop.
Verify the recommendation.
Change to another crop and verify that the advisory updates.

Bhuvan Integration

Climatos uses the Bhuvan Panchayat SISDP Phase-II WMS service for selected
map overlays.

The frontend currently supports Bhuvan layers for:

Roads
Settlements
Land Use / Land Cover
Drainage & Water Bodies

Panchayat boundary geometry is designed to be supplied through GeoJSON.

📦 Deployment

The project can be deployed using Vercel.

The repository is connected to GitHub so that new commits can trigger
automatic deployments.

Development Workflow

Recommended workflow:
Modify code
     ↓
Test on localhost
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
Vercel automatic deployment
     ↓
Test live website

🔮 Future Improvements

Possible future improvements include:

Official Panchayat boundary dataset integration
More crop types
More detailed crop-specific advisory
Improved agricultural recommendations using official agromet guidance
More weather indicators
Historical weather analysis
More climate-risk indicators
Improved Panchayat search
Additional Indian languages
Enhanced mobile responsiveness
Panchayat-level historical climate trends

👨‍💻 Project

Climatos

A Panchayat-level weather, climate-risk and agricultural advisory
dashboard.

Built using modern web technologies with a focus on localized environmental
information and decision-support visualization.