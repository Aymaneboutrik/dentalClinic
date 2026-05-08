import logoSrc from "../../assets/images/logo_32x32.png";

const Logo = () => {
  return (
    <div className="flex gap-2 items-center select-none">
      {/* New PNG Logo */}
      <img
        src={logoSrc}
        alt="Dental Clinic Logo"
        width="32"
        height="32"
        className="object-contain"
      />

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
