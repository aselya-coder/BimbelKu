
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockService } from "@/lib/mockService";
import { supabase } from "@/integrations/supabase/client";
import type { Subject } from "@/types/database";

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", is_active: true });
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data as Subject[]) || [];
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockService.subjects.getAll();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (isSupabaseConfigured) {
        const payload = { name: data.name, description: data.description, is_active: data.is_active };
        if (data.id) {
          const { error } = await supabase
            .from("subjects")
            .update(payload)
            .eq("id", data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("subjects")
            .insert([payload]);
          if (error) throw error;
        }
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      if (data.id) {
        return mockService.subjects.update(data.id, { name: data.name, description: data.description, is_active: data.is_active });
      } else {
        return mockService.subjects.create({ name: data.name, description: data.description, is_active: data.is_active });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      toast({ title: editingSubject ? "Berhasil diperbarui" : "Berhasil ditambahkan" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("subjects").delete().eq("id", id);
        if (error) throw error;
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      mockService.subjects.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      toast({ title: "Berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    },
  });

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({ name: subject.name, description: subject.description || "", is_active: subject.is_active });
    } else {
      setEditingSubject(null);
      setFormData({ name: "", description: "", is_active: true });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSubject(null);
    setFormData({ name: "", description: "", is_active: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingSubject?.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mata Pelajaran</h1>
          <p className="text-muted-foreground">Kelola daftar mata pelajaran yang tersedia</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Mata Pelajaran
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects?.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.description}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        subject.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {subject.is_active ? "Aktif" : "Tidak Aktif"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(subject)}>
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
                            <AlertDialogTitle>Hapus Mata Pelajaran?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Data mata pelajaran akan dihapus permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate(subject.id)}
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
                {!subjects?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Belum ada data mata pelajaran
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
            <DialogTitle>{editingSubject ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}</DialogTitle>
            <DialogDescription>Isi data mata pelajaran.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Mata Pelajaran</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Matematika"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat mata pelajaran..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Status Aktif</Label>
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
  );
}
