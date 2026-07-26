import { Bell, Menu, Search } from "lucide-react";

export function AdminTopbar({ onMenu, title }: { onMenu: () => void; title: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
      <button
        onClick={onMenu}
        className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary lg:hidden"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-extrabold sm:text-xl">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-2 sm:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search…" className="w-48 bg-transparent text-sm outline-none" />
        </div>
        <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sale" />
        </button>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          D
        </div>
      </div>
    </header>
  );
}
