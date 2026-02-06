import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePackages, useCities, usePackage } from "@/hooks/usePublicData";
import { ADMIN_WHATSAPP_NUMBER } from "@/lib/constants";

const registrationSchema = z.object({
  student_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  whatsapp_number: z.string().trim().min(10, "Nomor WhatsApp tidak valid").max(20, "Nomor WhatsApp tidak valid").regex(/^[0-9+\-\s]+$/, "Format nomor tidak valid"),
  email: z.string().trim().email("Email tidak valid").max(255, "Email terlalu panjang").optional().or(z.literal("")),
  package_id: z.string().min(1, "Pilih paket bimbel"),
  city: z.string().trim().min(1, "Masukkan kota Anda").max(100, "Nama kota terlalu panjang"),
  preferred_schedule: z.string().trim().max(500, "Keterangan terlalu panjang").optional(),
  detailed_location: z.string().trim().max(500, "Alamat terlalu panjang").optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegistrationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const preselectedPackageId = searchParams.get("package") || "";
  const { data: packages } = usePackages();
  const { data: cities } = useCities();
  const { data: preselectedPackage } = usePackage(preselectedPackageId);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      student_name: "",
      whatsapp_number: "",
      email: "",
      package_id: preselectedPackageId,
      city: "",
      preferred_schedule: "",
      detailed_location: "",
    },
  });

  useEffect(() => {
    if (preselectedPackageId) {
      form.setValue("package_id", preselectedPackageId);
    }
  }, [preselectedPackageId, form]);

  const selectedPackageId = form.watch("package_id");
  const selectedPackage = packages?.find(p => p.id === selectedPackageId);
  const isOffline = selectedPackage?.mode === "offline";

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("registrations").insert({
        package_id: data.package_id,
        student_name: data.student_name,
        whatsapp_number: data.whatsapp_number,
        email: data.email || null,
        city: data.city,
        preferred_schedule: data.preferred_schedule || null,
        detailed_location: isOffline ? data.detailed_location || null : null,
        status: "new",
      });

      if (error) throw error;

      setIsSuccess(true);
      
      // Redirect to WhatsApp
      const pkg = packages?.find(p => p.id === data.package_id);
      const message = encodeURIComponent(
        `Halo Admin BimbelKu,\n\nSaya baru saja mendaftar dengan data:\n- Nama: ${data.student_name}\n- Paket: ${pkg?.name || 'N/A'}\n- Kota: ${data.city}\n- Jadwal: ${data.preferred_schedule || 'Belum ditentukan'}\n\nMohon konfirmasi pendaftaran saya. Terima kasih!`
      );
      
      setTimeout(() => {
        window.open(`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${message}`, "_blank");
      }, 1500);

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Gagal Mendaftar",
        description: "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-16">
        <div className="container max-w-lg">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pendaftaran Berhasil!</h2>
              <p className="text-muted-foreground mb-6">
                Terima kasih telah mendaftar. Kami akan segera menghubungi Anda melalui WhatsApp.
              </p>
              <div className="space-y-3">
                <Link to="/packages">
                  <Button variant="outline" className="w-full">
                    Lihat Paket Lainnya
                  </Button>
                </Link>
                <Link to="/">
                  <Button className="w-full bg-gradient-primary">
                    Kembali ke Beranda
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-2xl">
        <Link to="/packages" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Paket
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Formulir Pendaftaran</CardTitle>
            <CardDescription>
              Isi data berikut untuk mendaftar program bimbel. Kami akan menghubungi Anda melalui WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="student_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Siswa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor WhatsApp *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 081234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Opsional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="package_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paket Bimbel *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih paket bimbel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {packages?.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              {pkg.name} - {pkg.subject?.name} ({pkg.level?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kota *</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan kota Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jadwal Pilihan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Contoh: Senin & Rabu, pukul 16.00-18.00"
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isOffline && (
                  <FormField
                    control={form.control}
                    name="detailed_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Lengkap (untuk mode offline)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Masukkan alamat lengkap untuk belajar offline"
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-accent text-white shadow-accent hover:opacity-90"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Mengirim..."
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Kirim Pendaftaran
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
