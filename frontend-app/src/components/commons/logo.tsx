const Logo = () => {
  return (
    <div className="flex gap-2 items-center select-none">
      {/* Shield + Tooth SVG logo */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield outline */}
        <path
          d="M50 5 L90 22 L90 60 Q90 90 50 105 Q10 90 10 60 L10 22 Z"
          fill="none"
          stroke="#2196f3"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Tooth body */}
        <path
          d="M35 30 Q28 30 26 42 Q24 54 28 68 Q30 76 34 76 Q38 76 40 68 L50 55 L60 68 Q62 76 66 76 Q70 76 72 68 Q76 54 74 42 Q72 30 65 30 Q58 30 50 38 Q42 30 35 30 Z"
          fill="#42b0f5"
        />
        {/* Medical cross on tooth */}
        <rect x="44" y="38" width="12" height="4" rx="2" fill="white" opacity="0.9" />
        <rect x="48" y="34" width="4" height="12" rx="2" fill="white" opacity="0.9" />
        {/* Shine swirl */}
        <path
          d="M62 28 Q72 20 76 28 Q72 36 62 28"
          fill="#42b0f5"
          opacity="0.7"
        />
        {/* Sparkles */}
        <path d="M78 14 L79.5 18 L83 14 L79.5 10 Z" fill="#1a5fa8" />
        <circle cx="85" cy="20" r="2" fill="#1a5fa8" />
        <circle cx="82" cy="10" r="1.5" fill="#1a5fa8" />
      </svg>

      {/* Text block */}
      <div className="flex flex-col leading-tight">
        <span
          style={{
            fontFamily: "'Segoe UI', sans-serif",
            fontWeight: 800,
            fontSize: "13px",
            color: "#1a3a6b",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Dental Clinic
        </span>
        <span
          style={{
            fontFamily: "'Segoe UI', sans-serif",
            fontWeight: 400,
            fontSize: "7px",
            color: "#42b0f5",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Excellence in Care &amp; Well-Being
        </span>
      </div>
    </div>
  );
};

export default Logo;
