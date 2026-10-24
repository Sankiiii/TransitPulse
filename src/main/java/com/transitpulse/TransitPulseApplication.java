package com.transitpulse;

import com.sun.net.httpserver.HttpServer;
import com.transitpulse.controller.ApiController;
import com.transitpulse.controller.StaticFileController;
import com.transitpulse.repository.RepositoryManager;
import com.transitpulse.util.ConfigUtils;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class TransitPulseApplication {

    public static void main(String[] args) {
        try {
            int port = ConfigUtils.getInt("server.port", 8080);
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            ApiController apiController = new ApiController();
            StaticFileController staticFileController = new StaticFileController();

            server.createContext("/api", apiController);
            server.createContext("/", staticFileController);

            server.setExecutor(Executors.newFixedThreadPool(16));
            server.start();

            String mode = ConfigUtils.getMode().toUpperCase();
            String repoInfo = RepositoryManager.getRepository().getDataSourceMode();

            System.out.println("========================================================================");
            System.out.println("    _______                 _ _   _____       _           ");
            System.out.println("   |__   __|               (_) | |  __ \\     | |          ");
            System.out.println("      | |_ __ __ _ _ __  ___ _| |_| |__) |   _| |___  ___ ");
            System.out.println("      | | '__/ _` | '_ \\/ __| | __|  ___/ | | | / __|/ _ \\");
            System.out.println("      | | | | (_| | | | \\__ \\ | |_| |   | |_| | \\__ \\  __/");
            System.out.println("      |_|_|  \\__,_|_| |_|___/_|\\__|_|    \\__,_|_|___/\\___|");
            System.out.println("========================================================================");
            System.out.println(" >> SMART PUBLIC TRANSPORT ROUTE & CROWD MANAGEMENT SYSTEM");
            System.out.println(" >> LOCATION: Mumbai Metropolitan Region (BEST Bus & Metro Line 3)");
            System.out.println(" >> SERVER ACTIVE AT: http://localhost:" + port + "/");
            System.out.println(" >> DATA SOURCE MODE: [" + mode + "] -> " + repoInfo);
            System.out.println("------------------------------------------------------------------------");
            System.out.println("  * Route Planner:       http://localhost:" + port + "/#planner");
            System.out.println("  * Live Tracking (EV):  http://localhost:" + port + "/#tracking");
            System.out.println("  * Passenger Reports:   http://localhost:" + port + "/#report");
            System.out.println("  * Fleet Ops & Admin:   http://localhost:" + port + "/#admin");
            System.out.println("  * MSc Analytics Lab:   http://localhost:" + port + "/#analytics");
            System.out.println("========================================================================");
            System.out.println("Press Ctrl+C to gracefully stop server.");

        } catch (Exception e) {
            System.err.println("Fatal: Failed to start TransitPulse application server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
