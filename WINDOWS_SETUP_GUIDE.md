# 🚆 TransitPulse — Windows & MySQL Workbench Setup Guide
**Smart Public Transport Route & Crowd Management System**  
*MCA 1st Semester Project — Mumbai Metropolitan Region (BEST & Metro Line 3)*

---

## 📌 Executive Summary
This guide is tailored specifically for running **TransitPulse** on a **Windows 10/11 laptop** with **MySQL Workbench**.

By default, the project runs in **JSON mode** (no MySQL required). When you are ready to connect it to **MySQL Workbench**, you only need to run two SQL scripts and change **one line** in `application.properties`.

---

## 🛠️ Step 1: Prerequisites
Ensure the following are installed on your Windows laptop:
1. **Java Development Kit (JDK 17 or higher)**
   - Check by opening Command Prompt (`cmd`) and typing:
     ```cmd
     javac -version
     java -version
     ```
   - If not installed, download free **OpenJDK 17** (Temurin/Adoptium or Oracle JDK).
2. **MySQL Server & MySQL Workbench** (Version 8.0 or higher).
3. *(Optional)* **IntelliJ IDEA**, **Eclipse**, or **VS Code** (if you want to open the code in an IDE).

---

## 🗄️ Step 2: Set Up the Database in MySQL Workbench

You will find two pre-written SQL scripts in `src/main/resources/`:
- `schema.sql` — Creates the database `transitpulse_db` and all 8 relational tables with constraints and indexes.
- `data.sql` — Seeds realistic Mumbai transport data (Line C-101 Express, Metro Line 3 Aqua, stops, live vehicle telemetry, and historical analytics).

### How to Execute in MySQL Workbench:
1. Open **MySQL Workbench** and connect to your local MySQL instance (usually `localhost:3306`).
2. Go to **File → Open SQL Script...** (or press `Ctrl + Shift + O`).
3. Select `src/main/resources/schema.sql` and click **Open**.
4. Click the **⚡ Execute (Lightning Bolt)** button.
   - *Result*: The `transitpulse_db` schema is created with all tables (`stops`, `routes`, `route_stops`, `vehicles`, `incidents`, `user_reports`, `analytics_hourly`, `bottlenecks`).
5. Now open `src/main/resources/data.sql` via **File → Open SQL Script...**.
6. Click the **⚡ Execute (Lightning Bolt)** button.
   - *Result*: All Mumbai routes, vehicles, stops, incidents, and diurnal hourly analytics are populated.
7. In the left **Schemas** pane, right-click and select **Refresh All**. You will see `transitpulse_db` with all tables populated!

---

## ⚙️ Step 3: Switch the App to MySQL Mode

Open `src/main/resources/application.properties` in Notepad or any code editor:

```properties
# Change this line from 'json' to 'mysql':
app.datasource.mode=mysql

# Verify your MySQL password matches your local MySQL root password:
spring.datasource.url=jdbc:mysql://localhost:3306/transitpulse_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=root123    <-- Change to your MySQL password if different
```

Save the file.

---

## 🚀 Step 4: Run the Application (1-Click)

### Method A: The 1-Click Batch File (Simplest)
1. Double-click **`run.bat`** in the project root folder.
2. The script will automatically:
   - Compile all Java files with `javac`.
   - Copy all configuration and web static assets.
   - Launch your default web browser to `http://localhost:8080/`.
   - Start the TransitPulse server with live console output.

### Method B: Via VS Code (Visual Studio Code)
1. Open **VS Code**.
2. Click **File → Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Select the extracted project root folder (the folder containing `pom.xml`, `run.bat`, and `src`).
4. Open the integrated terminal in VS Code:
   - Press **`Ctrl + \``** (Ctrl + Backtick) or click **Terminal → New Terminal** at the top.
5. In the terminal, simply run:
   ```cmd
   .\run.bat
   ```
6. Press Enter! The project compiles, starts the server, and automatically opens `http://localhost:8080/` in her browser.
   *(Alternatively, if she has the "Extension Pack for Java" installed in VS Code, she can simply open `src/main/java/com/transitpulse/TransitPulseApplication.java` and click the **▶ Run** button above `main`).*

### Method C: Via IntelliJ IDEA or Eclipse (Maven)
1. Open IntelliJ IDEA or Eclipse.
2. Select **File → Open...** and select the project root folder (containing `pom.xml`).
3. IntelliJ will automatically recognize it as a standard Maven Java project and download `mysql-connector-j`.
4. Right-click `src/main/java/com/transitpulse/TransitPulseApplication.java` and click **Run**.
5. Open your browser and go to: `http://localhost:8080/`.

---

## 🔍 Step 5: How to Verify Everything Works
Once the web app opens:
1. **Notice the Footer Badge**:
   - In the sidebar footer, check that the badge says **`● MySQL Workbench DB`** (in blue).
2. **Test Route Planner (Screen 1)**:
   - Check the 3 alternative routes from Dadar to Airport T2.
   - Explore the interactive SVG transit map.
3. **Test Live Tracking (Screen 2)**:
   - Inspect Tata Starbus EV #4092, the live capacity ring (45/80), and the ticking arrival countdown.
4. **Test Passenger Report (Screen 3)**:
   - Submit a test crowd or delay report.
   - Check that it appears in the live community feed instantly.
   - Open MySQL Workbench and run `SELECT * FROM user_reports;` — your report is saved in MySQL!
5. **Test Fleet Admin Queue (Screen 4)**:
   - Click **"Verify & Alert"** on an unverified incident.
   - Watch the top emergency broadcast marquee trigger immediately!
6. **Test MSc Analytics Lab (Screen 5)**:
   - View the 24-Hour Diurnal Heatmap with Mumbai morning/evening rush hours.
   - Move the sliders under the ML Simulation card and click **"Run ML Scenario Simulation"**.

---

## 🎓 College Viva Defense — Key Questions & Answers

### Q1: What design pattern did you use for the dual database functionality?
> **Answer**: We implemented the **Repository Pattern** (`DataRepository` interface) with two concrete implementations: `JsonDataRepository` and `MySqlDataRepository`. The `RepositoryManager` factory selects the active repository at startup based on the `app.datasource.mode` flag in `application.properties`. This allows offline testing on macOS using JSON, while enabling seamless migration to MySQL Workbench on Windows without changing a single line of business logic.

### Q2: How did you model the transit network in MySQL?
> **Answer**: We implemented a 3NF relational schema:
> - `stops`: Spatial nodes with GPS coordinates (`latitude`, `longitude`), landmark, and zone.
> - `routes`: Transit lines with fares, transport types, and operational metrics.
> - `route_stops`: Weak entity linking routes and stops with a composite primary key `(route_id, sequence)` to represent the sequential timeline progression.
> - `vehicles`: Real-time IoT telemetry table recording speed, heading, capacity, and cabin climate.
> - `user_reports` & `incidents`: Citizen crowdsourcing and dispatch verification queues.
> - `analytics_hourly`: Diurnal traffic distribution capturing time-series congestion patterns.

### Q3: What is the Diurnal Ridership Curve shown in Screen 5?
> **Answer**: In urban transportation analytics, a diurnal curve models the 24-hour cycle of passenger volume. In Mumbai, our data models the characteristic bi-modal distribution: the morning peak (8:30–10:30 AM) driven by office commuters traveling into BKC and South Mumbai, and the evening peak (5:30–8:00 PM) return flow, with occupancy reaching 94% and delays spiking to 9.8 minutes.

### Q4: How does the ML What-If simulation work?
> **Answer**: The simulation implements a predictive regression model that estimates changes in average corridor delay and on-time performance based on operational interventions:
> 1. Injecting standby electric buses to dissolve headway deficits.
> 2. Extending green signal timing at critical junctions like BKC to eliminate intersection queue backlogs.
> 3. Dynamic off-peak fare incentives to flatten the super-peak demand curve.
