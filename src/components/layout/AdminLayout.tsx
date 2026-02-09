import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  GraduationCap, LayoutDashboard, BookOpen, MapPin, Package, 
  Calendar, Users, LogOut, Menu, X, Building2, Star
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { APP_NAME, applyAppearanceSettings } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockService } from "@/lib/mockService";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/subjects", label: "Mata Pelajaran", icon: BookOpen },
  { href: "/admin/cities", label: "Kota", icon: MapPin },
  { href: "/admin/locations", label: "Lokasi Partner", icon: Building2 },
  { href: "/admin/packages", label: "Paket Bimbel", icon: Package },
  { href: "/admin/schedules", label: "Jadwal", icon: Calendar },
  { href: "/admin/registrations", label: "Pendaftaran", icon: Users },
  { href: "/admin/testimonials", label: "Testimoni", icon: Star },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prevRegCount = useRef<number>(mockService.registrations.getAll().length);
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  useEffect(() => {
    applyAppearanceSettings();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel("registrations_new")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "registrations" }, (payload) => {
          const name = (payload.new as { student_name?: string })?.student_name || "Pendaftaran Baru";
          toast({ title: "Pendaftaran Baru", description: name });
          queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    const check = () => {
      const regs = mockService.registrations.getAll();
      if (regs.length > prevRegCount.current) {
        const latest = regs[0];
        toast({ title: "Pendaftaran Baru", description: latest?.student_name });
        queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      }
      prevRegCount.current = regs.length;
    };

    const interval = setInterval(check, 2000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bimbelku_registrations") check();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, [toast, queryClient, isSupabaseConfigured]);

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-sidebar-foreground">{APP_NAME}</span>
            </Link>
            <button 
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {sidebarLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User & Logout */}
          <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 text-xs text-sidebar-foreground/60 truncate">
            {user ? (user.email ?? (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "Admin")) : ""}
          </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Lihat Website
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
