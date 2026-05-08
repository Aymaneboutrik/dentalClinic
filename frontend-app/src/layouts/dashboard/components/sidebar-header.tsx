import useUserPreference from "@stores/user-preference";
import clsx from "clsx";
import logoSrc from "../../../assets/images/logo_64x64.svg";

function SidebarHeader() {
  const { sidebarCollapsed } = useUserPreference();

  return (
    <div className="flex items-center justify-center w-full my-3">
      <div className="flex items-center justify-center flex-shrink-0">
        <img
          src={logoSrc}
          alt="Dental Clinic Logo"
          width={sidebarCollapsed ? "48" : "64"}
          height={sidebarCollapsed ? "48" : "64"}
          className="object-contain"
        />
      </div>
    </div>
  );
}

export default SidebarHeader;

