// Venue geometry and reference locations from the supplied Stadia-main project.
// The operations simulation models four sectors; each sector owns two physical gates.
export const DY_PATIL = { lat: 19.04194, lng: 73.02667, name: "DY Patil Stadium, Nerul" };

export const STADIUM_GATES = [
  { id: "A", name: "North", zoneId: "north", corridor: "local", lat: 19.04339, lng: 73.02667, angle: 0 },
  { id: "B", name: "North-East", zoneId: "north", corridor: "local", lat: 19.04296, lng: 73.02775, angle: 45 },
  { id: "C", name: "East", zoneId: "east", corridor: "outstation", lat: 19.04194, lng: 73.0282, angle: 90 },
  { id: "D", name: "South-East", zoneId: "east", corridor: "outstation", lat: 19.04092, lng: 73.02775, angle: 135 },
  { id: "E", name: "South", zoneId: "south", corridor: "outstation", lat: 19.04049, lng: 73.02667, angle: 180 },
  { id: "F", name: "South-West", zoneId: "south", corridor: "outstation", lat: 19.04092, lng: 73.02559, angle: 225 },
  { id: "G", name: "West", zoneId: "west", corridor: "local", lat: 19.04194, lng: 73.02514, angle: 270 },
  { id: "H", name: "North-West", zoneId: "west", corridor: "local", lat: 19.04296, lng: 73.02559, angle: 315 },
];

export const STADIUM_PARKING = [
  { id: "P1", name: "Nerul West Grounds", lat: 19.04474, lng: 73.02547 },
  { id: "P2", name: "Sector 14 Multi-Level", lat: 19.04454, lng: 73.02907 },
  { id: "P3", name: "DY Patil College Grounds", lat: 19.04294, lng: 73.02387 },
  { id: "P4", name: "Palm Beach Road Lot", lat: 19.04434, lng: 73.02407 },
  { id: "P5", name: "Nerul Station Overflow", lat: 19.04544, lng: 73.02717 },
];

export const STADIUM_HOTELS = [
  { name: "OYO Flagship Vashi", lat: 19.0777, lng: 73.0012 },
  { name: "Lemon Tree Nerul", lat: 19.0439, lng: 73.0189 },
  { name: "Fortune Select Seawoods", lat: 19.04, lng: 73.01 },
  { name: "Savoy Seawoods", lat: 19.042, lng: 73.006 },
  { name: "Novotel Mumbai (Nerul)", lat: 19.0349, lng: 73.0198 },
  { name: "Hotel Sea Breeze Nerul", lat: 19.045, lng: 73.015 },
  { name: "Radisson Blu Belapur", lat: 19.0317, lng: 73.0364 },
  { name: "The Grand Vashi", lat: 19.0757, lng: 72.9984 },
  { name: "Hotel Orchid Vashi", lat: 19.0793, lng: 72.9988 },
  { name: "Taj Santacruz (Airport)", lat: 19.0957, lng: 72.8711 },
  { name: "Holiday Inn Mumbai Airport", lat: 19.093, lng: 72.867 },
  { name: "Zostel Airport Stay", lat: 19.099, lng: 72.873 },
];

export const STADIUM_TRANSIT = [
  { name: "Nerul Station → Gate A", points: [[19.0473, 73.0262], [19.0456, 73.0264], [19.04339, 73.02667]] },
  { name: "Belapur feeder → Gate C", points: [[19.0317, 73.0364], [19.0352, 73.0312], [19.0388, 73.0293], [19.04194, 73.0282]] },
];

export const STADIUM_SHUTTLES = [
  { name: "Seawoods drop → Gate E", points: [[19.04, 73.01], [19.0403, 73.018], [19.04049, 73.02667]] },
  { name: "Belapur shuttle → Gate D", points: [[19.0317, 73.0364], [19.036, 73.032], [19.04092, 73.02775]] },
];

export const isDyPatilVenue = (lat, lng) =>
  Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) &&
  Math.abs(Number(lat) - DY_PATIL.lat) < 0.01 && Math.abs(Number(lng) - DY_PATIL.lng) < 0.01;

export const gateCoordinates = (gate, lat, lng) => ({
  lat: Number(lat) + (gate.lat - DY_PATIL.lat),
  lng: Number(lng) + (gate.lng - DY_PATIL.lng),
});
