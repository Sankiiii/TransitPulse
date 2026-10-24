-- ==============================================================================
-- TransitPulse - Seed Data Script (MySQL 8.0+ / MySQL Workbench)
-- Populates 12 Mumbai Stations (SNDT Juhu, Ghatkopar, Andheri, Airport T2, etc.)
-- ==============================================================================

USE transitpulse_db;

-- ------------------------------------------------------------------------------
-- 1. STOPS SEED DATA (12 REAL MUMBAI LANDMARKS)
-- ------------------------------------------------------------------------------
INSERT INTO stops (stop_id, stop_name, city, latitude, longitude, stop_type, landmark, zone) VALUES
(1, 'SNDT University Juhu', 'Mumbai', 19.0988000, 72.8267000, 'TERMINAL', 'Juhu Tara Road / Santacruz West', 'Western Suburbs'),
(2, 'Andheri Railway Station', 'Mumbai', 19.1197000, 72.8464000, 'METRO_STATION', 'Platform 1 & Metro Line 1 Interchange', 'Western Corridor'),
(3, 'Airport International (CSMIA T2)', 'Mumbai', 19.0974000, 72.8745000, 'TERMINUS', 'Departures Level • Sahar Elevated Access', 'Airport Zone'),
(4, 'Ghatkopar Metro Station', 'Mumbai', 19.0864000, 72.9081000, 'METRO_STATION', 'Metro Line 1 / Central Railway Concourse', 'Eastern Suburbs'),
(5, 'Vivekanand College (VESIT)', 'Mumbai', 19.0463000, 72.8889000, 'BUS_STOP', 'Sindhi Society / Collector Colony, Chembur', 'Chembur East'),
(6, 'BARC (Trombay Hub)', 'Mumbai', 19.0182000, 72.9234000, 'TERMINAL', 'Bhabha Atomic Research Centre Gate 1', 'Trombay Corridor'),
(7, 'Siddhivinayak Mandir (Prabhadevi)', 'Mumbai', 19.0169000, 72.8303000, 'BUS_STOP', 'SK Bole Marg / Prabhadevi Junction', 'South-Central'),
(8, 'Mahalaxmi', 'Mumbai', 18.9827000, 72.8239000, 'BUS_STOP', 'Mahalaxmi Temple / Racecourse Concourse', 'South Mumbai'),
(9, 'Marine Lines', 'Mumbai', 18.9442000, 72.8242000, 'BUS_STOP', 'Queens Necklace / Marine Drive Walkway', 'South Mumbai'),
(10, 'CSMT Railway Station', 'Mumbai', 18.9401000, 72.8354000, 'TERMINUS', 'Chhatrapati Shivaji Maharaj Terminus', 'South Mumbai'),
(11, 'Vashi Railway Station', 'Navi Mumbai', 19.0644000, 72.9984000, 'TERMINAL', 'Sector 30A / Vashi Plaza Hub', 'Navi Mumbai Hub'),
(12, 'Juinagar Railway Station', 'Navi Mumbai', 19.0494000, 73.0186000, 'BUS_STOP', 'Sion-Panvel Highway Connector', 'Navi Mumbai Corridor');

-- ------------------------------------------------------------------------------
-- 2. ROUTES SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO routes (route_id, route_number, operator, transport_type, is_recommended, is_disrupted, disruption_tag, fare, fare_formatted, duration_mins, departs_in_mins, departure_clock, platform, stop_count, transfers, transfer_text, crowd_level, crowd_text, crowd_badge_class, status, status_text, co2_saved_kg, reliability_pct, active_vehicle, description) VALUES
(101, 'Line C-101 AC Express', 'BEST Electric Transit', 'BUS', TRUE, FALSE, NULL, 20.00, '₹20 Fare', 26, 4, '14:38', 'Juhu Tara Bay 1', 5, 0, 'Direct (Zero Transfer)', 'LOW', 'Seats Open', 'emerald', 'ON_TIME', 'On Time', 3.40, 99.40, 'Tata Starbus EV #4092', 'Direct AC Electric route from SNDT Juhu to CSMIA Airport T2 via Sahar corridor'),
(202, 'Metro Line 1 + Aqua 3', 'MMRCL & Metro One', 'METRO', FALSE, FALSE, NULL, 30.00, '₹30 Fare', 22, 3, '14:41', 'Platform 1 Elevated', 6, 0, 'Direct Metro Line 1', 'MEDIUM', 'Standing Room', 'amber', 'ON_TIME', 'On Time', 4.10, 98.20, 'Metro Consist #T-108', 'High-frequency metro connecting Ghatkopar Metro to Andheri Railway Station'),
(303, 'Harbour Fast Express', 'Central Railway', 'SHUTTLE', FALSE, FALSE, NULL, 15.00, '₹15 Fare', 38, 7, '14:45', 'Platform 3 Fast', 8, 0, 'Direct Fast Suburban', 'PACKED', 'Crowded', 'rose', 'DELAYED', '+4m signal wait', 5.20, 92.50, 'Suburban Fast EMU #3210', 'Express suburban train connecting Vashi and Juinagar to CSMT Terminus'),
(404, 'Route 355 AC Feeder', 'BEST Electric', 'BUS', TRUE, FALSE, NULL, 15.00, '₹15 Fare', 18, 6, '14:44', 'Collector Colony Bay', 4, 0, 'Direct Feeder', 'LOW', 'Seats Open', 'emerald', 'ON_TIME', 'On Time', 2.60, 97.80, 'Ashok Leyland EV #1104', 'Direct feeder connecting Vivekanand College (Chembur) to BARC Trombay'),
(505, 'Western AC Suburban', 'Western Railway', 'BUS', FALSE, FALSE, NULL, 20.00, '₹20 Fare', 19, 5, '14:43', 'Platform 2 North', 5, 0, 'Direct Western Line', 'MEDIUM', 'Standing Room', 'amber', 'ON_TIME', 'On Time', 3.80, 96.50, 'Medha AC EMU #702', 'Fast AC transit connecting Marine Lines and Mahalaxmi to Siddhivinayak');

-- ------------------------------------------------------------------------------
-- 3. ROUTE_STOPS SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO route_stops (route_id, sequence, stop_id, stop_name, subtext, scheduled_time, actual_time, status, status_tag, is_next, is_terminus, delay_delta, subway_connection) VALUES
(101, 1, 1, 'SNDT University Juhu', 'Campus Gate 1 • Juhu Tara Rd Terminal', '14:35', '14:35', 'DEPARTED', 'Departed', FALSE, FALSE, '+0m', NULL),
(101, 2, 2, 'Juhu Circle / Tara Road', 'Opposite Juhu Beach Link', '14:41', '14:41', 'DEPARTED', 'Departed', FALSE, FALSE, '+0m', NULL),
(101, 3, 3, 'Vile Parle Station West', 'Suburban Railway Interchange Walkway', '14:48', '14:48', 'APPROACHING', 'Arriving in 3m', TRUE, FALSE, '+0m', 'Western Suburban Line connection'),
(101, 4, 4, 'Sahar Elevated Connector', 'Direct Express Flyover Corridor', '14:56', '14:57', 'UPCOMING', '+1m', FALSE, FALSE, '+1m', NULL),
(101, 5, 5, 'Airport International (CSMIA T2)', 'Departures Level • Direct Skybridge Gate 1-40', '15:04', '15:04', 'TERMINUS', 'Terminus', FALSE, TRUE, '+0m', NULL);

-- ------------------------------------------------------------------------------
-- 4. VEHICLES SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO vehicles (vehicle_id, vehicle_number, route_number, vehicle_type, model, current_speed_kmh, heading_degrees, heading_direction, capacity_max, capacity_current, occupancy_pct, occupancy_tier, occupancy_label, climate_celsius, accessibility_status, connectivity, odometer_km, battery_state_pct, operator_name, driver_name, latitude, longitude, corridor_status) VALUES
(4092, 'MH-01-CV-4092', 'Line C-101 AC Express', 'BUS', 'Tata Starbus EV Ultra-Low Emission (BEST)', 38.5, 142, 'SE', 80, 45, 56, 'MODERATE', 'Seats Open (56% Occupancy)', 21.0, 'Low-floor Automated Ramp', '5G IoT Active', 114.2, 88, 'BEST Electric Transit', 'Marcus Vance', 19.0988000, 72.8267000, 'Corridor Flow: Clear (Sahar Elevated Expressway)'),
(108, 'M1-METRO-108', 'Metro Line 1 + Aqua 3', 'METRO', 'Alstom Metropolis 4-Car Consist', 52.0, 75, 'ENE', 1100, 680, 62, 'MODERATE', 'Standing Room (62% Occupancy)', 20.5, 'Step-free automated platform doors', 'CBTC Signaling Dedicated Link', 340.5, 96, 'MMRCL & Metro One', 'Attendant Priya Rao', 19.0864000, 72.9081000, 'Flow: Normal Schedule (Ghatkopar Concourse Clear)'),
(3210, 'CR-EMU-3210', 'Harbour Fast Express', 'SHUTTLE', 'Bombardier 12-Car Fast EMU', 65.0, 220, 'SW', 2400, 2150, 89, 'PACKED', 'Crowded (89% Occupancy)', 24.0, 'Standard Suburban Coaches', 'Central Railway Telemetry', 620.0, 100, 'Central Railway', 'Suresh Sawant', 19.0644000, 72.9984000, 'Corridor: +4m signal hold at Kurla Junction');

-- ------------------------------------------------------------------------------
-- 5. INCIDENTS SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO incidents (incident_id, vehicle_id, route_number, severity, status, reported_ago, passenger_consensus, headline, crowd_density, congestion_spike_speed, assigned_driver, location, verified) VALUES
(1, 4092, 'Line C-101 AC Express', 'CRITICAL', 'UNVERIFIED', '1m ago', '94% Consensus', 'Traffic Slowdown (+8m) near Sahar Airport Ramp', 'Moderate Occupancy', '12 km/h (Slow moving)', 'Marcus Vance', 'Sahar Elevated Road', FALSE),
(2, 108, 'Metro Line 1 + Aqua 3', 'HARDWARE_AUTO', 'UNVERIFIED', '4m ago', 'Automated Sensor Sync', 'Platform Gate Delay (+2m at Saki Naka)', 'Normal Platform Flow', 'Holding 2 mins', 'Priya Rao', 'Saki Naka Concourse', FALSE);

-- ------------------------------------------------------------------------------
-- 6. USER_REPORTS SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO user_reports (report_id, route_number, stop_name, crowd_level, delay_minutes, causes, comment, upvotes) VALUES
(1, 'Line C-101 AC Express', 'SNDT University Juhu', 'Low', 0, 'Clear Flow', 'Bus arrived right on time at Juhu campus stop', 5),
(2, 'Metro Line 1', 'Ghatkopar Metro Station', 'Moderate', 2, 'Crowd Boarding', 'Smooth boarding at platform 1', 3);

-- ------------------------------------------------------------------------------
-- 7. ANALYTICS_HOURLY SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO analytics_hourly (hour_of_day, load_passengers_k, avg_delay_min, congestion_tier) VALUES
('06', 42, 1.80, 'MODERATE'),
('07', 78, 3.40, 'MODERATE'),
('08', 145, 8.20, 'RUSH_CRITICAL'),
('09', 162, 9.10, 'RUSH_CRITICAL'),
('10', 120, 6.50, 'RUSH_CRITICAL'),
('11', 65, 2.80, 'MODERATE'),
('12', 54, 2.00, 'LOW'),
('13', 48, 1.60, 'LOW'),
('14', 52, 1.90, 'LOW'),
('15', 68, 3.10, 'MODERATE'),
('16', 92, 5.20, 'MODERATE'),
('17', 155, 8.40, 'RUSH_CRITICAL'),
('18', 172, 9.50, 'RUSH_CRITICAL'),
('19', 138, 7.50, 'RUSH_CRITICAL'),
('20', 82, 4.00, 'MODERATE'),
('21', 55, 2.40, 'LOW');

-- ------------------------------------------------------------------------------
-- 8. BOTTLENECKS SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO bottlenecks (rank_no, route_name, avg_delay_str, reliability_index, reliability_label, primary_cause, reports_count, status_label, status_class) VALUES
('#1', 'Line C-101 (SNDT Juhu ↔ Airport T2)', '4.8 mins', '88.2%', 'Good', 'Airport Approach Traffic', 420, 'Active Flow', 'emerald'),
('#2', 'Metro Line 1 (Ghatkopar ↔ Andheri)', '2.5 mins', '96.1%', 'High', 'Peak Dwell Time', 290, 'Healthy', 'blue'),
('#3', 'Harbour Fast (Vashi ↔ CSMT)', '6.2 mins', '84.5%', 'Acceptable', 'Kurla Junction Signal', 510, 'Monitored', 'amber');
