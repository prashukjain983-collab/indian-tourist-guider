import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { BookmarkCheck, LogOut, Map } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading, displayName } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-secondary border-t-primary" />
      </div>
    );
  }

  const firstName = (displayName || user.email || "").split(/[\s@]/)[0];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/explore" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              भ
            </span>
            <span className="hidden font-display text-lg font-semibold sm:inline">
              Indian Tourist Guider
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            <Link
              to="/explore"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              <Map className="size-4" /> Map
            </Link>
            <Link
              to="/saved"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              <BookmarkCheck className="size-4" /> My places
            </Link>
          </nav>
          <div className="hidden text-sm text-muted-foreground md:block">
            Namaste, <span className="font-semibold text-foreground">{firstName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut />
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
