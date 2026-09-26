import { NextResponse } from 'next/server';
import {
  simulateInflowSpike, dispatchActions, acceptGroundTask, completeGroundTask,
  confirmTransportTask, flagTask, updateThresholds, toggleEmergency, broadcast,
  reportManualIncident, resetSimulation,
} from '@/lib/eventState';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch { /* empty body ok */ }
  const { type, ...args } = body;
  let result;
  switch (type) {
    case 'spike':            result = simulateInflowSpike(); break;
    case 'dispatch':         result = dispatchActions(args.incidentId, args.actions || []); break;
    case 'ground.accept':    result = acceptGroundTask(args.id); break;
    case 'ground.complete':  result = completeGroundTask(args.id); break;
    case 'transport.confirm':result = confirmTransportTask(args.id); break;
    case 'task.flag':        result = flagTask(args.id, args.kind, args.issue); break;
    case 'thresholds':       result = updateThresholds(args.gateId, args.warning, args.critical); break;
    case 'emergency':        result = toggleEmergency(args.on); break;
    case 'broadcast':        result = broadcast(args.message); break;
    case 'report':           result = reportManualIncident(args); break;
    case 'reset':            result = resetSimulation(); break;
    default: return NextResponse.json({ error: `Unknown action type: ${type}` }, { status: 400 });
  }
  if (result?.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
