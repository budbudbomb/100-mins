/**
 * SLA Engine — 100-Minute Complaint Resolution Timer
 * 
 * Configurable milestone thresholds within the 100-minute window.
 * Returns elapsed/remaining time and breach flags per milestone.
 */

// Default SLA configuration (all values in minutes)
export const DEFAULT_SLA_CONFIG = {
  totalSLA: 100, // Total SLA window in minutes
  milestones: {
    reviewedWithin: 15,       // Complaint reviewed within 15 min
    alertAcknowledgedWithin: 25, // Squad acknowledges alert within 25 min
    squadDepartedWithin: 35,  // Squad departs within 35 min
    squadArrivedWithin: 60,   // Squad arrives within 60 min
    firstActionWithin: 100,   // First action within 100 min (the guarantee)
  },
};

/**
 * Get current SLA status for a complaint
 * @param {Object} complaint - The complaint object with timestamps
 * @param {Object} config - SLA configuration (defaults to DEFAULT_SLA_CONFIG)
 * @returns {Object} SLA status object
 */
export function getSLAStatus(complaint, config = DEFAULT_SLA_CONFIG) {
  const submissionTime = new Date(complaint.timestamps?.submissionTime);
  if (isNaN(submissionTime.getTime())) {
    return { error: 'No submission time', totalElapsed: 0, totalRemaining: config.totalSLA };
  }

  const now = new Date();
  const elapsedMs = now - submissionTime;
  const elapsedMinutes = elapsedMs / (1000 * 60);
  const remainingMinutes = Math.max(0, config.totalSLA - elapsedMinutes);
  const progressPercent = Math.min(100, (elapsedMinutes / config.totalSLA) * 100);

  // Check milestone breaches
  const milestoneStatus = {};
  const { milestones } = config;

  // Reviewed milestone
  milestoneStatus.reviewed = getMilestoneStatus(
    complaint.timestamps?.submissionTime,
    complaint.timestamps?.reviewTime,
    milestones.reviewedWithin
  );

  // Alert acknowledged milestone
  milestoneStatus.alertAcknowledged = getMilestoneStatus(
    complaint.timestamps?.submissionTime,
    complaint.timestamps?.alertDispatchTime,
    milestones.alertAcknowledgedWithin
  );

  // Squad departed milestone
  milestoneStatus.squadDeparted = getMilestoneStatus(
    complaint.timestamps?.submissionTime,
    complaint.timestamps?.squadDepartureTime,
    milestones.squadDepartedWithin
  );

  // Squad arrived milestone (use arrivalTime if available, otherwise approximate)
  milestoneStatus.squadArrived = getMilestoneStatus(
    complaint.timestamps?.submissionTime,
    complaint.timestamps?.arrivalTime,
    milestones.squadArrivedWithin
  );

  // First action milestone
  milestoneStatus.firstAction = getMilestoneStatus(
    complaint.timestamps?.submissionTime,
    complaint.timestamps?.actionTime,
    milestones.firstActionWithin
  );

  // Overall breach
  const isBreached = elapsedMinutes > config.totalSLA && !complaint.timestamps?.actionTime;
  const urgencyLevel = getUrgencyLevel(remainingMinutes, config.totalSLA);

  return {
    totalElapsed: Math.round(elapsedMinutes * 10) / 10,
    totalRemaining: Math.round(remainingMinutes * 10) / 10,
    progressPercent: Math.round(progressPercent * 10) / 10,
    isBreached,
    urgencyLevel,
    milestoneStatus,
    config,
  };
}

/**
 * Get status for a single milestone
 */
function getMilestoneStatus(submissionTimeStr, completionTimeStr, thresholdMinutes) {
  const submissionTime = new Date(submissionTimeStr);
  if (isNaN(submissionTime.getTime())) {
    return { status: 'unknown', elapsed: null, threshold: thresholdMinutes };
  }

  const now = new Date();

  if (completionTimeStr) {
    // Milestone was completed
    const completionTime = new Date(completionTimeStr);
    const elapsed = (completionTime - submissionTime) / (1000 * 60);
    const breached = elapsed > thresholdMinutes;
    return {
      status: breached ? 'breached_completed' : 'completed',
      elapsed: Math.round(elapsed * 10) / 10,
      threshold: thresholdMinutes,
      breached,
    };
  }

  // Milestone not yet completed
  const elapsed = (now - submissionTime) / (1000 * 60);
  const breached = elapsed > thresholdMinutes;
  return {
    status: breached ? 'breached' : 'pending',
    elapsed: Math.round(elapsed * 10) / 10,
    threshold: thresholdMinutes,
    breached,
  };
}

/**
 * Determine urgency level based on remaining time
 */
export function getUrgencyLevel(remainingMinutes, totalSLA) {
  const pctRemaining = (remainingMinutes / totalSLA) * 100;

  if (remainingMinutes <= 0) return 'critical';     // SLA breached
  if (pctRemaining <= 10) return 'critical';         // <10 min
  if (pctRemaining <= 25) return 'high';             // <25 min
  if (pctRemaining <= 50) return 'medium';           // <50 min
  return 'low';                                       // >50 min
}

/**
 * Get the CSS color variable name for an urgency level
 */
export function getUrgencyColor(level) {
  const colors = {
    low: 'var(--sla-green)',
    medium: 'var(--sla-yellow)',
    high: 'var(--sla-orange)',
    critical: 'var(--sla-red)',
  };
  return colors[level] || colors.low;
}

/**
 * Format remaining time as human-readable string
 */
export function formatRemainingTime(minutes) {
  if (minutes <= 0) return { text: 'SLA BREACHED', isBreached: true };
  
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes * 60) % 60);

  if (hrs > 0) {
    return { text: `${hrs}h ${mins}m`, isBreached: false };
  }
  if (mins > 0) {
    return { text: `${mins}m ${secs}s`, isBreached: false };
  }
  return { text: `${secs}s`, isBreached: false };
}

/**
 * Calculate success metrics for the admin dashboard
 */
export function calculateMetrics(complaints, config = DEFAULT_SLA_CONFIG) {
  const total = complaints.length;
  if (total === 0) return getEmptyMetrics();

  const resolved = complaints.filter(c => c.timestamps?.actionTime);
  const withinSLA = resolved.filter(c => {
    const submission = new Date(c.timestamps.submissionTime);
    const action = new Date(c.timestamps.actionTime);
    return (action - submission) / (1000 * 60) <= config.totalSLA;
  });

  const withDispatch = complaints.filter(c => c.timestamps?.alertDispatchTime);
  const avgDispatchTime = withDispatch.length > 0
    ? withDispatch.reduce((sum, c) => {
        const sub = new Date(c.timestamps.submissionTime);
        const disp = new Date(c.timestamps.alertDispatchTime);
        return sum + (disp - sub) / (1000 * 60);
      }, 0) / withDispatch.length
    : 0;

  const withArrival = complaints.filter(c => c.timestamps?.arrivalTime && c.timestamps?.alertDispatchTime);
  const avgArrivalTime = withArrival.length > 0
    ? withArrival.reduce((sum, c) => {
        const disp = new Date(c.timestamps.alertDispatchTime);
        const arr = new Date(c.timestamps.arrivalTime);
        return sum + (arr - disp) / (1000 * 60);
      }, 0) / withArrival.length
    : 0;

  const escalated = complaints.filter(c => c.timestamps?.escalationTime);
  const escalatedResolved = escalated.filter(c => c.timestamps?.resolutionTime);
  const avgEscalationTime = escalatedResolved.length > 0
    ? escalatedResolved.reduce((sum, c) => {
        const esc = new Date(c.timestamps.escalationTime);
        const res = new Date(c.timestamps.resolutionTime);
        return sum + (res - esc) / (1000 * 60);
      }, 0) / escalatedResolved.length
    : 0;

  const avgResolutionTime = resolved.length > 0
    ? resolved.reduce((sum, c) => {
        const sub = new Date(c.timestamps.submissionTime);
        const act = new Date(c.timestamps.actionTime);
        return sum + (act - sub) / (1000 * 60);
      }, 0) / resolved.length
    : 0;

  return {
    totalComplaints: total,
    slaComplianceRate: total > 0 ? Math.round((withinSLA.length / total) * 100) : 0,
    avgDispatchTime: Math.round(avgDispatchTime * 10) / 10,
    avgArrivalTime: Math.round(avgArrivalTime * 10) / 10,
    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    escalatedCount: escalated.length,
    avgEscalationTime: Math.round(avgEscalationTime * 10) / 10,
    resolvedCount: resolved.length,
    breachedCount: total - withinSLA.length,
    activeCount: complaints.filter(c => !['RESOLVED', 'DUPLICATE', 'FALSE_COMPLAINT'].includes(c.status)).length,
  };
}

function getEmptyMetrics() {
  return {
    totalComplaints: 0,
    slaComplianceRate: 0,
    avgDispatchTime: 0,
    avgArrivalTime: 0,
    avgResolutionTime: 0,
    escalatedCount: 0,
    avgEscalationTime: 0,
    resolvedCount: 0,
    breachedCount: 0,
    activeCount: 0,
  };
}
