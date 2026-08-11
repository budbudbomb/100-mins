import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { STATES, CATEGORY_LABELS } from '../../lib/stateMachine';
import StatusBadge from '../common/StatusBadge';
import SLATimer from '../common/SLATimer';
import Timeline from '../common/Timeline';
import { 
  ArrowLeft, CheckCircle, AlertTriangle, Copy, MapPin, 
  Clock, Phone, Globe, User, EyeOff, Flag, Merge,
  Send, Image, Video, Mic 
} from 'lucide-react';
import { formatDateTime, maskPhone } from '../../lib/utils';

export default function ComplaintDetail({ complaint: initialComplaint, onBack }) {
  const { formatMessage } = useIntl();
  const { locale } = useLanguage();
  const { complaints, transitionComplaint, flagComplaint } = useComplaints();
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  
  // Get live version of the complaint from context
  const complaint = complaints.find(c => c.id === initialComplaint.id) || initialComplaint;

  const handleMarkReviewed = () => {
    // Transition: SUBMITTED → UNDER_REVIEW → ALERT_DISPATCHED
    if (complaint.status === STATES.SUBMITTED) {
      transitionComplaint(complaint.id, STATES.UNDER_REVIEW, {
        actor: 'call-receiver',
        actorRole: 'callReceiver',
        notes: 'Complaint reviewed by Call Receiver',
      });
      // Then immediately dispatch alert
      setTimeout(() => {
        transitionComplaint(complaint.id, STATES.ALERT_DISPATCHED, {
          actor: 'system',
          actorRole: 'system',
          notes: 'Alert dispatched to nearest Flying Squad',
        });
      }, 500);
    } else if (complaint.status === STATES.UNDER_REVIEW) {
      transitionComplaint(complaint.id, STATES.ALERT_DISPATCHED, {
        actor: 'system',
        actorRole: 'system',
        notes: 'Alert dispatched to nearest Flying Squad',
      });
    }
  };

  const canReview = complaint.status === STATES.SUBMITTED || complaint.status === STATES.UNDER_REVIEW;

  return (
    <div className="page-container animate-slide-in">
      {/* Back Button */}
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={16} />
        {formatMessage({ id: 'common.back' })}
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                  {complaint.id}
                </span>
                <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => navigator.clipboard?.writeText(complaint.id)}>
                  <Copy size={12} />
                </button>
              </div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                {CATEGORY_LABELS[locale]?.[complaint.category]}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {complaint.channel === 'TOLL_FREE' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
                    <Phone size={12} /> Toll-Free
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--info)' }}>
                    <Globe size={12} /> Web/App
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-4)' }}>
            {complaint.description}
          </p>

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
            <div style={{ padding: 'var(--space-3)', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                {locale === 'hi' ? 'स्थान' : 'Location'}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                {complaint.location?.landmark || 'GPS Location'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {complaint.location?.districtName} ({complaint.location?.lat?.toFixed(4)}, {complaint.location?.lng?.toFixed(4)})
              </div>
            </div>

            <div style={{ padding: 'var(--space-3)', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                <User size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                {locale === 'hi' ? 'शिकायतकर्ता' : 'Complainant'}
              </div>
              {complaint.complainant?.anonymous ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                  <EyeOff size={12} />
                  {locale === 'hi' ? 'गुमनाम' : 'Anonymous'}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                    {complaint.complainant?.name || '—'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {maskPhone(complaint.complainant?.phone)}
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: 'var(--space-3)', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                {locale === 'hi' ? 'दर्ज समय' : 'Submitted At'}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                {formatDateTime(complaint.timestamps?.submissionTime, locale)}
              </div>
            </div>

            <div style={{ padding: 'var(--space-3)', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
                {locale === 'hi' ? 'जिला' : 'District'}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                {locale === 'hi' ? complaint.location?.districtNameHi : complaint.location?.districtName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence */}
      {complaint.evidence?.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-header">
            <div className="card-header-title">{formatMessage({ id: 'common.evidence' })}</div>
          </div>
          <div className="card-body">
            <div className="evidence-grid">
              {complaint.evidence.map((item, i) => (
                <div key={i} className="evidence-thumb">
                  {item.type === 'photo' ? <Image size={20} /> : 
                   item.type === 'video' ? <Video size={20} /> : <Mic size={20} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SLA */}
      {canReview && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="card-header">
            <div className="card-header-title">SLA Status</div>
          </div>
          <div className="card-body">
            <SLATimer complaint={complaint} showMilestones />
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

      {/* Action Buttons */}
      {canReview && (
        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-3)', 
          position: 'sticky', 
          bottom: 'calc(var(--bottom-nav-height) + var(--space-4))',
          padding: 'var(--space-4)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border)',
          marginTop: 'var(--space-4)',
        }}>
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-ghost"
              onClick={() => setShowFlagMenu(!showFlagMenu)}
            >
              <Flag size={16} />
              {locale === 'hi' ? 'चिह्नित' : 'Flag'}
            </button>
            {showFlagMenu && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-2)',
                minWidth: '160px',
                zIndex: 10,
                boxShadow: 'var(--shadow-lg)',
              }}>
                <button className="sidebar-item" style={{ width: '100%' }}
                  onClick={() => { flagComplaint(complaint.id, 'duplicate'); onBack(); }}>
                  <Copy size={14} /> {formatMessage({ id: 'review.flagDuplicate' })}
                </button>
                <button className="sidebar-item" style={{ width: '100%', color: 'var(--danger)' }}
                  onClick={() => { flagComplaint(complaint.id, 'false'); onBack(); }}>
                  <AlertTriangle size={14} /> {formatMessage({ id: 'review.flagFalse' })}
                </button>
              </div>
            )}
          </div>
          <button 
            className="btn btn-success btn-lg"
            onClick={handleMarkReviewed}
            style={{ flex: 1 }}
          >
            <CheckCircle size={18} />
            {formatMessage({ id: 'review.markReviewed' })}
          </button>
        </div>
      )}
    </div>
  );
}
