import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORIES, CATEGORY_LABELS, CHANNELS, STATES } from '../../lib/stateMachine';
import { DISTRICTS, BLOCKS_BY_DISTRICT } from '../../lib/mockData';
import {
  ShieldAlert, Banknote, FileWarning, Megaphone, HelpCircle,
  MapPin, Check, Copy, ArrowRight, ArrowLeft, Sparkles,
  Image, Video, Mic, Locate, X, Upload, EyeOff, ChevronRight
} from 'lucide-react';

/* ─── Category config ─── */
const CATEGORY_CONFIG = {
  BOOTH_CAPTURING: { icon: ShieldAlert, color: 'var(--danger)' },
  BRIBERY:         { icon: Banknote,    color: 'var(--warning)' },
  CODE_OF_CONDUCT: { icon: FileWarning, color: 'var(--info)' },
  CAMPAIGN_MALPRACTICE: { icon: Megaphone, color: 'var(--accent)' },
  OTHER:           { icon: HelpCircle,  color: 'var(--text-tertiary)' },
};

/* ─── Step indicator ─── */
function StepIndicator({ current, total, labels }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 'var(--space-6)' }}>
      {labels.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-xs)', fontWeight: 700,
                background: done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--surface)',
                border: `2px solid ${done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--border)'}`,
                color: done || active ? 'white' : 'var(--text-tertiary)',
                transition: 'all var(--transition)',
                boxShadow: active ? 'var(--shadow-glow-primary)' : 'none',
              }}>
                {done ? <Check size={14} /> : step}
              </div>
              <div style={{
                fontSize: '10px', fontWeight: 600, marginTop: '4px', textAlign: 'center',
                color: active ? 'var(--primary)' : done ? 'var(--success)' : 'var(--text-tertiary)',
                transition: 'color var(--transition)',
              }}>
                {label}
              </div>
            </div>
            {i < total - 1 && (
              <div style={{
                height: 2, flex: 1,
                background: done ? 'var(--success)' : 'var(--border)',
                marginBottom: 20,
                transition: 'background var(--transition)',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Evidence Attachment ─── */
function EvidenceBox({ evidence, onAdd, onRemove }) {
  const { locale } = useLanguage();
  const fileRef = useRef();

  const TYPE_ICONS = { photo: Image, video: Video, audio: Mic };
  const TYPE_COLORS = { photo: 'var(--info)', video: 'var(--danger)', audio: 'var(--success)' };
  const TYPE_LABELS = {
    en: { photo: 'Photo', video: 'Video', audio: 'Voice Note' },
    hi: { photo: 'फ़ोटो', video: 'वीडियो', audio: 'आवाज़ नोट' },
  };

  if (evidence) {
    const Icon = TYPE_ICONS[evidence.type] || Image;
    return (
      <div style={{
        border: `2px solid ${TYPE_COLORS[evidence.type] || 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        background: 'var(--surface)',
        position: 'relative',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--radius-md)',
          background: `${TYPE_COLORS[evidence.type]}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={24} color={TYPE_COLORS[evidence.type]} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{evidence.name}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            {TYPE_LABELS[locale]?.[evidence.type]} • {evidence.size}
          </div>
        </div>
        <button
          onClick={onRemove}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--danger-bg)', border: '1px solid var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <X size={14} color="var(--danger)" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-10)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition)',
          background: 'var(--surface)',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <Upload size={32} style={{ margin: '0 auto var(--space-3)', color: 'var(--text-tertiary)' }} />
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
          {locale === 'hi' ? 'साक्ष्य संलग्न करें' : 'Attach Evidence'}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          {locale === 'hi' ? 'फ़ोटो, वीडियो या आवाज़ नोट' : 'Photo, Video, or Voice Note'}
        </div>
      </div>
      {/* Quick action buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
        {[
          { type: 'photo', icon: Image, label: { en: 'Photo', hi: 'फ़ोटो' } },
          { type: 'video', icon: Video, label: { en: 'Video', hi: 'वीडियो' } },
          { type: 'audio', icon: Mic,   label: { en: 'Voice', hi: 'आवाज़' } },
        ].map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => onAdd({
              type,
              name: `evidence_${type}_${Date.now()}.${type === 'photo' ? 'jpg' : type === 'video' ? 'mp4' : 'mp3'}`,
              size: `${Math.floor(Math.random() * 4000 + 500)} KB`,
            })}
            style={{
              flex: 1, padding: 'var(--space-3)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              cursor: 'pointer', transition: 'all var(--transition)',
              fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Icon size={20} />
            {label[locale]}
          </button>
        ))}
      </div>
      <input ref={fileRef} type="file" style={{ display: 'none' }} accept="image/*,video/*,audio/*" />
    </div>
  );
}

/* ─── Main Component ─── */
export default function SubmitComplaint() {
  const { formatMessage } = useIntl();
  const { locale } = useLanguage();
  const { isRole } = useAuth();
  const { addComplaint } = useComplaints();
  const navigate = useNavigate();

  // Form state
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [address, setAddress] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [gps, setGps] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const blocks = district ? (BLOCKS_BY_DISTRICT[district] || []) : [];

  // Reset block when district changes
  useEffect(() => { setBlock(''); }, [district]);

  const captureGPS = () => {
    setGpsLoading(true);
    setGpsError('');
    if (!navigator.geolocation) {
      // Fallback: simulate GPS
      setTimeout(() => {
        const d = DISTRICTS.find(x => x.id === district) || DISTRICTS[0];
        setGps({ lat: d.lat + (Math.random() - 0.5) * 0.05, lng: d.lng + (Math.random() - 0.5) * 0.05 });
        setGpsLoading(false);
      }, 1200);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        // Simulate if denied
        const d = DISTRICTS.find(x => x.id === district) || DISTRICTS[0];
        setGps({ lat: d.lat + (Math.random() - 0.5) * 0.05, lng: d.lng + (Math.random() - 0.5) * 0.05 });
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (overrideStatus = null) => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    const selectedDistrict = DISTRICTS.find(d => d.id === district) || DISTRICTS[0];
    const selectedBlock = blocks.find(b => b.id === block);
    addComplaint({
      category,
      description,
      channel: isRole('callReceiver') ? CHANNELS.TOLL_FREE : CHANNELS.WEB,
      status: overrideStatus,
      location: {
        lat: gps?.lat ?? selectedDistrict.lat,
        lng: gps?.lng ?? selectedDistrict.lng,
        landmark: address || 'GPS Location',
        address,
        district: selectedDistrict.id,
        districtName: selectedDistrict.name,
        districtNameHi: selectedDistrict.nameHi,
        block: selectedBlock?.id || '',
        blockName: selectedBlock?.name || '',
      },
      complainant: isRole('callReceiver')
        ? { anonymous: false, phone: callerPhone, name: callerName }
        : isAnonymous
          ? { anonymous: true, phone: null, name: null }
          : { anonymous: false, phone: '+919876543210', name: 'Demo Citizen' },
      evidence: evidence ? [evidence] : [],
    });
    setSubmittedId(`EC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`);
    setIsSubmitting(false);
    setStep(5); // success
  };

  const stepLabels = {
    en: ['Type', 'Describe', 'Location', 'Evidence'],
    hi: ['प्रकार', 'विवरण', 'स्थान', 'साक्ष्य'],
  };

  /* ── DESKTOP: show all steps in one scrollable column ── */
  /* ── MOBILE: show one step per screen ── */

  /* ─── Step 5: Success ─── */
  if (step === 5) {
    return (
      <div className="page-container animate-scale-in" style={{ textAlign: 'center', paddingTop: 'var(--space-16)' }}>
        <div className="success-checkmark"><Check size={40} /></div>
        <h2 style={{
          fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-4)',
          background: 'linear-gradient(135deg, var(--success), var(--success-light))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {formatMessage({ id: 'submit.success' })}
        </h2>
        <div className="card" style={{ maxWidth: 360, margin: '0 auto var(--space-6)', padding: 'var(--space-5)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
            {formatMessage({ id: 'submit.successId' })}
          </div>
          <div style={{
            fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-mono)', fontWeight: 800,
            color: 'var(--primary-light)', marginBottom: 'var(--space-3)', letterSpacing: '0.02em',
          }}>
            {submittedId}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(submittedId)}>
            <Copy size={14} /> Copy ID
          </button>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
          {formatMessage({ id: 'submit.successMsg' })}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 320, margin: '0 auto' }}>
          <button className="btn btn-primary btn-lg btn-full" onClick={() => navigate('/track')}>
            {formatMessage({ id: 'submit.trackButton' })}
          </button>
          <button className="btn btn-ghost btn-lg btn-full" onClick={() => {
            setStep(1); setCategory(''); setDescription(''); setAddress('');
            setDistrict(''); setBlock(''); setGps(null); setEvidence(null); setIsAnonymous(false);
          }}>
            {formatMessage({ id: 'submit.newButton' })}
          </button>
        </div>
      </div>
    );
  }

  /* ─── DESKTOP: single scrollable form ─── */
  const isDesktop = () => window.innerWidth >= 768;

  /* ─── MOBILE step screens ─── */
  const renderMobileStep = () => {
    /* Step 1: Complaint Type */
    if (step === 1) return (
      <div className="page-container animate-slide-up">
        <StepIndicator current={1} total={4} labels={stepLabels[locale]} />
        <div className="page-header">
          <h1 className="page-title">{formatMessage({ id: 'submit.title' })}</h1>
          <p className="page-subtitle">{formatMessage({ id: 'submit.category' })}</p>
        </div>
        <div className="category-grid">
          {Object.entries(CATEGORIES).map(([key, value]) => {
            const { icon: Icon, color } = CATEGORY_CONFIG[key] || { icon: HelpCircle, color: 'var(--text-tertiary)' };
            const isSelected = category === value;
            return (
              <button
                key={key}
                className={`category-option ${isSelected ? 'selected' : ''}`}
                onClick={() => setCategory(value)}
                style={{ '--cat-color': color }}
              >
                <div className="category-option-icon" style={{ color: isSelected ? color : undefined }}>
                  <Icon size={24} />
                </div>
                <span className="category-option-label">{CATEGORY_LABELS[locale]?.[value]}</span>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 'var(--space-6)' }}>
          <button className="btn btn-primary btn-lg btn-full" disabled={!category} onClick={() => setStep(2)}>
            {formatMessage({ id: 'common.next' })} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

    /* Step 2: Describe */
    if (step === 2) return (
      <div className="page-container animate-slide-up">
        <StepIndicator current={2} total={4} labels={stepLabels[locale]} />
        <div className="page-header">
          <h1 className="page-title">{locale === 'hi' ? 'घटना का विवरण' : 'Describe the Incident'}</h1>
          <p className="page-subtitle">{CATEGORY_LABELS[locale]?.[category]}</p>
        </div>

        <div className="form-group">
          <label className="form-label">{formatMessage({ id: 'submit.description' })}</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={formatMessage({ id: 'submit.descriptionPlaceholder' })}
            rows={6}
            autoFocus
          />
          <div className="form-hint">
            {description.length}/500 {locale === 'hi' ? 'अक्षर' : 'characters'}
          </div>
        </div>

        <div className="form-group">
          <div className="toggle-wrapper" onClick={() => setIsAnonymous(!isAnonymous)}>
            <div className={`toggle ${isAnonymous ? 'active' : ''}`} />
            <div>
              <div className="toggle-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                <EyeOff size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                {formatMessage({ id: 'submit.anonymous' })}
              </div>
              <div className="form-hint">{formatMessage({ id: 'submit.anonymousHint' })}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <button className="btn btn-ghost btn-lg" onClick={() => setStep(1)}><ArrowLeft size={18} /></button>
          <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={description.length < 10} onClick={() => setStep(3)}>
            {formatMessage({ id: 'common.next' })} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

    /* Step 3: Location */
    if (step === 3) return (
      <div className="page-container animate-slide-up">
        <StepIndicator current={3} total={4} labels={stepLabels[locale]} />
        <div className="page-header">
          <h1 className="page-title">{locale === 'hi' ? 'स्थान जोड़ें' : 'Add Location'}</h1>
        </div>

        {/* District */}
        <div className="form-group">
          <label className="form-label">
            {locale === 'hi' ? 'जिला' : 'District'} <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <select className="form-select" value={district} onChange={e => setDistrict(e.target.value)}>
            <option value="">{locale === 'hi' ? 'जिला चुनें...' : 'Select district...'}</option>
            {DISTRICTS.map(d => (
              <option key={d.id} value={d.id}>{locale === 'hi' ? d.nameHi : d.name}</option>
            ))}
          </select>
        </div>

        {/* Block */}
        <div className="form-group">
          <label className="form-label">
            {locale === 'hi' ? 'ब्लॉक' : 'Block'}
            {!district && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginLeft: 8 }}>
              ({locale === 'hi' ? 'पहले जिला चुनें' : 'select district first'})
            </span>}
          </label>
          <select className="form-select" value={block} onChange={e => setBlock(e.target.value)} disabled={!district}>
            <option value="">{locale === 'hi' ? 'ब्लॉक चुनें...' : 'Select block...'}</option>
            {blocks.map(b => (
              <option key={b.id} value={b.id}>{locale === 'hi' ? b.nameHi : b.name}</option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div className="form-group">
          <label className="form-label">{locale === 'hi' ? 'पता / लैंडमार्क' : 'Address / Landmark'}</label>
          <input
            type="text"
            className="form-input"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder={locale === 'hi' ? 'जैसे: सरकारी विद्यालय के पास, वार्ड 5' : 'e.g. Near Govt School, Ward 5'}
          />
        </div>

        {/* GPS */}
        <div className="form-group">
          <label className="form-label">{locale === 'hi' ? 'GPS स्थान' : 'GPS Coordinates'}</label>
          {gps ? (
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--success-bg)', border: '1px solid var(--success)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            }}>
              <Check size={16} color="var(--success)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--success)' }}>
                  {locale === 'hi' ? 'GPS कैप्चर हुआ' : 'GPS Captured'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                </div>
              </div>
              <button onClick={() => setGps(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-full"
              onClick={captureGPS}
              disabled={gpsLoading}
              style={{ justifyContent: 'center', gap: 'var(--space-2)', padding: 'var(--space-4)' }}
            >
              {gpsLoading ? (
                <><span className="spinner" /> {locale === 'hi' ? 'GPS खोज रहे हैं...' : 'Capturing GPS...'}</>
              ) : (
                <><Locate size={18} /> {locale === 'hi' ? 'GPS से स्थान पकड़ें' : 'Capture My Location'}</>
              )}
            </button>
          )}
          {gpsError && <div className="form-hint" style={{ color: 'var(--danger)' }}>{gpsError}</div>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <button className="btn btn-ghost btn-lg" onClick={() => setStep(2)}><ArrowLeft size={18} /></button>
          <button
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            disabled={!district}
            onClick={() => setStep(4)}
          >
            {formatMessage({ id: 'common.next' })} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );

    /* Step 4: Evidence + Submit */
    if (step === 4) return (
      <div className="page-container animate-slide-up">
        <StepIndicator current={4} total={4} labels={stepLabels[locale]} />
        <div className="page-header">
          <h1 className="page-title">{locale === 'hi' ? 'साक्ष्य संलग्न करें' : 'Attach Evidence'}</h1>
          <p className="page-subtitle">{locale === 'hi' ? 'वैकल्पिक — आप बाद में भी जोड़ सकते हैं' : 'Optional — you can skip this step'}</p>
        </div>

        <div className="form-group">
          <EvidenceBox
            evidence={evidence}
            onAdd={setEvidence}
            onRemove={() => setEvidence(null)}
          />
        </div>

        {/* Summary preview */}
        <div className="card" style={{ marginBottom: 'var(--space-5)', background: 'var(--surface)' }}>
          <div className="card-body">
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
              {locale === 'hi' ? 'समीक्षा' : 'Review'}
            </div>
            {[
              { label: locale === 'hi' ? 'श्रेणी' : 'Category', value: CATEGORY_LABELS[locale]?.[category] },
              { label: locale === 'hi' ? 'जिला' : 'District', value: DISTRICTS.find(d => d.id === district)?.[locale === 'hi' ? 'nameHi' : 'name'] },
              { label: locale === 'hi' ? 'ब्लॉक' : 'Block', value: blocks.find(b => b.id === block)?.[locale === 'hi' ? 'nameHi' : 'name'] || '—' },
              { label: locale === 'hi' ? 'गुमनाम' : 'Anonymous', value: isAnonymous ? (locale === 'hi' ? 'हाँ' : 'Yes') : (locale === 'hi' ? 'नहीं' : 'No') },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{label}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-lg" onClick={() => setStep(3)}><ArrowLeft size={18} /></button>
          
          {isRole('callReceiver') ? (
            <div style={{ flex: 1, display: 'flex', gap: 'var(--space-2)' }}>
              <button
                className="btn btn-outline btn-lg"
                style={{ flex: 1, padding: '0 var(--space-2)' }}
                disabled={isSubmitting}
                onClick={() => handleSubmit()}
              >
                {isSubmitting ? <span className="spinner" /> : locale === 'hi' ? 'लंबित में डालें' : 'Log as Pending'}
              </button>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1.2, padding: '0 var(--space-2)' }}
                disabled={isSubmitting}
                onClick={() => handleSubmit(STATES.ALERT_DISPATCHED)}
              >
                {isSubmitting ? <span className="spinner" /> : <><Sparkles size={16} /> {locale === 'hi' ? 'स्वीकृत करें' : 'Submit & Approve'}</>}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
            >
              {isSubmitting ? (
                <><span className="spinner" /> {formatMessage({ id: 'submit.submitting' })}</>
              ) : (
                <><Sparkles size={18} /> {formatMessage({ id: 'submit.button' })}</>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  /* ─── DESKTOP: all steps in one view ─── */
  const renderDesktopForm = () => (
    <div className="page-container animate-slide-up" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 'var(--space-8)' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">{formatMessage({ id: 'submit.title' })}</h1>
        <p className="page-subtitle">{locale === 'hi' ? 'कृपया नीचे सभी प्रासंगिक विवरण प्रदान करें' : 'Please provide all relevant details below'}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Card 1: Complaint Types */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileWarning size={20} color="var(--primary)" />
            {formatMessage({ id: 'submit.category' })}
          </h2>
          <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            {Object.entries(CATEGORIES).map(([key, value]) => {
              const { icon: Icon, color } = CATEGORY_CONFIG[key] || { icon: HelpCircle, color: 'var(--text-tertiary)' };
              return (
                <button
                  key={key}
                  className={`category-option ${category === value ? 'selected' : ''}`}
                  onClick={() => setCategory(value)}
                  style={{ '--cat-color': color, minHeight: 'auto', padding: 'var(--space-3)' }}
                >
                  <div className="category-option-icon" style={{ color: category === value ? color : undefined, width: 32, height: 32, marginBottom: 8 }}>
                    <Icon size={20} />
                  </div>
                  <span className="category-option-label" style={{ fontSize: 'var(--text-xs)' }}>
                    {CATEGORY_LABELS[locale]?.[value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Description */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <HelpCircle size={20} color="var(--primary)" />
            {formatMessage({ id: 'submit.description' })}
          </h2>
          <textarea
            className="form-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={formatMessage({ id: 'submit.descriptionPlaceholder' })}
            rows={4}
          />
          
          {/* Anonymous (hidden for Call Receiver) */}
          {!isRole('callReceiver') && (
            <div className="form-group" style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
              <div className="toggle-wrapper" onClick={() => setIsAnonymous(!isAnonymous)} style={{ padding: 'var(--space-3)', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                <div className={`toggle ${isAnonymous ? 'active' : ''}`} />
                <div>
                  <div className="toggle-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    <EyeOff size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    {formatMessage({ id: 'submit.anonymous' })}
                  </div>
                  <div className="form-hint" style={{ marginTop: 2 }}>{formatMessage({ id: 'submit.anonymousHint' })}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Location / Caller Details */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <MapPin size={20} color="var(--primary)" />
            {isRole('callReceiver') ? (locale === 'hi' ? 'कॉलर और स्थान' : 'Caller & Location Details') : (locale === 'hi' ? 'स्थान विवरण' : 'Location Details')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            {/* Caller details only for call receiver */}
            {isRole('callReceiver') && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{locale === 'hi' ? 'कॉलर का नाम' : 'Caller Name'}</label>
                  <input type="text" className="form-input" value={callerName} onChange={e => setCallerName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{locale === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}</label>
                  <input type="tel" className="form-input" value={callerPhone} onChange={e => setCallerPhone(e.target.value)} placeholder="+91..." />
                </div>
              </>
            )}

            {/* District */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{locale === 'hi' ? 'जिला' : 'District'} <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select className="form-select" value={district} onChange={e => setDistrict(e.target.value)}>
                <option value="">{locale === 'hi' ? 'जिला चुनें...' : 'Select district...'}</option>
                {DISTRICTS.map(d => <option key={d.id} value={d.id}>{locale === 'hi' ? d.nameHi : d.name}</option>)}
              </select>
            </div>

            {/* Block */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{locale === 'hi' ? 'ब्लॉक' : 'Block'}</label>
              <select className="form-select" value={block} onChange={e => setBlock(e.target.value)} disabled={!district}>
                <option value="">{locale === 'hi' ? 'ब्लॉक चुनें...' : 'Select block...'}</option>
                {blocks.map(b => <option key={b.id} value={b.id}>{locale === 'hi' ? b.nameHi : b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{locale === 'hi' ? 'पता / लैंडमार्क' : 'Address / Landmark'}</label>
            <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)}
              placeholder={locale === 'hi' ? 'जैसे: सरकारी विद्यालय के पास' : 'e.g. Near Govt School, Ward 5'} />
          </div>

          {/* GPS (Hidden for Call Receiver) */}
          {!isRole('callReceiver') && (
            <div className="form-group" style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
              <label className="form-label">{locale === 'hi' ? 'GPS स्थान' : 'GPS Coordinates'}</label>
              {gps ? (
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--success-bg)', border: '1px solid var(--success)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                }}>
                  <Check size={16} color="var(--success)" />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--success)', fontWeight: 600 }}>
                    {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                  </span>
                  <button onClick={() => setGps(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', color: 'var(--text-tertiary)' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button className="btn btn-ghost btn-full" onClick={captureGPS} disabled={gpsLoading}
                  style={{ justifyContent: 'center' }}>
                  {gpsLoading ? <><span className="spinner" /> {locale === 'hi' ? 'खोज रहे हैं...' : 'Capturing...'}</> : <><Locate size={16} /> {locale === 'hi' ? 'GPS स्थान पकड़ें' : 'Capture My Location'}</>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Card 4: Evidence */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Image size={20} color="var(--primary)" />
            {formatMessage({ id: 'submit.evidence' })}
          </h2>
          <EvidenceBox evidence={evidence} onAdd={setEvidence} onRemove={() => setEvidence(null)} />
        </div>

        {/* Submit Actions */}
        <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--surface-hover)' }}>
          {isRole('callReceiver') ? (
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                className="btn btn-outline btn-lg"
                style={{ flex: 1, background: 'var(--bg-body)' }}
                disabled={!category || !description || !district || isSubmitting || !callerName || !callerPhone}
                onClick={() => handleSubmit()}
              >
                {isSubmitting ? <span className="spinner" /> : locale === 'hi' ? 'लंबित में डालें' : 'Log as Pending'}
              </button>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1.5 }}
                disabled={!category || !description || !district || isSubmitting || !callerName || !callerPhone}
                onClick={() => handleSubmit(STATES.ALERT_DISPATCHED)}
              >
                {isSubmitting ? <span className="spinner" /> : <><Sparkles size={18} /> {locale === 'hi' ? 'स्वीकृत और डिस्पैच करें' : 'Submit & Approve'}</>}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-lg btn-full"
              disabled={!category || !description || !district || isSubmitting}
              onClick={() => handleSubmit()}
            >
              {isSubmitting
                ? <><span className="spinner" /> {formatMessage({ id: 'submit.submitting' })}</>
                : <><Sparkles size={18} /> {formatMessage({ id: 'submit.button' })}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ─── Responsive switch: mobile vs desktop ─── */
  return (
    <>
      {/* Mobile: step-by-step (below 768px) */}
      <div className="submit-mobile-view">
        {renderMobileStep()}
      </div>
      {/* Desktop: single scrollable form (768px+) */}
      <div className="submit-desktop-view">
        {renderDesktopForm()}
      </div>
    </>
  );
}
