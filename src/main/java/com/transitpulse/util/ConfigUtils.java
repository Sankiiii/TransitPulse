package com.transitpulse.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

public class ConfigUtils {
    private static final Properties props = new Properties();

    static {
        // Default properties
        props.setProperty("server.port", "8080");
        props.setProperty("app.datasource.mode", "json");
        props.setProperty("spring.datasource.url", "jdbc:mysql://localhost:3306/transitpulse_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        props.setProperty("spring.datasource.username", "root");
        props.setProperty("spring.datasource.password", "root123");
        props.setProperty("spring.datasource.driver-class-name", "com.mysql.cj.jdbc.Driver");

        // Try loading from classpath or file
        try {
            File propFile = new File("src/main/resources/application.properties");
            if (propFile.exists()) {
                try (InputStream is = new FileInputStream(propFile)) {
                    props.load(is);
                }
            } else {
                InputStream is = ConfigUtils.class.getClassLoader().getResourceAsStream("application.properties");
                if (is != null) {
                    props.load(is);
                    is.close();
                }
            }
        } catch (Exception e) {
            System.err.println("Note: Using default configuration: " + e.getMessage());
        }
    }

    public static String get(String key, String defaultValue) {
        return props.getProperty(key, defaultValue);
    }

    public static int getInt(String key, int defaultValue) {
        String val = props.getProperty(key);
        if (val == null) return defaultValue;
        try {
            return Integer.parseInt(val.trim());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public static String getMode() {
        return get("app.datasource.mode", "json").trim().toLowerCase();
    }
}
