# 🚆 TransitPulse — Smart Public Transport Route & Crowd Management System
### MCA 1st Semester Capstone Project | Specialization: Data Analytics & Distributed Systems
**Location Focus**: Mumbai Metropolitan Region (BEST Electric Bus Network & Mumbai Metro Line 3 Aqua)

---

## 🌟 Project Overview
**TransitPulse** is a full-stack, enterprise-grade public transport monitoring and crowd analytics web platform built with **Java 17**, modern vanilla **CSS/JavaScript**, and **dual database architecture (JSON Local Mode & MySQL Workbench)**.

Designed specifically for an MCA 1st Semester academic submission, TransitPulse addresses urban commuting bottlenecks in Mumbai by combining:
1. **PulseAI Transit Copilot (Gemini 3.8 Flash)**: Live multimodal transit assistant with native English, Hindi, and Marathi commuter intelligence, live route synthesis, and zero-downtime resilient fallback.
2. **Dynamic Searchable Routing & Collision Protection**: Typeable inputs with instant autocomplete across 18+ Mumbai transit hubs, 1-click direction swap (`⇄`), and real-time collision detection preventing identical origin/destination errors.
3. **Live GPS & Telemetry Simulation**: Continuous vehicle motion along Mumbai road/railway paths on Leaflet maps, live ticking arrival timer, auto-advancing stops, and speech audio announcements (`🔊 Voice Alerts`).
4. **Dynamic Fleet Telemetry**: Live fluctuating speed (`km/h`), animated radial capacity load gauge, cabin AC climate, and battery state.
5. **Citizen Crowdsourcing**: Rapid crowd density and delay reporting with a real-time community feed stream.
6. **Operations Incident Dispatch**: Admin portal with automated consensus checking and alert broadcast.
7. **MSc Data Analytics Lab**: 24-hour diurnal commuter heatmap analysis, bottleneck rankings, and predictive scenario simulations.
8. **🎨 Dual Theme System**: Instant 1-click toggle between **Dark Slate Theme** and **Clean White / Light Theme**.
9. **🛡️ End-to-End Exception Handling & Input Validation**: Zero-crash resilience with custom exceptions (`BadRequestException`, `ResourceNotFoundException`, `DatabaseException`) and structured JSON error responses.

---

## 🖼️ Active Application Screens (Real-Time Commuter & AI System)

| # | Screen Name | Description & Key Features |
|---|---|---|
| **1** | **Route Planner & Commute Search** | Commute query card from Dadar/SNDT to Airport T2, preference pills (Fastest, Least Crowded, Pocket Friendly), detailed route alternatives, and interactive Leaflet Mumbai transit cartography in both Dark and Light themes. |
| **2** | **PulseAI Live Connect & Radar** | **✨ Real-Time Telemetry & AI Hub**: Live fluctuating vehicle telemetry (speed, circular SVG capacity gauge, climate, battery), approaching stop live countdown, **Interchange Connection Radar** (proactive transfer guard across BEST Bus, Metro Aqua Line 3, and Suburban Rail), and embedded **Gemini 3.8 Flash Copilot** for real-time commuter advisory. |
| **3** | **Journey Steps (Turn-by-Turn)** | Turn-by-turn detailed navigation timeline, platform recommendations, commuter tips, and route summary. |
| **4** | **Passenger Crowd & Delay Report** | Real-time crowdsourcing portal with 1-tap crowd selector, delay stepper, root cause tags, passenger notes, and live community feed stream. |

---

## 🛡️ Exception Handling & Resilience Architecture

The system implements comprehensive error prevention and handling across all tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Frontend                        │
│   • Input validation (delay limits, mandatory fields)       │
│   • Offline toast banners & network retry indicators        │
│   • User-friendly error messages                            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP Request
┌──────────────────────────────▼──────────────────────────────┐
│                  ApiController & Controllers                │
│   • BadRequestException (HTTP 400) on malformed inputs      │
│   • ResourceNotFoundException (HTTP 404) with suggestions   │
│   • Structured ErrorResponse JSON payload                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Repository & Data Tier                   │
│   • DatabaseException (HTTP 500)                            │
│   • Automatic fallback to JSON in-memory cache if MySQL     │
│     connection drops — Server NEVER crashes!                │
└─────────────────────────────────────────────────────────────┘
```

### Standard Error Response Format:
```json
{
  "error": "NOT_FOUND",
  "message": "Route with identifier [999] was not found.",
  "status": 404,
  "path": "/api/routes/999",
  "timestamp": "2026-10-12T10:48:42.502Z",
  "suggestions": [
    "Try Route 101 (Line C-101 Express)",
    "Try Route 202 (Metro Line 3)",
    "Try Route 303 (Shuttle A1)"
  ]
}
```

---

## 🚀 Quick Start Instructions

### A. Running on macOS (Instant Zero-Dependency Setup)
No MySQL installation required. Runs directly using pre-installed Java 17:
```bash
# 1. Open Terminal and navigate to the project directory
cd /path/to/adventurous-tesla

# 2. Run the 1-click launch script
./run.sh
```
*The script automatically compiles the Java backend, copies assets, starts the server at `http://localhost:8080/`, and opens your web browser.*

---

### B. Running on Windows (with MySQL Workbench)
For detailed instructions, refer to **[WINDOWS_SETUP_GUIDE.md](file:///Users/kapilsharma/Documents/antigravity/adventurous-tesla/WINDOWS_SETUP_GUIDE.md)**:

1. **Import Database Scripts in MySQL Workbench**:
   - Open `src/main/resources/schema.sql` → Execute ⚡
   - Open `src/main/resources/data.sql` → Execute ⚡
2. **Switch Mode in `application.properties`**:
   ```properties
   app.datasource.mode=mysql
   spring.datasource.password=your_mysql_password
   ```
3. **Double-Click `run.bat`**:
   - Compiles and starts the server with direct MySQL connection on `http://localhost:8080/`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/system/status` | Returns system health, current data source mode, and version. |
| `GET` | `/api/stops` | Returns all Mumbai transit nodes with GPS coordinates and landmarks. |
| `GET` | `/api/routes` | Returns transit routes with optional `?preference=fastest\|eco\|...` query. |
| `GET` | `/api/routes/{id}` | Returns single route details (returns 404 if not found). |
| `GET` | `/api/routes/{id}/stops` | Returns sequential stop progression for a given route. |
| `GET` | `/api/tracking` | Returns real-time IoT telemetry and timeline for vehicle (default EV #4092). |
| `GET` | `/api/vehicles` | Returns all 348 active fleet vehicles with occupancy and speeds. |
| `GET` | `/api/incidents` | Returns active operational incidents with passenger consensus data. |
| `POST` | `/api/incidents/report` | Submits citizen crowd & delay report with validation. |
| `POST` | `/api/incidents/{id}/verify` | Verifies incident and triggers network-wide broadcast alert. |
| `POST` | `/api/incidents/{id}/dismiss` | Dismisses incident from operations queue. |
| `GET` | `/api/reports` | Returns community crowdsource feedback stream. |
| `GET` | `/api/admin/kpis` | Returns the 4 top operational KPIs. |
| `GET` | `/api/analytics` | Returns 24-hr diurnal congestion curve and bottleneck rankings. |
| `POST` | `/api/analytics/simulate` | Runs ML predictive what-if scenario given buses, signal phase, and tariff. |
| `GET` | `/api/export` | Exports complete system data (routes, stops, incidents, telemetry) as JSON. |

---

## 📁 Directory Structure
```
adventurous-tesla/
├── pom.xml                               # Standard Maven Project Object Model
├── run.sh                                # 1-Click Launch Script for macOS
├── run.bat                               # 1-Click Launch Script for Windows
├── README.md                             # Project Documentation
├── WINDOWS_SETUP_GUIDE.md                # Step-by-Step MySQL Workbench Guide & Viva Q&A
├── src/
│   ├── main/
│   │   ├── java/com/transitpulse/
│   │   │   ├── TransitPulseApplication.java   # HTTP Server Bootstrap & Routing
│   │   │   ├── controller/                    # ApiController & StaticFileController
│   │   │   ├── exception/                     # ResourceNotFound, BadRequest, DatabaseException
│   │   │   ├── model/                         # Route, Stop, Vehicle, Incident, UserReport
│   │   │   ├── repository/                    # DataRepository, JsonDataRepo, MySqlDataRepo
│   │   │   ├── service/                       # RouteService, TrackingService, AnalyticsService
│   │   │   └── util/                          # Zero-dependency JsonUtils & ConfigUtils
│   │   └── resources/
│   │       ├── application.properties         # Configuration (Port, Database Mode Toggle)
│   │       ├── schema.sql                     # Complete 3NF MySQL Workbench DDL
│   │       ├── data.sql                       # Complete Mumbai MMR Seed Data DML
│   │       ├── data/                          # Seed JSON files (stops, routes, telemetry, etc.)
│   │       └── static/                        # Web UI Assets
│   │           ├── index.html                 # SPA (5 Screens + Theme Switcher + Code Modal)
│   │           ├── css/transitpulse.css       # Design System Tokens (Dark & Light Theme)
│   │           └── js/                        # app.js, api.js, map.js, charts.js
```
