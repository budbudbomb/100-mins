import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useComplaints } from '../../context/ComplaintContext';
import { Star, Send } from 'lucide-react';

export default function FeedbackForm({ complaintId, onClose }) {
  const { formatMessage } = useIntl();
  const { addFeedback } = useComplaints();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    addFeedback(complaintId, { rating, comment });
    setSubmitted(true);
    setTimeout(() => onClose?.(), 2000);
  };

  if (submitted) {
    return (
      <div className="card animate-scale-in" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>🙏</div>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--success)', marginBottom: 'var(--space-2)' }}>
          {formatMessage({ id: 'feedback.thanks' })}
        </h3>
      </div>
    );
  }

  return (
    <div className="card animate-slide-in">
      <div className="card-header">
        <div className="card-header-title">{formatMessage({ id: 'feedback.title' })}</div>
      </div>
      <div className="card-body">
        {/* Star Rating */}
        <div className="form-group">
          <label className="form-label">{formatMessage({ id: 'feedback.rating' })}</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform var(--transition-spring)',
                  transform: (hoveredStar >= star || rating >= star) ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                <Star
                  size={32}
                  fill={(hoveredStar >= star || rating >= star) ? '#fbbf24' : 'transparent'}
                  color={(hoveredStar >= star || rating >= star) ? '#fbbf24' : 'var(--text-tertiary)'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="form-group">
          <label className="form-label">{formatMessage({ id: 'feedback.comment' })}</label>
          <textarea
            className="form-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={formatMessage({ id: 'feedback.commentPlaceholder' })}
            rows={3}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost" onClick={onClose}>
            {formatMessage({ id: 'common.cancel' })}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={rating === 0} style={{ flex: 1 }}>
            <Send size={16} />
            {formatMessage({ id: 'feedback.submit' })}
          </button>
        </div>
      </div>
    </div>
  );
}
