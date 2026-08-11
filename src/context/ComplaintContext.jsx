import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { generateSeedData, generateComplaintId, FLYING_SQUADS } from '../lib/mockData';
import { transition, canTransition, STATES } from '../lib/stateMachine';
import { jitterPosition } from '../lib/gpsSimulator';

const ComplaintContext = createContext();

const seedData = generateSeedData();

const initialState = {
  complaints: seedData.complaints,
  flyingSquads: seedData.flyingSquads.map(s => ({ ...s })),
  callReceivers: seedData.callReceivers,
  districts: seedData.districts,
  zones: seedData.zones,
  notifications: [],
  offlineQueue: [],
};

function complaintReducer(state, action) {
  switch (action.type) {
    case 'ADD_COMPLAINT': {
      const newComplaint = {
        ...action.payload,
        id: generateComplaintId(),
        status: action.payload.status || STATES.SUBMITTED,
        timestamps: {
          submissionTime: new Date().toISOString(),
        },
        auditTrail: [{
          fromState: null,
          toState: STATES.SUBMITTED,
          timestamp: new Date().toISOString(),
          actor: action.payload.channel === 'TOLL_FREE' ? 'call-receiver' : 'citizen',
          actorRole: action.payload.channel === 'TOLL_FREE' ? 'callReceiver' : 'complainant',
          notes: 'Complaint submitted',
        }],
        evidence: action.payload.evidence || [],
        firstAction: null,
        escalation: null,
        feedback: null,
        isFlagged: false,
        isDuplicate: false,
        mergedWith: null,
      };

      return {
        ...state,
        complaints: [newComplaint, ...state.complaints],
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            type: 'complaint_created',
            complaintId: newComplaint.id,
            message: `New complaint ${newComplaint.id} submitted`,
            timestamp: new Date().toISOString(),
            read: false,
          },
        ],
      };
    }

    case 'TRANSITION_COMPLAINT': {
      const { complaintId, toState, metadata } = action.payload;
      const idx = state.complaints.findIndex(c => c.id === complaintId);
      if (idx === -1) return state;

      const complaint = state.complaints[idx];
      if (!canTransition(complaint.status, toState)) return state;

      try {
        const updated = transition(complaint, toState, metadata);
        const newComplaints = [...state.complaints];
        newComplaints[idx] = updated;

        return {
          ...state,
          complaints: newComplaints,
          notifications: [
            ...state.notifications,
            {
              id: Date.now(),
              type: 'status_change',
              complaintId,
              message: `Complaint ${complaintId}: ${complaint.status} → ${toState}`,
              timestamp: new Date().toISOString(),
              read: false,
            },
          ],
        };
      } catch {
        return state;
      }
    }

    case 'LOG_FIRST_ACTION': {
      const { complaintId, actionData } = action.payload;
      const idx = state.complaints.findIndex(c => c.id === complaintId);
      if (idx === -1) return state;

      const complaint = state.complaints[idx];
      const now = new Date().toISOString();

      const updated = {
        ...complaint,
        status: STATES.FIRST_ACTION_LOGGED,
        firstAction: {
          ...actionData,
          timestamp: now,
        },
        timestamps: {
          ...complaint.timestamps,
          arrivalTime: complaint.timestamps.arrivalTime || now,
          actionTime: now,
        },
        auditTrail: [
          ...complaint.auditTrail,
          {
            fromState: complaint.status,
            toState: STATES.FIRST_ACTION_LOGGED,
            timestamp: now,
            actor: actionData.actor || 'squad',
            actorRole: 'flyingSquad',
            notes: `First action: ${actionData.type} - ${actionData.notes}`,
          },
        ],
      };

      const newComplaints = [...state.complaints];
      newComplaints[idx] = updated;

      return { ...state, complaints: newComplaints };
    }

    case 'ESCALATE_COMPLAINT': {
      const { complaintId, escalationData } = action.payload;
      const idx = state.complaints.findIndex(c => c.id === complaintId);
      if (idx === -1) return state;

      const complaint = state.complaints[idx];
      const now = new Date().toISOString();

      const updated = {
        ...complaint,
        status: STATES.ESCALATED,
        escalation: escalationData,
        timestamps: {
          ...complaint.timestamps,
          escalationTime: now,
        },
        auditTrail: [
          ...complaint.auditTrail,
          {
            fromState: complaint.status,
            toState: STATES.ESCALATED,
            timestamp: now,
            actor: escalationData.actor || 'squad',
            actorRole: 'flyingSquad',
            notes: `Escalated to ${escalationData.targetAuthority}: ${escalationData.reason}`,
          },
        ],
      };

      const newComplaints = [...state.complaints];
      newComplaints[idx] = updated;

      return { ...state, complaints: newComplaints };
    }

    case 'FLAG_COMPLAINT': {
      const { complaintId, flagType } = action.payload;
      const idx = state.complaints.findIndex(c => c.id === complaintId);
      if (idx === -1) return state;

      const newComplaints = [...state.complaints];
      if (flagType === 'duplicate') {
        newComplaints[idx] = { ...newComplaints[idx], isDuplicate: true, status: STATES.DUPLICATE };
      } else if (flagType === 'false') {
        newComplaints[idx] = { ...newComplaints[idx], isFlagged: true, status: STATES.FALSE_COMPLAINT };
      }

      return { ...state, complaints: newComplaints };
    }

    case 'ADD_FEEDBACK': {
      const { complaintId, feedback } = action.payload;
      const idx = state.complaints.findIndex(c => c.id === complaintId);
      if (idx === -1) return state;

      const newComplaints = [...state.complaints];
      newComplaints[idx] = {
        ...newComplaints[idx],
        feedback: { ...feedback, timestamp: new Date().toISOString() },
      };

      return { ...state, complaints: newComplaints };
    }

    case 'UPDATE_SQUAD_POSITION': {
      const { squadId, lat, lng } = action.payload;
      const idx = state.flyingSquads.findIndex(s => s.id === squadId);
      if (idx === -1) return state;

      const newSquads = [...state.flyingSquads];
      newSquads[idx] = { ...newSquads[idx], lat, lng };

      return { ...state, flyingSquads: newSquads };
    }

    case 'MARK_NOTIFICATION_READ': {
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    }

    default:
      return state;
  }
}

export function ComplaintProvider({ children }) {
  const [state, dispatch] = useReducer(complaintReducer, initialState);
  const intervalRef = useRef(null);

  // Simulate GPS updates for squads every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      state.flyingSquads.forEach(squad => {
        const jittered = jitterPosition({ lat: squad.lat, lng: squad.lng }, 0.2);
        dispatch({
          type: 'UPDATE_SQUAD_POSITION',
          payload: { squadId: squad.id, lat: jittered.lat, lng: jittered.lng },
        });
      });
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addComplaint = useCallback((complaint) => {
    dispatch({ type: 'ADD_COMPLAINT', payload: complaint });
  }, []);

  const transitionComplaint = useCallback((complaintId, toState, metadata = {}) => {
    dispatch({ type: 'TRANSITION_COMPLAINT', payload: { complaintId, toState, metadata } });
  }, []);

  const logFirstAction = useCallback((complaintId, actionData) => {
    dispatch({ type: 'LOG_FIRST_ACTION', payload: { complaintId, actionData } });
  }, []);

  const escalateComplaint = useCallback((complaintId, escalationData) => {
    dispatch({ type: 'ESCALATE_COMPLAINT', payload: { complaintId, escalationData } });
  }, []);

  const flagComplaint = useCallback((complaintId, flagType) => {
    dispatch({ type: 'FLAG_COMPLAINT', payload: { complaintId, flagType } });
  }, []);

  const addFeedback = useCallback((complaintId, feedback) => {
    dispatch({ type: 'ADD_FEEDBACK', payload: { complaintId, feedback } });
  }, []);

  const getComplaint = useCallback((id) => {
    return state.complaints.find(c => c.id === id);
  }, [state.complaints]);

  const getComplaintsByStatus = useCallback((status) => {
    if (Array.isArray(status)) {
      return state.complaints.filter(c => status.includes(c.status));
    }
    return state.complaints.filter(c => c.status === status);
  }, [state.complaints]);

  const getComplaintsByDistrict = useCallback((districtId) => {
    return state.complaints.filter(c => c.location?.district === districtId);
  }, [state.complaints]);

  return (
    <ComplaintContext.Provider value={{
      ...state,
      addComplaint,
      transitionComplaint,
      logFirstAction,
      escalateComplaint,
      flagComplaint,
      addFeedback,
      getComplaint,
      getComplaintsByStatus,
      getComplaintsByDistrict,
    }}>
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) throw new Error('useComplaints must be used within ComplaintProvider');
  return context;
}
