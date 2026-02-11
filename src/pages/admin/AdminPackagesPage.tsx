
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockService } from "@/lib/mockService";
import { supabase } from "@/integrations/supabase/client";
import { LEARNING_MODES, LEARNING_PLACES, LEARNING_SYSTEMS } from "@/lib/constants";
import type { TutoringPackage, Subject, EducationLevel, City, PartnerLocation, LearningMode, LearningPlace, LearningSystem } from "@/types/database";

interface PackageFormData {
  name: string;
  subject_id: string;
  level_id: string;
  city_id: string;
  location_id: string;
  mode: LearningMode;
  place: LearningPlace | "";
  system: LearningSystem;
  price: string;
  session_duration: string;
  total_sessions: string;
  group_quota: string;
  description: string;
  is_active: boolean;
}

const initialFormData: PackageFormData = {
  name: "",
  subject_id: "",
  level_id: "",
  city_id: "",
  location_id: "",
  mode: "online",
  place: "",
  system: "private",
  price: "",
  session_duration: "90",
  total_sessions: "8",
  group_quota: "",
  description: "",
  is_active: true,
};

// Check if Supabase is configured
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function AdminPackagesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TutoringPackage | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("tutoring_packages")
            .select(`
              *,
              subject:subjects(*),
              level:education_levels(*),
              city:cities(*),
              location:partner_locations(*)
            `)
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data as TutoringPackage[];
        } catch {
          await new Promise(resolve => setTimeout(resolve, 300));
          return mockService.packages.getAll();
        }
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockService.packages.getAll();
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ["admin-subjects-select"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from("subjects").select("*").eq("is_active", true);
          if (error) throw error;
          return data as Subject[];
        } catch {
          return mockService.subjects.getAll().filter(s => s.is_active);
        }
      }
      return mockService.subjects.getAll().filter(s => s.is_active);
    },
  });

  const { data: levels } = useQuery({
    queryKey: ["admin-levels-select"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from("education_levels").select("*").order("sort_order");
          if (error) throw error;
          return data as EducationLevel[];
        } catch {
          return mockService.educationLevels.getAll();
        }
      }
      return mockService.educationLevels.getAll();
    },
  });

  const { data: cities } = useQuery({
    queryKey: ["admin-cities-select"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.from("cities").select("*").eq("is_active", true);
          if (error) throw error;
          return data as City[];
        } catch {
          return mockService.cities.getAll().filter(c => c.is_active);
        }
      }
      return mockService.cities.getAll().filter(c => c.is_active);
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["admin-locations-select", formData.city_id],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          let query = supabase.from("partner_locations").select("*").eq("is_active", true);
          if (formData.city_id) query = query.eq("city_id", formData.city_id);
          const { data, error } = await query;
          if (error) throw error;
          return data as PartnerLocation[];
        } catch {
          let locations = mockService.locations.getAll().filter(l => l.is_active);
          if (formData.city_id) {
            locations = locations.filter(l => l.city_id === formData.city_id);
          }
          return locations;
        }
      }

      let locations = mockService.locations.getAll().filter(l => l.is_active);
      if (formData.city_id) {
        locations = locations.filter(l => l.city_id === formData.city_id);
      }
      return locations;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PackageFormData & { id?: string }) => {
      const payload = {
        name: data.name,
        subject_id: data.subject_id,
        level_id: data.level_id,
        city_id: data.city_id,
        location_id: data.location_id || null,
        mode: data.mode as LearningMode,
        place: data.place || null,
        system: data.system as LearningSystem,
        price: parseFloat(data.price),
        session_duration: parseInt(data.session_duration),
        total_sessions: parseInt(data.total_sessions),
        group_quota: data.group_quota ? parseInt(data.group_quota) : null,
        description: data.description || null,
        is_active: data.is_active,
        slug: data.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
      };

      if (isSupabaseConfigured) {
        if (data.id) {
           const { error } = await supabase.from("tutoring_packages").update(payload).eq("id", data.id);
           if (error) throw error;
        } else {
           const { error } = await supabase.from("tutoring_packages").insert([payload]);
           if (error) throw error;
        }
        return;
      }

      // Mock fallback
      await new Promise(resolve => setTimeout(resolve, 500));
      if (data.id) {
        return mockService.packages.update(data.id, payload);
      } else {
        return mockService.packages.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      toast({ title: editingPackage ? "Berhasil diperbarui" : "Berhasil ditambahkan" });
      handleCloseDialog();
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("tutoring_packages").delete().eq("id", id);
        if (error) throw error;
        return;
      }
      // Mock fallback
      await new Promise(resolve => setTimeout(resolve, 500));
      mockService.packages.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      toast({ title: "Berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    },
  });

  const handleOpenDialog = (pkg?: TutoringPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        subject_id: pkg.subject_id,
        level_id: pkg.level_id,
        city_id: pkg.city_id,
        location_id: pkg.location_id || "",
        mode: pkg.mode,
        place: pkg.place || "",
        system: pkg.system,
        price: pkg.price.toString(),
        session_duration: pkg.session_duration.toString(),
        total_sessions: pkg.total_sessions.toString(),
        group_quota: pkg.group_quota?.toString() || "",
        description: pkg.description || "",
        is_active: pkg.is_active,
      });
    } else {
      setEditingPackage(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPackage(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingPackage?.id });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paket Bimbel</h1>
          <p className="text-muted-foreground">Kelola paket program bimbingan belajar</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Paket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit Paket" : "Tambah Paket"}</DialogTitle>
              <DialogDescription>Isi form paket bimbingan belajar.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nama Paket *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Paket Intensif Matematika SMA"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mata Pelajaran *</Label>
                  <Select value={formData.subject_id} onValueChange={(v) => setFormData({ ...formData, subject_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                    <SelectContent>
                      {subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Jenjang *</Label>
                  <Select value={formData.level_id} onValueChange={(v) => setFormData({ ...formData, level_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih jenjang" /></SelectTrigger>
                    <SelectContent>
                      {levels?.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kota *</Label>
                  <Select value={formData.city_id} onValueChange={(v) => setFormData({ ...formData, city_id: v, location_id: "" })}>
                    <SelectTrigger><SelectValue placeholder="Pilih kota" /></SelectTrigger>
                    <SelectContent>
                      {cities?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mode Belajar *</Label>
                  <Select value={formData.mode} onValueChange={(v) => setFormData({ ...formData, mode: v as LearningMode })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEARNING_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {formData.mode === "offline" && (
                  <>
                    <div className="space-y-2">
                      <Label>Tempat Belajar</Label>
                      <Select value={formData.place} onValueChange={(v) => setFormData({ ...formData, place: v as LearningPlace })}>
                        <SelectTrigger><SelectValue placeholder="Pilih tempat" /></SelectTrigger>
                        <SelectContent>
                          {LEARNING_PLACES.filter((p) => p.value === "student_home").map((p) => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Lokasi Partner</Label>
                      <Select value={formData.location_id} onValueChange={(v) => setFormData({ ...formData, location_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Pilih lokasi" /></SelectTrigger>
                        <SelectContent>
                          {locations?.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Sistem Belajar *</Label>
                  <Select value={formData.system} onValueChange={(v) => setFormData({ ...formData, system: v as LearningSystem })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEARNING_SYSTEMS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {formData.system === "group" && (
                  <div className="space-y-2">
                    <Label>Kuota Grup (Siswa)</Label>
                    <Input
                      type="number"
                      value={formData.group_quota}
                      onChange={(e) => setFormData({ ...formData, group_quota: e.target.value })}
                      placeholder="Contoh: 5"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Harga Paket (Rp) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Contoh: 500000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jumlah Pertemuan *</Label>
                  <Input
                    type="number"
                    value={formData.total_sessions}
                    onChange={(e) => setFormData({ ...formData, total_sessions: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Durasi per Pertemuan (Menit) *</Label>
                  <Input
                    type="number"
                    value={formData.session_duration}
                    onChange={(e) => setFormData({ ...formData, session_duration: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Deskripsi / Fasilitas</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan fasilitas yang didapat..."
                    className="h-24"
                  />
                </div>

                <div className="flex items-center space-x-2 md:col-span-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                  />
                  <Label>Status Aktif</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Batal</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Paket</TableHead>
                  <TableHead>Mapel & Jenjang</TableHead>
                  <TableHead>Kota & Mode</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages?.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{pkg.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{pkg.subject?.name}</span>
                        <span className="text-muted-foreground mx-1">•</span>
                        <span>{pkg.level?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span>{pkg.city?.name}</span>
                        <div className="text-xs text-muted-foreground capitalize">
                          {pkg.mode} {pkg.system}
                        </div>
                        {pkg.place === "student_home" && (
                          <div className="text-xs text-muted-foreground">
                            Tempat: {LEARNING_PLACES.find(p => p.value === pkg.place)?.label}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(pkg.price)}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                        pkg.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {pkg.is_active ? "Aktif" : "Non-aktif"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pkg)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Paket?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Data paket akan dihapus permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate(pkg.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {!packages?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Belum ada data paket
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
