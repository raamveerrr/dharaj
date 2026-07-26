import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AnnouncementBar } from "@/components/customer/AnnouncementBar";
import { Navbar } from "@/components/customer/Navbar";
import { BottomNav } from "@/components/customer/BottomNav";
import { Footer } from "@/components/customer/Footer";

export const Route = createFileRoute("/_shop")({
  component: ShopLayout,
});

function ShopLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
