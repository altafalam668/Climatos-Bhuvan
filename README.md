# Climatos
🌦️ Climatos

Climatos is a modern weather-based web application designed to provide users with useful climate and weather information through a simple, clean, and user-friendly interface.

The project combines a HTML/CSS/JavaScript frontend with a FastAPI (Python) backend to create a responsive and interactive web experience.

---

🚀 Features

- 🌤️ Weather information
- 📍 Location-based weather search
- 🌡️ Temperature information
- 💨 Weather-related details
- 📱 Responsive user interface
- ⚡ FastAPI backend
- 🔗 Frontend and backend API integration
- 📊 Interactive weather presentation
- 🖥️ Simple and modern UI

---

🛠️ Technologies Used

Frontend

- HTML5
- CSS3
- JavaScript

Backend

- Python
- FastAPI
- Uvicorn

Development Tools

- VS Code
- Git
- GitHub

---

📁 Project Structure

Climatos/
│
├── backend/
│   ├── main.py
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── index2.html
│   ├── style.css
│   └── script.js
│
├── requirements.txt
├── README.md
└── ...

«The exact folder structure may vary depending on the current version of the project.»

---

⚙️ Installation & Setup

1. Clone the repository

git clone https://github.com/YOUR-USERNAME/Climatos.git

Move into the project folder:

cd Climatos

---

2. Create a virtual environment

python -m venv venv

Activate it on macOS/Linux:

source venv/bin/activate

On Windows:

venv\Scripts\activate

---

3. Install dependencies

pip install -r requirements.txt

If "requirements.txt" is not available yet, install the main dependencies:

pip install fastapi uvicorn

---

▶️ Running the Backend

Start the FastAPI server:

uvicorn app:app --reload

The backend should start at:

http://127.0.0.1:8000

---

📚 API Documentation

FastAPI automatically provides interactive API documentation.

After starting the server, open:

http://127.0.0.1:8000/docs

You can use the Swagger UI to view and test the available API endpoints.

---

🖥️ Running the Frontend

Open the frontend HTML file in your browser or run it using the VS Code Live Server extension.

Make sure the FastAPI backend is running if the frontend communicates with the API.

---

🔄 How It Works

User
  │
  ▼
Climatos Frontend
(HTML + CSS + JavaScript)
  │
  ▼
FastAPI Backend
  │
  ▼
Weather / Climate Data
  │
  ▼
API Response
  │
  ▼
Frontend displays information

---

🎯 Project Goals

The main goals of Climatos are:

- Make weather information easy to access.
- Provide a clean and beginner-friendly interface.
- Learn frontend and backend integration.
- Understand how REST APIs work.
- Build practical experience with FastAPI and JavaScript.
- Create a deployable real-world web project.

---

🔮 Future Improvements

Some features planned for future versions include:

- 🌍 More detailed location search
- 📅 Multi-day weather forecast
- 📈 Weather data visualization
- 🌧️ Rain probability
- 💧 Humidity information
- 🌬️ Wind information
- 🌅 Sunrise and sunset information
- 📍 Automatic location detection
- 🌙 Dark mode
- 📱 Improved mobile experience
- 🤖 AI-based weather insights

---

👨‍💻 Development

Climatos is being developed as a learning and practical development project, with a focus on understanding:

- Web development
- REST APIs
- FastAPI
- JavaScript
- Backend integration
- Deployment
- Git and GitHub

---

📌 Status

🚧 Project Status: In Development

More features and improvements are being added as development continues.

---

🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Push the branch.
6. Create a Pull Request.

---

📄 License

This project is currently created for educational and development purposes.

---

⭐ If you like Climatos

Give the repository a ⭐ on GitHub and feel free to explore the project!



## 🛰️ Bhuvan Panchayat Integration

Climatos now includes an optional Bhuvan Panchayat GIS layer in the Leaflet map. The integration uses the official Bhuvan Panchayat SISDP Phase-II WMS service and adds transparent road and settlement layers on top of the map.

- 🗺️ Standard OpenStreetMap base map
- 🛰️ Satellite base map
- 🛣️ Bhuvan Panchayat road layer
- 🏘️ Bhuvan Panchayat settlement layer

The weather API remains separate: FastAPI fetches weather/forecast data while Bhuvan provides geospatial context.

## Vercel Deployment

This version deploys the FastAPI backend and frontend together. Import the repository into Vercel and deploy with the included `vercel.json`. After deployment, test `/api/health`; it should return JSON with `status: ok`.


### Frontend asset fix
The frontend uses relative asset paths (`./style.css`, `./script.js`, `./translations.js`) so it works when served by FastAPI and when opened with a local static server. FastAPI serves the project directory at `/` after the API routes.
