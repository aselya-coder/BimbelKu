import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useEffect } from "react";
import { applyAppearanceSettings } from "@/lib/constants";

export function PublicLayout() {
  useEffect(() => {
    applyAppearanceSettings();
  }, []);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton floating />
    </div>
  );
}
