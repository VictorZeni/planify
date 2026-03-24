import { AppSidebar } from "./app-sidebar";
import { AppNavbar } from "./app-navbar";
import { MotivationModal } from "@/components/motivation/motivation-modal";
import { AnimatedPageWrapper } from "@/components/motion/animated-page-wrapper";

type AppShellProps = {
  children: React.ReactNode;
  user: {
    displayName: string;
    email: string;
    avatarUrl: string | null;
    isAuthorized?: boolean;
    isAdmin?: boolean;
  };
};

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <MotivationModal />
      <main className="mx-auto w-full max-w-[1360px] px-3 pb-8 pt-4 md:px-6 md:pt-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
          <div className="grid min-h-[calc(100vh-4rem)] md:grid-cols-[240px_1fr]">
            <AppSidebar user={user} />
            <div className="min-w-0 border-l border-[var(--app-border)] md:border-l">
              <AppNavbar subtitle="Planejamento com clareza" />
              <div className="p-4 md:p-6">
                <AnimatedPageWrapper>{children}</AnimatedPageWrapper>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
