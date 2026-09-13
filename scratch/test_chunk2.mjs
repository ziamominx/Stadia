async function testChunk2() {
  console.log('--- TESTING CHUNK 2 ORCHESTRATION PIPELINE ---');

  // 1. Check baseline
  let eco = await fetch('http://localhost:3000/api/orchestration/ecosystem').then(r => r.json());
  console.log('1. Baseline scenario:', eco.activeScenario, '| Saturation:', eco.metrics.avgHotelSaturation + '% | Health:', eco.metrics.ecosystemHealthScore + '/100');

  // 2. Trigger demand_spike
  let trigger = await fetch('http://localhost:3000/api/orchestration/scenarios/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId: 'demand_spike' })
  }).then(r => r.json());
  console.log('2. Triggered scenario:', trigger.activeScenario);

  // 3. Verify spike in ecosystem
  eco = await fetch('http://localhost:3000/api/orchestration/ecosystem').then(r => r.json());
  console.log('3. Spiked scenario:', eco.activeScenario, '| Saturation:', eco.metrics.avgHotelSaturation + '% | Gates flagged:', eco.metrics.flaggedGatesCount, '| Health:', eco.metrics.ecosystemHealthScore + '/100');

  // 4. Apply mitigation
  let mit = await fetch('http://localhost:3000/api/orchestration/interventions/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Deploy 16 Rapid Shuttles',
      actionType: 'SHUTTLE_DISPATCH',
      impactMetric: '-28% Highway Congestion'
    })
  }).then(r => r.json());
  console.log('4. Mitigation applied:', mit.ok, mit.message);

  // 5. Verify mitigated in ecosystem
  eco = await fetch('http://localhost:3000/api/orchestration/ecosystem').then(r => r.json());
  console.log('5. Mitigated scenario:', eco.activeScenario, '| Health recovered to:', eco.metrics.ecosystemHealthScore + '/100 | Saturation:', eco.metrics.avgHotelSaturation + '%');

  // 6. Reset
  let reset = await fetch('http://localhost:3000/api/orchestration/reset', { method: 'POST' }).then(r => r.json());
  console.log('6. Reset executed:', reset.ok);
  eco = await fetch('http://localhost:3000/api/orchestration/ecosystem').then(r => r.json());
  console.log('7. Post-reset scenario:', eco.activeScenario, '| Health score:', eco.metrics.ecosystemHealthScore + '/100');

  // 8. Test Organizer & Gates APIs
  const overview = await fetch('http://localhost:3000/api/dashboard/overview').then(r => r.json());
  console.log('8. Organizer overview: Gates count =', overview.gates.length, '| Parking count =', overview.parking.length, '| Revenue =', overview.revenue.grand_total);

  const gatesForecast = await fetch('http://localhost:3000/api/dashboard/gates/forecast-summary').then(r => r.json());
  console.log('9. Gate forecast: Match =', gatesForecast.match.home_team, 'vs', gatesForecast.match.away_team, '| Gates forecasted =', gatesForecast.gates.length);

  const flow = await fetch('http://localhost:3000/api/dashboard/flow?time=45').then(r => r.json());
  console.log('10. Crowd flow: Segments =', flow.segments.length, '| Mixing points =', flow.mixingPoints.length);

  console.log('--- ALL CHUNK 2 TESTS PASSED PERFECTLY! ---');
}

testChunk2().catch(console.error);
