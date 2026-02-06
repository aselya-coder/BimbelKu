import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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

export default function AdminPackagesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TutoringPackage | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutoring_packages")
        .select("*, subject:subjects(*), level:education_levels(*), city:cities(*), location:partner_locations(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TutoringPackage[];
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ["admin-subjects-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*").eq("is_active", true).order("name");
      if (error) throw error;
      return data as Subject[];
    },
  });

  const { data: levels } = useQuery({
    queryKey: ["admin-levels-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("education_levels").select("*").order("sort_order");
      if (error) throw error;
      return data as EducationLevel[];
    },
  });

  const { data: cities } = useQuery({
    queryKey: ["admin-cities-select"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("*").eq("is_active", true).order("name");
      if (error) throw error;
      return data as City[];
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["admin-locations-select", formData.city_id],
    queryFn: async () => {
      let query = supabase.from("partner_locations").select("*").eq("is_active", true).order("name");
      if (formData.city_id) {
        query = query.eq("city_id", formData.city_id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as PartnerLocation[];
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
      };
      if (data.id) {
        const { error } = await supabase.from("tutoring_packages").update(payload).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tutoring_packages").insert(payload);
        if (error) throw error;
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
      const { error } = await supabase.from("tutoring_packages").delete().eq("id", id);
      if (error) throw error;
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
                          {LEARNING_PLACES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.place === "partner_cafe" && (
                      <div className="space-y-2">
                        <Label>Lokasi Partner</Label>
                        <Select value={formData.location_id} onValueChange={(v) => setFormData({ ...formData, location_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Pilih lokasi" /></SelectTrigger>
                          <SelectContent>
                            {locations?.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
                    <Label htmlFor="group_quota">Kuota Grup</Label>
                    <Input
                      id="group_quota"
                      type="number"
                      value={formData.group_quota}
                      onChange={(e) => setFormData({ ...formData, group_quota: e.target.value })}
                      placeholder="Maks. siswa per grup"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="price">Harga (IDR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Contoh: 1500000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session_duration">Durasi per Sesi (menit) *</Label>
                  <Input
                    id="session_duration"
                    type="number"
                    value={formData.session_duration}
                    onChange={(e) => setFormData({ ...formData, session_duration: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_sessions">Total Sesi *</Label>
                  <Input
                    id="total_sessions"
                    type="number"
                    value={formData.total_sessions}
                    onChange={(e) => setFormData({ ...formData, total_sessions: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi paket..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Aktif</Label>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
                <Button type="submit" disabled={saveMutation.isPending || !formData.subject_id || !formData.level_id || !formData.city_id}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Paket</TableHead>
                <TableHead>Mapel</TableHead>
                <TableHead>Jenjang</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : packages?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">Belum ada paket</p>
                  </TableCell>
                </TableRow>
              ) : (
                packages?.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{pkg.subject?.name}</TableCell>
                    <TableCell>{pkg.level?.name}</TableCell>
                    <TableCell>
                      <span className="capitalize">{pkg.mode}</span>
                      {pkg.system === "group" && " (Grup)"}
                    </TableCell>
                    <TableCell>{formatPrice(pkg.price)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        pkg.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {pkg.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pkg)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Paket?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus "{pkg.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(pkg.id)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
