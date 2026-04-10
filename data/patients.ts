export type Patient = {
  id: number;
  name: string;
  apptDate: string;
  priorNoShows: number;
  priorAppts: number;
  distanceMiles: number;
  insurance: string;
};

export const patients: Patient[] = [
  {
    id: 1,
    name: "Maria Garcia",
    apptDate: "2026-04-22",
    priorNoShows: 3,
    priorAppts: 7,
    distanceMiles: 12,
    insurance: "Medicare Advantage",
  },
  {
    id: 2,
    name: "James Thompson",
    apptDate: "2026-04-07",
    priorNoShows: 0,
    priorAppts: 4,
    distanceMiles: 2,
    insurance: "Medi-Cal",
  },
  {
    id: 3,
    name: "Robert Kim",
    apptDate: "2026-04-25",
    priorNoShows: 2,
    priorAppts: 5,
    distanceMiles: 18,
    insurance: "Commercial",
  },
  {
    id: 4,
    name: "Angela Torres",
    apptDate: "2026-04-09",
    priorNoShows: 1,
    priorAppts: 3,
    distanceMiles: 7,
    insurance: "Medi-Cal",
  },
  {
    id: 5,
    name: "David Nguyen",
    apptDate: "2026-04-28",
    priorNoShows: 4,
    priorAppts: 6,
    distanceMiles: 22,
    insurance: "Medicare Advantage",
  },
  {
    id: 6,
    name: "Patricia Okafor",
    apptDate: "2026-04-11",
    priorNoShows: 0,
    priorAppts: 9,
    distanceMiles: 4,
    insurance: "Commercial",
  },
];
