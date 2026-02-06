import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, MessageCircle, Loader2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { REGISTRATION_STATUSES, ADMIN_WHATSAPP_NUMBER } from "@/lib/constants";
import type { Registration, RegistrationStatus } from "@/types/database";

export default function AdminRegistrationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<RegistrationStatus>("new");

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["admin-registrations", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("registrations")
        .select("*, package:tutoring_packages(name, subject:subjects(name), level:education_levels(name))")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as RegistrationStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Registration[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: RegistrationStatus; notes: string }) => {
      const { error } = await supabase
        .from("registrations")
        .update({ status, admin_notes: notes || null })
        .eq("id", id);
      if (error) throw error;
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pendaftaran</h1>
        <p className="text-muted-foreground">Kelola pendaftaran siswa bimbel</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                      {(reg.package as any)?.name || "-"}
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
                  <span className="font-medium">{(selectedRegistration.package as any)?.name || "-"}</span>
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
