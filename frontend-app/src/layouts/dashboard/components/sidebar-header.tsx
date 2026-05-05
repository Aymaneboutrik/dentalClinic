import useUserPreference from "@stores/user-preference";
import clsx from "clsx";

function SidebarHeader() {
  const { sidebarCollapsed } = useUserPreference();

  return (
    <div
      className={clsx(
        "flex items-center gap-2 my-3",
        sidebarCollapsed && "justify-center"
      )}
    >
      <div className="ml-[3px] flex items-center justify-center flex-shrink-0">
        <svg
          width={sidebarCollapsed ? "32" : "36"}
          height={sidebarCollapsed ? "32" : "36"}
          viewBox="0 0 100 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 5 L90 22 L90 60 Q90 90 50 105 Q10 90 10 60 L10 22 Z"
            fill="none"
            stroke="#2196f3"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M35 30 Q28 30 26 42 Q24 54 28 68 Q30 76 34 76 Q38 76 40 68 L50 55 L60 68 Q62 76 66 76 Q70 76 72 68 Q76 54 74 42 Q72 30 65 30 Q58 30 50 38 Q42 30 35 30 Z"
            fill="#42b0f5"
          />
          <rect x="44" y="38" width="12" height="4" rx="2" fill="white" opacity="0.9" />
          <rect x="48" y="34" width="4" height="12" rx="2" fill="white" opacity="0.9" />
          <path d="M62 28 Q72 20 76 28 Q72 36 62 28" fill="#42b0f5" opacity="0.7" />
          <path d="M78 14 L79.5 18 L83 14 L79.5 10 Z" fill="#1a5fa8" />
          <circle cx="85" cy="20" r="2" fill="#1a5fa8" />
          <circle cx="82" cy="10" r="1.5" fill="#1a5fa8" />
        </svg>
      </div>

      {!sidebarCollapsed && (
        <div className="flex flex-col leading-tight overflow-hidden">
          <span
            style={{
              fontWeight: 800,
              fontSize: "13px",
              color: "var(--foreground, #1a3a6b)",
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            Dental Clinic
          </span>
          <span
            style={{
              fontWeight: 400,
              fontSize: "7px",
              color: "#42b0f5",
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
          >
            Excellence in Care & Well-Being
          </span>
        </div>
      )}
    </div>
  );
}

export default SidebarHeader;

