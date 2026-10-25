// Reads one uploaded training file, in the browser, into summary sessions.
// The accepted files are listed in specification 5.6.

import { unzipSync } from "fflate";
import type { ParseResult } from "../types";
import { looksLikeConcept2Csv, parseConcept2Csv } from "./concept2";
import { parseFit } from "./fit";
import { looksLikeNkCsv, parseNkCsv } from "./nk";
import { looksLikeStravaCsv, parseStravaCsv } from "./strava-csv";
import { parseGpx, parseTcx } from "./xml";

/** Imports up to 50 MB (docs/03-technical-setup.md "Security"). */
export const MAX_IMPORT_BYTES = 50 * 1024 * 1024;

export const ACCEPTED = ".csv,.zip,.fit,.gpx,.tcx";

function parseCsv(text: string): ParseResult {
  if (looksLikeStravaCsv(text)) return parseStravaCsv(text);
  if (looksLikeConcept2Csv(text)) return parseConcept2Csv(text);
  if (looksLikeNkCsv(text)) return parseNkCsv(text);
  return {
    format: "Unknown CSV",
    sessions: [],
    warnings: ["This CSV is not a Strava activities.csv, a Concept2 season export or an NK LiNK session."],
  };
}

export async function parseTrainingFile(name: string, bytes: ArrayBuffer): Promise<ParseResult> {
  if (bytes.byteLength > MAX_IMPORT_BYTES) {
    return { format: "Too large", sessions: [], warnings: ["Files must be under 50 MB."] };
  }
  const extension = name.toLowerCase().split(".").pop();
  const text = () => new TextDecoder("utf-8").decode(bytes);

  switch (extension) {
    case "zip": {
      // The Strava account export: only activities.csv is read. The activity
      // files inside it (which hold the routes) are never unpacked.
      const files = unzipSync(new Uint8Array(bytes), {
        filter: (file) => /(^|\/)activities\.csv$/i.test(file.name),
      });
      const csv = Object.values(files)[0];
      if (!csv) return { format: "ZIP", sessions: [], warnings: ["No activities.csv in this zip file."] };
      return parseStravaCsv(new TextDecoder("utf-8").decode(csv));
    }
    case "csv":
      return parseCsv(text());
    case "gpx":
      return parseGpx(text());
    case "tcx":
      return parseTcx(text());
    case "fit":
      return parseFit(bytes);
    default:
      return { format: "Unsupported", sessions: [], warnings: [`${name}: use a .csv, .zip, .fit, .gpx or .tcx file.`] };
  }
}
