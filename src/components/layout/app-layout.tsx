import { AppShell } from "./app-shell";

type AppLayoutProps = React.ComponentProps<typeof AppShell>;

export function AppLayout(props: AppLayoutProps) {
  return <AppShell {...props} />;
}

