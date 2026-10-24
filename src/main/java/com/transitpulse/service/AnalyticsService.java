package com.transitpulse.service;

import com.transitpulse.repository.DataRepository;
import com.transitpulse.repository.RepositoryManager;

import java.util.Map;

public class AnalyticsService {
    private final DataRepository repository;

    public AnalyticsService() {
        this.repository = RepositoryManager.getRepository();
    }

    public Map<String, Object> getHistoricalAnalytics() {
        return repository.getAnalytics();
    }

    public Map<String, Object> runWhatIfSimulation(int standbyBuses, int signalSeconds, boolean offPeakFare) {
        return repository.runSimulation(standbyBuses, signalSeconds, offPeakFare);
    }
}
