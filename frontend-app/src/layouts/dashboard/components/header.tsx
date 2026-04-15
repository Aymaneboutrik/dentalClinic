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

  const toggleSheet = () => setSheetOpen((prev) => !prev);

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

  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : "S";

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={clsx(
        "fixed top-0 right-0 z-10 flex gap-4 px-4 py-4 backdrop-blur-[10px] transition-all duration-300",
        sidebarCollapsed ? "left-0 sm:left-[60px]" : "sm:left-[250px] left-0"
      )}
    >
      {/* Mobile menu */}
      <Sheet open={sheetOpen} onOpenChange={toggleSheet}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
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

      {/* Top bar */}
      <div className="flex-1 flex gap-4 items-center justify-between">
        <SearchInput />

        <LangDropdown />

        <Button
          onClick={handleToggleTheme}
          variant="outline"
          className="rounded-full h-9 w-9"
          size="icon"
        >
          {theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full font-bold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              {initials}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleOpenProfile}>
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem>Settings</DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleOpenModal}
              className="text-red-500 focus:text-red-600"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
