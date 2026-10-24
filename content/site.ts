// Site-wide settings. Phase 3 moves these into the `settings` table.

export const settings = {
  email: "samuel.jensen@tarric.com",
  collaborateSubject: "Collaboration enquiry",
  handicap: "+1.0",
  lowestHandicap: "+2.3",
  features: {
    /** Sponsors section: shown once a sponsor exists. */
    sponsors: false,
    /** Engineering: Reports and publications. */
    reportsAndPublications: false,
  },
} as const;
