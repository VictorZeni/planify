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
    <div className="min-h-screen bg-[#0F172A] text-slate-100">
      <MotivationModal />
      <AppSidebar user={user} />
      <main className="bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08)_0%,_rgba(15,23,42,0)_45%)] px-4 pb-8 pt-16 md:ml-72 md:px-8 md:pt-8">
        <AnimatedPageWrapper>{children}</AnimatedPageWrapper>
      </main>
    </div>
  );
}
