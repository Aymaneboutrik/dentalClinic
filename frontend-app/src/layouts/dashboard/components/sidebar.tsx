import SidebarItem from "./sidebar-item";
import menus from "@configs/menus";
import SidebarHeader from "./sidebar-header";
import SidebarFooter from "./sidebar-footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useUserPreference from "@stores/user-preference";
import clsx from "clsx";
import { useLocation } from "react-router-dom";
import { doctorSidebarConfig } from "../../../features/doctor/config/sidebar.config";
import { secretaireSidebarConfig } from "../../../features/secretaire/config/sidebar.config";
import { assistantSidebarConfig } from "../../../features/assistant/config/sidebar.config";
export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUserPreference();
  const location = useLocation();

 const currentMenus = location.pathname.startsWith("/doctor")
  ? doctorSidebarConfig
  : location.pathname.startsWith("/secretaire")
  ? secretaireSidebarConfig
  : location.pathname.startsWith("/assistant")
  ? assistantSidebarConfig
  : menus;
  return (
    <>
      <aside
        className={clsx(
          "transition-all duration-300 overflow-hidden fixed inset-y-0 left-0 z-10 hidden justify-center flex-col border-r bg-background sm:flex",
          sidebarCollapsed ? "w-[60px]" : "w-[250px]"
        )}
      >
        <nav className={clsx("flex flex-col gap-1 p-2 items-start")}>
          <SidebarHeader />

          {currentMenus.map((m) => (
            <SidebarItem
              key={m.route}
              icon={m.icon}
              name={m.name}
              route={m.route}
              childs={m.childs}
            />
          ))}
        </nav>

        <nav className="flex flex-col items-start gap-4 px-2 mt-auto">
          <SidebarFooter />
        </nav>
      </aside>

      <div
        onClick={toggleSidebar}
        className={clsx(
          "transition-all duration-300 fixed z-20 top-[50%] h-[22px] w-[22px] cursor-pointer bg-primary hidden sm:flex items-center justify-center rounded-full text-primary-foreground",
          sidebarCollapsed ? "left-[48px]" : "left-[238px]"
        )}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-[18px] w-[18px]" />
        ) : (
          <ChevronLeft className="h-[18px] w-[18px]" />
        )}
      </div>
    </>
  );
}