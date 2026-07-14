"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const TABS = [
  { href: "/", label: "Hoy" },
  { href: "/semana", label: "Semana" },
] as const;

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex items-center gap-2">
      <div className="flex flex-1 gap-1 rounded-control bg-surface p-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 rounded-control px-3 py-2 text-center text-sm transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <ThemeToggle />
    </nav>
  );
}