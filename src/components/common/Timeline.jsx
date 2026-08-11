import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { STATE_LABELS } from '../../lib/stateMachine';
import { formatDateTime } from '../../lib/utils';

export default function Timeline({ auditTrail = [], currentStatus }) {
  const { locale } = useLanguage();

  if (!auditTrail.length) return null;

  return (
    <div className="timeline">
      {auditTrail.map((entry, index) => {
        const isLast = index === auditTrail.length - 1;
        const isEscalated = entry.toState === 'ESCALATED';
        const label = STATE_LABELS[locale]?.[entry.toState] || entry.toState;

        return (
          <div key={index} className="timeline-item">
            <div className={`timeline-dot ${
              isLast ? (isEscalated ? 'escalated' : 'active') : 'completed'
            }`} />
            <div className="timeline-content">
              <div className="timeline-title">{label}</div>
              <div className="timeline-time">
                {formatDateTime(entry.timestamp, locale)}
              </div>
              {entry.notes && (
                <div className="timeline-notes">{entry.notes}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
