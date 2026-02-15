import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mockService } from "@/lib/mockService";
import { DAYS_OF_WEEK } from "@/lib/constants";
import type { Schedule, TutoringPackage } from "@/types/database";

export default function AdminSchedulesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [filterPackageId, setFilterPackageId] = useState<string>("");
  const [formData, setFormData] = useState({
    package_id: "",
    day_of_week: 1,
    start_time: "16:00",
    end_time: "18:00",
    max_students: "",
    is_available: true,
  });

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  const { data: packages } = useQuery({
    queryKey: ["admin-packages-select"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("tutoring_packages")
            .select("id,name")
            .eq("is_active", true)
            .order("name");
          if (error) throw error;
          return data as Pick<TutoringPackage, "id" | "name">[];
        } catch {
          const items = mockService
            .packages
            .getAll()
            .filter(p => p.is_active)
            .map(p => ({ id: p.id, name: p.name }));
          return items as Pick<TutoringPackage, "id" | "name">[];
        }
      }
      const items = mockService
        .packages
        .getAll()
        .filter(p => p.is_active)
        .map(p => ({ id: p.id, name: p.name }));
      return items as Pick<TutoringPackage, "id" | "name">[];
    },
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["admin-schedules", filterPackageId],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          let q = supabase
            .from("schedules")
            .select("*, package:tutoring_packages(*)")
            .order("day_of_week")
            .order("start_time");
          if (filterPackageId) q = q.eq("package_id", filterPackageId);
          const { data, error } = await q;
          if (error) throw error;
          return (data as (Schedule & { package?: TutoringPackage })[]) || [];
        } catch {
          return [] as (Schedule & { package?: TutoringPackage })[];
        }
      }
      return [] as (Schedule & { package?: TutoringPackage })[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string } & { package_id: string; day_of_week: number; start_time: string; end_time: string; max_students: number | null; is_available: boolean }) => {
      if (!isSupabaseConfigured) return;
      if (payload.id) {
        const { error } = await supabase.from("schedules").update({
          package_id: payload.package_id,
          day_of_week: payload.day_of_week,
          start_time: payload.start_time,
          end_time: payload.end_time,
          max_students: payload.max_students,
          is_available: payload.is_available,
        }).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("schedules").insert([{ 
          package_id: payload.package_id,
          day_of_week: payload.day_of_week,
          start_time: payload.start_time,
          end_time: payload.end_time,
          max_students: payload.max_students,
          is_available: payload.is_available,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedules"] });
      toast({ title: editing ? "Jadwal diperbarui" : "Jadwal ditambahkan" });
      handleClose();
    },
    onError: (err: unknown) => {
      toast({ title: "Gagal menyimpan", description: String(err), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) return;
      const { error } = await supabase.from("schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedules"] });
      toast({ title: "Jadwal dihapus" });
    },
    onError: (err: unknown) => {
      toast({ title: "Gagal menghapus", description: String(err), variant: "destructive" });
    },
  });

  const handleOpen = (s?: Schedule) => {
    if (s) {
      setEditing(s);
      setFormData({
        package_id: s.package_id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        max_students: typeof s.max_students === "number" ? String(s.max_students) : "",
        is_available: s.is_available,
      });
    } else {
      setEditing(null);
      setFormData({ package_id: filterPackageId || "", day_of_week: 1, start_time: "16:00", end_time: "18:00", max_students: "", is_available: true });
    }
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.package_id) {
      toast({ title: "Paket wajib dipilih", variant: "destructive" });
      return;
    }
    const [sh, sm] = formData.start_time.split(":").map((v) => parseInt(v));
    const [eh, em] = formData.end_time.split(":").map((v) => parseInt(v));
    const startTotal = sh * 60 + sm;
    const endTotal = eh * 60 + em;
    if (!Number.isFinite(startTotal) || !Number.isFinite(endTotal) || startTotal >= endTotal) {
      toast({ title: "Waktu mulai harus sebelum waktu selesai", variant: "destructive" });
      return;
    }
    if (formData.day_of_week < 0 || formData.day_of_week > 6) {
      toast({ title: "Hari tidak valid", variant: "destructive" });
      return;
    }
    const maxVal = formData.max_students ? parseInt(formData.max_students) : null;
    if (maxVal !== null && (!Number.isFinite(maxVal) || maxVal < 1)) {
      toast({ title: "Kapasitas minimal 1", variant: "destructive" });
      return;
    }
    saveMutation.mutate({
      id: editing?.id,
      package_id: formData.package_id,
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time,
      max_students: Number.isFinite(maxVal as number) ? maxVal : null,
      is_available: formData.is_available,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jadwal</h1>
          <p className="text-muted-foreground">Kelola jadwal belajar untuk paket bimbel</p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Label>Paket</Label>
        <Select value={filterPackageId} onValueChange={(v) => setFilterPackageId(v)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Pilih Paket" />
          </SelectTrigger>
          <SelectContent>
            {packages?.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paket</TableHead>
                  <TableHead>Hari</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules?.map(s => {
                  const dayLabel = DAYS_OF_WEEK.find(d => d.value === s.day_of_week)?.label || String(s.day_of_week);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.package?.name || s.package_id}</TableCell>
                      <TableCell>{dayLabel}</TableCell>
                      <TableCell>{s.start_time} - {s.end_time}</TableCell>
                      <TableCell>{typeof s.max_students === "number" ? s.max_students : "-"}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {s.is_available ? "Tersedia" : "Tidak Tersedia"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpen(s)}><Pencil className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
                              <AlertDialogDescription>Data jadwal akan dihapus permanen.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!schedules?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Belum ada data jadwal</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
            <DialogDescription>Isi jadwal untuk paket bimbel.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Paket</Label>
              <Select value={formData.package_id} onValueChange={(v) => setFormData({ ...formData, package_id: v })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Paket" />
                </SelectTrigger>
                <SelectContent>
                  {packages?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hari</Label>
              <Select value={String(formData.day_of_week)} onValueChange={(v) => setFormData({ ...formData, day_of_week: parseInt(v) })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Hari" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(d => (
                    <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mulai</Label>
                <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Selesai</Label>
                <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kapasitas</Label>
              <Input type="number" min={1} placeholder="opsional" value={formData.max_students} onChange={(e) => setFormData({ ...formData, max_students: e.target.value })} />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={formData.is_available} onCheckedChange={(v) => setFormData({ ...formData, is_available: v })} />
              <Label>Tersedia</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Batal</Button>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
