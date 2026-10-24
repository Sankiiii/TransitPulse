package com.transitpulse.repository;

import com.transitpulse.util.ConfigUtils;

public class RepositoryManager {
    private static DataRepository instance;

    public static synchronized DataRepository getRepository() {
        if (instance == null) {
            String mode = ConfigUtils.getMode();
            if ("mysql".equalsIgnoreCase(mode)) {
                System.out.println("Initializing Data Repository: MYSQL WORKBENCH MODE");
                instance = new MySqlDataRepository();
            } else {
                System.out.println("Initializing Data Repository: LOCAL JSON SEED MODE");
                instance = new JsonDataRepository();
            }
        }
        return instance;
    }

    public static synchronized void setRepository(DataRepository customRepo) {
        instance = customRepo;
    }
}
