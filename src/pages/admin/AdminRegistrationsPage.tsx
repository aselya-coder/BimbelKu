import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, MessageCircle, Loader2, Search, Filter, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockService } from "@/lib/mockService";
import { REGISTRATION_STATUSES, ADMIN_WHATSAPP_NUMBER, DAYS_OF_WEEK } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Registration, RegistrationStatus, Schedule, TutoringPackage } from "@/types/database";

export default function AdminRegistrationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<RegistrationStatus>("new");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    student_name: "",
    whatsapp_number: "",
    email: "",
    package_id: "",
    city: "",
    preferred_schedule: "",
    detailed_location: "",
    status: "new" as RegistrationStatus,
  });

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

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["admin-registrations", statusFilter],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          let query = supabase
            .from("registrations")
            .select("id, student_name, whatsapp_number, email, city, preferred_schedule, detailed_location, status, admin_notes, created_at, updated_at, package:tutoring_packages(*)")
            .order("created_at", { ascending: false });
          if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter as RegistrationStatus);
          const { data, error } = await query;
          if (error) throw error;
          return (data as Registration[]);
        } catch {
          // fallback to mock
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      let data = mockService.registrations.getAll();
      if (statusFilter && statusFilter !== "all") {
        data = data.filter(reg => reg.status === statusFilter);
      }
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return data as Registration[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes, package_id }: { id: string; status: RegistrationStatus; notes: string; package_id: string }) => {
      let assignedLabel: string | null = null;
      if ((status === "contacted" || status === "active") && package_id && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("schedules")
          .select("*")
          .eq("package_id", package_id)
          .eq("is_available", true)
          .order("day_of_week")
          .order("start_time");
        if (!error && Array.isArray(data)) {
          const available = (data as Schedule[]).find((s) => {
            const ms = typeof s.max_students === "number" ? s.max_students : null;
            const cs = typeof s.current_students === "number" ? s.current_students : 0;
            return ms === null || cs < ms;
          });
          if (available) {
            const dayLabel = DAYS_OF_WEEK.find(d => d.value === available.day_of_week)?.label || String(available.day_of_week);
            assignedLabel = `${dayLabel} ${available.start_time}-${available.end_time}`;
            const cs = typeof available.current_students === "number" ? available.current_students : 0;
            const ms = typeof available.max_students === "number" ? available.max_students : null;
            const willFull = ms !== null && cs + 1 >= ms;
            await supabase
              .from("schedules")
              .update({ current_students: cs + 1, is_available: willFull ? false : true })
              .eq("id", available.id);
            queryClient.invalidateQueries({ queryKey: ["admin-schedules"] });
          }
        }
      }

      if (isSupabaseConfigured) {
        const payload: Database["public"]["Tables"]["registrations"]["Update"] = { status, admin_notes: notes || null };
        if (assignedLabel) payload.preferred_schedule = assignedLabel;
        const { error } = await supabase
          .from("registrations")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      return mockService.registrations.update(id, {
        status,
        admin_notes: notes || null,
        preferred_schedule: assignedLabel || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
      toast({ title: "Berhasil diperbarui" });
      setSelectedRegistration(null);
    },
    onError: () => {
      toast({ title: "Gagal memperbarui", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const name = createData.student_name.trim();
      const phone = createData.whatsapp_number.trim();
      const city = createData.city.trim();
      if (!name || !phone || !city) throw new Error("Nama, WhatsApp, dan Kota wajib");
      if (!/^\+?\d{8,15}$/.test(phone.replace(/\s|-/g, ""))) throw new Error("Format nomor WhatsApp tidak valid");

      const pkg = createData.package_id.trim();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const pkgIdToSend = pkg && uuidRegex.test(pkg) ? pkg : undefined;
      if (pkg && !pkgIdToSend) throw new Error("ID Paket harus UUID valid");

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("registrations")
          .insert([{ 
            package_id: pkgIdToSend,
            student_name: name,
            whatsapp_number: phone,
            email: createData.email || null,
            city,
            preferred_schedule: createData.preferred_schedule || null,
            detailed_location: createData.detailed_location || null,
            status: createData.status,
          }]);
        if (error) throw error;
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      return mockService.registrations.create({
        package_id: pkgIdToSend || "",
        student_name: name,
        whatsapp_number: phone,
        email: createData.email || null,
        city,
        preferred_schedule: createData.preferred_schedule || null,
        detailed_location: createData.detailed_location || null,
        status: createData.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
      toast({ title: "Pendaftaran ditambahkan" });
      setIsCreateOpen(false);
      setCreateData({ student_name: "", whatsapp_number: "", email: "", package_id: "", city: "", preferred_schedule: "", detailed_location: "", status: "new" });
    },
    onError: (err: unknown) => {
      toast({ title: "Gagal menambah pendaftaran", description: String(err), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("registrations").delete().eq("id", id);
        if (error) throw error;
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockService.registrations.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
      toast({ title: "Pendaftaran dihapus" });
    },
    onError: (err: unknown) => {
      toast({ title: "Gagal menghapus", description: String(err), variant: "destructive" });
    },
  });

  const openDetail = (reg: Registration) => {
    setSelectedRegistration(reg);
    setAdminNotes(reg.admin_notes || "");
    setNewStatus(reg.status);
  };

  const handleUpdate = () => {
    if (selectedRegistration) {
      updateMutation.mutate({
        id: selectedRegistration.id,
        status: newStatus,
        notes: adminNotes,
        package_id: selectedRegistration.package_id,
      });
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Halo ${name}, terima kasih sudah mendaftar di BimbelKu. `);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${message}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    const statusInfo = REGISTRATION_STATUSES.find(s => s.value === status);
    return statusInfo ? (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    ) : null;
  };

  const filteredRegistrations = registrations?.filter(reg =>
    reg.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.whatsapp_number.includes(searchTerm) ||
    reg.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pendaftaran</h1>
          <p className="text-muted-foreground">Kelola pendaftaran siswa bimbel</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pendaftaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pendaftaran</DialogTitle>
              <DialogDescription>Isi data pendaftaran siswa.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nama Siswa *</Label>
                  <Input value={createData.student_name} onChange={(e) => setCreateData({ ...createData, student_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp *</Label>
                  <Input value={createData.whatsapp_number} onChange={(e) => setCreateData({ ...createData, whatsapp_number: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={createData.email} onChange={(e) => setCreateData({ ...createData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Kota *</Label>
                  <Input value={createData.city} onChange={(e) => setCreateData({ ...createData, city: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Paket</Label>
                  <Select value={createData.package_id} onValueChange={(v) => setCreateData({ ...createData, package_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Opsional" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jadwal Pilihan</Label>
                  <Input value={createData.preferred_schedule} onChange={(e) => setCreateData({ ...createData, preferred_schedule: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alamat Lengkap</Label>
                <Textarea value={createData.detailed_location} onChange={(e) => setCreateData({ ...createData, detailed_location: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={createData.status} onValueChange={(v) => setCreateData({ ...createData, status: v as RegistrationStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGISTRATION_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, nomor, atau kota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RegistrationStatus | "all")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {REGISTRATION_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredRegistrations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== "all" ? "Tidak ada hasil pencarian" : "Belum ada pendaftaran"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistrations?.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.student_name}</TableCell>
                    <TableCell>{reg.whatsapp_number}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {reg.package?.name ?? "-"}
                    </TableCell>
                    <TableCell>{reg.city}</TableCell>
                    <TableCell>{getStatusBadge(reg.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(reg.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetail(reg)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600"
                          onClick={() => openWhatsApp(reg.whatsapp_number, reg.student_name)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pendaftaran?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus pendaftaran "{reg.student_name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(reg.id)}>
                                Hapus
                              </AlertDialogAction>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pendaftaran</DialogTitle>
            <DialogDescription>Ubah status dan catatan pendaftaran.</DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama Siswa</span>
                  <span className="font-medium">{selectedRegistration.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WhatsApp</span>
                  <span className="font-medium">{selectedRegistration.whatsapp_number}</span>
                </div>
                {selectedRegistration.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{selectedRegistration.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paket</span>
                  <span className="font-medium">{selectedRegistration.package?.name ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kota</span>
                  <span className="font-medium">{selectedRegistration.city}</span>
                </div>
                {selectedRegistration.preferred_schedule && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jadwal Pilihan</span>
                    <span className="font-medium">{selectedRegistration.preferred_schedule}</span>
                  </div>
                )}
                {selectedRegistration.detailed_location && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Alamat Lengkap</span>
                    <span className="font-medium">{selectedRegistration.detailed_location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Daftar</span>
                  <span className="font-medium">{formatDate(selectedRegistration.created_at)}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as RegistrationStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGISTRATION_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Catatan Admin</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Catatan internal..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => openWhatsApp(selectedRegistration.whatsapp_number, selectedRegistration.student_name)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Hubungi WhatsApp
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <DialogClose asChild>
                    <Button variant="outline">Batal</Button>
                  </DialogClose>
                  <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
