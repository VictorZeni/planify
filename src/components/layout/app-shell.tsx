import { AppSidebar } from "./app-sidebar";
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
      <AppSidebar user={user} />
      <main
        className="px-4 pb-8 pt-16 md:ml-72 md:px-8 md:pt-8"
        style={{
          background:
            "radial-gradient(circle at top, var(--app-glow) 0%, rgba(15,23,42,0) 45%)",
        }}
      >
        <AnimatedPageWrapper>{children}</AnimatedPageWrapper>
      </main>
    </div>
  );
}
