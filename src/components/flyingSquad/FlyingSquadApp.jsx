import React, { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { STATES, CATEGORY_LABELS, hasFirstAction } from '../../lib/stateMachine';
import { FIRST_ACTION_TYPES, FIRST_ACTION_LABELS } from '../../lib/stateMachine';
import StatusBadge from '../common/StatusBadge';
import SLATimer from '../common/SLATimer';
import Timeline from '../common/Timeline';
import { 
  AlertTriangle, MapPin, Navigation, Clock, ChevronRight,
  CheckCircle, ArrowUpRight, ArrowLeft, Send, Upload,
  Shield, Image, Video, Mic, Lock, Unlock, FileText
} from 'lucide-react';
import { timeAgo, formatDateTime } from '../../lib/utils';

// Alert List for incoming complaints
function AlertsList({ onSelect }) {
  const { formatMessage } = useIntl();
  const { locale } = useLanguage();
  const { complaints } = useComplaints();

  const activeAlerts = useMemo(() => {
    return complaints.filter(c => 
      [STATES.ALERT_DISPATCHED, STATES.EN_ROUTE, STATES.FIRST_ACTION_LOGGED].includes(c.status)
    ).sort((a, b) => new Date(b.timestamps.alertDispatchTime || 0) - new Date(a.timestamps.alertDispatchTime || 0));
  }, [complaints]);

  if (activeAlerts.length === 0) {
    return (
      <div className="page-container animate-slide-up">
        <div className="page-header">
          <h1 className="page-title">{formatMessage({ id: 'squad.alerts' })}</h1>
        </div>
        <div className="empty-state">
          <Shield size={48} className="empty-state-icon" />
          <p className="empty-state-title">{formatMessage({ id: 'squad.noAlerts' })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">{formatMessage({ id: 'squad.alerts' })}</h1>
        <p className="page-subtitle">{activeAlerts.length} {locale === 'hi' ? 'सक्रिय' : 'active'}</p>
      </div>

      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {activeAlerts.map(complaint => {
          const needsAction = complaint.status === STATES.ALERT_DISPATCHED;
          const needsFirstAction = complaint.status === STATES.EN_ROUTE;
          
          return (
            <button
              key={complaint.id}
              className="complaint-card"
              onClick={() => onSelect(complaint)}
              style={{
                '--card-accent': needsAction ? 'var(--danger)' : needsFirstAction ? 'var(--warning)' : 'var(--success)',
                textAlign: 'left',
                width: '100%',
                ...(needsAction ? { animation: 'slide-in 0.4s ease-out, timer-pulse 2s ease-in-out infinite' } : {}),
              }}
            >
              {needsAction && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 'var(--radius)',
                  marginBottom: 'var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--danger)',
                }}>
                  <AlertTriangle size={14} />
                  {locale === 'hi' ? '🚨 नया अलर्ट — तुरंत प्रतिक्रिया दें' : '🚨 NEW ALERT — Respond immediately'}
                </div>
              )}

              <div className="complaint-card-header">
                <div className="complaint-card-id">{complaint.id}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <SLATimer complaint={complaint} compact />
                  <StatusBadge status={complaint.status} />
                </div>
              </div>

              <div className="complaint-card-category">
                <AlertTriangle size={16} />
                {CATEGORY_LABELS[locale]?.[complaint.category]}
              </div>

              <div className="complaint-card-description">
                {complaint.description}
              </div>

              <div className="complaint-card-footer">
                <div className="complaint-card-meta">
                  <span className="complaint-card-meta-item">
                    <MapPin size={14} />
                    {complaint.location?.landmark || complaint.location?.districtName}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {needsAction && (
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <Navigation size={12} />
                      {locale === 'hi' ? 'स्वीकार करें' : 'Accept'}
                    </span>
                  )}
                  <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Squad Complaint Detail with Action Controls
function SquadDetail({ complaint: initialComplaint, onBack }) {
  const { formatMessage } = useIntl();
  const { locale } = useLanguage();
  const { complaints, transitionComplaint, logFirstAction, escalateComplaint } = useComplaints();
  const complaint = complaints.find(c => c.id === initialComplaint.id) || initialComplaint;

  const [view, setView] = useState('detail'); // detail, logAction, updateStatus, escalate
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [escalationTarget, setEscalationTarget] = useState('District Election Officer');

  const firstActionDone = hasFirstAction(complaint);
  const canLogAction = complaint.status === STATES.EN_ROUTE;
  const canUpdateStatus = firstActionDone && complaint.status === STATES.FIRST_ACTION_LOGGED;
  const canAccept = complaint.status === STATES.ALERT_DISPATCHED;

  const handleAccept = () => {
    transitionComplaint(complaint.id, STATES.EN_ROUTE, {
      actor: 'fs-001',
      actorRole: 'flyingSquad',
      notes: 'Squad accepted alert and departed',
    });
  };

  const handleLogAction = () => {
    if (!actionType || actionNotes.length < 20) return;
    logFirstAction(complaint.id, {
      type: actionType,
      notes: actionNotes,
      evidence: [],
      actor: 'fs-001',
    });
    setView('detail');
  };

  const handleResolve = () => {
    transitionComplaint(complaint.id, STATES.RESOLVED, {
      actor: 'fs-001',
      actorRole: 'flyingSquad',
      notes: statusNotes || 'Complaint resolved',
    });
    setView('detail');
  };

  const handleEscalate = () => {
    if (!escalationReason) return;
    escalateComplaint(complaint.id, {
      reason: escalationReason,
      targetAuthority: escalationTarget,
      notes: escalationNotes,
      actor: 'fs-001',
    });
    setView('detail');
  };

  // Log First Action Form
  if (view === 'logAction') {
    return (
      <div className="page-container animate-slide-in">
        <button className="btn btn-ghost btn-sm" onClick={() => setView('detail')} style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={16} /> {formatMessage({ id: 'common.back' })}
        </button>

        <div className="page-header">
          <h1 className="page-title">{formatMessage({ id: 'squad.logAction' })}</h1>
          <p className="page-subtitle">{complaint.id}</p>
        </div>

        <div className="form-group">
          <label className="form-label">{formatMessage({ id: 'squad.actionType' })}</label>
          <div className="category-grid">
            {Object.entries(FIRST_ACTION_TYPES).map(([key, value]) => (
              <button
                key={key}
                className={`category-option ${actionType === value ? 'selected' : ''}`}
                onClick={() => setActionType(value)}
                style={{ padding: 'var(--space-3)' }}
              >
                <span className="category-option-label" style={{ fontSize: 'var(--text-xs)' }}>
                  {FIRST_ACTION_LABELS[locale]?.[value]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{formatMessage({ id: 'squad.actionNotes' })}</label>
          <textarea
            className="form-textarea"
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            placeholder={formatMessage({ id: 'squad.actionNotesPlaceholder' })}
            rows={4}
          />
          {actionNotes.length > 0 && actionNotes.length < 20 && (
            <div className="form-hint" style={{ color: 'var(--danger)' }}>
              {locale === 'hi' ? `${20 - actionNotes.length} और अक्षर चाहिए` : `${20 - actionNotes.length} more characters needed`}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">{formatMessage({ id: 'submit.evidence' })}</label>
          <button className="btn btn-ghost btn-full">
            <Upload size={16} /> {formatMessage({ id: 'submit.evidenceHint' })}
          </button>
        </div>

        <button
          className="btn btn-success btn-lg btn-full"
          disabled={!actionType || actionNotes.length < 20}
          onClick={handleLogAction}
        >
          <CheckCircle size={18} />
          {formatMessage({ id: 'squad.logAction' })}
        </button>
      </div>
    );
  }

  // Escalation Form
  if (view === 'escalate') {
    return (
      <div className="page-container animate-slide-in">
        <button className="btn btn-ghost btn-sm" onClick={() => setView('detail')} style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={16} /> {formatMessage({ id: 'common.back' })}
        </button>

        <div className="page-header">
          <h1 className="page-title">{formatMessage({ id: 'squad.escalate' })}</h1>
          <p className="page-subtitle">{complaint.id}</p>
        </div>

        {/* Full history summary */}
        <div className="alert-card alert-info" style={{ marginBottom: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {locale === 'hi' 
              ? 'पूरा शिकायत इतिहास, GPS ट्रेल, सभी साक्ष्य और नोट्स स्वचालित रूप से भेजे जाएंगे।'
              : 'Full complaint history, GPS trail, all evidence, and notes will be forwarded automatically.'}
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">{formatMessage({ id: 'squad.escalateTarget' })}</label>
          <select className="form-select" value={escalationTarget} onChange={(e) => setEscalationTarget(e.target.value)}>
            <option value="District Election Officer">{locale === 'hi' ? 'जिला निर्वाचन अधिकारी' : 'District Election Officer'}</option>
            <option value="Returning Officer">{locale === 'hi' ? 'रिटर्निंग ऑफिसर' : 'Returning Officer'}</option>
            <option value="Police Authority">{locale === 'hi' ? 'पुलिस प्राधिकारी' : 'Police Authority'}</option>
            <option value="Dedicated Cell">{locale === 'hi' ? 'समर्पित सेल' : 'Dedicated Cell'}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{formatMessage({ id: 'squad.escalateReason' })}</label>
          <select className="form-select" value={escalationReason} onChange={(e) => setEscalationReason(e.target.value)}>
            <option value="">{locale === 'hi' ? 'कारण चुनें...' : 'Select reason...'}</option>
            <option value="Requires higher authority">{locale === 'hi' ? 'उच्चाधिकार की आवश्यकता' : 'Requires higher authority'}</option>
            <option value="Law and order situation">{locale === 'hi' ? 'कानून-व्यवस्था स्थिति' : 'Law and order situation'}</option>
            <option value="Large-scale violation">{locale === 'hi' ? 'बड़े पैमाने पर उल्लंघन' : 'Large-scale violation'}</option>
            <option value="Political interference">{locale === 'hi' ? 'राजनीतिक हस्तक्षेप' : 'Political interference'}</option>
            <option value="Safety concerns">{locale === 'hi' ? 'सुरक्षा चिंता' : 'Safety concerns'}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{formatMessage({ id: 'squad.escalateNotes' })}</label>
          <textarea
            className="form-textarea"
            value={escalationNotes}
            onChange={(e) => setEscalationNotes(e.target.value)}
            placeholder={locale === 'hi' ? 'अतिरिक्त विवरण दें...' : 'Provide additional context...'}
            rows={3}
          />
        </div>

        <button
          className="btn btn-danger btn-lg btn-full"
          disabled={!escalationReason}
          onClick={handleEscalate}
        >
          <ArrowUpRight size={18} />
          {formatMessage({ id: 'squad.escalate' })}
        </button>
      </div>
    );
  }

  // Main Detail View
  return (
    <div className="page-container animate-slide-in">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={16} /> {formatMessage({ id: 'common.back' })}
      </button>

      {/* Complaint Header */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{complaint.id}</div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginTop: 'var(--space-1)' }}>
                {CATEGORY_LABELS[locale]?.[complaint.category]}
              </h2>
            </div>
            <StatusBadge status={complaint.status} />
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-3)' }}>
            {complaint.description}
          </p>

          {/* Location */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-3)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border-light)',
          }}>
            <MapPin size={16} style={{ color: 'var(--primary-light)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{complaint.location?.landmark}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {complaint.location?.districtName} • {complaint.location?.lat?.toFixed(4)}, {complaint.location?.lng?.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLA */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-body">
          <SLATimer complaint={complaint} showMilestones />
        </div>
      </div>

      {/* First Action Gate Status */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {firstActionDone ? (
              <>
                <Unlock size={20} style={{ color: 'var(--success)' }} />
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--success)' }}>
                    {locale === 'hi' ? 'प्रथम कार्रवाई पूर्ण' : 'First Action Completed'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {complaint.firstAction?.type && FIRST_ACTION_LABELS[locale]?.[complaint.firstAction.type]}
                    {complaint.firstAction?.timestamp && ` • ${formatDateTime(complaint.firstAction.timestamp, locale)}`}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Lock size={20} style={{ color: 'var(--warning)' }} />
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--warning)' }}>
                    {formatMessage({ id: 'squad.actionRequired' })}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {formatMessage({ id: 'squad.statusLocked' })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        position: 'sticky',
        bottom: 'calc(var(--bottom-nav-height) + var(--space-4))',
        padding: 'var(--space-4)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--glass-border)',
      }}>
        {canAccept && (
          <button className="btn btn-success btn-lg btn-full" onClick={handleAccept}>
            <Navigation size={18} />
            {formatMessage({ id: 'squad.accept' })}
          </button>
        )}

        {canLogAction && (
          <button className="btn btn-primary btn-lg btn-full" onClick={() => setView('logAction')}>
            <FileText size={18} />
            {formatMessage({ id: 'squad.logAction' })}
          </button>
        )}

        {canUpdateStatus && (
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-danger" onClick={() => setView('escalate')} style={{ flex: 1 }}>
              <ArrowUpRight size={16} />
              {formatMessage({ id: 'squad.escalate' })}
            </button>
            <button className="btn btn-success" onClick={handleResolve} style={{ flex: 2 }}>
              <CheckCircle size={16} />
              {locale === 'hi' ? 'समाधान करें' : 'Mark Resolved'}
            </button>
          </div>
        )}

        {complaint.status === STATES.RESOLVED && (
          <div className="alert-card alert-success" style={{ margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'center' }}>
              <CheckCircle size={18} style={{ color: 'var(--success)' }} />
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                {locale === 'hi' ? 'शिकायत का समाधान हो गया' : 'Complaint Resolved'}
              </span>
            </div>
          </div>
        )}

        {complaint.status === STATES.ESCALATED && (
          <div className="alert-card alert-warning" style={{ margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'center' }}>
              <ArrowUpRight size={18} style={{ color: 'var(--warning)' }} />
              <span style={{ fontWeight: 700, color: 'var(--warning)' }}>
                {locale === 'hi' ? `${complaint.escalation?.targetAuthority} को भेजा गया` : `Escalated to ${complaint.escalation?.targetAuthority}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Flying Squad Component
export default function FlyingSquadApp() {
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  if (selectedComplaint) {
    return <SquadDetail complaint={selectedComplaint} onBack={() => setSelectedComplaint(null)} />;
  }

  return <AlertsList onSelect={setSelectedComplaint} />;
}
