// Writes the sample training files in tests/fixtures: `npx tsx tests/make-fixtures.ts`.
//
// The sessions are invented test data, not Samuel's training. Every position
// is near 0° N 0° E, in the open Atlantic, so no real place is recorded.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Encoder, Profile } from "@garmin/fitsdk";
import { strToU8, zipSync } from "fflate";

const dir = path.join(import.meta.dirname, "fixtures");
mkdirSync(dir, { recursive: true });
const write = (name: string, data: string | Uint8Array) => writeFileSync(path.join(dir, name), data);

// ---- Strava bulk export: activities.csv. "Elapsed Time" and "Distance" appear
// twice, as in the real file (the second Distance is in metres).
const stravaHeader = [
  "Activity ID", "Activity Date", "Activity Name", "Activity Type", "Activity Description", "Elapsed Time",
  "Distance", "Max Heart Rate", "Relative Effort", "Commute", "Filename", "Elapsed Time", "Moving Time",
  "Distance", "Max Speed", "Average Speed", "Average Heart Rate", "Average Watts", "Average Cadence",
];
const stravaRows = [
  ["9000000001", "Oct 20, 2025, 6:01:41 AM", "Morning row", "Rowing", "", "3623", "12.04", "172", "80", "false", "activities/9000000001.gpx", "3623", "3600", "12040.0", "4.1", "3.34", "148", "", "22"],
  ["9000000002", "Oct 20, 2025, 7:05:00 AM", "WU", "Rowing", "", "480", "1.50", "120", "5", "false", "", "480", "480", "1500.0", "3.5", "3.1", "112", "", "18"],
  ["9000000003", "Oct 21, 2025, 5:30:00 PM", "2k test", "VirtualRow", "", "400", "2.00", "188", "60", "false", "", "400", "400", "2000.0", "5.2", "5.0", "176", "352", "33"],
  ["9000000004", "Oct 22, 2025, 4:00:00 PM", "Weight Training", "Weight Training", "", "3600", "0.00", "150", "40", "false", "", "3600", "3300", "0.0", "", "", "118", "", ""],
  ["9000000005", "Oct 23, 2025, 6:00:00 AM", "Cool-down jog", "Run", "", "900", "2.40", "140", "10", "false", "", "900", "880", "2400.0", "3.0", "2.7", "130", "", "80"],
];
const stravaCsv = [stravaHeader, ...stravaRows].map((r) => r.map((v) => (v.includes(",") ? `"${v}"` : v)).join(",")).join("\n");
write("strava-activities.csv", stravaCsv);

// ---- The same export as a zip, with an activity file that must not be read.
const routeGpx = `<?xml version="1.0"?><gpx><trk><trkseg><trkpt lat="0.001" lon="0.001"><time>2025-10-20T06:01:41Z</time></trkpt></trkseg></trk></gpx>`;
write("strava-export.zip", zipSync({ "activities.csv": strToU8(stravaCsv), "activities/9000000001.gpx": strToU8(routeGpx) }));

// ---- Concept2 Logbook season export. Times are local (Copenhagen).
// Log 70000002 is the same 2k as Strava 9000000003 (17:30 UTC = 19:30 CEST).
write(
  "concept2-season.csv",
  [
    `"Log ID","Date","Description","Work Time (Formatted)","Work Time (Seconds)","Rest Time (Formatted)","Rest Time (Seconds)","Work Distance","Rest Distance","Stroke Rate/Cadence","Stroke Count","Pace","Avg Watts","Cal/Hour","Total Cal","Avg Heart Rate","Drag Factor","Age","Weight","Type","Ranked","Comments","Date Entered"`,
    `70000001,"2025-11-25 07:00:00","6000m","21:38.7",1298.7,"0:00.0",0,6000,0,30,650,"1:48.2",276,"1300","469",165,120,23,"Hwt","RowErg","Yes","","2025-11-25"`,
    `70000002,"2025-10-21 19:30:20","2000m","6:40.0",400.0,"0:00.0",0,2000,0,33,220,"1:40.0",350,"1500","167",176,120,23,"Hwt","RowErg","Yes","","2025-10-21"`,
    `70000003,"2025-11-26 07:00:00","30:00","30:00.0",1800,"0:00.0",0,7520,0,20,600,"1:59.7",204,"1000","500",142,115,23,"Hwt","SkiErg","No","","2025-11-26"`,
  ].join("\n"),
);

// ---- NK SpeedCoach session from NK LiNK. The per-stroke rows carry GPS
// columns; the parser must stop before them.
write(
  "nk-session.csv",
  [
    "Session Information:",
    "Name:,Steady state",
    "Start Time:,10/24/2025 07:30 AM",
    "Device Info:,SpeedCoach GPS 2",
    "",
    "Session Summary:",
    ",Elapsed Time,Distance (GPS),Distance (IMP),Avg Split (GPS),Avg Speed (GPS),Avg Split (IMP),Avg Speed (IMP),Avg Stroke Rate,Total Strokes,Distance/Stroke (GPS),Distance/Stroke (IMP),Avg Heart Rate,Avg Power,Avg Catch,Avg Slip,Avg Finish,Avg Wash,Avg Force Avg,Avg Work,Avg Force Max,Avg Max Force Angle",
    "Total:,00:50:00.0,11200,11150,02:13.9,3.73,02:14.5,3.72,19.5,975,11.5,11.4,145,---,,,,,,,,",
    "",
    "Per-Stroke Data:",
    "Interval,Distance (GPS),Distance (IMP),Elapsed Time,Split (GPS),Speed (GPS),Split (IMP),Speed (IMP),Stroke Rate,Total Strokes,Distance/Stroke (GPS),Distance/Stroke (IMP),Heart Rate,Power,Catch,Slip,Finish,Wash,Force Avg,Work,Force Max,Max Force Angle,GPS Lat.,GPS Lon.",
    "1,11,11,00:00:03.0,02:16.0,3.67,02:16.0,3.67,19.0,1,11.0,11.0,120,---,,,,,,,,,0.000100,0.000100",
    "1,22,22,00:00:06.1,02:15.0,3.70,02:15.0,3.70,19.5,2,11.0,11.0,121,---,,,,,,,,,0.000200,0.000200",
  ].join("\n"),
);

// ---- GPX: about 10 km due north from 0° 0° over 50 minutes.
const gpxPoints = Array.from({ length: 51 }, (_, i) => {
  const time = new Date(Date.UTC(2025, 9, 25, 7, 0, 0) + i * 60_000).toISOString();
  const lat = (i * 0.0018).toFixed(6);
  return `<trkpt lat="${lat}" lon="0.000000"><time>${time}</time><extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>${140 + (i % 10)}</gpxtpx:hr><gpxtpx:cad>20</gpxtpx:cad></gpxtpx:TrackPointExtension></extensions></trkpt>`;
});
write(
  "activity.gpx",
  `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="StravaGPX" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
 <metadata><time>2025-10-25T07:00:00Z</time></metadata>
 <trk><name>Saturday long row</name><type>rowing</type><trkseg>
${gpxPoints.join("\n")}
 </trkseg></trk>
</gpx>`,
);

// ---- TCX: two laps, positions in the track points.
write(
  "activity.tcx",
  `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
 <Activities>
  <Activity Sport="Other">
   <Id>2025-10-26T08:00:00Z</Id>
   <Lap StartTime="2025-10-26T08:00:00Z">
    <TotalTimeSeconds>1200</TotalTimeSeconds><DistanceMeters>4800</DistanceMeters>
    <AverageHeartRateBpm><Value>140</Value></AverageHeartRateBpm><MaximumHeartRateBpm><Value>155</Value></MaximumHeartRateBpm>
    <Cadence>20</Cadence>
    <Track><Trackpoint><Time>2025-10-26T08:00:00Z</Time><Position><LatitudeDegrees>0.0001</LatitudeDegrees><LongitudeDegrees>0.0001</LongitudeDegrees></Position></Trackpoint></Track>
   </Lap>
   <Lap StartTime="2025-10-26T08:20:00Z">
    <TotalTimeSeconds>1200</TotalTimeSeconds><DistanceMeters>5000</DistanceMeters>
    <AverageHeartRateBpm><Value>150</Value></AverageHeartRateBpm><MaximumHeartRateBpm><Value>165</Value></MaximumHeartRateBpm>
    <Cadence>22</Cadence>
   </Lap>
   <Notes>Rowing</Notes>
  </Activity>
 </Activities>
</TrainingCenterDatabase>`,
);

// ---- FIT: an indoor rowing session with position records.
const start = new Date(Date.UTC(2025, 9, 27, 17, 0, 0));
const end = new Date(start.getTime() + 2700_000);
const semicircles = (degrees: number) => Math.round((degrees * 2 ** 31) / 180);
const encoder = new Encoder();
// The SDK's types do not list each message's fields, so they are passed loosely.
const mesg = (num: number, fields: Record<string, unknown>) =>
  encoder.onMesg(num, fields as Parameters<typeof encoder.onMesg>[1]);
mesg(Profile.MesgNum.FILE_ID, { manufacturer: "development", product: 0, timeCreated: start, type: "activity", serialNumber: 1 });
for (let i = 0; i <= 45; i++) {
  mesg(Profile.MesgNum.RECORD, {
    timestamp: new Date(start.getTime() + i * 60_000),
    positionLat: semicircles(i * 0.0002),
    positionLong: semicircles(0),
    heartRate: 140,
    cadence: 22,
    distance: i * 222,
  });
}
mesg(Profile.MesgNum.LAP, {
  messageIndex: 0, timestamp: end, startTime: start, totalElapsedTime: 2700, totalTimerTime: 2700,
  totalDistance: 10000, event: "lap", eventType: "stop",
});
mesg(Profile.MesgNum.SESSION, {
  messageIndex: 0, timestamp: end, startTime: start, totalElapsedTime: 2700, totalTimerTime: 2700,
  totalDistance: 10000, sport: "rowing", subSport: "indoorRowing", avgHeartRate: 141, maxHeartRate: 160,
  avgCadence: 22, avgPower: 210, firstLapIndex: 0, numLaps: 1, event: "session", eventType: "stop",
});
mesg(Profile.MesgNum.ACTIVITY, { timestamp: end, numSessions: 1, totalTimerTime: 2700, type: "manual", event: "activity", eventType: "stop" });
write("activity.fit", encoder.close());

console.log("Fixtures written to", dir);
