import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORY_LABELS, STATES } from '../../lib/stateMachine';
import StatusBadge from '../common/StatusBadge';
import SLATimer from '../common/SLATimer';
import Timeline from '../common/Timeline';
import FeedbackForm from './FeedbackForm';
import { Search, MapPin, Clock, Shield } from 'lucide-react';

export default function TrackComplaint() {
  const { formatMessage } = useIntl();
  const { locale } = useLanguage();
  const { complaints, getComplaint } = useComplaints();
  const [searchId, setSearchId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [searched, setSearched] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSearch = () => {
    if (!searchId.trim()) return;
    const found = getComplaint(searchId.trim().toUpperCase());
    setComplaint(found || null);
    setSearched(true);
  };

  // Also allow picking from recent complaints for demo purposes
  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">{formatMessage({ id: 'track.title' })}</h1>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <input
          type="text"
          className="form-input"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={formatMessage({ id: 'track.placeholder' })}
          style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          <Search size={18} />
          {formatMessage({ id: 'track.search' })}
        </button>
      </div>

      {/* Quick Pick (Demo) */}
      {!complaint && !searched && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-header">
            <div className="card-header-title" style={{ fontSize: 'var(--text-sm)' }}>
              {locale === 'hi' ? 'हाल की शिकायतें (डेमो)' : 'Recent Complaints (Demo)'}
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentComplaints.map(c => (
              <button
                key={c.id}
                onClick={() => { setComplaint(c); setSearchId(c.id); setSearched(true); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'background var(--transition)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--surface-hover)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{c.id}</span>
                <StatusBadge status={c.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Not Found */}
      {searched && !complaint && (
        <div className="empty-state">
          <Search size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
          <p className="empty-state-title">{formatMessage({ id: 'track.notFound' })}</p>
        </div>
      )}

      {/* Complaint Detail */}
      {complaint && (
        <div className="animate-slide-in">
          {/* Header Card */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                    {complaint.id}
                  </div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                    {CATEGORY_LABELS[locale]?.[complaint.category]}
                  </div>
                </div>
                <StatusBadge status={complaint.status} />
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
                {complaint.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {complaint.location?.landmark || complaint.location?.districtName}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {new Date(complaint.timestamps?.submissionTime).toLocaleString(locale === 'hi' ? 'hi-IN' : 'en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* SLA Timer */}
          {complaint.status !== STATES.RESOLVED && complaint.status !== STATES.DUPLICATE && complaint.status !== STATES.FALSE_COMPLAINT && (
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="card-header">
                <div className="card-header-title">{formatMessage({ id: 'track.slaRemaining' })}</div>
              </div>
              <div className="card-body">
                <SLATimer complaint={complaint} showMilestones={true} />
              </div>
            </div>
          )}

          {/* Status Messages - citizen-friendly, no squad details */}
          {complaint.status === STATES.ALERT_DISPATCHED && (
            <div className="alert-card alert-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Shield size={18} style={{ color: 'var(--info)' }} />
                <span style={{ fontWeight: 600 }}>{formatMessage({ id: 'track.teamDispatched' })}</span>
              </div>
            </div>
          )}
          {complaint.status === STATES.EN_ROUTE && (
            <div className="alert-card alert-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Shield size={18} style={{ color: 'var(--info)' }} />
                <span style={{ fontWeight: 600 }}>{formatMessage({ id: 'track.teamEnRoute' })}</span>
              </div>
            </div>
          )}
          {(complaint.status === STATES.FIRST_ACTION_LOGGED || complaint.status === STATES.RESOLVED) && (
            <div className="alert-card alert-success">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Shield size={18} style={{ color: 'var(--success)' }} />
                <span style={{ fontWeight: 600 }}>{formatMessage({ id: 'track.actionTaken' })}</span>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-header">
              <div className="card-header-title">{formatMessage({ id: 'track.timeline' })}</div>
            </div>
            <div className="card-body">
              <Timeline auditTrail={complaint.auditTrail} currentStatus={complaint.status} />
            </div>
          </div>

          {/* Feedback */}
          {complaint.status === STATES.RESOLVED && !complaint.feedback && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              {showFeedback ? (
                <FeedbackForm complaintId={complaint.id} onClose={() => setShowFeedback(false)} />
              ) : (
                <button className="btn btn-primary btn-full" onClick={() => setShowFeedback(true)}>
                  {formatMessage({ id: 'track.feedback' })}
                </button>
              )}
            </div>
          )}

          {complaint.feedback && (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
                  {'⭐'.repeat(complaint.feedback.rating)}
                </div>
                {complaint.feedback.comment && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    "{complaint.feedback.comment}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
