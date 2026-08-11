import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORIES, CATEGORY_LABELS, CHANNELS } from '../../lib/stateMachine';
import { DISTRICTS } from '../../lib/mockData';
import { 
  Phone, MapPin, ShieldAlert, Banknote, FileWarning, 
  Megaphone, Send, Mic, ChevronDown, ChevronUp, Check 
} from 'lucide-react';

const CATEGORY_ICONS = {
  BOOTH_CAPTURING: ShieldAlert,
  BRIBERY: Banknote,
  CODE_OF_CONDUCT: FileWarning,
  CAMPAIGN_MALPRACTICE: Megaphone,
};

const CALL_SCRIPT = {
  en: [
    "1. Greet the caller: 'Thank you for calling the Election Complaint Helpline.'",
    "2. Ask: 'Can you describe the nature of the complaint?'",
    "3. Ask: 'Where is this happening? Please provide the nearest landmark or address.'",
    "4. Ask: 'How many people are involved approximately?'",
    "5. Ask: 'Are you witnessing this right now or did it happen earlier?'",
    "6. Ask: 'Would you like to remain anonymous?'",
    "7. Confirm details and inform: 'Your complaint has been registered. A team will respond within 100 minutes.'",
    "8. Provide the complaint ID for tracking.",
  ],
  hi: [
    "1. अभिवादन करें: 'चुनाव शिकायत हेल्पलाइन पर कॉल करने के लिए धन्यवाद।'",
    "2. पूछें: 'शिकायत का स्वरूप क्या है?'",
    "3. पूछें: 'यह कहाँ हो रहा है? कृपया निकटतम लैंडमार्क या पता बताएं।'",
    "4. पूछें: 'लगभग कितने लोग शामिल हैं?'",
    "5. पूछें: 'क्या आप अभी यह देख रहे हैं या यह पहले हुआ था?'",
    "6. पूछें: 'क्या आप गुमनाम रहना चाहते हैं?'",
    "7. विवरण की पुष्टि करें: 'आपकी शिकायत दर्ज कर ली गई है। 100 मिनट में दल प्रतिक्रिया करेगा।'",
    "8. ट्रैकिंग के लिए शिकायत आईडी प्रदान करें।",
  ],
};

export default function LogComplaint() {
  const { formatMessage } = useIntl();
  const { locale } = useLanguage();
  const { addComplaint } = useComplaints();
  
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [locationDesc, setLocationDesc] = useState('');
  const [district, setDistrict] = useState('bhopal');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const handleSubmit = async () => {
    if (!category || !description || !locationDesc) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const selectedDistrict = DISTRICTS.find(d => d.id === district) || DISTRICTS[0];

    const newComplaint = {
      category,
      description,
      channel: CHANNELS.TOLL_FREE,
      location: {
        lat: selectedDistrict.lat + (Math.random() - 0.5) * 0.05,
        lng: selectedDistrict.lng + (Math.random() - 0.5) * 0.05,
        landmark: locationDesc,
        district: selectedDistrict.id,
        districtName: selectedDistrict.name,
        districtNameHi: selectedDistrict.nameHi,
      },
      complainant: isAnonymous ? {
        anonymous: true,
        phone: null,
        name: null,
      } : {
        anonymous: false,
        phone: callerPhone ? `+91${callerPhone}` : null,
        name: null,
      },
      evidence: [],
    };

    addComplaint(newComplaint);
    setSubmittedId(`EC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setCategory('');
    setDescription('');
    setCallerPhone('');
    setLocationDesc('');
    setDistrict('bhopal');
    setIsAnonymous(false);
    setSubmitted(false);
    setSubmittedId('');
  };

  if (submitted) {
    return (
      <div className="page-container animate-scale-in" style={{ textAlign: 'center', paddingTop: 'var(--space-12)' }}>
        <div className="success-checkmark">
          <Check size={40} />
        </div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--success)' }}>
          {locale === 'hi' ? 'शिकायत दर्ज की गई' : 'Complaint Logged'}
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: 'var(--primary-light)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          {submittedId}
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          {locale === 'hi' ? 'SLA टाइमर शुरू हो गया है। शिकायत समीक्षा कतार में है।' : 'SLA timer started. Complaint is in the review queue.'}
        </p>

        {/* Recording indicator */}
        <div className="card" style={{ maxWidth: '360px', margin: '0 auto var(--space-6)', padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'center' }}>
            <Mic size={16} style={{ color: 'var(--danger)' }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {formatMessage({ id: 'callLog.recordingActive' })}
            </span>
            <span style={{ 
              width: 8, height: 8, borderRadius: '50%', 
              background: 'var(--danger)', 
              animation: 'pulse-dot 1.5s ease-in-out infinite' 
            }} />
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={resetForm}>
          {locale === 'hi' ? 'नई कॉल दर्ज करें' : 'Log Another Call'}
        </button>
      </div>
    );
  }

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">{formatMessage({ id: 'callLog.title' })}</h1>
        {/* Recording indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <span style={{ 
            width: 8, height: 8, borderRadius: '50%', 
            background: 'var(--danger)', 
            animation: 'pulse-dot 1.5s ease-in-out infinite' 
          }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', fontWeight: 600 }}>
            {formatMessage({ id: 'callLog.recordingActive' })}
          </span>
        </div>
      </div>

      {/* Call Script Toggle */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <button 
          onClick={() => setShowScript(!showScript)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: 'var(--space-4)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            📋 {formatMessage({ id: 'callLog.script' })}
          </span>
          {showScript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showScript && (
          <div style={{ padding: '0 var(--space-4) var(--space-4)', borderTop: '1px solid var(--border-light)' }}>
            <ol style={{ paddingLeft: 0, listStyle: 'none', margin: 0, marginTop: 'var(--space-3)' }}>
              {CALL_SCRIPT[locale].map((step, i) => (
                <li key={i} style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  padding: 'var(--space-2) 0',
                  borderBottom: i < CALL_SCRIPT[locale].length - 1 ? '1px solid var(--border-light)' : 'none',
                }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Caller Phone */}
      <div className="form-group">
        <label className="form-label">
          <Phone size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          {formatMessage({ id: 'callLog.callerPhone' })}
        </label>
        <input
          type="tel"
          className="form-input"
          value={callerPhone}
          onChange={(e) => setCallerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="98XXXXXXXX"
          maxLength={10}
        />
      </div>

      {/* Category */}
      <div className="form-group">
        <label className="form-label">{formatMessage({ id: 'submit.category' })}</label>
        <div className="category-grid">
          {Object.entries(CATEGORIES).map(([key, value]) => {
            const Icon = CATEGORY_ICONS[key];
            return (
              <button
                key={key}
                className={`category-option ${category === value ? 'selected' : ''}`}
                onClick={() => setCategory(value)}
              >
                <div className="category-option-icon">
                  <Icon size={20} />
                </div>
                <span className="category-option-label">
                  {CATEGORY_LABELS[locale]?.[value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">{formatMessage({ id: 'submit.description' })}</label>
        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={formatMessage({ id: 'submit.descriptionPlaceholder' })}
          rows={4}
        />
      </div>

      {/* Location by Description */}
      <div className="form-group">
        <label className="form-label">
          <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          {formatMessage({ id: 'callLog.locationDescription' })}
        </label>
        <textarea
          className="form-textarea"
          value={locationDesc}
          onChange={(e) => setLocationDesc(e.target.value)}
          placeholder={formatMessage({ id: 'callLog.locationPlaceholder' })}
          rows={2}
        />
      </div>

      {/* District */}
      <div className="form-group">
        <label className="form-label">{formatMessage({ id: 'common.district' })}</label>
        <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
          {DISTRICTS.map(d => (
            <option key={d.id} value={d.id}>
              {locale === 'hi' ? d.nameHi : d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Anonymous Toggle */}
      <div className="form-group">
        <div className="toggle-wrapper" onClick={() => setIsAnonymous(!isAnonymous)}>
          <div className={`toggle ${isAnonymous ? 'active' : ''}`} />
          <span className="toggle-label">{formatMessage({ id: 'submit.anonymous' })}</span>
        </div>
      </div>

      {/* Submit */}
      <button
        className="btn btn-primary btn-lg btn-full"
        disabled={!category || !description || !locationDesc || isSubmitting}
        onClick={handleSubmit}
        style={{ marginTop: 'var(--space-4)' }}
      >
        {isSubmitting ? (
          formatMessage({ id: 'submit.submitting' })
        ) : (
          <>
            <Send size={18} />
            {formatMessage({ id: 'callLog.submit' })}
          </>
        )}
      </button>
    </div>
  );
}
