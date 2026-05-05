import { Button } from "@components/ui/button";
import clsx from "clsx";
import LangDropdown from "@components/commons/lang-dropdown";


export function Header() {
  return (
    <header
      className={clsx(
        "w-full absolute top-0 left-0 z-50 flex gap-4 px-8 py-6 bg-transparent transition-all duration-300"
      )}
    >

      {/* ======== App Bar ======== */}
      <div className="flex-1 flex gap-4 items-center justify-end">
        <div className="flex gap-2">
          <LangDropdown />
        </div>
      </div>
    </header>
  );
}

