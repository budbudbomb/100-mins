import React, { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { STATES, CATEGORY_LABELS } from '../../lib/stateMachine';
import StatusBadge from '../common/StatusBadge';
import SLATimer from '../common/SLATimer';
import ComplaintDetail from './ComplaintDetail';
import { ClipboardList, Filter, Globe, Phone, Clock, MapPin, AlertTriangle, ChevronRight } from 'lucide-react';
import { timeAgo } from '../../lib/utils';

export default function ReviewQueue() {
  const { formatMessage } = useIntl();
  const { locale } = useLanguage();
  const { complaints } = useComplaints();
  
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Filter complaints that need review (SUBMITTED state)
  const reviewQueue = useMemo(() => {
    let filtered = complaints.filter(c => 
      c.status === STATES.SUBMITTED || c.status === STATES.UNDER_REVIEW
    );
    
    if (channelFilter !== 'all') {
      filtered = filtered.filter(c => c.channel === channelFilter);
    }
    
    // Sort by submission time (oldest first — they're most urgent)
    return filtered.sort((a, b) => 
      new Date(a.timestamps.submissionTime) - new Date(b.timestamps.submissionTime)
    );
  }, [complaints, channelFilter]);

  const submittedCount = complaints.filter(c => c.status === STATES.SUBMITTED).length;
  const underReviewCount = complaints.filter(c => c.status === STATES.UNDER_REVIEW).length;

  if (selectedComplaint) {
    return (
      <ComplaintDetail 
        complaint={selectedComplaint} 
        onBack={() => setSelectedComplaint(null)} 
      />
    );
  }

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">{formatMessage({ id: 'review.title' })}</h1>
        <p className="page-subtitle">
          {submittedCount} {formatMessage({ id: 'review.pending' })} • {underReviewCount} {formatMessage({ id: 'status.UNDER_REVIEW' })}
        </p>
      </div>

      {/* Filter Chips */}
      <div className="filters-bar">
        <Filter size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <button 
          className={`filter-chip ${channelFilter === 'all' ? 'active' : ''}`}
          onClick={() => setChannelFilter('all')}
        >
          {formatMessage({ id: 'review.all' })} ({reviewQueue.length})
        </button>
        <button 
          className={`filter-chip ${channelFilter === 'WEB' ? 'active' : ''}`}
          onClick={() => setChannelFilter('WEB')}
        >
          <Globe size={12} />
          {formatMessage({ id: 'review.webChannel' })}
        </button>
        <button 
          className={`filter-chip ${channelFilter === 'TOLL_FREE' ? 'active' : ''}`}
          onClick={() => setChannelFilter('TOLL_FREE')}
        >
          <Phone size={12} />
          {formatMessage({ id: 'review.tollFreeChannel' })}
        </button>
      </div>

      {/* Queue List */}
      {reviewQueue.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} className="empty-state-icon" />
          <p className="empty-state-title">
            {locale === 'hi' ? 'कोई लंबित शिकायत नहीं' : 'No Pending Complaints'}
          </p>
          <p className="empty-state-text">
            {locale === 'hi' ? 'सभी शिकायतों की समीक्षा हो चुकी है' : 'All complaints have been reviewed'}
          </p>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {reviewQueue.map(complaint => (
            <button
              key={complaint.id}
              className="complaint-card"
              onClick={() => setSelectedComplaint(complaint)}
              style={{ 
                '--card-accent': complaint.status === STATES.SUBMITTED ? 'var(--warning)' : 'var(--info)',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div className="complaint-card-header">
                <div className="complaint-card-id">{complaint.id}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <SLATimer complaint={complaint} compact />
                  <StatusBadge status={complaint.status} />
                </div>
              </div>

              <div className="complaint-card-category" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {CATEGORY_LABELS[locale]?.[complaint.category]}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                  padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                  background: complaint.channel === 'TOLL_FREE' ? 'var(--warning-bg)' : 'var(--info-bg)',
                  color: complaint.channel === 'TOLL_FREE' ? 'var(--warning)' : 'var(--info)',
                  border: `1px solid ${complaint.channel === 'TOLL_FREE' ? 'var(--warning)' : 'var(--info)'}`
                }}>
                  {complaint.channel === 'TOLL_FREE' ? <Phone size={10} /> : <Globe size={10} />}
                  {complaint.channel === 'TOLL_FREE' 
                    ? (locale === 'hi' ? 'कॉल द्वारा प्राप्त' : 'Received via Call')
                    : (locale === 'hi' ? 'नागरिक द्वारा प्रस्तुत' : 'Submitted by Citizen')}
                </div>
              </div>

              <div className="complaint-card-description">
                {complaint.description}
              </div>

              <div className="complaint-card-footer">
                <div className="complaint-card-meta">
                  <span className="complaint-card-meta-item">
                    <MapPin size={14} />
                    {complaint.location?.districtName || complaint.location?.landmark}
                  </span>
                  <span className="complaint-card-meta-item">
                    <Clock size={14} />
                    {timeAgo(complaint.timestamps?.submissionTime, locale)}
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
