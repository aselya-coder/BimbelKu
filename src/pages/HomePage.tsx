import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, MapPin, Monitor, Users, ArrowRight, Star, CheckCircle2, Clock, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubjects, useCities, useTestimonials } from "@/hooks/usePublicData";
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  const { data: subjects } = useSubjects();
  const { data: cities } = useCities();
  const { data: testimonials } = useTestimonials();

  const [filters, setFilters] = useState({
    subject: "",
    city: "",
    mode: "",
    system: "",
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.subject) params.set("subject", filters.subject);
    if (filters.city) params.set("city", filters.city);
    if (filters.mode) params.set("mode", filters.mode);
    if (filters.system) params.set("system", filters.system);
    window.location.href = `/packages?${params.toString()}`;
  };

  const benefits = [
    {
      icon: Award,
      title: "Tutor Berpengalaman",
      description: "Semua tutor kami telah melalui seleksi ketat dan memiliki pengalaman mengajar yang mumpuni.",
    },
    {
      icon: Clock,
      title: "Jadwal Fleksibel",
      description: "Pilih jadwal belajar sesuai kenyamanan Anda, baik online maupun offline.",
    },
    {
      icon: Users,
      title: "Private & Grup",
      description: "Tersedia pilihan belajar private 1-on-1 atau dalam grup kecil yang interaktif.",
    },
    {
      icon: Heart,
      title: "Pendampingan Intensif",
      description: "Tutor kami memberikan perhatian penuh untuk memastikan pemahaman materi.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-in">
              Raih Prestasi Terbaik dengan{" "}
              <span className="text-gradient-primary">{APP_NAME}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Bimbingan belajar berkualitas dengan tutor profesional. 
              Tersedia online dan offline di berbagai kota.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-accent text-white shadow-accent hover:opacity-90">
                  Daftar Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/packages">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white border-2 border-primary !text-primary hover:bg-primary/10">
                  Lihat Paket Bimbel
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Filter Form */}
          <Card className="mx-auto mt-12 max-w-4xl shadow-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mata Pelajaran</label>
                  <Select value={filters.subject} onValueChange={(v) => setFilters({ ...filters, subject: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mapel" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Kota</label>
                  <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kota" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mode Belajar</label>
                  <Select value={filters.mode} onValueChange={(v) => setFilters({ ...filters, mode: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Online/Offline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tipe Belajar</label>
                  <Select value={filters.system} onValueChange={(v) => setFilters({ ...filters, system: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Private/Grup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="group">Grup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full bg-gradient-primary hover:opacity-90">
                    <Search className="mr-2 h-4 w-4" />
                    Cari
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Mengapa Memilih <span className="text-gradient-primary">{APP_NAME}</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Kami berkomitmen memberikan pengalaman belajar terbaik untuk siswa
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="group border-2 border-transparent transition-all hover:border-primary/20 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary transition-colors">
                    <benefit.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-16">
        <div className="container">
          <div className="grid gap-8 text-center md:grid-cols-4">
            {[
              { value: "500+", label: "Siswa Terdaftar" },
              { value: "50+", label: "Tutor Profesional" },
              { value: "10+", label: "Kota Layanan" },
              { value: "95%", label: "Tingkat Kepuasan" },
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl font-bold text-primary-foreground md:text-5xl">{stat.value}</div>
                <div className="mt-2 text-sm text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Apa Kata Mereka?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Testimoni dari siswa dan orang tua yang telah bergabung
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(testimonials?.length ? testimonials : [
              { id: "1", name: "Andi Pratama", role: "Siswa SMA", content: "Bimbel ini sangat membantu saya memahami materi matematika yang sulit. Tutor sabar dan menjelaskan dengan jelas.", rating: 5 },
              { id: "2", name: "Ibu Dewi", role: "Orang Tua", content: "Anak saya jadi lebih semangat belajar. Sistem pembelajaran yang fleksibel sangat cocok dengan jadwal kami.", rating: 5 },
              { id: "3", name: "Rizky Hidayat", role: "Siswa SMP", content: "Saya suka belajar online di sini karena tutornya asyik dan materinya mudah dipahami.", rating: 5 },
            ]).map((testimonial, index) => (
              <Card 
                key={testimonial.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mb-4 text-muted-foreground italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <span className="text-sm font-semibold text-secondary-foreground">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Card className="overflow-hidden bg-gradient-primary">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold text-primary-foreground md:text-4xl">
                Siap Untuk Memulai Perjalanan Belajar?
              </h2>
              <p className="mt-4 text-primary-foreground/80 md:text-lg">
                Daftar sekarang dan rasakan pengalaman belajar yang menyenangkan bersama {APP_NAME}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                    Daftar Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/packages">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
                    Lihat Paket
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
