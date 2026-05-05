import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import useUserPreference from "@stores/user-preference";
import clsx from "clsx";
import { Earth } from "lucide-react";
import { useTranslation } from "react-i18next";

function LangDropdown() {
  const { i18n } = useTranslation();
  const { changeLang } = useUserPreference();

  const handleChangeLang = (lang: Lang) => {
    i18n.changeLanguage(lang);
    changeLang(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full glass shadow-glass border-white/10 hover:scale-110 transition-all duration-300"
        >
          <Earth className="h-[18px] w-[18px] text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="space-y-1">
        <DropdownMenuItem
          onClick={() => handleChangeLang("en")}
          className={clsx(
            "cursor-pointer",
            i18n.language === "en" &&
              "bg-primary text-primary-foreground focus:text-primary-foreground focus:bg-primary"
          )}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleChangeLang("fr")}
          className={clsx(
            "cursor-pointer",
            i18n.language === "fr" &&
              "bg-primary text-primary-foreground focus:text-primary-foreground focus:bg-primary"
          )}
        >
          Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LangDropdown;
