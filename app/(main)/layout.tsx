import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/app/components/navigation/Sidebar";
import { MobileNav } from "@/app/components/navigation/MobileNav";
import { TopBar } from "@/app/components/navigation/TopBar";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    (user?.user_metadata?.username as string | undefined)?.trim() ||
    user?.email?.split("@")[0] ||
    "User";

  const email = user?.email ?? "";
  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) ?? "";

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar displayName={displayName} email={email} avatarUrl={avatarUrl} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
