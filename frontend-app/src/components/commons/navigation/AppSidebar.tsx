import { Link } from "react-router-dom";

type SidebarItem = {
  title: string;
  url: string;
  icon?: React.ElementType;
};

type AppSidebarProps = {
  menuItems: SidebarItem[];
};

export function AppSidebar({ menuItems }: AppSidebarProps) {
  return (
    <aside className="w-64 border-r">
      <div className="p-4 text-xl font-bold">Dental Clinic</div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              to={item.url}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}