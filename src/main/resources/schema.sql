-- ==============================================================================
-- TransitPulse - Smart Public Transport Route & Crowd Management System
-- Database Schema Definition (MySQL 8.0+ / MySQL Workbench)
-- Designed for MCA Project - Data Analytics & Distributed Systems
-- Target Region: Mumbai Metropolitan Region (BEST Bus & Metro Line 3 Aqua)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS transitpulse_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE transitpulse_db;

-- ------------------------------------------------------------------------------
-- Clean up existing tables safely
-- ------------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bottlenecks;
DROP TABLE IF EXISTS analytics_hourly;
DROP TABLE IF EXISTS user_reports;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS route_stops;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS stops;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- Table 1: STOPS (Transit nodes, bus terminals, and underground metro concourses)
-- ------------------------------------------------------------------------------
CREATE TABLE stops (
    stop_id INT AUTO_INCREMENT PRIMARY KEY,
    stop_name VARCHAR(150) NOT NULL,
    city VARCHAR(80) NOT NULL DEFAULT 'Mumbai',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    stop_type ENUM('TERMINAL', 'BUS_STOP', 'METRO_STATION', 'TERMINUS') NOT NULL,
    landmark VARCHAR(200),
    zone VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stops_city_zone (city, zone),
    INDEX idx_stops_coords (latitude, longitude)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- Table 2: ROUTES (Transit services, lines, fares, and carbon metrics)
-- ------------------------------------------------------------------------------
CREATE TABLE routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    route_number VARCHAR(80) NOT NULL,
    operator VARCHAR(100) NOT NULL,
    transport_type ENUM('BUS', 'METRO', 'METRO_BUS', 'SHUTTLE') NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE,
    is_disrupted BOOLEAN DEFAULT FALSE,
    disruption_tag VARCHAR(50),
    fare DECIMAL(6, 2) NOT NULL,
    fare_formatted VARCHAR(30) NOT NULL,
    duration_mins INT NOT NULL,
    departs_in_mins INT NOT NULL,
    departure_clock VARCHAR(20) NOT NULL,
    platform VARCHAR(80),
    stop_count INT NOT NULL,
    transfers INT NOT NULL DEFAULT 0,
    transfer_text VARCHAR(120),
    crowd_level ENUM('LOW', 'MEDIUM', 'HIGH', 'PACKED') NOT NULL,
    crowd_text VARCHAR(100),
    crowd_badge_class VARCHAR(40),
    status VARCHAR(50) NOT NULL DEFAULT 'ON_TIME',
    status_text VARCHAR(120),
    co2_saved_kg DECIMAL(5, 2) DEFAULT 0.00,
    reliability_pct DECIMAL(5, 2) DEFAULT 95.00,
    active_vehicle VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_routes_status (status),
    INDEX idx_routes_type (transport_type)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- Table 3: ROUTE_STOPS (Waypoints and timeline progression per route)
-- ------------------------------------------------------------------------------
CREATE TABLE route_stops (
    route_id INT NOT NULL,
    sequence INT NOT NULL,
    stop_id INT NOT NULL,
    stop_name VARCHAR(150) NOT NULL,
    subtext VARCHAR(255),
    scheduled_time VARCHAR(20) NOT NULL,
    actual_time VARCHAR(20),
    status VARCHAR(50) NOT NULL,
    status_tag VARCHAR(80),
    is_next BOOLEAN DEFAULT FALSE,
    is_terminus BOOLEAN DEFAULT FALSE,
    delay_delta VARCHAR(20) DEFAULT '+0m',
    subway_connection VARCHAR(200),
    PRIMARY KEY (route_id, sequence),
    CONSTRAINT fk_routestops_route FOREIGN KEY (route_id) REFERENCES routes (route_id) ON DELETE CASCADE,
    CONSTRAINT fk_routestops_stop FOREIGN KEY (stop_id) REFERENCES stops (stop_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- Table 4: VEHICLES (Live active fleet telemetry, IoT sensors, capacity)
-- ------------------------------------------------------------------------------
CREATE TABLE vehicles (
    vehicle_id INT PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    route_number VARCHAR(80) NOT NULL,
    vehicle_type ENUM('BUS', 'METRO', 'SHUTTLE') NOT NULL,
    model VARCHAR(150) NOT NULL,
    current_speed_kmh DECIMAL(5, 2) NOT NULL DEFAULT 0.0,
    heading_degrees INT NOT NULL DEFAULT 0,
    heading_direction VARCHAR(10) NOT NULL DEFAULT 'N',
    capacity_max INT NOT NULL,
    capacity_current INT NOT NULL,
    occupancy_pct INT NOT NULL,
    occupancy_tier VARCHAR(40) NOT NULL,
    occupancy_label VARCHAR(100),
    climate_celsius DECIMAL(4, 1) DEFAULT 21.0,
    accessibility_status VARCHAR(100),
    connectivity VARCHAR(80),
    odometer_km DECIMAL(8, 2) DEFAULT 0.0,
    battery_state_pct INT DEFAULT 100,
    operator_name VARCHAR(120),
    driver_name VARCHAR(120),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    corridor_status VARCHAR(255),
    last_telemetry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vehicles_coords (latitude, longitude)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- Table 5: INCIDENTS (Fleet operations queue, verified/unverified chokepoints)
-- ------------------------------------------------------------------------------
CREATE TABLE incidents (
    incident_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    route_number VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED',
    reported_ago VARCHAR(50),
    passenger_consensus VARCHAR(120),
    headline VARCHAR(255) NOT NULL,
    crowd_density VARCHAR(150),
    congestion_spike_speed VARCHAR(150),
    assigned_driver VARCHAR(100),
    location VARCHAR(150) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_incidents_status (status),
    INDEX idx_incidents_verified (verified)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- Table 6: USER_REPORTS (Citizen crowdsourced crowd & delay submissions)
-- ------------------------------------------------------------------------------
CREATE TABLE user_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    route_number VARCHAR(100) NOT NULL,
    stop_name VARCHAR(150) NOT NULL,
    crowd_level VARCHAR(50) NOT NULL,
    delay_minutes INT NOT NULL DEFAULT 0,
    causes VARCHAR(255),
    comment TEXT,
    reported_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upvotes INT DEFAULT 1,
    INDEX idx_reports_route (route_number)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- Table 7: ANALYTICS_HOURLY (24-hour diurnal commuter curve for Data Analytics)
-- ------------------------------------------------------------------------------
CREATE TABLE analytics_hourly (
    hour_of_day VARCHAR(5) PRIMARY KEY,
    load_passengers_k INT NOT NULL,
    avg_delay_min DECIMAL(4, 2) NOT NULL,
    congestion_tier VARCHAR(40) NOT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- Table 8: BOTTLENECKS (Network corridor bottleneck ranking & actions)
-- ------------------------------------------------------------------------------
CREATE TABLE bottlenecks (
    rank_no VARCHAR(10) PRIMARY KEY,
    route_name VARCHAR(150) NOT NULL,
    avg_delay_str VARCHAR(50) NOT NULL,
    reliability_index VARCHAR(20) NOT NULL,
    reliability_label VARCHAR(40) NOT NULL,
    primary_cause VARCHAR(100) NOT NULL,
    reports_count INT NOT NULL,
    status_label VARCHAR(60) NOT NULL,
    status_class VARCHAR(30) NOT NULL
) ENGINE=InnoDB;
