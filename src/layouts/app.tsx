import { Header } from "./_header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen gradient-bg-purple">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};
