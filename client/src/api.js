import { useEffect, useState } from 'react';

async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  matches: () => request('GET', '/matches'),
  matchSeats: (id) => request('GET', `/matches/${id}/seats`),
  hotels: () => request('GET', '/hotels'),
  createBooking: (payload) => request('POST', '/bookings', payload),
  travelInfo: (ticketId, payload) => request('POST', `/bookings/${ticketId}/travel-info`, payload),
  selectHotel: (ticketId, hotelId) => request('POST', `/bookings/${ticketId}/hotel`, { hotelId }),
  ticket: (ticketId) => request('GET', `/bookings/${ticketId}`),
  sendWhatsApp: (ticketId) => request('POST', `/notifications/whatsapp/${ticketId}`),
  claimReferral: (ticketId, type) => request('POST', '/referrals', { ticketId, type }),
  dashboard: () => request('GET', '/dashboard/overview'),
  gates: () => request('GET', '/dashboard/gates'),
  gateForecast: (gateId) => request('GET', `/dashboard/gates/${gateId}/forecast`),
  gateForecastSummary: () => request('GET', '/dashboard/gates/forecast-summary'),
  crowdFlow: (time) => request('GET', `/dashboard/flow?time=${time}`),
  parking: () => request('GET', '/dashboard/parking'),
  shuttles: () => request('GET', '/dashboard/shuttles'),
  revenue: () => request('GET', '/dashboard/revenue'),
  routingDecisions: () => request('GET', '/dashboard/routing/decisions'),
  tourism: () => request('GET', '/tourism'),
  ecosystem: () => request('GET', '/orchestration/ecosystem'),
  scenarios: () => request('GET', '/orchestration/scenarios'),
  triggerScenario: (scenarioId) => request('POST', '/orchestration/scenarios/trigger', { scenarioId }),
  applyIntervention: (payload) => request('POST', '/orchestration/interventions/apply', payload),
  resetOrchestration: () => request('POST', '/orchestration/reset'),
  hospitalityZones: () => request('GET', '/hospitality/zones'),
  hospitalityMerchants: () => request('GET', '/hospitality/merchants'),
  itineraryEvents: () => request('GET', '/itinerary/events'),
  planItinerary: (payload) => request('POST', '/itinerary/plan', payload),
};

export function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fn()
      .then((d) => {
        if (alive) {
          setData(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (alive) setError(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { data, error, loading, reload: () => setReloadKey((k) => k + 1) };
}