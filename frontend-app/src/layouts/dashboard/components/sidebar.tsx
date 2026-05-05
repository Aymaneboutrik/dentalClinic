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
          "transition-all duration-300 fixed top-4 bottom-4 left-4 z-10 hidden flex-col border bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/20 sm:flex overflow-hidden organic-card-reverse",
          sidebarCollapsed ? "w-[60px]" : "w-[250px]"
        )}
      >
        <div className="flex flex-col h-full py-2">
          <div className="px-2 pb-2">
            <SidebarHeader />
          </div>

          <nav className={clsx("flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-1 custom-scrollbar")}>
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

          <div className="px-2 pt-2 mt-auto">
            <SidebarFooter />
          </div>
        </div>
      </aside>

      <div
        onClick={toggleSidebar}
        className={clsx(
          "transition-all duration-300 fixed z-20 top-[50%] h-[22px] w-[22px] cursor-pointer bg-primary hidden sm:flex items-center justify-center rounded-full text-primary-foreground shadow-md",
          sidebarCollapsed ? "left-[64px]" : "left-[254px]"
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