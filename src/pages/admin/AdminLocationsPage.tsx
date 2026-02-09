
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
import type { PartnerLocation, City } from "@/types/database";

export default function AdminLocationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PartnerLocation | null>(null);
  const [formData, setFormData] = useState({ 
    city_id: "", 
    name: "", 
    address: "", 
    operating_hours: "", 
    is_active: true 
  });

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);

  const { data: locations, isLoading } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("partner_locations")
          .select("*, city:cities(*)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data as PartnerLocation[]) || [];
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      const locations = mockService.locations.getAll();
      const cities = mockService.cities.getAll();
      return locations.map(loc => ({
        ...loc,
        city: cities.find(c => c.id === loc.city_id)
      }));
    },
  });

  const { data: cities } = useQuery({
    queryKey: ["admin-cities-select"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("cities")
          .select("*")
          .eq("is_active", true)
          .order("name");
        if (error) throw error;
        return data as City[];
      }
      return mockService.cities.getAll().filter(c => c.is_active);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        city_id: data.city_id,
        name: data.name,
        address: data.address,
        operating_hours: data.operating_hours || null,
        is_active: data.is_active,
      };

      if (isSupabaseConfigured) {
        if (data.id) {
          const { error } = await supabase
            .from("partner_locations")
            .update(payload)
            .eq("id", data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("partner_locations")
            .insert([payload]);
          if (error) throw error;
        }
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      if (data.id) {
        return mockService.locations.update(data.id, payload);
      } else {
        return mockService.locations.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast({ title: editingLocation ? "Berhasil diperbarui" : "Berhasil ditambahkan" });
      handleCloseDialog();
    },
    onError: (err: unknown) => {
      toast({ title: "Gagal menyimpan", description: String(err), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("partner_locations")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      mockService.locations.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast({ title: "Berhasil dihapus" });
    },
    onError: (err: unknown) => {
      toast({ title: "Gagal menghapus", description: String(err), variant: "destructive" });
    },
  });

  const handleOpenDialog = (location?: PartnerLocation) => {
    if (location) {
      setEditingLocation(location);
      setFormData({ 
        city_id: location.city_id,
        name: location.name,
        address: location.address,
        operating_hours: location.operating_hours || "",
        is_active: location.is_active
      });
    } else {
      setEditingLocation(null);
      setFormData({ 
        city_id: "", 
        name: "", 
        address: "", 
        operating_hours: "", 
        is_active: true 
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
    setFormData({ 
      city_id: "", 
      name: "", 
      address: "", 
      operating_hours: "", 
      is_active: true 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingLocation?.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lokasi Belajar</h1>
          <p className="text-muted-foreground">Kelola daftar lokasi/cafe terdekat untuk belajar</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Lokasi
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
                  <TableHead>Nama Lokasi</TableHead>
                  <TableHead>Kota</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations?.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.city?.name || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{location.address}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        location.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {location.is_active ? "Aktif" : "Tidak Aktif"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(location)}>
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
                            <AlertDialogTitle>Hapus Lokasi?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Data lokasi akan dihapus permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate(location.id)}
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
                {!locations?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Belum ada data lokasi
                    </TableCell>
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
            <DialogTitle>{editingLocation ? "Edit Lokasi" : "Tambah Lokasi"}</DialogTitle>
            <DialogDescription>Isi detail lokasi/cafe belajar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">Kota</Label>
              <Select 
                value={formData.city_id} 
                onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kota" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lokasi</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Cafe Belajar Kemang"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Raya Kemang No. 123..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operating_hours">Jam Operasional</Label>
              <Input
                id="operating_hours"
                value={formData.operating_hours}
                onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                placeholder="Contoh: 10:00 - 22:00"
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
