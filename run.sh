#!/bin/bash
# ==============================================================================
# SmartPublic Transport - 1-Click Launch Script for macOS
# Smart Public Transport Route & Crowd Management System (Mumbai MMR)
# Zero-dependency execution using Java 17
# ==============================================================================

echo "========================================================================"
echo "    SmartPublic Transport: Mumbai Smart Public Transit Platform"
echo "    Target Region: Mumbai Metropolitan Region (BEST, Metro & Suburban)"
echo "========================================================================"

# Check Java installation
if ! command -v javac &> /dev/null || ! command -v java &> /dev/null; then
    echo "Error: Java 17 (JDK) is required to run this project."
    echo "Please install OpenJDK 17 or ensure javac and java are in your PATH."
    exit 1
fi

echo "[1/3] Compiling Java backend classes..."
mkdir -p bin
javac -d bin $(find src/main/java -name "*.java")

if [ $? -ne 0 ]; then
    echo "Compilation failed. Please inspect the error messages above."
    exit 1
fi

echo "[2/3] Synchronizing resource files (JSON datasets & web static assets)..."
cp -r src/main/resources/* bin/

echo "[3/3] Starting TransitPulse Application Server on http://localhost:8080/ ..."
echo "------------------------------------------------------------------------"

# Open browser automatically after 1.5 seconds in background
(sleep 2 && open "http://localhost:8080/") &

# Launch Server
java -cp bin com.transitpulse.TransitPulseApplication
