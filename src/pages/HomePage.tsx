import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, BookOpen, MapPin, Monitor, Home, Users, ArrowRight, Star, CheckCircle2, Clock, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjects, useCities, useTestimonials, usePartnerLocations, usePackages } from "@/hooks/usePublicData";
import { APP_NAME, LEARNING_MODES, LEARNING_SYSTEMS, LEARNING_PLACES } from "@/lib/constants";
import type { LearningMode, LearningSystem } from "@/types/database";

export default function HomePage() {
  const { data: subjects } = useSubjects();
  const { data: cities } = useCities();
  const { data: testimonials } = useTestimonials();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    subject: "",
    city: "",
    mode: "",
    system: "",
    place: "",
  });

  const { data: partnerLocations, isLoading: isLoadingLocations } = usePartnerLocations(filters.city || undefined);
  const { data: allPackages } = usePackages();
  const { data: searchPackages, isLoading: isLoadingSearch } = usePackages({
    subject_id: filters.subject || undefined,
    city_id: filters.city || undefined,
    mode: filters.mode ? (filters.mode as LearningMode) : undefined,
    system: filters.system ? (filters.system as LearningSystem) : undefined,
  });

  const quickResults = (searchPackages || []).filter((p) => {
    if (filters.place === "partner_cafe") return !!p.location_id;
    return true;
  });

  const packagesParams = new URLSearchParams();
  if (filters.subject) packagesParams.set("subject", filters.subject);
  if (filters.city) packagesParams.set("city", filters.city);
  if (filters.mode) packagesParams.set("mode", filters.mode);
  if (filters.system) packagesParams.set("system", filters.system);
  if (filters.place) packagesParams.set("place", filters.place);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.subject) params.set("subject", filters.subject);
    if (filters.city) params.set("city", filters.city);
    if (filters.mode) params.set("mode", filters.mode);
    if (filters.system) params.set("system", filters.system);
    if (filters.place) params.set("place", filters.place);
    navigate(`/packages?${params.toString()}`);
  };

  const benefits = [
    {
      icon: Award,
      title: "Tutor Berpengalaman",
      description: "Semua tutor kami telah melalui seleksi ketat dan memiliki pengalaman mengajar yang mumpuni.",
    },
    {
      icon: MapPin,
      title: "Lokasi & Jadwal Fleksibel",
      description: "Belajar nyaman di cafe terdekat setiap kota atau online, dengan jadwal yang fleksibel.",
    },
    {
      icon: Users,
      title: "Private & Grup",
      description: "Tersedia pilihan belajar private 1-on-1 atau dalam grup kecil yang interaktif.",
    },
    {
      icon: Heart,
      title: "Pendampingan Intensif",
      description: "Tutor kami memberikan perhatian penuh untuk memastikan pemahaman materi.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-in">
              Raih Prestasi Terbaik dengan{" "}
              <span className="text-gradient-primary">{APP_NAME}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Bimbingan belajar berkualitas dengan tutor profesional. 
              Tersedia online dan offline di cafe terdekat di setiap kota.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-accent text-white shadow-accent hover:opacity-90">
                  Daftar Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/packages">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white border-2 border-primary !text-primary hover:bg-primary/10">
                  Lihat Paket Bimbel
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Filter Form */}
          <Card className="mx-auto mt-12 max-w-4xl shadow-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mata Pelajaran</label>
                  <Select value={filters.subject || "all"} onValueChange={(v) => setFilters({ ...filters, subject: v === "all" ? "" : v })}>
                    <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                      <SelectValue placeholder="Semua Mapel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Mapel</SelectItem>
                      {subjects?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Kota</label>
                  <Select value={filters.city || "all"} onValueChange={(v) => setFilters({ ...filters, city: v === "all" ? "" : v })}>
                    <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                      <SelectValue placeholder="Semua Kota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kota</SelectItem>
                      {cities?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mode Belajar</label>
                  <Select value={filters.mode || "all"} onValueChange={(v) => setFilters({ ...filters, mode: v === "all" ? "" : v })}>
                    <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                      <SelectValue placeholder="Semua Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Mode</SelectItem>
                      {LEARNING_MODES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tipe Belajar</label>
              <Select value={filters.system || "all"} onValueChange={(v) => setFilters({ ...filters, system: v === "all" ? "" : v })}>
              <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  {LEARNING_SYSTEMS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tempat Belajar</label>
              <Select value={filters.place || "all"} onValueChange={(v) => setFilters({ ...filters, place: v === "all" ? "" : v })}>
                <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                  <SelectValue placeholder="Semua Tempat" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tempat</SelectItem>
                    {LEARNING_PLACES.filter((p) => p.value === "partner_cafe").map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>

                <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full bg-gradient-primary hover:opacity-90">
                <Search className="mr-2 h-4 w-4" />
                Cari
              </Button>
                </div>
              </div>
          </CardContent>
          </Card>

          {(filters.subject || filters.city || filters.mode || filters.system || filters.place) && (
            <Card className="mx-auto mt-6 max-w-4xl shadow-md animate-fade-in" style={{ animationDelay: "0.33s" }}>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-medium">Hasil Cepat</div>
                  <Link to={`/packages?${packagesParams.toString()}`}>
                    <Button size="sm" variant="outline">Lihat Semua</Button>
                  </Link>
                </div>
                {isLoadingSearch ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                        <CardFooter>
                          <Skeleton className="h-10 w-full" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : quickResults.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Tidak ada paket sesuai filter. Coba ubah filter atau klik "Lihat Semua".</div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {quickResults.slice(0, 6).map((pkg) => (
                      <Card key={pkg.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 flex flex-col h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {pkg.name}
                              </h3>
                              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                <span>{pkg.subject?.name}</span>
                                <span>•</span>
                                <span>{pkg.level?.name}</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary" className="gap-1">
                              {pkg.mode === "online" ? <Monitor className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                              {pkg.mode === "online" ? "Online" : "Offline"}
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <Users className="h-3 w-3" />
                              {pkg.system === "private" ? "Private" : "Grup"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{pkg.city?.name}</span>
                          </div>
                          {pkg.location?.name && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <span>Cafe:</span>
                              <span className="break-words whitespace-normal">{pkg.location?.name}</span>
                            </div>
                          )}
                          <div className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(pkg.price)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.total_sessions} sesi × {pkg.session_duration} menit
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 mt-auto">
                          <Link to={`/packages/${pkg.id}`} className="w-full">
                            <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="outline">
                              Lihat Detail
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(filters.city || filters.place === "partner_cafe") && (
            <Card className="mx-auto mt-6 max-w-4xl shadow-md animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-medium">{filters.city ? "Lokasi Cafe di Kota Terpilih" : "Lokasi Cafe Terdekat"}</div>
                </div>
                {isLoadingLocations ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : (partnerLocations && partnerLocations.length > 0) ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {partnerLocations.map((loc) => (
                      <Card key={loc.id} className="group transition-all hover:shadow-lg hover:border-primary/30 bg-white border rounded-xl flex flex-col h-full">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold break-words whitespace-normal flex-1">{loc.name}</div>
                            {typeof loc.distance_km === "number" && (
                              <Badge variant="outline" className="shrink-0 whitespace-nowrap">~{loc.distance_km.toFixed(1)} km</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-2">
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="break-words whitespace-normal line-clamp-2">{loc.address}</span>
                          </div>
                          {(() => {
                            const pkgs = (allPackages || [])
                              .filter(p => String(p.location_id) === String(loc.id))
                              .filter(p => !filters.system || p.system === filters.system)
                              .filter(p => !filters.mode || p.mode === filters.mode)
                              .filter(p => !filters.subject || p.subject_id === filters.subject)
                              .filter(p => !filters.city || p.city_id === filters.city);
                            if (pkgs.length === 0) return null;
                            return (
                              <div className="mt-3 space-y-3">
                                {pkgs.slice(0, 3).map(p => (
                                  <div key={p.id} className="space-y-1">
                                    <div className="text-sm font-medium break-words whitespace-normal line-clamp-2">{p.name}</div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant="secondary">{p.system === "private" ? "Private" : "Grup"}</Badge>
                                      <Badge variant="outline">{p.mode === "online" ? "Online" : "Offline"}</Badge>
                                      <div className="text-sm text-muted-foreground">{formatPrice(p.price)}</div>
                                    </div>
                                  </div>
                                ))}
                                {pkgs.length > 3 && (
                                  <div className="text-xs text-muted-foreground">+{pkgs.length - 3} paket lainnya</div>
                                )}
                              </div>
                            );
                          })()}
                        </CardContent>
                        <CardFooter className="p-4 pt-0 mt-auto">
                          <div className="grid grid-cols-1 gap-2 w-full">
                            {loc.maps_link && (
                              <a href={loc.maps_link} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button variant="outline" size="sm" className="w-full">Buka Maps</Button>
                              </a>
                            )}
                            <Button size="sm" className="w-full bg-gradient-primary hover:opacity-90" onClick={() => {
                              const params = new URLSearchParams();
                              params.set("place", "partner_cafe");
                              params.set("location", loc.id);
                              navigate(`/packages?${params.toString()}`);
                            }}>Lihat Paket di Cafe Ini</Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Belum ada lokasi cafe terdaftar di kota ini.</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Mengapa Memilih <span className="text-gradient-primary">{APP_NAME}</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Kami berkomitmen memberikan pengalaman belajar terbaik untuk siswa
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="group border-2 border-transparent transition-all hover:border-primary/20 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary transition-colors">
                    <benefit.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-16">
        <div className="container">
          <div className="grid gap-8 text-center md:grid-cols-4">
            {[
              { value: "500+", label: "Siswa Terdaftar" },
              { value: "50+", label: "Tutor Profesional" },
              { value: "10+", label: "Kota Layanan" },
              { value: "95%", label: "Tingkat Kepuasan" },
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl font-bold text-primary-foreground md:text-5xl">{stat.value}</div>
                <div className="mt-2 text-sm text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Apa Kata Mereka?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Testimoni dari siswa dan orang tua yang telah bergabung
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(testimonials?.length ? testimonials : [
              { id: "1", name: "Andi Pratama", role: "Siswa SMA", content: "Bimbel ini sangat membantu saya memahami materi matematika yang sulit. Tutor sabar dan menjelaskan dengan jelas.", rating: 5 },
              { id: "2", name: "Ibu Dewi", role: "Orang Tua", content: "Anak saya jadi lebih semangat belajar. Sistem pembelajaran yang fleksibel sangat cocok dengan jadwal kami.", rating: 5 },
              { id: "3", name: "Rizky Hidayat", role: "Siswa SMP", content: "Saya suka belajar online di sini karena tutornya asyik dan materinya mudah dipahami.", rating: 5 },
            ]).map((testimonial, index) => (
              <Card 
                key={testimonial.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mb-4 text-muted-foreground italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <span className="text-sm font-semibold text-secondary-foreground">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Card className="overflow-hidden bg-gradient-primary">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold text-primary-foreground md:text-4xl">
                Siap Untuk Memulai Perjalanan Belajar?
              </h2>
              <p className="mt-4 text-primary-foreground/80 md:text-lg">
                Daftar sekarang dan rasakan pengalaman belajar yang menyenangkan bersama {APP_NAME}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                    Daftar Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/packages">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
                    Lihat Paket
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
  const formatPrice = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
