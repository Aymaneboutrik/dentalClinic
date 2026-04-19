import { Button } from "@components/ui/button";
import { Moon, Sun } from "lucide-react";
import clsx from "clsx";
import LangDropdown from "@components/commons/lang-dropdown";
import { useTheme } from "@components/theme/theme-provider";


export function Header() {
  const { setTheme, theme } = useTheme();

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
        "w-full absolute top-0 left-0 z-50 flex gap-4 px-8 py-6 bg-transparent transition-all duration-300"
      )}
    >

      {/* ======== App Bar ======== */}
      {/* Removed Redundant Logo for Auth Pages */}
      <div className="flex-1 flex gap-4 items-center justify-end">


        <div className="flex gap-2">
          <LangDropdown />

          <Button
            onClick={handleToggleTheme}
            variant="outline"
            className="rounded-full h-9 w-9 flex items-center justify-center"
            size="icon"
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
