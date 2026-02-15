import { useQuery } from "@tanstack/react-query";
import { Package, Users, MapPin, BookOpen, TrendingUp, Clock, Wifi, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockService } from "@/lib/mockService";
import type { Registration, TutoringPackage } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAdminWhatsAppNumber, setAdminWhatsAppNumber, getAppearanceSettings, setAppearanceSettings, COLOR_PRESETS, SIDEBAR_PRESETS, GRADIENT_PRESETS, type AppearanceSettings } from "@/lib/constants";
import { useState, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RecentRegistration = Pick<Registration, "id" | "student_name" | "created_at"> & {
  package?: Pick<TutoringPackage, "name">;
};

type AdminStats = {
  registrations: number;
  packages: number;
  subjects: number;
  cities: number;
  recentRegistrations: RecentRegistration[];
  onlineCount: number;
  offlineCount: number;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [adminPhone, setAdminPhone] = useState<string>(getAdminWhatsAppNumber());
  const [appearance, setAppearance] = useState<AppearanceSettings>(getAppearanceSettings());
  const presetKey = useMemo(() => {
    const found = COLOR_PRESETS.find(p => p.primary === appearance.primary && p.accent === appearance.accent);
    return found?.key || "teal";
  }, [appearance]);
  const sidebarKey = useMemo(() => {
    const found = SIDEBAR_PRESETS.find(p => p.background === appearance.sidebarBackground && p.accent === appearance.sidebarAccent);
    return found?.key || "default";
  }, [appearance]);
  const gradientKey = useMemo(() => {
    const found = GRADIENT_PRESETS.find(g => g.primary === appearance.gradientPrimary && g.accent === appearance.gradientAccent && g.hero === appearance.gradientHero);
    return found?.key || "default";
  }, [appearance]);
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"] as const,
    queryFn: async (): Promise<AdminStats> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (isSupabaseConfigured) {
        try {
          const [pkgRes, subjRes, cityRes, regRes] = await Promise.all([
            supabase.from("tutoring_packages").select("*").eq("is_active", true),
            supabase.from("subjects").select("*").eq("is_active", true),
            supabase.from("cities").select("*").eq("is_active", true),
            supabase
              .from("registrations")
              .select("*, package:tutoring_packages(name, mode)")
              .order("created_at", { ascending: false })
              .limit(5),
          ]);

          if (pkgRes.error) throw pkgRes.error;
          if (subjRes.error) throw subjRes.error;
          if (cityRes.error) throw cityRes.error;
          if (regRes.error) throw regRes.error;

          const packages = (pkgRes.data || []) as TutoringPackage[];
          const subjects = subjRes.data || [];
          const cities = cityRes.data || [];

          type RegWithPackageName = {
            id: string;
            student_name: string;
            created_at: string;
            package?: { name: string } | null;
          };
          const regsData = (regRes.data ?? []) as RegWithPackageName[];
          const recentRegistrations: RecentRegistration[] = regsData.map((reg) => ({
            id: reg.id,
            student_name: reg.student_name,
            created_at: reg.created_at,
            package: reg.package ? { name: reg.package.name } : undefined,
          }));

          const onlineCount = packages.filter(p => p.mode === "online").length;
          const offlineCount = packages.filter(p => p.mode === "offline").length;

          return {
            registrations: (regRes.data || []).length,
            packages: packages.length,
            subjects: subjects.length,
            cities: cities.length,
            recentRegistrations,
            onlineCount,
            offlineCount,
          };
        } catch {
          // fallback to mock when Supabase query fails
        }
      }

      const registrations = mockService.registrations.getAll();
      const packages = mockService.packages.getAll().filter(p => p.is_active);
      const subjects = mockService.subjects.getAll().filter(s => s.is_active);
      const cities = mockService.cities.getAll().filter(c => c.is_active);
      
      const recentRegistrationsRaw = [...registrations]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      const recentRegistrations: RecentRegistration[] = recentRegistrationsRaw.map((reg) => ({
        id: reg.id,
        student_name: reg.student_name,
        created_at: reg.created_at,
        package: reg.package ? { name: reg.package.name } : undefined,
      }));

      const onlineCount = packages.filter(p => p.mode === "online").length;
      const offlineCount = packages.filter(p => p.mode === "offline").length;

      return {
        registrations: registrations.length,
        packages: packages.length,
        subjects: subjects.length,
        cities: cities.length,
        recentRegistrations,
        onlineCount,
        offlineCount,
      };
    },
  });

  const statCards = [
    { title: "Total Pendaftaran", value: stats?.registrations || 0, icon: Users, color: "text-blue-600" },
    { title: "Paket Aktif", value: stats?.packages || 0, icon: Package, color: "text-green-600" },
    { title: "Mata Pelajaran", value: stats?.subjects || 0, icon: BookOpen, color: "text-purple-600" },
    { title: "Kota Layanan", value: stats?.cities || 0, icon: MapPin, color: "text-orange-600" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan data bimbel Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? "-" : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mode Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Statistik Mode Belajar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span>Online</span>
                </div>
                <div className="text-2xl font-bold">{isLoading ? "-" : stats?.onlineCount}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-500" />
                  <span>Offline</span>
                </div>
                <div className="text-2xl font-bold">{isLoading ? "-" : stats?.offlineCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Contact Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengaturan Kontak Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Nomor WhatsApp Admin</label>
              <Input
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="Contoh: 6281234567890"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setAdminWhatsAppNumber(adminPhone);
                    toast({ title: "Tersimpan", description: "+" + adminPhone });
                  }}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengaturan Tampilan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Mode Gelap</Label>
                <Switch
                  checked={appearance.theme === "dark"}
                  onCheckedChange={(v) => setAppearance({ ...appearance, theme: v ? "dark" : "light" })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Warna Utama</Label>
                <Select
                  value={presetKey}
                  onValueChange={(key) => {
                    const p = COLOR_PRESETS.find((c) => c.key === key);
                    if (p) setAppearance({ ...appearance, primary: p.primary, accent: p.accent });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih warna" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_PRESETS.map((p) => (
                      <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Warna Sidebar</Label>
                <Select
                  value={sidebarKey}
                  onValueChange={(key) => {
                    const s = SIDEBAR_PRESETS.find((c) => c.key === key);
                    if (s) setAppearance({ ...appearance, sidebarBackground: s.background, sidebarAccent: s.accent });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tema sidebar" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIDEBAR_PRESETS.map((s) => (
                      <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Gaya Gradient</Label>
                <Select
                  value={gradientKey}
                  onValueChange={(key) => {
                    const g = GRADIENT_PRESETS.find((c) => c.key === key);
                    if (g) setAppearance({ ...appearance, gradientPrimary: g.primary, gradientAccent: g.accent, gradientHero: g.hero });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih gradient" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_PRESETS.map((g) => (
                      <SelectItem key={g.key} value={g.key}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Radius Sudut</Label>
                <Select
                  value={appearance.radius}
                  onValueChange={(v) => setAppearance({ ...appearance, radius: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5rem">Kecil</SelectItem>
                    <SelectItem value="0.75rem">Sedang</SelectItem>
                    <SelectItem value="1rem">Besar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  const def = { theme: "light", primary: "174 60% 40%", accent: "16 85% 60%", radius: "0.75rem" } as AppearanceSettings;
                  setAppearance(def);
                  setAppearanceSettings(def);
                  toast({ title: "Tampilan direset" });
                }}>Reset</Button>
                <Button onClick={() => {
                  const updated = setAppearanceSettings(appearance);
                  setAppearance(updated);
                  toast({ title: "Tersimpan", description: "Pengaturan tampilan diterapkan" });
                }}>Simpan</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Pendaftaran Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Memuat...</p>
            ) : stats?.recentRegistrations?.length === 0 ? (
              <p className="text-muted-foreground">Belum ada pendaftaran</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentRegistrations?.map((reg) => (
                  <div key={reg.id} className="flex items-start justify-between text-sm">
                    <div>
                      <div className="font-medium">{reg.student_name}</div>
                      <div className="text-muted-foreground text-xs">{reg.package?.name}</div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {formatDate(reg.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
