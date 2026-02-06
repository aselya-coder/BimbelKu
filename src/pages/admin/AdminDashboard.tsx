import { useQuery } from "@tanstack/react-query";
import { Package, Users, MapPin, BookOpen, TrendingUp, Clock, Wifi, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockService } from "@/lib/mockService";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const registrations = mockService.registrations.getAll();
      const packages = mockService.packages.getAll().filter(p => p.is_active);
      const subjects = mockService.subjects.getAll().filter(s => s.is_active);
      const cities = mockService.cities.getAll().filter(c => c.is_active);
      
      const recentRegistrations = [...registrations]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

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
                <span className="font-semibold">{stats?.onlineCount || 0} paket</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-500" />
                  <span>Offline</span>
                </div>
                <span className="font-semibold">{stats?.offlineCount || 0} paket</span>
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
                {stats?.recentRegistrations?.map((reg: any) => (
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
