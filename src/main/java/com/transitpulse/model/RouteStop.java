package com.transitpulse.model;

public class RouteStop {
    private int routeId;
    private int sequence;
    private int stopId;
    private String stopName;
    private String subtext;
    private String scheduledTime;
    private String actualTime;
    private String status;
    private String statusTag;
    private boolean isNext;
    private boolean isTerminus;
    private String delayDelta;
    private String subwayConnection;

    public RouteStop() {}

    public int getRouteId() { return routeId; }
    public void setRouteId(int routeId) { this.routeId = routeId; }

    public int getSequence() { return sequence; }
    public void setSequence(int sequence) { this.sequence = sequence; }

    public int getStopId() { return stopId; }
    public void setStopId(int stopId) { this.stopId = stopId; }

    public String getStopName() { return stopName; }
    public void setStopName(String stopName) { this.stopName = stopName; }

    public String getSubtext() { return subtext; }
    public void setSubtext(String subtext) { this.subtext = subtext; }

    public String getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(String scheduledTime) { this.scheduledTime = scheduledTime; }

    public String getActualTime() { return actualTime; }
    public void setActualTime(String actualTime) { this.actualTime = actualTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStatusTag() { return statusTag; }
    public void setStatusTag(String statusTag) { this.statusTag = statusTag; }

    public boolean isNext() { return isNext; }
    public void setNext(boolean next) { isNext = next; }

    public boolean isTerminus() { return isTerminus; }
    public void setTerminus(boolean terminus) { isTerminus = terminus; }

    public String getDelayDelta() { return delayDelta; }
    public void setDelayDelta(String delayDelta) { this.delayDelta = delayDelta; }

    public String getSubwayConnection() { return subwayConnection; }
    public void setSubwayConnection(String subwayConnection) { this.subwayConnection = subwayConnection; }
}
