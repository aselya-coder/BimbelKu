import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockService } from "@/lib/mockService";
import { supabase } from "@/integrations/supabase/client";
import type { EducationLevel } from "@/types/database";

export default function AdminLevelsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<EducationLevel | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", sort_order: 1 });
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  const { data: levels, isLoading } = useQuery({
    queryKey: ["admin-levels"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("education_levels")
          .select("*")
          .order("sort_order");
        if (error) throw error;
        return (data as EducationLevel[]) || [];
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockService.educationLevels.getAll();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = { name: data.name.trim(), code: data.code.trim().toLowerCase(), sort_order: Number(data.sort_order) || 1 };
      if (!payload.name || !payload.code) throw new Error("Nama dan kode wajib diisi");

      if (isSupabaseConfigured) {
        if (data.id) {
          const { error } = await supabase
            .from("education_levels")
            .update(payload)
            .eq("id", data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("education_levels")
            .insert([payload]);
          if (error) throw error;
        }
        return;
      }
      if (data.id) {
        mockService.educationLevels.update(data.id, payload);
      } else {
        mockService.educationLevels.create(payload);
      }
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: editingLevel ? "Jenjang diperbarui" : "Jenjang ditambahkan" });
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      setIsDialogOpen(false);
      setEditingLevel(null);
      setFormData({ name: "", code: "", sort_order: 1 });
    },
    onError: () => {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("education_levels")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return;
      }
      mockService.educationLevels.delete(id);
    },
    onSuccess: () => {
      toast({ title: "Jenjang dihapus" });
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
    },
    onError: () => {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    },
  });

  const handleOpenDialog = (level?: EducationLevel) => {
    if (level) {
      setEditingLevel(level);
      setFormData({ name: level.name, code: level.code, sort_order: level.sort_order });
    } else {
      setEditingLevel(null);
      setFormData({ name: "", code: "", sort_order: (levels?.length || 0) + 1 });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingLevel?.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jenjang</h1>
          <p className="text-muted-foreground">Kelola daftar jenjang pendidikan (SD/SMP/SMA/Umum)</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jenjang
        </Button>
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
                  <TableHead>Nama Jenjang</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels?.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell className="uppercase text-xs">{level.code}</TableCell>
                    <TableCell>{level.sort_order}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(level)}>
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
                            <AlertDialogTitle>Hapus Jenjang?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Data jenjang akan dihapus permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate(level.id)}
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
                {!levels?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Belum ada data jenjang
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLevel ? "Edit Jenjang" : "Tambah Jenjang"}</DialogTitle>
            <DialogDescription>Isi data jenjang pendidikan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Jenjang</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Misal: SD, SMP, SMA, Umum"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Kode</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="sd / smp / sma / umum"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Urutan</Label>
              <Input
                id="sort_order"
                type="number"
                min={1}
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
