/**
 * Complaint State Machine
 * States: SUBMITTED → UNDER_REVIEW → ALERT_DISPATCHED → EN_ROUTE → FIRST_ACTION_LOGGED → RESOLVED | ESCALATED
 * Escalated complaints can also reach RESOLVED.
 */

export const STATES = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ALERT_DISPATCHED: 'ALERT_DISPATCHED',
  EN_ROUTE: 'EN_ROUTE',
  FIRST_ACTION_LOGGED: 'FIRST_ACTION_LOGGED',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED',
  DUPLICATE: 'DUPLICATE',
  FALSE_COMPLAINT: 'FALSE_COMPLAINT',
};

export const STATE_LABELS = {
  en: {
    [STATES.SUBMITTED]: 'Submitted',
    [STATES.UNDER_REVIEW]: 'Under Review',
    [STATES.ALERT_DISPATCHED]: 'Alert Dispatched',
    [STATES.EN_ROUTE]: 'Squad En Route',
    [STATES.FIRST_ACTION_LOGGED]: 'First Action Taken',
    [STATES.RESOLVED]: 'Resolved',
    [STATES.ESCALATED]: 'Escalated',
    [STATES.DUPLICATE]: 'Duplicate',
    [STATES.FALSE_COMPLAINT]: 'False Complaint',
  },
  hi: {
    [STATES.SUBMITTED]: 'प्रस्तुत',
    [STATES.UNDER_REVIEW]: 'समीक्षाधीन',
    [STATES.ALERT_DISPATCHED]: 'अलर्ट भेजा गया',
    [STATES.EN_ROUTE]: 'दल रास्ते में',
    [STATES.FIRST_ACTION_LOGGED]: 'प्रथम कार्रवाई',
    [STATES.RESOLVED]: 'समाधान',
    [STATES.ESCALATED]: 'उच्चाधिकारी को भेजा',
    [STATES.DUPLICATE]: 'डुप्लीकेट',
    [STATES.FALSE_COMPLAINT]: 'झूठी शिकायत',
  },
};

// Valid state transitions
const TRANSITIONS = {
  [STATES.SUBMITTED]: [STATES.UNDER_REVIEW, STATES.DUPLICATE, STATES.FALSE_COMPLAINT],
  [STATES.UNDER_REVIEW]: [STATES.ALERT_DISPATCHED, STATES.DUPLICATE, STATES.FALSE_COMPLAINT],
  [STATES.ALERT_DISPATCHED]: [STATES.EN_ROUTE],
  [STATES.EN_ROUTE]: [STATES.FIRST_ACTION_LOGGED],
  [STATES.FIRST_ACTION_LOGGED]: [STATES.RESOLVED, STATES.ESCALATED],
  [STATES.ESCALATED]: [STATES.RESOLVED],
  [STATES.RESOLVED]: [],
  [STATES.DUPLICATE]: [],
  [STATES.FALSE_COMPLAINT]: [],
};

// Timestamp field mapping for each state transition
const TIMESTAMP_FIELDS = {
  [STATES.SUBMITTED]: 'submissionTime',
  [STATES.UNDER_REVIEW]: 'reviewTime',
  [STATES.ALERT_DISPATCHED]: 'alertDispatchTime',
  [STATES.EN_ROUTE]: 'squadDepartureTime',
  [STATES.FIRST_ACTION_LOGGED]: 'actionTime',
  [STATES.RESOLVED]: 'resolutionTime',
  [STATES.ESCALATED]: 'escalationTime',
};

/**
 * Check if a state transition is valid
 */
export function canTransition(fromState, toState) {
  const allowed = TRANSITIONS[fromState];
  if (!allowed) return false;
  return allowed.includes(toState);
}

/**
 * Get valid next states from a given state
 */
export function getNextStates(currentState) {
  return TRANSITIONS[currentState] || [];
}

/**
 * Perform a state transition with validation
 * Returns the updated complaint object with new state and timestamp
 */
export function transition(complaint, toState, metadata = {}) {
  if (!canTransition(complaint.status, toState)) {
    throw new Error(
      `Invalid transition: ${complaint.status} → ${toState}. ` +
      `Allowed: ${TRANSITIONS[complaint.status]?.join(', ') || 'none'}`
    );
  }

  // Enforce first-action gate: cannot resolve or escalate without first action
  if (
    (toState === STATES.RESOLVED || toState === STATES.ESCALATED) &&
    complaint.status !== STATES.FIRST_ACTION_LOGGED &&
    complaint.status !== STATES.ESCALATED
  ) {
    throw new Error('First action must be logged before resolving or escalating');
  }

  const now = new Date().toISOString();
  const timestampField = TIMESTAMP_FIELDS[toState];

  const auditEntry = {
    fromState: complaint.status,
    toState,
    timestamp: now,
    actor: metadata.actor || 'system',
    actorRole: metadata.actorRole || 'system',
    notes: metadata.notes || '',
    ...metadata.auditExtra,
  };

  return {
    ...complaint,
    status: toState,
    timestamps: {
      ...complaint.timestamps,
      ...(timestampField ? { [timestampField]: now } : {}),
    },
    auditTrail: [...(complaint.auditTrail || []), auditEntry],
    ...(metadata.extra || {}),
  };
}

/**
 * Get the ordered progression of states for timeline display
 */
export function getStateProgression() {
  return [
    STATES.SUBMITTED,
    STATES.UNDER_REVIEW,
    STATES.ALERT_DISPATCHED,
    STATES.EN_ROUTE,
    STATES.FIRST_ACTION_LOGGED,
    STATES.RESOLVED,
  ];
}

/**
 * Get the state index for progress calculation
 */
export function getStateIndex(state) {
  const progression = getStateProgression();
  const idx = progression.indexOf(state);
  if (idx === -1) {
    // ESCALATED is between FIRST_ACTION_LOGGED and RESOLVED
    if (state === STATES.ESCALATED) return 4.5;
    return -1;
  }
  return idx;
}

/**
 * Check if a complaint is in a terminal state
 */
export function isTerminal(state) {
  return [STATES.RESOLVED, STATES.DUPLICATE, STATES.FALSE_COMPLAINT].includes(state);
}

/**
 * Check if first action has been logged for a complaint
 */
export function hasFirstAction(complaint) {
  return complaint.timestamps?.actionTime != null ||
    complaint.status === STATES.FIRST_ACTION_LOGGED ||
    complaint.status === STATES.RESOLVED ||
    complaint.status === STATES.ESCALATED;
}

export const CATEGORIES = {
  BOOTH_CAPTURING: 'BOOTH_CAPTURING',
  BRIBERY: 'BRIBERY',
  CODE_OF_CONDUCT: 'CODE_OF_CONDUCT',
  CAMPAIGN_MALPRACTICE: 'CAMPAIGN_MALPRACTICE',
  OTHER: 'OTHER',
};

export const CATEGORY_LABELS = {
  en: {
    [CATEGORIES.BOOTH_CAPTURING]: 'Booth Capturing',
    [CATEGORIES.BRIBERY]: 'Bribery / Vote Buying',
    [CATEGORIES.CODE_OF_CONDUCT]: 'Code of Conduct Violation',
    [CATEGORIES.CAMPAIGN_MALPRACTICE]: 'Campaign Malpractice',
    [CATEGORIES.OTHER]: 'Other',
  },
  hi: {
    [CATEGORIES.BOOTH_CAPTURING]: 'बूथ कैप्चरिंग',
    [CATEGORIES.BRIBERY]: 'रिश्वतखोरी / वोट खरीद',
    [CATEGORIES.CODE_OF_CONDUCT]: 'आचार संहिता उल्लंघन',
    [CATEGORIES.CAMPAIGN_MALPRACTICE]: 'चुनाव प्रचार में गड़बड़ी',
    [CATEGORIES.OTHER]: 'अन्य',
  },
};

export const CHANNELS = {
  WEB: 'WEB',
  TOLL_FREE: 'TOLL_FREE',
};

export const FIRST_ACTION_TYPES = {
  SITE_VERIFICATION: 'SITE_VERIFICATION',
  PRELIMINARY_INTERVENTION: 'PRELIMINARY_INTERVENTION',
  EVIDENCE_COLLECTION: 'EVIDENCE_COLLECTION',
  OTHER: 'OTHER',
};

export const FIRST_ACTION_LABELS = {
  en: {
    [FIRST_ACTION_TYPES.SITE_VERIFICATION]: 'Site Verification',
    [FIRST_ACTION_TYPES.PRELIMINARY_INTERVENTION]: 'Preliminary Intervention',
    [FIRST_ACTION_TYPES.EVIDENCE_COLLECTION]: 'Evidence Collection',
    [FIRST_ACTION_TYPES.OTHER]: 'Other Action',
  },
  hi: {
    [FIRST_ACTION_TYPES.SITE_VERIFICATION]: 'स्थल सत्यापन',
    [FIRST_ACTION_TYPES.PRELIMINARY_INTERVENTION]: 'प्रारंभिक हस्तक्षेप',
    [FIRST_ACTION_TYPES.EVIDENCE_COLLECTION]: 'साक्ष्य संग्रहण',
    [FIRST_ACTION_TYPES.OTHER]: 'अन्य कार्रवाई',
  },
};
