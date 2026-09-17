const geoData = {
    "Bihar": {
        "Madhepura": {
            "Dauram Madhepura": ["Bhelwa", "Khopayati", "Sahugarh"],
            "Gwalpara": ["Chhatapur", "Gwalpara", "Jhitkiya"],
            "Singheshwar": ["Singheshwarsthan", "Rampur", "Durgapur"] // Added new block & panchayats
        },
        "Patna": {
            "Patna Sadar": ["Kumhrar", "Phulwari Sharif"],
            "Danapur": ["Digha", "Khagaul"]
        },
        "Darbhanga": { // Added new district
            "Bahadurpur": ["Bela", "Asurchak", "Parikro"],
            "Keoti": ["Keoti Ranway", "Haridaspur"]
        }
    },
    "Maharashtra": {
        "Pune": {
            "Haveli": ["Khadakwasla", "Manjri"],
            "Khed": ["Alandi", "Chakan"]
        }
    }
};

// DOM Elements
const stateSelect = document.getElementById('state');
const districtSelect = document.getElementById('district');
const blockSelect = document.getElementById('block');
const panchayatSelect = document.getElementById('panchayat');
const btnSubmit = document.getElementById('btn-submit');
const btnLocation = document.getElementById('btn-location');

// Helper function to populate a dropdown
function populateDropdown(selectElement, optionsArray, defaultText) {
    selectElement.innerHTML = `<option value="">-- ${defaultText} --</option>`;
    optionsArray.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        selectElement.appendChild(opt);
    });
}

// 1. Initialize States on page load
window.addEventListener('DOMContentLoaded', () => {
    populateDropdown(stateSelect, Object.keys(geoData), "Select State");
});

// 2. Handle State Change
stateSelect.addEventListener('change', function () {
    const state = this.value;

    // Reset downstream dropdowns
    populateDropdown(districtSelect, [], "Select District");
    populateDropdown(blockSelect, [], "Select Block");
    populateDropdown(panchayatSelect, [], "Select Panchayat");

    districtSelect.disabled = true;
    blockSelect.disabled = true;
    panchayatSelect.disabled = true;
    btnSubmit.disabled = true;

    if (state) {
        const districts = Object.keys(geoData[state]);
        populateDropdown(districtSelect, districts, "Select District");
        districtSelect.disabled = false;
    }
});

// 3. Handle District Change
districtSelect.addEventListener('change', function () {
    const state = stateSelect.value;
    const district = this.value;

    populateDropdown(blockSelect, [], "Select Block");
    populateDropdown(panchayatSelect, [], "Select Panchayat");

    blockSelect.disabled = true;
    panchayatSelect.disabled = true;
    btnSubmit.disabled = true;

    if (district) {
        const blocks = Object.keys(geoData[state][district]);
        populateDropdown(blockSelect, blocks, "Select Block");
        blockSelect.disabled = false;
    }
});

// 4. Handle Block Change
blockSelect.addEventListener('change', function () {
    const state = stateSelect.value;
    const district = districtSelect.value;
    const block = this.value;

    populateDropdown(panchayatSelect, [], "Select Panchayat");
    panchayatSelect.disabled = true;
    btnSubmit.disabled = true;

    if (block) {
        const panchayats = geoData[state][district][block];
        populateDropdown(panchayatSelect, panchayats, "Select Panchayat");
        panchayatSelect.disabled = false;
    }
});

// 5. Handle Panchayat Change
panchayatSelect.addEventListener('change', function () {
    btnSubmit.disabled = !this.value; // Enable submit button if a panchayat is selected
});

// 6. Handle Geolocation Button
btnLocation.addEventListener('click', () => {
    if ("geolocation" in navigator) {
        btnLocation.textContent = "Locating...";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                alert(`Location found: Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}\n(A backend API is required to auto-fill the dropdowns from these coordinates)`);
                btnLocation.textContent = "Use My Location";
            },
            (error) => {
                alert("Unable to retrieve location. Please check your browser permissions.");
                btnLocation.textContent = "Use My Location";
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
    }
});
// --- Leaflet Map Initialization ---

// 1. Initialize map centered on India with a zoom level of 5
const map = L.map('map').setView([22.5937, 78.9629], 5);

// 2. Add OpenStreetMap Base Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let currentMarker = null;

// 3. Mock Coordinates for the Panchayats in our dropdown
const panchayatCoords = {
    // Existing panchayats
    "Bhelwa": [25.9250, 86.7910],
    "Khopayati": [25.9520, 86.8150],
    "Sahugarh": [25.9010, 86.7820],
    "Chhatapur": [25.8550, 86.9010],
    "Gwalpara": [25.8420, 86.9210],
    "Jhitkiya": [25.8600, 86.9100],
    "Kumhrar": [25.6022, 85.1834],
    "Phulwari Sharif": [25.5775, 85.0833],
    "Digha": [25.6370, 85.0933],
    "Khagaul": [25.5800, 85.0440],
    "Khadakwasla": [18.4340, 73.7620],
    "Manjri": [18.5080, 73.9720],
    "Alandi": [18.6750, 73.8950],
    "Chakan": [18.7500, 73.8500],

    // Newly added panchayats coordinates
    "Singheshwarsthan": [26.0231, 86.8201],
    "Rampur": [26.0100, 86.8050],
    "Durgapur": [25.9900, 86.7900],
    "Bela": [26.1520, 85.9010],
    "Asurchak": [26.1400, 85.8900],
    "Parikro": [26.1300, 85.8800],
    "Keoti Ranway": [26.2300, 85.8500],
    "Haridaspur": [26.2100, 85.8400]
};

// 4. Update the existing Panchayat change event
panchayatSelect.addEventListener('change', function () {
    const selectedPanchayat = this.value;
    btnSubmit.disabled = !selectedPanchayat;

    if (selectedPanchayat && panchayatCoords[selectedPanchayat]) {
        const coords = panchayatCoords[selectedPanchayat];

        // Smoothly fly to the new coordinates at zoom level 13
        map.flyTo(coords, 13, {
            duration: 1.5
        });

        // Remove the old marker if it exists
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Drop a new marker with a popup
        currentMarker = L.marker(coords).addTo(map)
            .bindPopup(`<b>${selectedPanchayat}</b><br>Forecasting grid location.`)
            .openPopup();
    }
});

// --- Climatos + Bhuvan Panchayat Map Layers ---

// Base map
const defaultMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
});

const satelliteLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        maxZoom: 18,
        attribution: 'Tiles © Esri'
    }
);

// Official Bhuvan Panchayat SISDP Phase-II WMS service.
// These two layer names are exposed by the Bhuvan Panchayat service.
const bhuvanWmsUrl = 'https://bhuvanpanchayat.nrsc.gov.in/geoserver2/SISDP_P2/wms';

const bhuvanRoadsLayer = L.tileLayer.wms(bhuvanWmsUrl, {
    layers: 'SISDP_P2:ROAD_PHASE_II',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: 'Bhuvan Panchayat / NRSC-ISRO'
});

const bhuvanSettlementsLayer = L.tileLayer.wms(bhuvanWmsUrl, {
    layers: 'SISDP_P2:SETTLEMENT_PHASE_II',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: 'Bhuvan Panchayat / NRSC-ISRO'
});
// Bhuvan Panchayat Land Use / Land Cover
const bhuvanLulcLayer = L.tileLayer.wms(bhuvanWmsUrl, {
    layers: 'SISDP_P2:LULC_PHASE_II',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: 'Bhuvan Panchayat / NRSC-ISRO'
});

// Bhuvan Panchayat Drainage & Water Bodies
const bhuvanWaterLayer = L.tileLayer.wms(bhuvanWmsUrl, {
    layers: 'SISDP_P2:DRAIN_PHASE_II',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: 'Bhuvan Panchayat / NRSC-ISRO'
});

// Keep Bhuvan overlays together so switching modes does not leave stale layers.
const bhuvanOverlays = [
    bhuvanRoadsLayer,
    bhuvanSettlementsLayer,
    bhuvanLulcLayer,
    bhuvanWaterLayer
];

function removeBhuvanOverlays() {
    bhuvanOverlays.forEach(layer => {
        if (map.hasLayer(layer)) map.removeLayer(layer);
    });
}

function setBaseLayer(layer) {
    if (map.hasLayer(defaultMapLayer)) map.removeLayer(defaultMapLayer);
    if (map.hasLayer(satelliteLayer)) map.removeLayer(satelliteLayer);
    layer.addTo(map);
}

// Layer buttons
const layerBtns = document.querySelectorAll('.layer-btn');
layerBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        layerBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const layerType = this.dataset.layer;
        removeBhuvanOverlays();

        if (layerType === 'satellite') {

            setBaseLayer(satelliteLayer);

        } else if (layerType === 'roads') {

            setBaseLayer(defaultMapLayer);

            bhuvanRoadsLayer.addTo(map);

        } else if (layerType === 'settlements') {

            setBaseLayer(defaultMapLayer);

            bhuvanSettlementsLayer.addTo(map);

        } else if (layerType === 'lulc') {

            setBaseLayer(defaultMapLayer);

            bhuvanLulcLayer.addTo(map);

        } else if (layerType === 'water') {

            setBaseLayer(defaultMapLayer);

            bhuvanWaterLayer.addTo(map);

        } else {

            setBaseLayer(defaultMapLayer);

        }
    });
});

// Default map
setBaseLayer(defaultMapLayer);

// --- Backend Data Fetching & UI Rendering ---

const resultsSection = document.getElementById('forecast-results');
const resultTitle = document.getElementById('result-title');

// DOM Elements for Current Weather
const currentTemp = document.getElementById('current-temp');
const currentHumidity = document.getElementById('current-humidity');
const currentWind = document.getElementById('current-wind');
const currentSoil = document.getElementById('current-soil');

// DOM Elements for Advisory
const advisoryCard = document.getElementById('advisory-card');
const advisoryStatus = document.getElementById('advisory-status');
const advisoryText = document.getElementById('advisory-text');

// DOM Elements for 7-day forecast
const forecast7DaysContainer = document.getElementById('forecast-7-days');
const rainfallRisk = document.getElementById('rainfall-risk');
const heatRisk = document.getElementById('heat-risk');
const agricultureRisk = document.getElementById('agriculture-risk');
const soilCondition = document.getElementById('soil-condition');

const riskTodayRain = document.getElementById('risk-today-rain');
const riskTotalRain = document.getElementById('risk-total-rain');
const riskMaxTemp = document.getElementById('risk-max-temp');

btnSubmit.addEventListener('click', async () => {
    const state = stateSelect.value;
    const district = districtSelect.value;
    const block = blockSelect.value;
    const panchayat = panchayatSelect.value;

    if (!panchayat) return;

    // Get coordinates from our mock list
    const coords = panchayatCoords[panchayat] || [25.9010, 86.7820]; // Fallback coordinates
    const lat = coords[0];
    const lon = coords[1];

    btnSubmit.textContent = "Fetching Downscaled Data...";
    btnSubmit.disabled = true;

    try {
        // Call your FastAPI backend endpoint
        const apiUrl = `/api/forecast/panchayat?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            let detail = `HTTP ${response.status}`;
            try {
                const errorBody = await response.json();
                if (errorBody.detail) detail += `: ${errorBody.detail}`;
            } catch (_) { }
            throw new Error(detail);
        }

        const data = await response.json();

        // -----------------------------
        // Climate Risk Dashboard
        // -----------------------------

        if (data.climate_risk) {

            rainfallRisk.textContent =
                data.climate_risk.rainfall_risk;

            heatRisk.textContent =
                data.climate_risk.heat_risk;

            agricultureRisk.textContent =
                data.climate_risk.agriculture_risk;

            soilCondition.textContent =
                data.climate_risk.soil_condition;

            riskTodayRain.textContent =
                `${data.climate_risk.today_rainfall_mm} mm`;

            riskTotalRain.textContent =
                `${data.climate_risk.total_7_day_rainfall_mm} mm`;

            riskMaxTemp.textContent =
                `${data.climate_risk.max_forecast_temperature_c} °C`;
        }

        // 1. Update Title
        resultTitle.textContent = `Weather & Agromet Advisory for ${panchayat}, ${block}, ${district}`;

        // 2. Render Current Weather
        currentTemp.textContent = data.current.temperature_c;
        currentHumidity.textContent = `${data.current.humidity_percent}%`;
        currentWind.textContent = `${data.current.wind_speed_kmh} km/h`;
        currentSoil.textContent = `${data.current.soil_moisture_percent}%`;

        // 3. Render Agromet Advisory
        const status = data.agromet_advisory.status;
        advisoryCard.className = `card advisory-box ${status}`;
        advisoryStatus.textContent = status;
        advisoryText.textContent = data.agromet_advisory.message;

        // 4. Render 7-Day Forecast Cards & Chart
        forecast7DaysContainer.innerHTML = "";
        const daysLabels = [];
        const maxTemps = [];
        const minTemps = [];
        const rainfallValues = [];

        data.forecast_7_day.forEach(day => {
            // Collect data points for the chart graph
            daysLabels.push(day.day);
            maxTemps.push(day.max_temp);
            minTemps.push(day.min_temp);
            rainfallValues.push(day.rainfall_mm);
            // Render visual cards
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="day">${day.day}</div>
                <div class="date">${day.date}</div>
                <div class="condition">${day.condition}</div>
                <div class="temps">
                    <span class="max">${day.max_temp}°</span> / <span class="min">${day.min_temp}°</span>
                </div>
                <div class="rain">🌧 ${day.rainfall_mm} mm</div>
            `;
            forecast7DaysContainer.appendChild(card);
        });

        // Render Chart.js Trend Graph
        const ctx = document.getElementById('weatherChart').getContext('2d');
        if (window.myWeatherChart) {
            window.myWeatherChart.destroy(); // Clear out previous chart instance to avoid duplicates
        }
        window.myWeatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: daysLabels,
                datasets: [
                    {
                        label: 'Max Temperature (°C)',
                        data: maxTemps,
                        borderColor: '#dc2626',
                        backgroundColor: '#dc2626',
                        tension: 0.3
                    },
                    {
                        label: 'Min Temperature (°C)',
                        data: minTemps,
                        borderColor: '#2563eb',
                        backgroundColor: '#2563eb',
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });

        // -----------------------------
        // Rainfall Chart
        // -----------------------------

        const rainfallCtx =
            document.getElementById('rainfallChart').getContext('2d');

        if (window.myRainfallChart) {
            window.myRainfallChart.destroy();
        }

        window.myRainfallChart = new Chart(rainfallCtx, {
            type: 'bar',

            data: {
                labels: daysLabels,

                datasets: [
                    {
                        label: 'Rainfall (mm)',
                        data: rainfallValues,

                        borderWidth: 1
                    }
                ]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        position: 'top'
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        title: {
                            display: true,
                            text: 'Rainfall (mm)'
                        }
                    },

                    x: {
                        title: {
                            display: true,
                            text: 'Day'
                        }
                    }
                }
            }
        });
        // 5. Reveal the results container smoothly
        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error("FastAPI request failed:", error);
        alert(`MoES backend error: ${error.message}\n\nIf you are testing locally, start the server with:\nuvicorn app:app --reload\n\nThen open:\nhttp://127.0.0.1:8000`);
    } finally {
        btnSubmit.textContent = "Get Forecast Data";
        btnSubmit.disabled = false;
    }
});

// --- Multi-Language Support (Bhashini Simulation) ---
const languageSelect = document.querySelector('.language-select');

languageSelect.addEventListener('change', (e) => {
    const lang = e.target.value; // 'en' or 'hi'
    const t = translations[lang];

    if (!t) return;

    // 1. Translate Form Labels & Buttons
    document.querySelector('.selector-header h3').textContent = t.selectLocation;
    document.querySelector('label[for="state"]').textContent = t.stateLabel;
    document.querySelector('label[for="district"]').textContent = t.districtLabel;
    document.querySelector('label[for="block"]').textContent = t.blockLabel;
    document.querySelector('label[for="panchayat"]').textContent = t.panchayatLabel;
    btnLocation.textContent = t.btnLocation;
    btnSubmit.textContent = t.btnSubmit;

    // 2. Translate Map Header
    document.querySelector('.map-section .selector-header h3').textContent = t.mapTitle;

    // 3. Translate Results Dashboard Headers (if visible)
    const resultTitleEl = document.getElementById('result-title');
    if (resultTitleEl && resultTitleEl.textContent) {
        // Keep the dynamic panchayat name if already selected, just update static headers
        resultTitleEl.textContent = t.resultsTitle;
    }

    const resultsSubtitle = document.querySelector('.results-header-card .subtitle');
    if (resultsSubtitle) resultsSubtitle.textContent = t.resultsSubtitle;

    document.querySelector('.current-weather-card h3').textContent = t.currentConditions;

    // Translate metric labels
    const metricLabels = document.querySelectorAll('.metric .label');
    if (metricLabels.length >= 3) {
        metricLabels[0].textContent = t.humidity;
        metricLabels[1].textContent = t.windSpeed;
        metricLabels[2].textContent = t.soilMoisture;
    }

    document.querySelector('.advisory-box h3').textContent = t.advisoryHeading;

    const forecastHeading = document.querySelector('#forecast-results .card.mt-4 h3');
    if (forecastHeading) forecastHeading.textContent = t.forecastHeading;
});
