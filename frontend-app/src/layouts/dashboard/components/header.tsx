import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@components/ui/sheet";
import { Moon, PanelLeft, Sun } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import menus from "@configs/menus";
import SidebarItem from "./sidebar-item";
import useUserPreference from "@stores/user-preference";
import clsx from "clsx";
import LangDropdown from "@components/commons/lang-dropdown";
import { useTheme } from "@components/theme/theme-provider";
import SearchInput from "@components/inputs/search-input";
import Logo from "@components/commons/logo";
import { useModal } from "@saimin/react-modal-manager";
import LogoutConfirmation from "@components/modals/logout-confirmation";
import ProfileModal from "@components/modals/profile-modal";
import { useState } from "react";
import useAuthOperations from "@hooks/use-auth-operations";
import useAuthStore from "@stores/auth-store";

export function Header() {
  const { sidebarCollapsed } = useUserPreference();
  const { setTheme, theme } = useTheme();
  const { open } = useModal();
  const { logout } = useAuthOperations();
  const { user } = useAuthStore();

  const [sheetOpen, setSheetOpen] = useState(false);

  const toggleSheet = () => {
    setSheetOpen((prev) => !prev);
  };

  const handleOpenModal = () => {
    open("logout-confirmation", {
      content: <LogoutConfirmation onConfirm={logout} />,
      animationType: "zoom",
    });
  };

  const handleOpenProfile = () => {
    open("profile-modal", {
      content: <ProfileModal />,
      animationType: "zoom",
    });
  };

  const initials = user 
    ? (user.email ? user.email.charAt(0) : "U").toUpperCase() 
    : "S";

  const handleToggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <header
      className={clsx(
        "fixed top-0 right-0 z-10 flex gap-4 px-4 py-4 backdrop-blur-[10px] transition-all duration-300",
        sidebarCollapsed ? "left-0 sm:left-[80px]" : "sm:left-[270px] left-0"
      )}
    >
      {/* ======== Mobile Drawer Navbar ======== */}
      <Sheet open={sheetOpen} onOpenChange={toggleSheet}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="sm:max-w-xs">
          <VisuallyHidden>
            <SheetTitle>Dental Clinic</SheetTitle>

            <SheetDescription>Dental Clinic</SheetDescription>

          </VisuallyHidden>
          <Logo />
          <nav className="flex flex-col gap-1 mt-4">
            {menus.map((m) => (
              <SidebarItem
                key={m.route}
                collapsible={false}
                icon={m.icon}
                name={m.name}
                route={m.route}
                childs={m.childs}
                closeSheet={setSheetOpen}
              />
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* ======== App Bar ======== */}
      <div className="flex-1 flex gap-4 items-center justify-between">
        <SearchInput />

        <div className="flex items-center gap-3">
          <LangDropdown />

          <Button
            onClick={handleToggleTheme}
            variant="outline"
            className="rounded-full h-10 w-10 flex items-center justify-center glass shadow-glass border-white/10 hover:scale-110 hover:rotate-12 transition-all duration-300"
            size="icon"
          >
            {theme === "light" ? (
              <Sun className="h-[22px] w-[22px] text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)] animate-in fade-in zoom-in duration-300" />
            ) : (
              <Moon className="h-[22px] w-[22px] text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.5)] animate-in fade-in zoom-in duration-300" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full font-bold bg-gradient-to-br from-primary to-cyan-500 text-white border-white/20 shadow-glass-dark hover:scale-110 transition-all duration-300 glow-blue"
              >
                <div className="text-sm">{initials}</div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 organic-card p-4 mt-2 border-white/5 shadow-2xl backdrop-blur-2xl">
              <DropdownMenuItem
                onClick={handleOpenProfile}
                className="cursor-pointer"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleOpenModal}
                className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
