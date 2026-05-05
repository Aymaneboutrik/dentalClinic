import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import useUserPreference from "@stores/user-preference";
import { useNavigate, useMatch, useLocation } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import Text from "@components/commons/text";
import { useTranslation } from "react-i18next";

interface Props {
  icon?: ReactNode;
  name: string;
  route: string;
  collapsible?: boolean;
  closeSheet?: Dispatch<SetStateAction<boolean>>;
  childs?: {
    icon?: ReactNode;
    name: string;
    route: string;
  }[];
}

function SidebarItem({
  icon,
  name,
  route,
  childs,
  collapsible = true,
  closeSheet,
}: Props) {
  const { sidebarCollapsed } = useUserPreference();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [showChilds, setShowChilds] = useState<boolean>(false);
  const hasChildren = (childs?.length ?? 0) > 0;

  const getChildRoutes = (): string[] => {
    if (hasChildren) {
  return childs!.map((c) => c.route);
}

    return [];
  };

  const isActiveModule = (): boolean => {
    // If the route is a root dashboard route, it must match exactly
    if (route === "/doctor" || route === "/secretaire" || route === "/assistant" || route === "/") {
      return location.pathname === route;
    }
    // Otherwise, check if the current path starts with this route
    return location.pathname.startsWith(route);
  };

  const hasActiveChild = (): boolean => {
    if (hasChildren) {
      const childRoutes = getChildRoutes();

      return childRoutes.includes(location.pathname.split("/").pop() as string);
    }

    return false;
  };

 const handleClick = () => {
  if (hasChildren) {
    setShowChilds((prev) => !prev);
  } else {
    navigate(route);
    if (closeSheet) closeSheet((prev) => !prev);
  }
};

  /** ======= Collapsed Sidebar ======= */
  if (sidebarCollapsed && collapsible) {
    return (
      <>
        {/* ======= Collapsed item with child items ======= */}
        {hasChildren ? (
          <Popover>
            <PopoverTrigger>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={clsx(
                      "cursor-pointer my-1 ml-[5px] flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-primary md:h-8 md:w-8",
                      isActiveModule() || hasActiveChild()
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {icon}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">{t(name)}</TooltipContent>
              </Tooltip>
            </PopoverTrigger>
            <PopoverContent side="right">
              <div>
                {hasChildren && childs!.map((c) => (
                  <ChildItem
                    key={c.route}
                    icon={c.icon}
                    name={c.name}
                    route={c.route}
                    collapsed={sidebarCollapsed}
                    closeSheet={closeSheet}
                  />
                  // <div key={c.route}>{c.name}</div>÷
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          /* ======= Collapsed item without child items ======= */
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={handleClick}
                className={clsx(
                  "w-full h-9 flex items-center justify-center px-2 rounded-lg cursor-pointer transition-all duration-300 select-none outline-none focus:outline-none",
                  isActiveModule() || hasActiveChild()
                    ? "bg-primary/20 text-primary organic-pill glow-blue shadow-lg shadow-primary/10"
                    : "text-muted-foreground hover:bg-primary/10 hover:translate-x-1 rounded-xl"
                )}
              >
                {icon}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{t(name)}</TooltipContent>
          </Tooltip>
        )}
      </>
    );
  }

  /** ======= Expanded Sidebar ======= */
  return (
    <>
      {/*======= Parent Menu =======*/}
      <div
        onClick={handleClick}
        className={clsx(
          "w-full h-9 flex items-center justify-between px-2 rounded-lg cursor-pointer transition-all duration-300 text-muted-foreground select-none outline-none focus:outline-none group",
          (isActiveModule() || hasActiveChild()) &&
            "bg-primary/20 text-primary organic-pill glow-blue shadow-lg shadow-primary/10",
          !(isActiveModule() || hasActiveChild()) && "hover:bg-primary/10 hover:translate-x-2 rounded-xl"
        )}
      >
        <div className={clsx("flex items-center gap-2")}>
          <div>{icon}</div>
          <div className="min-w-[150px] overflow-hidden">
            <Text>{t(name)}</Text>
          </div>
        </div>

        {hasChildren && (
          <ChevronDown
            className={clsx(
              "h-[15px] w-[15px] transition-all duration-500",
              showChilds && "rotate-180"
            )}
          />
        )}
      </div>

      {/*======= Child Menus =======*/}
      <div
        className={clsx(
          "overflow-hidden transition-all duration-500",
          showChilds ? "max-h-[100vh]" : "max-h-0"
        )}
      >
        {hasChildren &&
          childs!.map((c) => (
          <ChildItem
            key={c.route}
            icon={c.icon}
            name={c.name}
            route={c.route}
            closeSheet={closeSheet}
          />
        ))}
      </div>
    </>
  );
}

function ChildItem({
  icon,
  name,
  route,
  collapsed = false,
  closeSheet,
}: Omit<Props, "childs"> & { collapsed?: boolean }) {
  const isMatched = useMatch(route);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    navigate(route);
    if (closeSheet) closeSheet((prev) => !prev);
  };

  return (
    <div
    onClick={handleClick}
      className={clsx(
            "flex align-middle gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 text-muted-foreground select-none outline-none focus:outline-none",
        isMatched && "text-primary font-bold bg-primary/5 organic-pill",
        !isMatched && "hover:text-primary hover:translate-x-2 rounded-xl",
        !collapsed && "pl-6"
      )}
    >
      {icon}
      <Text>{t(name)}</Text>
    </div>
  );
}

export default SidebarItem;
