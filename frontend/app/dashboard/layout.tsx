import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";
import MobileNav from "@/app/components/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="md:ml-64 min-h-screen">
        {children}
      </div>
      <MobileNav />
    </>
  );
}

