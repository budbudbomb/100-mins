/**
 * GPS Simulator — simulates Flying Squad movement for demo purposes
 * Generates realistic GPS updates along routes toward complaint locations
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate distance between two points in km (Haversine)
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Simulate GPS position update — move squad toward target
 * @param {Object} currentPos - { lat, lng }
 * @param {Object} targetPos - { lat, lng }
 * @param {number} speedKmH - Speed in km/h (default 40 for urban)
 * @param {number} intervalSec - Update interval in seconds (default 30)
 * @returns {Object} New position { lat, lng, bearing, distanceRemaining, eta }
 */
export function simulateMovement(currentPos, targetPos, speedKmH = 40, intervalSec = 30) {
  const distance = haversineDistance(currentPos.lat, currentPos.lng, targetPos.lat, targetPos.lng);
  
  // Calculate movement per interval
  const distancePerInterval = (speedKmH / 3600) * intervalSec; // km per interval
  
  if (distance <= distancePerInterval) {
    // Arrived at target
    return {
      lat: targetPos.lat,
      lng: targetPos.lng,
      bearing: 0,
      distanceRemaining: 0,
      eta: 0,
      arrived: true,
    };
  }

  // Calculate bearing
  const bearing = calculateBearing(currentPos.lat, currentPos.lng, targetPos.lat, targetPos.lng);
  
  // Move toward target with some randomness for realism
  const fraction = distancePerInterval / distance;
  const jitter = 0.0001 * (Math.random() - 0.5); // small random deviation
  
  const newLat = currentPos.lat + (targetPos.lat - currentPos.lat) * fraction + jitter;
  const newLng = currentPos.lng + (targetPos.lng - currentPos.lng) * fraction + jitter;
  
  const newDistance = haversineDistance(newLat, newLng, targetPos.lat, targetPos.lng);
  const etaMinutes = (newDistance / speedKmH) * 60;

  return {
    lat: newLat,
    lng: newLng,
    bearing,
    distanceRemaining: Math.round(newDistance * 100) / 100,
    eta: Math.round(etaMinutes * 10) / 10,
    arrived: false,
  };
}

/**
 * Calculate bearing between two points
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Generate a GPS trail (array of positions) simulating movement from A to B
 */
export function generateGPSTrail(startPos, endPos, intervalSec = 30, speedKmH = 40) {
  const trail = [{ ...startPos, timestamp: new Date().toISOString() }];
  let current = { ...startPos };
  let step = 0;
  const maxSteps = 200; // safety limit

  while (step < maxSteps) {
    const next = simulateMovement(current, endPos, speedKmH, intervalSec);
    const timestamp = new Date(Date.now() - (maxSteps - step) * intervalSec * 1000).toISOString();
    trail.push({ ...next, timestamp });
    
    if (next.arrived) break;
    current = { lat: next.lat, lng: next.lng };
    step++;
  }

  return trail;
}

/**
 * Find the nearest Flying Squad to a complaint location
 */
export function findNearestSquad(complaintLocation, squads) {
  if (!squads || squads.length === 0) return null;

  let nearest = null;
  let minDistance = Infinity;

  for (const squad of squads) {
    if (squad.status === 'on_mission') continue; // skip busy squads
    const dist = haversineDistance(
      complaintLocation.lat, complaintLocation.lng,
      squad.lat, squad.lng
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...squad, distance: Math.round(dist * 100) / 100 };
    }
  }

  return nearest;
}

/**
 * Simulate random squad position jitter (for idle squads on the map)
 */
export function jitterPosition(pos, maxKm = 0.5) {
  const jitterLat = (Math.random() - 0.5) * (maxKm / 111);
  const jitterLng = (Math.random() - 0.5) * (maxKm / (111 * Math.cos(toRad(pos.lat))));
  return {
    lat: pos.lat + jitterLat,
    lng: pos.lng + jitterLng,
  };
}
