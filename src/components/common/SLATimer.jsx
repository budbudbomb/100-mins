import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { getSLAStatus, formatRemainingTime } from '../../lib/slaEngine';

export default function SLATimer({ complaint, compact = false, showMilestones = false }) {
  const [sla, setSla] = useState(() => getSLAStatus(complaint));

  useEffect(() => {
    const timer = setInterval(() => {
      setSla(getSLAStatus(complaint));
    }, 1000);
    return () => clearInterval(timer);
  }, [complaint]);

  const remaining = formatRemainingTime(sla.totalRemaining);

  if (compact) {
    return (
      <div className={`sla-timer urgency-${sla.urgencyLevel}`}>
        {sla.isBreached ? <AlertTriangle size={14} /> : <Clock size={14} />}
        <span>{remaining.text}</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <div className={`sla-timer urgency-${sla.urgencyLevel}`}>
          {sla.isBreached ? <AlertTriangle size={14} /> : <Clock size={14} />}
          <span>{remaining.text}</span>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          {Math.round(sla.totalElapsed)} / 100 min
        </span>
      </div>
      
      <div className="sla-progress">
        <div 
          className={`sla-progress-bar urgency-${sla.urgencyLevel}`}
          style={{ width: `${Math.min(100, sla.progressPercent)}%` }}
        />
      </div>

      {showMilestones && (
        <div style={{ 
          display: 'grid', 
          gap: 'var(--space-1)', 
          marginTop: 'var(--space-3)' 
        }}
        className="sla-milestones-grid"
      >
          {[
            { key: 'reviewed', label: '✓ Review', threshold: sla.config.milestones.reviewedWithin },
            { key: 'alertAcknowledged', label: '📡 Alert', threshold: sla.config.milestones.alertAcknowledgedWithin },
            { key: 'squadDeparted', label: '🚗 Depart', threshold: sla.config.milestones.squadDepartedWithin },
            { key: 'squadArrived', label: '📍 Arrive', threshold: sla.config.milestones.squadArrivedWithin },
            { key: 'firstAction', label: '⚡ Action', threshold: sla.config.milestones.firstActionWithin },
          ].map(({ key, label, threshold }) => {
            const milestone = sla.milestoneStatus[key];
            if (!milestone) return null;
            const isDone = milestone.status === 'completed' || milestone.status === 'breached_completed';
            const isBreach = milestone.breached;
            
            return (
              <div key={key} style={{
                textAlign: 'center',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius)',
                background: isDone 
                  ? (isBreach ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)')
                  : 'var(--surface)',
                border: '1px solid',
                borderColor: isDone
                  ? (isBreach ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)')
                  : 'var(--border)',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                  {label}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: isDone 
                    ? (isBreach ? 'var(--danger)' : 'var(--success)')
                    : 'var(--text-tertiary)',
                  fontWeight: 600,
                }}>
                  {isDone ? `${Math.round(milestone.elapsed)}m` : `< ${threshold}m`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
