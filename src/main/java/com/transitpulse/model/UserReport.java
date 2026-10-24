package com.transitpulse.model;

import java.util.List;

public class UserReport {
    private int reportId;
    private String routeNumber;
    private String stopName;
    private String crowdLevel;
    private int delayMinutes;
    private List<String> causes;
    private String comment;
    private String timestamp;
    private int upvotes;

    public UserReport() {}

    public UserReport(int reportId, String routeNumber, String stopName, String crowdLevel, int delayMinutes, List<String> causes, String comment, String timestamp, int upvotes) {
        this.reportId = reportId;
        this.routeNumber = routeNumber;
        this.stopName = stopName;
        this.crowdLevel = crowdLevel;
        this.delayMinutes = delayMinutes;
        this.causes = causes;
        this.comment = comment;
        this.timestamp = timestamp;
        this.upvotes = upvotes;
    }

    public int getReportId() { return reportId; }
    public void setReportId(int reportId) { this.reportId = reportId; }

    public String getRouteNumber() { return routeNumber; }
    public void setRouteNumber(String routeNumber) { this.routeNumber = routeNumber; }

    public String getStopName() { return stopName; }
    public void setStopName(String stopName) { this.stopName = stopName; }

    public String getCrowdLevel() { return crowdLevel; }
    public void setCrowdLevel(String crowdLevel) { this.crowdLevel = crowdLevel; }

    public int getDelayMinutes() { return delayMinutes; }
    public void setDelayMinutes(int delayMinutes) { this.delayMinutes = delayMinutes; }

    public List<String> getCauses() { return causes; }
    public void setCauses(List<String> causes) { this.causes = causes; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }
}
