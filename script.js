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
// Panchayat location information
const panchayatInfoName = document.getElementById('panchayat-info-name');
const panchayatInfoPath = document.getElementById('panchayat-info-path');

const infoState = document.getElementById('info-state');
const infoDistrict = document.getElementById('info-district');
const infoBlock = document.getElementById('info-block');
const infoLat = document.getElementById('info-lat');
const infoLon = document.getElementById('info-lon');
const infoStatus = document.getElementById('info-status');

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

// ==========================================
// AI DOWNSCALED RAINFALL - 4 KM GRID
// ==========================================

let downscaledRainLayer = null;

// Rainfall color scale
function getRainColor(rainfall) {
    if (rainfall >= 50) return "#800026";
    if (rainfall >= 30) return "#BD0026";
    if (rainfall >= 20) return "#E31A1C";
    if (rainfall >= 10) return "#FD8D3C";
    if (rainfall >= 5) return "#FEB24C";
    if (rainfall >= 1) return "#FED976";
    return "#FFFFCC";
}

// Load AI 4 km rainfall grid
async function loadDownscaledRainfall() {
    try {
        console.log("Loading AI 4-km rainfall grid...");

        const response = await fetch(
            "/api/downscaled/grid-clipped"
        );

        if (!response.ok) {
            throw new Error("Could not load downscaled GeoJSON");
        }

        const geojson = await response.json();

        // Remove old layer
        if (downscaledRainLayer) {
            map.removeLayer(downscaledRainLayer);
        }

        downscaledRainLayer = L.geoJSON(geojson, {

            style: function (feature) {
                const rainfall =
                    Number(feature.properties.predicted_rainfall_mm) || 0;

                return {
                    fillColor: getRainColor(rainfall),
                    fillOpacity: 0.55,
                    color: "#333",
                    weight: 0.8
                };
            },

            onEachFeature: function (feature, layer) {

                const p = feature.properties;

                layer.bindPopup(`
                    <div style="min-width:220px">
                        <h3>🌧️ AI Downscaled Rainfall</h3>

                        <b>Grid:</b> ${p.grid_id || p.name}<br>
                        <b>Resolution:</b> ${p.cell_km}<br>

                        <hr>

                        <b>Predicted Rainfall:</b>
                        <span style="font-size:18px">
                            ${p.predicted_rainfall_mm} mm
                        </span>

                        <br>

                        <b>Prediction Date:</b>
                        ${p.prediction_date}

                        <hr>

                        <small>
                            Method: XGBoost Spatial Downscaling<br>
                            Status: ${p.data_status}
                        </small>
                    </div>
                `);

                layer.on({
                    mouseover: function () {
                        this.setStyle({
                            weight: 2,
                            fillOpacity: 0.75
                        });
                    },

                    mouseout: function () {
                        downscaledRainLayer.resetStyle(this);
                    }
                });
            }
        }).addTo(map);

        console.log(
            `AI rainfall grid loaded: ${geojson.features.length} cells`
        );

    } catch (error) {
        console.error(
            "Downscaled rainfall loading error:",
            error
        );
    }
}

// ==========================================
// AI RAINFALL MAP CONTROL
// ==========================================

let aiRainfallVisible = true;


// ------------------------------------------
// Rainfall Legend
// ------------------------------------------

const rainfallLegend = L.control({
    position: "bottomright"
});

rainfallLegend.onAdd = function () {

    const div = L.DomUtil.create(
        "div",
        "ai-rainfall-legend"
    );

    div.innerHTML = `
        <div style="
            background: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            font-family: Arial, sans-serif;
            font-size: 12px;
            min-width: 150px;
        ">

            <div style="
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 8px;
            ">
                🌧️ AI Rainfall
            </div>

            <div>
                <span style="
                    display:inline-block;
                    width:18px;
                    height:12px;
                    background:#FFFFCC;
                    margin-right:6px;
                "></span>
                0 – 1 mm
            </div>

            <div>
                <span style="
                    display:inline-block;
                    width:18px;
                    height:12px;
                    background:#FED976;
                    margin-right:6px;
                "></span>
                1 – 5 mm
            </div>

            <div>
                <span style="
                    display:inline-block;
                    width:18px;
                    height:12px;
                    background:#FEB24C;
                    margin-right:6px;
                "></span>
                5 – 10 mm
            </div>

            <div>
                <span style="
                    display:inline-block;
                    width:18px;
                    height:12px;
                    background:#FD8D3C;
                    margin-right:6px;
                "></span>
                10 – 20 mm
            </div>

            <div>
                <span style="
                    display:inline-block;
                    width:18px;
                    height:12px;
                    background:#E31A1C;
                    margin-right:6px;
                "></span>
                20 – 30 mm
            </div>

            <div>
                <span style="
                    display:inline-block;
                    width:18px;
                    height:12px;
                    background:#BD0026;
                    margin-right:6px;
                "></span>
                30 – 50 mm
            </div>

            <div>
                <span style="
                    display:inline-block;
                    width:18px;
                    height:12px;
                    background:#800026;
                    margin-right:6px;
                "></span>
                50+ mm
            </div>

        </div>
    `;

    return div;
};


// ------------------------------------------
// AI Rainfall ON/OFF Button
// ------------------------------------------

const aiRainfallControl = L.control({
    position: "topright"
});

aiRainfallControl.onAdd = function () {

    const div = L.DomUtil.create(
        "div",
        "ai-rainfall-control"
    );

    div.innerHTML = `
        <button
            id="aiRainfallToggle"
            style="
                background:#ffffff;
                border:none;
                padding:10px 14px;
                border-radius:7px;
                box-shadow:0 2px 8px rgba(0,0,0,0.25);
                cursor:pointer;
                font-weight:bold;
                color:#073b73;
                font-size:13px;
            "
        >
            🌧️ AI 4-km Rainfall: ON
        </button>
    `;

    L.DomEvent.disableClickPropagation(div);

    return div;
};


// Add controls to map
aiRainfallControl.addTo(map);
rainfallLegend.addTo(map);


// ------------------------------------------
// Toggle AI Rainfall Layer
// ------------------------------------------

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target &&
            event.target.id === "aiRainfallToggle"
        ) {

            const button =
                event.target;

            if (aiRainfallVisible) {

                // Hide layer
                if (downscaledRainLayer) {
                    map.removeLayer(
                        downscaledRainLayer
                    );
                }

                aiRainfallVisible = false;

                button.innerHTML =
                    "🌧️ AI 4-km Rainfall: OFF";

                button.style.color =
                    "#666";

            } else {

                // Show layer
                if (downscaledRainLayer) {
                    downscaledRainLayer.addTo(map);
                }

                aiRainfallVisible = true;

                button.innerHTML =
                    "🌧️ AI 4-km Rainfall: ON";

                button.style.color =
                    "#073b73";
            }
        }
    }
);
loadDownscaledRainfall();

// 2. Add OpenStreetMap Base Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let currentMarker = null;
// --- Panchayat Boundary Layer ---
let currentPanchayatBoundary = null;
function clearPanchayatBoundary() {
    if (currentPanchayatBoundary) {
        map.removeLayer(currentPanchayatBoundary);
        currentPanchayatBoundary = null;
    }
}


function showPanchayatBoundary(geoJsonData) {

    clearPanchayatBoundary();

    if (!geoJsonData) {
        return;
    }

    currentPanchayatBoundary = L.geoJSON(geoJsonData, {
        style: {
            color: "#003366",
            weight: 3,
            opacity: 1,
            fillColor: "#3b82f6",
            fillOpacity: 0.15
        }
    }).addTo(map);

    // Automatically fit map to boundary
    const boundaryBounds =
        currentPanchayatBoundary.getBounds();

    if (boundaryBounds.isValid()) {
        map.fitBounds(boundaryBounds, {
            padding: [30, 30]
        });
    }
}
const panchayatBoundaries = {
    // Real GeoJSON boundaries will be added here later.
};

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
// 6. Handle Panchayat Change + Location Information
panchayatSelect.addEventListener('change', function () {

    const selectedPanchayat = this.value;

    btnSubmit.disabled = !selectedPanchayat;
    clearPanchayatBoundary();

    if (!selectedPanchayat) {
        panchayatInfoName.textContent = "Panchayat Location";
        panchayatInfoPath.textContent =
            "Select a Panchayat to view location details.";

        infoState.textContent = "--";
        infoDistrict.textContent = "--";
        infoBlock.textContent = "--";
        infoLat.textContent = "--";
        infoLon.textContent = "--";
        infoStatus.textContent = "--";

        return;
    }

    const coords = panchayatCoords[selectedPanchayat];

    // Fill administrative information
    infoState.textContent = stateSelect.value || "--";
    infoDistrict.textContent = districtSelect.value || "--";
    infoBlock.textContent = blockSelect.value || "--";

    panchayatInfoName.textContent = selectedPanchayat;

    panchayatInfoPath.textContent =
        `${blockSelect.value}, ${districtSelect.value}, ${stateSelect.value}`;

    if (coords) {

        const lat = coords[0];
        const lon = coords[1];

        infoLat.textContent = lat.toFixed(4);
        infoLon.textContent = lon.toFixed(4);

        infoStatus.textContent = "Coordinate available";

        // Move map
        map.flyTo(coords, 13, {
            duration: 1.5
        });

        // Remove previous marker
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Add new marker
        currentMarker = L.marker(coords)
            .addTo(map)
            .bindPopup(
                `<b>${selectedPanchayat}</b><br>
                 ${blockSelect.value}, ${districtSelect.value}<br>
                 Lat: ${lat.toFixed(4)}<br>
                 Lon: ${lon.toFixed(4)}`
            )
            .openPopup();
        // Show Panchayat boundary if available
        const boundary = panchayatBoundaries[selectedPanchayat];

        if (boundary) {
            showPanchayatBoundary(boundary);
        }

    } else {

        infoLat.textContent = "--";
        infoLon.textContent = "--";
        infoStatus.textContent = "Coordinates unavailable";
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
// DOM Elements for Panchayat Weather Overview
const overviewLocationText = document.getElementById('overview-location-text');
const overviewStatus = document.getElementById('overview-status');
const overviewPanchayat = document.getElementById('overview-panchayat');
const overviewTemperature = document.getElementById('overview-temperature');
const overviewRainfall = document.getElementById('overview-rainfall');
const overviewSoil = document.getElementById('overview-soil');
const overviewUpdated = document.getElementById('overview-updated');

// DOM Elements for Current Weather
const currentTemp = document.getElementById('current-temp');
const currentHumidity = document.getElementById('current-humidity');
const currentWind = document.getElementById('current-wind');
const currentSoil = document.getElementById('current-soil');

// DOM Elements for Advisory
const advisoryCard = document.getElementById('advisory-card');
const advisoryStatus = document.getElementById('advisory-status');
const advisoryText = document.getElementById('advisory-text');

// DOM Elements for Crop Advisory
const cropSelect = document.getElementById('crop-select');
const cropCondition = document.getElementById('crop-condition');
const cropRecommendationText = document.getElementById('crop-recommendation-text');
const cropTempFactor = document.getElementById('crop-temp-factor');
const cropRainFactor = document.getElementById('crop-rain-factor');
const cropSoilFactor = document.getElementById('crop-soil-factor');


const cropAdvisoryTitle = document.getElementById('crop-advisory-title');
const cropHumidityFactor = document.getElementById('crop-humidity-factor');
const cropSuitabilityValue = document.getElementById('crop-suitability-value');
const cropSuitabilityFill = document.getElementById('crop-suitability-fill');
// Store the latest weather data for crop advisory
let latestWeatherData = null;

// DOM Elements for 7-day forecast
const forecast7DaysContainer = document.getElementById('forecast-7-days');
const rainfallRisk = document.getElementById('rainfall-risk');
const heatRisk = document.getElementById('heat-risk');
const agricultureRisk = document.getElementById('agriculture-risk');
const soilCondition = document.getElementById('soil-condition');

const riskTodayRain = document.getElementById('risk-today-rain');
const riskTotalRain = document.getElementById('risk-total-rain');
const riskMaxTemp = document.getElementById('risk-max-temp');



// =========================================
// 📍 Panchayat Weather Overview
// =========================================

function updatePanchayatOverview(data) {

    if (!data || !data.current) {
        return;
    }

    const selectedPanchayat = panchayatSelect.value;
    const current = data.current || {};
    const forecast = data.forecast_7_day || [];

    // Panchayat name
    overviewPanchayat.textContent =
        selectedPanchayat || '--';

    // Location description
    overviewLocationText.textContent =
        selectedPanchayat
            ? `Weather summary for ${selectedPanchayat}, ${blockSelect.value}, ${districtSelect.value}.`
            : 'Weather summary for the selected Panchayat.';

    // Current temperature
    const temperature = Number(current.temperature_c);

    overviewTemperature.textContent =
        Number.isFinite(temperature)
            ? `${temperature.toFixed(1)} °C`
            : '--';

    // Total 7-day rainfall
    const totalRainfall = forecast.reduce((total, day) => {
        return total + Number(day.rainfall_mm || 0);
    }, 0);

    overviewRainfall.textContent =
        `${totalRainfall.toFixed(1)} mm`;

    // Soil moisture
    const soilMoisture =
        Number(current.soil_moisture_percent);

    overviewSoil.textContent =
        Number.isFinite(soilMoisture)
            ? `${soilMoisture.toFixed(1)}%`
            : '--';

    // Status based on existing Climate Risk data
    let overviewStatusText = 'Updated';

    if (data.climate_risk) {

        const rainfallRisk =
            String(data.climate_risk.rainfall_risk || '').toLowerCase();

        const heatRisk =
            String(data.climate_risk.heat_risk || '').toLowerCase();

        const agricultureRisk =
            String(data.climate_risk.agriculture_risk || '').toLowerCase();

        const soilCondition =
            String(data.climate_risk.soil_condition || '').toLowerCase();

        const riskText =
            `${rainfallRisk} ${heatRisk} ${agricultureRisk} ${soilCondition}`;

        if (
            riskText.includes('high') ||
            riskText.includes('danger') ||
            riskText.includes('critical')
        ) {
            overviewStatusText = 'Attention Required';

        } else if (
            riskText.includes('moderate') ||
            riskText.includes('medium') ||
            riskText.includes('watch')
        ) {
            overviewStatusText = 'Monitor Conditions';

        } else {
            overviewStatusText = 'Normal Conditions';
        }
    }

    overviewStatus.textContent = overviewStatusText;

    // Last updated time
    overviewUpdated.textContent =
        new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
}

// =========================================
// 🌾 Crop Advisory Logic
// =========================================

function updateCropAdvisory(data) {

    const selectedCrop = cropSelect.value;

    if (!selectedCrop || !data) {
        cropCondition.textContent = 'Select a crop';
        cropRecommendationText.textContent =
            'Select a crop to receive a weather-based agricultural recommendation.';

        cropTempFactor.textContent = '--';
        cropRainFactor.textContent = '--';
        cropSoilFactor.textContent = '--';
        cropHumidityFactor.textContent = '--';

        cropSuitabilityValue.textContent = '--';
        cropSuitabilityFill.style.width = '0%';

        if (cropAdvisoryTitle) {
            cropAdvisoryTitle.textContent = '🌾 Panchayat Crop Advisory';
        }

        return;
    }


    /* =========================================
       Panchayat Name
       ========================================= */

    const selectedPanchayat = panchayatSelect.value;

    if (cropAdvisoryTitle) {

        if (selectedPanchayat) {
            cropAdvisoryTitle.textContent =
                `🌾 Crop Advisory — ${selectedPanchayat}`;
        } else {
            cropAdvisoryTitle.textContent =
                '🌾 Panchayat Crop Advisory';
        }
    }


    /* =========================================
       Weather Data
       ========================================= */

    const current = data.current || {};
    const forecast = data.forecast_7_day || [];

    const temperature = Number(current.temperature_c);
    const soilMoisture = Number(current.soil_moisture_percent);
    const humidity = Number(current.humidity_percent);

    const totalRainfall = forecast.reduce((total, day) => {
        return total + Number(day.rainfall_mm || 0);
    }, 0);


    /* =========================================
       Display Weather Factors
       ========================================= */

    cropTempFactor.textContent =
        Number.isFinite(temperature)
            ? `${temperature.toFixed(1)} °C`
            : '--';

    cropRainFactor.textContent =
        `${totalRainfall.toFixed(1)} mm`;

    cropSoilFactor.textContent =
        Number.isFinite(soilMoisture)
            ? `${soilMoisture.toFixed(1)}%`
            : '--';

    cropHumidityFactor.textContent =
        Number.isFinite(humidity)
            ? `${humidity.toFixed(1)}%`
            : '--';


    /* =========================================
       Crop Suitability Calculation
       ========================================= */

    let score = 50;
    let recommendation = '';
    let condition = 'Moderate';


    if (selectedCrop === 'rice') {

        if (temperature >= 22 && temperature <= 35) {
            score += 20;
        } else {
            score -= 15;
        }

        if (totalRainfall >= 30 && totalRainfall <= 180) {
            score += 20;
        } else if (totalRainfall < 30) {
            score -= 10;
        } else {
            score -= 15;
        }

        if (soilMoisture >= 40) {
            score += 10;
        } else {
            score -= 5;
        }

        recommendation =
            'Rice generally benefits from warm conditions and adequate water availability. Monitor rainfall and soil moisture before deciding on additional irrigation.';

    }


    else if (selectedCrop === 'wheat') {

        if (temperature >= 10 && temperature <= 25) {
            score += 20;
        } else {
            score -= 15;
        }

        if (totalRainfall >= 10 && totalRainfall <= 80) {
            score += 20;
        } else if (totalRainfall > 80) {
            score -= 15;
        } else {
            score -= 5;
        }

        if (soilMoisture >= 25 && soilMoisture <= 70) {
            score += 10;
        }

        recommendation =
            'Wheat generally performs better under cooler conditions. Monitor excess rainfall and soil moisture to avoid unnecessary irrigation.';

    }


    else if (selectedCrop === 'maize') {

        if (temperature >= 18 && temperature <= 32) {
            score += 20;
        } else {
            score -= 15;
        }

        if (totalRainfall >= 20 && totalRainfall <= 120) {
            score += 20;
        } else {
            score -= 10;
        }

        if (soilMoisture >= 30) {
            score += 10;
        }

        recommendation =
            'Maize benefits from moderate warmth and sufficient moisture. Monitor rainfall and soil moisture during the crop period.';

    }


    else if (selectedCrop === 'potato') {

        if (temperature >= 10 && temperature <= 25) {
            score += 20;
        } else {
            score -= 15;
        }

        if (totalRainfall >= 10 && totalRainfall <= 70) {
            score += 20;
        } else if (totalRainfall > 70) {
            score -= 15;
        }

        if (soilMoisture >= 25 && soilMoisture <= 70) {
            score += 10;
        }

        recommendation =
            'Potato generally prefers cooler conditions and controlled soil moisture. Avoid excessive irrigation when rainfall is already sufficient.';

    }


    else if (selectedCrop === 'mustard') {

        if (temperature >= 10 && temperature <= 25) {
            score += 25;
        } else {
            score -= 15;
        }

        if (totalRainfall >= 5 && totalRainfall <= 60) {
            score += 20;
        } else if (totalRainfall > 60) {
            score -= 15;
        }

        recommendation =
            'Mustard generally prefers cooler and relatively dry conditions. Monitor rainfall and avoid excess moisture around the crop.';

    }


    else if (selectedCrop === 'vegetables') {

        if (temperature >= 15 && temperature <= 30) {
            score += 20;
        } else {
            score -= 10;
        }

        if (totalRainfall >= 15 && totalRainfall <= 100) {
            score += 20;
        } else {
            score -= 10;
        }

        if (soilMoisture >= 30 && soilMoisture <= 75) {
            score += 10;
        }

        recommendation =
            'Vegetables generally need balanced temperature and soil moisture. Monitor rainfall and avoid over-irrigation when soil moisture is already adequate.';

    }


    /* =========================================
       Keep Score Between 0 and 100
       ========================================= */

    score = Math.max(0, Math.min(100, Math.round(score)));


    /* =========================================
       Determine Crop Condition
       ========================================= */

    if (score >= 75) {
        condition = 'Suitable';
    } else if (score >= 50) {
        condition = 'Moderate';
    } else {
        condition = 'Needs Attention';
    }


    /* =========================================
       Display Results
       ========================================= */

    cropCondition.textContent = condition;

    cropRecommendationText.textContent = recommendation;

    cropSuitabilityValue.textContent = `${score}%`;

    cropSuitabilityFill.style.width = `${score}%`;

}

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

        // =========================================
        // Climatos XGBoost Downscaled Rainfall
        // =========================================

        let downscaledData = null;

        try {
            const downscaleResponse = await fetch(
                `/api/downscaled/panchayat?name=${encodeURIComponent(panchayat)}`
            );

            if (downscaleResponse.ok) {
                downscaledData = await downscaleResponse.json();

                console.log("XGBoost Downscaled Data:", downscaledData);
            } else {
                console.warn(
                    "Downscaled rainfall API returned:",
                    downscaleResponse.status
                );
            }

        } catch (error) {
            console.warn(
                "XGBoost downscaling request failed:",
                error
            );
        }


        // Save latest weather data for Crop Advisory
        latestWeatherData = data;

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

        // 2.5 Update Panchayat Weather Overview
        updatePanchayatOverview(data);

        // 2.6 Update Crop Advisory
        updateCropAdvisory(data);

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
// =========================================
// 🌾 Crop Selection Change
// =========================================

cropSelect.addEventListener('change', () => {

    if (latestWeatherData) {
        updateCropAdvisory(latestWeatherData);
    }

});