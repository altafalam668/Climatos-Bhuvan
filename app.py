from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

import urllib.request
import json
import ssl
import certifi
from datetime import datetime
from pathlib import Path


app = FastAPI(title="MoES Panchayat Weather & Agromet API")


# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "MoES Panchayat Weather & Agromet API"}

# -----------------------------
# Website
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent


@app.get("/")
async def home():
    return FileResponse(BASE_DIR / "index.html")


# -----------------------------
# Weather API
# -----------------------------
@app.get("/api/forecast/panchayat")
async def get_panchayat_forecast(lat: float, lon: float):

    try:

        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&"
            f"current=temperature_2m,relative_humidity_2m,"
            f"wind_speed_10m,soil_moisture_0_to_1cm&"
            f"daily=weathercode,temperature_2m_max,"
            f"temperature_2m_min,precipitation_sum&"
            f"timezone=auto"
        )

        ssl_context = ssl.create_default_context(cafile=certifi.where())

        with urllib.request.urlopen(url, context=ssl_context) as response:
            data = json.loads(response.read().decode())


        current = data.get("current", {})
        daily = data.get("daily", {})


        temp = current.get("temperature_2m", 28.0)
        humidity = current.get("relative_humidity_2m", 65)
        wind_speed = current.get("wind_speed_10m", 10.0)
        soil_moisture = current.get(
            "soil_moisture_0_to_1cm",
            0.35
        )


        soil_moisture_pct = (
            round(soil_moisture * 100, 1)
            if soil_moisture is not None
            else 35.0
        )


        rainfall_today = (
            daily.get("precipitation_sum", [0])[0]
            or 0.0
        )


        if rainfall_today > 10.0:

            advisory_status = "warning"

            advisory_msg = (
                f"Heavy rainfall expected "
                f"({rainfall_today} mm). "
                f"Postpone fertilizer application "
                f"and ensure proper drainage."
            )

        elif temp > 35.0:

            advisory_status = "advisory"

            advisory_msg = (
                f"High temperature alert ({temp}°C). "
                f"Provide light and frequent irrigation."
            )

        else:

            advisory_status = "optimal"

            advisory_msg = (
                "Weather conditions are favorable "
                "for normal crop growth."
            )


        # -----------------------------
        # 7-day forecast
        # -----------------------------

        forecast_7_day = []

        days_list = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        precips = daily.get("precipitation_sum", [])
        codes = daily.get("weathercode", [])


        def interpret_weather(code):

            if code == 0:
                return "Clear Sky"

            if code in [1, 2, 3]:
                return "Partly Cloudy"

            if code in [51, 53, 55, 61, 63]:
                return "Light Rain"

            if code in [65, 80, 81, 82]:
                return "Heavy Rain"

            return "Moderate"


        for i in range(min(7, len(days_list))):

            dt = datetime.strptime(
                days_list[i],
                "%Y-%m-%d"
            )

            forecast_7_day.append({

                "day": dt.strftime("%A"),

                "date": dt.strftime("%d %b"),

                "condition": interpret_weather(
                    codes[i]
                    if i < len(codes)
                    else 0
                ),

                "max_temp": (
                    max_temps[i]
                    if i < len(max_temps)
                    else 30
                ),

                "min_temp": (
                    min_temps[i]
                    if i < len(min_temps)
                    else 20
                ),

                "rainfall_mm": (
                    precips[i]
                    if i < len(precips)
                    else 0.0
                )
            })


        return {

            "location": {
                "lat": lat,
                "lon": lon
            },

            "current": {

                "temperature_c": temp,

                "humidity_percent": humidity,

                "wind_speed_kmh": wind_speed,

                "soil_moisture_percent":
                    soil_moisture_pct
            },

            "agromet_advisory": {

                "status": advisory_status,

                "message": advisory_msg
            },

            "forecast_7_day":
                forecast_7_day
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# -----------------------------
# Static files
# -----------------------------
# Serve frontend assets (CSS, JS, images) from the project root.
# This matches the relative paths used by index.html and works locally + on Vercel.
app.mount(
    "/",
    StaticFiles(directory=BASE_DIR, html=True),
    name="frontend"
)