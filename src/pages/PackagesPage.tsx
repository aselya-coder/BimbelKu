import { Link, useSearchParams } from "react-router-dom";
import { Filter, MapPin, Monitor, Users, BookOpen, ChevronRight, Wifi, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackages, useSubjects, useCities, useEducationLevels, usePartnerLocations } from "@/hooks/usePublicData";
import type { LearningMode, LearningSystem, LearningPlace } from "@/types/database";
import { LEARNING_MODES, LEARNING_SYSTEMS, LEARNING_PLACES } from "@/lib/constants";

export default function PackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filters = {
    subject_id: searchParams.get("subject") || "",
    level_id: searchParams.get("level") || "",
    city_id: searchParams.get("city") || "",
    mode: (searchParams.get("mode") as LearningMode) || undefined,
    system: (searchParams.get("system") as LearningSystem) || undefined,
    place: (searchParams.get("place") as LearningPlace) || undefined,
    location_id: searchParams.get("location") || "",
  };

  const { data: packages, isLoading } = usePackages({
    subject_id: filters.subject_id || undefined,
    level_id: filters.level_id || undefined,
    city_id: filters.city_id || undefined,
    mode: filters.mode,
    system: filters.system,
    location_id: filters.location_id || undefined,
  });

  const { data: subjects } = useSubjects();
  const { data: cities } = useCities();
  const { data: levels } = useEducationLevels();
  const { data: partnerLocations, isLoading: isLoadingLocations } = usePartnerLocations(filters.city_id || undefined);
  const { data: allPackages } = usePackages();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    const newValue = value === "all" ? "" : value;
    
    // Map internal key to URL key
    const urlKey = key.replace("_id", "");
    
    if (newValue) {
      params.set(urlKey, newValue);
    } else {
      params.delete(urlKey);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getModeLabel = (mode: LearningMode) => {
    return LEARNING_MODES.find(m => m.value === mode)?.label || mode;
  };

  const getSystemLabel = (system: LearningSystem) => {
    return LEARNING_SYSTEMS.find(s => s.value === system)?.label || system;
  };

  const getPlaceLabel = (place: string | null) => {
    if (!place) return null;
    return LEARNING_PLACES.find(p => p.value === place)?.label || place;
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Paket Bimbel</h1>
          <p className="mt-2 text-muted-foreground">
            Temukan paket bimbingan belajar yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Filter</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-sm">
                  Reset Filter
                </Button>
              )}
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <Select value={filters.subject_id || "all"} onValueChange={(v) => updateFilter("subject_id", v)}>
                <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                  <SelectValue placeholder="Mata Pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mapel</SelectItem>
                  {subjects?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.level_id || "all"} onValueChange={(v) => updateFilter("level_id", v)}>
                <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                  <SelectValue placeholder="Jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenjang</SelectItem>
                  {levels?.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.city_id || "all"} onValueChange={(v) => updateFilter("city_id", v)}>
                <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                  <SelectValue placeholder="Kota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kota</SelectItem>
                  {cities?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.mode || "all"} onValueChange={(v) => updateFilter("mode", v)}>
                <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                  <SelectValue placeholder="Mode Belajar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mode</SelectItem>
                  {LEARNING_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.system || "all"} onValueChange={(v) => updateFilter("system", v)}>
                <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                  <SelectValue placeholder="Tipe Belajar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  {LEARNING_SYSTEMS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.place || "all"} onValueChange={(v) => updateFilter("place", v)}>
                <SelectTrigger className="w-full truncate [&>span]:whitespace-nowrap">
                  <SelectValue placeholder="Tempat Belajar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tempat</SelectItem>
                  {LEARNING_PLACES.filter((p) => p.value === "partner_cafe").map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Partner Locations */}
        {(!filters.location_id && filters.mode !== "online" && (filters.mode === "offline" || filters.place === "partner_cafe" || filters.city_id)) && (
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{filters.city_id ? "Lokasi Belajar di Kota Terpilih" : "Lokasi Cafe Terdekat"}</div>
                {filters.place !== "partner_cafe" && (
                  <Button size="sm" variant="outline" onClick={() => updateFilter("place", "partner_cafe")}>Tampilkan Paket di Cafe</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
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
                            .filter(p => !filters.subject_id || p.subject_id === filters.subject_id)
                            .filter(p => !filters.level_id || p.level_id === filters.level_id);
                          if (pkgs.length === 0) return null;
                          const formatPrice = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
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
                          <Button
                            size="sm"
                            className="w-full bg-gradient-primary hover:opacity-90"
                            onClick={() => {
                              updateFilter("location_id", loc.id);
                            }}
                          >
                            Lihat Paket di Cafe Ini
                          </Button>
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

        {/* Selected Location Summary */}
        {filters.location_id && (() => {
          const selectedLocation = partnerLocations?.find(l => String(l.id) === String(filters.location_id));
          return (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm">
                    <div className="font-medium">Paket di Cafe: {selectedLocation?.name || "Lokasi Terpilih"}</div>
                    {selectedLocation?.address && (
                      <div className="mt-1 text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="break-words whitespace-normal line-clamp-2">{selectedLocation.address}</span>
                      </div>
                    )}
                  </div>
                  {selectedLocation?.maps_link && (
                    <a href={selectedLocation.maps_link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">Buka Maps</Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {(() => {
          const hideBecauseShowingCafes = (!filters.location_id && filters.mode !== "online" && (filters.mode === "offline" || filters.place === "partner_cafe" || filters.city_id));
          const showEmptyBecauseCafeOnline = (filters.place === "partner_cafe" && !filters.location_id && filters.mode === "online");
          const filtered = (packages || []).filter((p) => {
            if (filters.place === "partner_cafe") return !!p.location_id;
            return true;
          });
          if (hideBecauseShowingCafes) return null;
          if (showEmptyBecauseCafeOnline) {
            return (
              <Card className="p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Tidak ada paket ditemukan</h3>
                <p className="mt-2 text-muted-foreground">
                  Coba ubah filter pencarian atau hubungi kami untuk informasi lebih lanjut.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Reset Filter
                  </Button>
                )}
              </Card>
            );
          }
          if (isLoading) {
            return (
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
            );
          }
          if (filtered.length === 0) {
            return (
              <Card className="p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Tidak ada paket ditemukan</h3>
                <p className="mt-2 text-muted-foreground">
                  Coba ubah filter pencarian atau hubungi kami untuk informasi lebih lanjut.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Reset Filter
                  </Button>
                )}
              </Card>
            );
          }
          return (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Menampilkan {filtered.length} paket
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((pkg) => (
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
                        {formatPrice(pkg.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pkg.total_sessions} sesi × {pkg.session_duration} menit
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0 mt-auto">
                      <Link to={`/packages/${pkg.id}`} className="w-full">
                        <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="outline">
                          Lihat Detail
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
