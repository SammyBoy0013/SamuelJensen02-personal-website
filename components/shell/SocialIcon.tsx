type Network = "linkedin" | "strava" | "instagram" | "facebook";

/** Simple 24 px line icons in currentColor. */
export function SocialIcon({ network }: { network: Network }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 22,
    height: 22,
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (network) {
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 10.5V17M12 17v-6.5M12 13.5a2.75 2.75 0 0 1 5.5 0V17" />
          <circle cx="8" cy="7.25" r="0.6" fill="currentColor" />
        </svg>
      );
    case "strava":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M10.3 2 4 14.4h3.7l2.6-5.1 2.6 5.1h3.7z" />
          <path d="M15.5 14.4 13.7 18l-1.8-3.6H9.3L13.7 23l4.4-8.6z" opacity="0.7" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.25" cy="6.75" r="0.6" fill="currentColor" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 8h-1.5A2.5 2.5 0 0 0 11 10.5V21M8.5 13.5h6" />
        </svg>
      );
  }
}
