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
      <AppNavbar subtitle="Planejamento com clareza" />
      <AppSidebar user={user} />
      <main className="pb-8 pt-6 md:ml-72">
        <AnimatedPageWrapper>{children}</AnimatedPageWrapper>
      </main>
    </div>
  );
}

