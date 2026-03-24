import Image from "next/image";
import { Button } from "@/components/ui/button";

type AppNavbarProps = {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function AppNavbar({ title = "Planify", subtitle, right }: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--app-border)] bg-[color:rgba(247,248,246,0.92)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <Image src="/planify-logo.svg" alt="Planify" width={130} height={34} className="h-8 w-auto" priority />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[var(--app-text)]">{title}</p>
            {subtitle ? <p className="text-xs text-[var(--app-text-muted)]">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Workspace
          </Button>
        </div>
      </div>
    </header>
  );
}

