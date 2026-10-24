# Phase 4: Training log

Branch: `phase-4-training`. There is no Strava or Concept2 API connection in this version. All data comes from files Samuel uploads in admin.

1. Build importers for the formats in specification 5.6: the Strava bulk export (`activities.csv`, alone or in the zip), single Strava activities (`.fit`, `.gpx`, `.tcx`), the Concept2 Logbook season CSV and the NK SpeedCoach (NK LiNK) CSV.
2. Normalise everything into `training_sessions`. **Discard all GPS coordinates during parsing**; never store or log them.
3. Deduplicate (same start time within 2 minutes and similar duration) and record the source.
4. Auto-hide likely warm-ups and cool-downs with the rules in specification 5.6, and store the reason. Samuel can toggle any session back.
5. The admin upload flow: choose a file, see a preview table (new, duplicate, auto-hidden), then confirm the import.
6. Public training summary on the Rowing page: this week, this month and this season (sessions, hours, kilometres), with count-up. Add a paginated session list (date, type, duration, distance, average split, rate, heart rate), newest first.
7. Leave a clear, documented interface (`lib/training/summary.ts`) for the dashboard pages designed later.

Test with small sample files you create for each format. Include the samples in `tests/fixtures/`, with no real coordinates. Write the phase report, then open a pull request.
