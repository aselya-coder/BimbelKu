import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Users, BookOpen, Monitor, Home, Wifi, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackage, useSchedules } from "@/hooks/usePublicData";
import { LEARNING_MODES, LEARNING_SYSTEMS, LEARNING_PLACES } from "@/lib/constants";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pkg, isLoading, error } = usePackage(id || "");
  const { data: schedules } = useSchedules(id || "");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getModeLabel = (mode: string) => {
    return LEARNING_MODES.find(m => m.value === mode)?.label || mode;
  };

  const getSystemLabel = (system: string) => {
    return LEARNING_SYSTEMS.find(s => s.value === system)?.label || system;
  };

  const getPlaceLabel = (place: string | null) => {
    if (!place) return null;
    return LEARNING_PLACES.find(p => p.value === place)?.label || place;
  };

  if (isLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-4xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="py-16">
        <div className="container text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Paket Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">Paket yang Anda cari tidak tersedia atau sudah dihapus.</p>
          <Link to="/packages">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Paket
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const whatsappMessage = `Halo, saya tertarik dengan paket bimbel "${pkg.name}" - ${pkg.subject?.name} (${pkg.level?.name}). Mohon informasi lebih lanjut.`;

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <Link to="/packages" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Paket
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="gap-1">
              {pkg.mode === "online" ? <Wifi className="h-3 w-3" /> : <Home className="h-3 w-3" />}
              {getModeLabel(pkg.mode)}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {getSystemLabel(pkg.system)}
            </Badge>
            {pkg.place === "student_home" && (
              <Badge variant="outline">{getPlaceLabel(pkg.place)}</Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold text-foreground md:text-4xl">{pkg.name}</h1>
          
          <div className="mt-3 flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{pkg.subject?.name}</span>
            </div>
            <span>•</span>
            <span>{pkg.level?.name}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{pkg.city?.name}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {pkg.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deskripsi Paket</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{pkg.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detail Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Total Sesi</div>
                      <div className="text-sm text-muted-foreground">{pkg.total_sessions} pertemuan</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Durasi per Sesi</div>
                      <div className="text-sm text-muted-foreground">{pkg.session_duration} menit</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      {pkg.mode === "online" ? (
                        <Wifi className="h-5 w-5 text-primary" />
                      ) : (
                        <Home className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">Mode Belajar</div>
                      <div className="text-sm text-muted-foreground">{getModeLabel(pkg.mode)}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Tipe Belajar</div>
                      <div className="text-sm text-muted-foreground">
                        {getSystemLabel(pkg.system)}
                        {pkg.system === "group" && pkg.group_quota && (
                          <span> (maks. {pkg.group_quota} siswa)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Info for Offline */}
                {pkg.mode === "offline" && pkg.location && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">Lokasi Belajar</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{pkg.location.name}</p>
                      <p>{pkg.location.address}</p>
                      <div className="mt-1">
                        <a
                          href={pkg.location.maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pkg.location.address || pkg.location.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          Buka di Google Maps
                        </a>
                      </div>
                      {pkg.location.operating_hours && (
                        <p className="mt-1">Jam operasional: {pkg.location.operating_hours}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">Jadwal Tersedia</span>
                  </div>
                  {schedules && schedules.length > 0 ? (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {schedules.map((s) => {
                        const dayLabel = DAYS_OF_WEEK.find(d => d.value === s.day_of_week)?.label || String(s.day_of_week);
                        return (
                          <li key={`${s.id}`} className="flex items-center gap-2">
                            <Badge variant="outline" className="mr-1">{dayLabel}</Badge>
                            <span>{s.start_time} - {s.end_time}</span>
                            {typeof s.max_students === "number" && (
                              <span className="ml-2">• Kapasitas {s.max_students}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Jadwal akan dikoordinasikan bersama admin melalui WhatsApp.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yang Akan Didapat</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Materi pembelajaran terstruktur",
                    "Latihan soal dan pembahasan",
                    "Tutor berpengalaman dan profesional",
                    "Konsultasi di luar jam belajar via WhatsApp",
                    "Laporan perkembangan belajar",
                    "Tryout dan evaluasi berkala",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Pricing & CTA */}
          <div className="space-y-6">
            <Card className="sticky top-24 shadow-lg border-primary/20">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-sm text-muted-foreground mb-1">Harga Paket</div>
                  <div className="text-3xl font-bold text-primary">{formatPrice(pkg.price)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {pkg.total_sessions} sesi × {pkg.session_duration} menit
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to={`/register?package=${pkg.id}`} className="block">
                    <Button className="w-full bg-gradient-accent text-white shadow-accent hover:opacity-90" size="lg">
                      Daftar Sekarang
                    </Button>
                  </Link>
                  
                  <WhatsAppButton 
                    message={whatsappMessage}
                    className="w-full justify-center"
                  />
                </div>

                <p className="mt-4 text-xs text-center text-muted-foreground">
                  Konsultasi gratis sebelum mendaftar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
