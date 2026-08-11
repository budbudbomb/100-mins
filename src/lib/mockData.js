/**
 * Mock Data Generator
 * Generates realistic seed data for all roles across Madhya Pradesh districts
 */

import { STATES, CATEGORIES, CHANNELS, FIRST_ACTION_TYPES } from './stateMachine.js';

// Real MP districts with approximate coordinates
const DISTRICTS = [
  { id: 'bhopal', name: 'Bhopal', nameHi: 'भोपाल', lat: 23.2599, lng: 77.4126 },
  { id: 'indore', name: 'Indore', nameHi: 'इंदौर', lat: 22.7196, lng: 75.8577 },
  { id: 'jabalpur', name: 'Jabalpur', nameHi: 'जबलपुर', lat: 23.1815, lng: 79.9864 },
  { id: 'gwalior', name: 'Gwalior', nameHi: 'ग्वालियर', lat: 26.2183, lng: 78.1828 },
  { id: 'ujjain', name: 'Ujjain', nameHi: 'उज्जैन', lat: 23.1765, lng: 75.7885 },
  { id: 'sagar', name: 'Sagar', nameHi: 'सागर', lat: 23.8388, lng: 78.7378 },
  { id: 'dewas', name: 'Dewas', nameHi: 'देवास', lat: 22.9676, lng: 76.0534 },
  { id: 'satna', name: 'Satna', nameHi: 'सतना', lat: 24.5805, lng: 80.8322 },
];

// Blocks per district (Urban / Rural panchayat blocks)
const BLOCKS_BY_DISTRICT = {
  bhopal: [
    { id: 'huzur', name: 'Huzur', nameHi: 'हुज़ूर' },
    { id: 'berasia', name: 'Berasia', nameHi: 'बेरसिया' },
    { id: 'phanda', name: 'Phanda', nameHi: 'फंदा' },
    { id: 'kolars', name: 'Kolar Road', nameHi: 'कोलार रोड' },
  ],
  indore: [
    { id: 'indore_city', name: 'Indore City', nameHi: 'इंदौर शहर' },
    { id: 'mhow', name: 'Mhow', nameHi: 'महू' },
    { id: 'depalpur', name: 'Depalpur', nameHi: 'देपालपुर' },
    { id: 'sanwer', name: 'Sanwer', nameHi: 'सांवेर' },
  ],
  jabalpur: [
    { id: 'jabalpur_city', name: 'Jabalpur City', nameHi: 'जबलपुर शहर' },
    { id: 'patan', name: 'Patan', nameHi: 'पाटन' },
    { id: 'kundam', name: 'Kundam', nameHi: 'कुंडम' },
    { id: 'sihora', name: 'Sihora', nameHi: 'सिहोरा' },
  ],
  gwalior: [
    { id: 'gwalior_city', name: 'Gwalior City', nameHi: 'ग्वालियर शहर' },
    { id: 'bhitarwar', name: 'Bhitarwar', nameHi: 'भितरवार' },
    { id: 'dabra', name: 'Dabra', nameHi: 'डबरा' },
    { id: 'pichhore', name: 'Pichhore', nameHi: 'पिछोर' },
  ],
  ujjain: [
    { id: 'ujjain_city', name: 'Ujjain City', nameHi: 'उज्जैन शहर' },
    { id: 'mahidpur', name: 'Mahidpur', nameHi: 'महिदपुर' },
    { id: 'tarana', name: 'Tarana', nameHi: 'तराना' },
    { id: 'nagda', name: 'Nagda', nameHi: 'नागदा' },
  ],
  sagar: [
    { id: 'sagar_city', name: 'Sagar City', nameHi: 'सागर शहर' },
    { id: 'rehli', name: 'Rehli', nameHi: 'रेहली' },
    { id: 'banda', name: 'Banda', nameHi: 'बांदा' },
    { id: 'khurai', name: 'Khurai', nameHi: 'खुरई' },
  ],
  dewas: [
    { id: 'dewas_city', name: 'Dewas City', nameHi: 'देवास शहर' },
    { id: 'kannod', name: 'Kannod', nameHi: 'कन्नोड' },
    { id: 'bagli', name: 'Bagli', nameHi: 'बागली' },
    { id: 'tonkkhurd', name: 'Tonk Khurd', nameHi: 'टोंक खुर्द' },
  ],
  satna: [
    { id: 'satna_city', name: 'Satna City', nameHi: 'सतना शहर' },
    { id: 'maihar', name: 'Maihar', nameHi: 'मैहर' },
    { id: 'ramnagar', name: 'Ramnagar', nameHi: 'रामनगर' },
    { id: 'uchhahara', name: 'Uchahara', nameHi: 'उचेहरा' },
  ],
};


// Zone assignments for Flying Squads
const ZONES = [
  { id: 'zone-a', name: 'Zone A - North', districts: ['bhopal', 'sagar'] },
  { id: 'zone-b', name: 'Zone B - West', districts: ['indore', 'ujjain', 'dewas'] },
  { id: 'zone-c', name: 'Zone C - East', districts: ['jabalpur', 'satna'] },
  { id: 'zone-d', name: 'Zone D - Central', districts: ['gwalior'] },
];

// Flying Squad teams
const FLYING_SQUADS = [
  { id: 'fs-001', name: 'Alpha Squad', zoneId: 'zone-a', districtId: 'bhopal', status: 'available', lat: 23.2500, lng: 77.4000, members: ['Officer Sharma', 'Officer Patel', 'Officer Khan'] },
  { id: 'fs-002', name: 'Bravo Squad', zoneId: 'zone-a', districtId: 'sagar', status: 'available', lat: 23.8300, lng: 78.7300, members: ['Officer Verma', 'Officer Singh', 'Officer Joshi'] },
  { id: 'fs-003', name: 'Charlie Squad', zoneId: 'zone-b', districtId: 'indore', status: 'on_mission', lat: 22.7100, lng: 75.8500, members: ['Officer Gupta', 'Officer Thakur', 'Officer Yadav'] },
  { id: 'fs-004', name: 'Delta Squad', zoneId: 'zone-b', districtId: 'ujjain', status: 'available', lat: 23.1700, lng: 75.7800, members: ['Officer Mishra', 'Officer Dubey', 'Officer Tiwari'] },
  { id: 'fs-005', name: 'Echo Squad', zoneId: 'zone-b', districtId: 'dewas', status: 'available', lat: 22.9600, lng: 76.0500, members: ['Officer Rajput', 'Officer Chouhan', 'Officer Pandey'] },
  { id: 'fs-006', name: 'Foxtrot Squad', zoneId: 'zone-c', districtId: 'jabalpur', status: 'available', lat: 23.1750, lng: 79.9800, members: ['Officer Soni', 'Officer Bhatt', 'Officer Dixit'] },
  { id: 'fs-007', name: 'Golf Squad', zoneId: 'zone-c', districtId: 'satna', status: 'on_mission', lat: 24.5750, lng: 80.8200, members: ['Officer Saxena', 'Officer Agarwal', 'Officer Shukla'] },
  { id: 'fs-008', name: 'Hotel Squad', zoneId: 'zone-d', districtId: 'gwalior', status: 'available', lat: 26.2100, lng: 78.1700, members: ['Officer Chauhan', 'Officer Rathore', 'Officer Kushwaha'] },
];

// Call Receivers
const CALL_RECEIVERS = [
  { id: 'cr-001', name: 'Anita Sharma', districtId: 'bhopal', shift: 'morning', callsHandled: 45, avgHandlingTime: 4.2 },
  { id: 'cr-002', name: 'Rajesh Kumar', districtId: 'bhopal', shift: 'evening', callsHandled: 38, avgHandlingTime: 5.1 },
  { id: 'cr-003', name: 'Priya Patel', districtId: 'indore', shift: 'morning', callsHandled: 52, avgHandlingTime: 3.8 },
  { id: 'cr-004', name: 'Vikram Singh', districtId: 'jabalpur', shift: 'morning', callsHandled: 30, avgHandlingTime: 4.5 },
  { id: 'cr-005', name: 'Sunita Verma', districtId: 'gwalior', shift: 'evening', callsHandled: 41, avgHandlingTime: 4.0 },
  { id: 'cr-006', name: 'Amit Gupta', districtId: 'ujjain', shift: 'morning', callsHandled: 28, avgHandlingTime: 5.5 },
];

// Complaint description templates
const DESCRIPTIONS_EN = [
  'Armed individuals preventing voters from entering polling booth at Ward {ward}. Approximately {count} people involved.',
  'Cash distribution observed near polling station {station}. Envelopes being given to voters in exchange for vote promises.',
  'Campaign posters and banners displayed within 100m of polling station, violating election code of conduct.',
  'Loudspeaker being used for campaign propaganda near polling booth during silent period.',
  'Voters being transported in organized groups by political party workers to polling station.',
  'Intimidation of voters by unknown persons near booth {booth}. Voters being asked to show their ballot.',
  'Unauthorized persons found inside polling booth {booth}, attempting to influence the voting process.',
  'Distribution of liquor bottles observed near Ward {ward} polling area last night before election.',
  'Fake voter ID cards being used at polling station {station}. Multiple persons voting with same ID.',
  'Party flags and symbols displayed on vehicles parked near polling station in violation of guidelines.',
];

const DESCRIPTIONS_HI = [
  'वार्ड {ward} में मतदान केंद्र पर सशस्त्र व्यक्ति मतदाताओं को प्रवेश से रोक रहे हैं। लगभग {count} लोग शामिल।',
  'मतदान केंद्र {station} के पास नकद वितरण देखा गया। वोट के बदले मतदाताओं को लिफाफे दिए जा रहे हैं।',
  'मतदान केंद्र से 100 मीटर के भीतर चुनाव प्रचार के पोस्टर और बैनर लगाए गए हैं।',
  'मौन अवधि के दौरान मतदान केंद्र के पास लाउडस्पीकर से प्रचार किया जा रहा है।',
  'राजनीतिक दल के कार्यकर्ताओं द्वारा मतदाताओं को संगठित समूहों में मतदान केंद्र ले जाया जा रहा है।',
  'बूथ {booth} के पास अज्ञात व्यक्तियों द्वारा मतदाताओं को डराया जा रहा है।',
  'मतदान केंद्र {booth} के अंदर अनधिकृत व्यक्ति पाए गए, मतदान प्रक्रिया को प्रभावित करने का प्रयास।',
  'चुनाव से पहले रात को वार्ड {ward} के मतदान क्षेत्र के पास शराब की बोतलें वितरित की गईं।',
  'मतदान केंद्र {station} पर फर्जी मतदाता पहचान पत्र का उपयोग। एक ही आईडी से कई व्यक्ति मतदान कर रहे हैं।',
  'दिशानिर्देशों के उल्लंघन में मतदान केंद्र के पास खड़ी गाड़ियों पर पार्टी के झंडे और चिह्न लगाए गए हैं।',
];

const LANDMARKS = [
  'Near Government School, Main Road',
  'Behind District Hospital',
  'Opposite Municipal Office',
  'Near Bus Stand, Station Road',
  'Inside Community Hall compound',
  'Next to Hanuman Temple',
  'Near Railway Crossing, NH-12',
  'Behind Panchayat Bhawan',
  'Near Anganwadi Center, Ward 5',
  'Opposite SBI Bank Branch',
];

let complaintIdCounter = 1000;

function generateComplaintId() {
  complaintIdCounter++;
  const year = new Date().getFullYear();
  return `EC-${year}-${String(complaintIdCounter).padStart(5, '0')}`;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function minutesAgo(mins) {
  return new Date(Date.now() - mins * 60 * 1000).toISOString();
}

function fillTemplate(template) {
  return template
    .replace('{ward}', Math.floor(randomBetween(1, 50)))
    .replace('{count}', Math.floor(randomBetween(3, 15)))
    .replace('{station}', Math.floor(randomBetween(100, 500)))
    .replace('{booth}', Math.floor(randomBetween(1, 30)));
}

function generateComplaint(state, ageMinutes, district) {
  const category = randomItem(Object.values(CATEGORIES));
  const channel = randomItem(Object.values(CHANNELS));
  const isAnonymous = Math.random() > 0.7;
  const descIdx = Math.floor(Math.random() * DESCRIPTIONS_EN.length);

  const baseLat = district.lat + randomBetween(-0.05, 0.05);
  const baseLng = district.lng + randomBetween(-0.05, 0.05);

  const timestamps = {
    submissionTime: minutesAgo(ageMinutes),
  };

  const auditTrail = [{
    fromState: null,
    toState: STATES.SUBMITTED,
    timestamp: timestamps.submissionTime,
    actor: channel === CHANNELS.TOLL_FREE ? 'cr-001' : 'citizen',
    actorRole: channel === CHANNELS.TOLL_FREE ? 'callReceiver' : 'complainant',
    notes: 'Complaint submitted',
  }];

  // Build timestamps based on state progression
  if ([STATES.UNDER_REVIEW, STATES.ALERT_DISPATCHED, STATES.EN_ROUTE, STATES.FIRST_ACTION_LOGGED, STATES.RESOLVED, STATES.ESCALATED].includes(state)) {
    timestamps.reviewTime = minutesAgo(ageMinutes - randomBetween(5, 12));
    auditTrail.push({
      fromState: STATES.SUBMITTED,
      toState: STATES.UNDER_REVIEW,
      timestamp: timestamps.reviewTime,
      actor: randomItem(CALL_RECEIVERS).id,
      actorRole: 'callReceiver',
      notes: 'Complaint reviewed and verified',
    });
  }

  if ([STATES.ALERT_DISPATCHED, STATES.EN_ROUTE, STATES.FIRST_ACTION_LOGGED, STATES.RESOLVED, STATES.ESCALATED].includes(state)) {
    timestamps.alertDispatchTime = minutesAgo(ageMinutes - randomBetween(13, 20));
    const squad = randomItem(FLYING_SQUADS.filter(s => s.districtId === district.id) || FLYING_SQUADS);
    auditTrail.push({
      fromState: STATES.UNDER_REVIEW,
      toState: STATES.ALERT_DISPATCHED,
      timestamp: timestamps.alertDispatchTime,
      actor: 'system',
      actorRole: 'system',
      notes: `Alert dispatched to ${squad.name}`,
    });
  }

  if ([STATES.EN_ROUTE, STATES.FIRST_ACTION_LOGGED, STATES.RESOLVED, STATES.ESCALATED].includes(state)) {
    timestamps.squadDepartureTime = minutesAgo(ageMinutes - randomBetween(22, 30));
    auditTrail.push({
      fromState: STATES.ALERT_DISPATCHED,
      toState: STATES.EN_ROUTE,
      timestamp: timestamps.squadDepartureTime,
      actor: 'fs-001',
      actorRole: 'flyingSquad',
      notes: 'Squad departed for complaint location',
    });
  }

  if ([STATES.FIRST_ACTION_LOGGED, STATES.RESOLVED, STATES.ESCALATED].includes(state)) {
    timestamps.arrivalTime = minutesAgo(ageMinutes - randomBetween(35, 55));
    timestamps.actionTime = minutesAgo(ageMinutes - randomBetween(56, 70));
    auditTrail.push({
      fromState: STATES.EN_ROUTE,
      toState: STATES.FIRST_ACTION_LOGGED,
      timestamp: timestamps.actionTime,
      actor: 'fs-001',
      actorRole: 'flyingSquad',
      notes: 'Site verification completed. Situation assessed.',
    });
  }

  if (state === STATES.RESOLVED) {
    timestamps.resolutionTime = minutesAgo(ageMinutes - randomBetween(72, 90));
    auditTrail.push({
      fromState: STATES.FIRST_ACTION_LOGGED,
      toState: STATES.RESOLVED,
      timestamp: timestamps.resolutionTime,
      actor: 'fs-001',
      actorRole: 'flyingSquad',
      notes: 'Complaint resolved. Situation under control.',
    });
  }

  if (state === STATES.ESCALATED) {
    timestamps.escalationTime = minutesAgo(ageMinutes - randomBetween(72, 85));
    auditTrail.push({
      fromState: STATES.FIRST_ACTION_LOGGED,
      toState: STATES.ESCALATED,
      timestamp: timestamps.escalationTime,
      actor: 'fs-001',
      actorRole: 'flyingSquad',
      notes: 'Escalated to District Election Officer. Requires higher authority intervention.',
    });
  }

  return {
    id: generateComplaintId(),
    category,
    description: fillTemplate(DESCRIPTIONS_EN[descIdx]),
    descriptionHi: fillTemplate(DESCRIPTIONS_HI[descIdx]),
    channel,
    status: state,
    location: {
      lat: baseLat,
      lng: baseLng,
      landmark: randomItem(LANDMARKS),
      district: district.id,
      districtName: district.name,
      districtNameHi: district.nameHi,
    },
    complainant: isAnonymous ? {
      anonymous: true,
      phone: null,
      name: null,
    } : {
      anonymous: false,
      phone: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      name: randomItem(['Ramesh', 'Sunita', 'Mukesh', 'Kavita', 'Anil', 'Geeta', 'Suresh', 'Meena']),
    },
    evidence: [],
    assignedSquad: state !== STATES.SUBMITTED && state !== STATES.UNDER_REVIEW
      ? randomItem(FLYING_SQUADS.filter(s => s.districtId === district.id) || FLYING_SQUADS)?.id
      : null,
    firstAction: [STATES.FIRST_ACTION_LOGGED, STATES.RESOLVED, STATES.ESCALATED].includes(state) ? {
      type: randomItem(Object.values(FIRST_ACTION_TYPES)),
      notes: 'Site visited. Verified the complaint. Preliminary action taken as per protocol.',
      evidence: [],
      timestamp: timestamps.actionTime,
    } : null,
    escalation: state === STATES.ESCALATED ? {
      reason: 'Requires intervention by higher authority. Local resolution not possible.',
      targetAuthority: 'District Election Officer',
      notes: 'Multiple party workers involved. FIR may be needed.',
    } : null,
    feedback: state === STATES.RESOLVED && Math.random() > 0.5 ? {
      rating: Math.floor(randomBetween(3, 5)),
      comment: 'Team responded quickly and resolved the issue.',
      timestamp: minutesAgo(ageMinutes - randomBetween(91, 120)),
    } : null,
    isFlagged: false,
    isDuplicate: false,
    mergedWith: null,
    timestamps,
    auditTrail,
  };
}

/**
 * Generate the full set of seed data
 */
export function generateSeedData() {
  const complaints = [];

  // Generate complaints in various states
  // SUBMITTED: 8 complaints (recent, waiting for review)
  for (let i = 0; i < 8; i++) {
    complaints.push(generateComplaint(STATES.SUBMITTED, randomBetween(2, 18), randomItem(DISTRICTS)));
  }

  // UNDER_REVIEW: 6 complaints
  for (let i = 0; i < 6; i++) {
    complaints.push(generateComplaint(STATES.UNDER_REVIEW, randomBetween(10, 25), randomItem(DISTRICTS)));
  }

  // ALERT_DISPATCHED: 4 complaints
  for (let i = 0; i < 4; i++) {
    complaints.push(generateComplaint(STATES.ALERT_DISPATCHED, randomBetween(20, 40), randomItem(DISTRICTS)));
  }

  // EN_ROUTE: 5 complaints
  for (let i = 0; i < 5; i++) {
    complaints.push(generateComplaint(STATES.EN_ROUTE, randomBetween(30, 55), randomItem(DISTRICTS)));
  }

  // FIRST_ACTION_LOGGED: 4 complaints
  for (let i = 0; i < 4; i++) {
    complaints.push(generateComplaint(STATES.FIRST_ACTION_LOGGED, randomBetween(60, 85), randomItem(DISTRICTS)));
  }

  // RESOLVED: 15 complaints
  for (let i = 0; i < 15; i++) {
    complaints.push(generateComplaint(STATES.RESOLVED, randomBetween(90, 300), randomItem(DISTRICTS)));
  }

  // ESCALATED: 5 complaints
  for (let i = 0; i < 5; i++) {
    complaints.push(generateComplaint(STATES.ESCALATED, randomBetween(80, 200), randomItem(DISTRICTS)));
  }

  return {
    complaints,
    flyingSquads: FLYING_SQUADS,
    callReceivers: CALL_RECEIVERS,
    districts: DISTRICTS,
    zones: ZONES,
  };
}

export { DISTRICTS, BLOCKS_BY_DISTRICT, ZONES, FLYING_SQUADS, CALL_RECEIVERS, generateComplaintId };
