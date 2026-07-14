import { logout } from "@/app/actions/session";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label="Cerrar sesión"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-text-muted hover:bg-border/50"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M7.5 17.5H4.5a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1h3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M13 14l4-4-4-4M17 10H7.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}
