import { Link } from "react-router-dom";
import { GraduationCap, MapPin, Phone, Mail } from "lucide-react";
import { APP_NAME, ADMIN_WHATSAPP_NUMBER } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background/80">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-sm text-background/60">
              Platform bimbingan belajar terpercaya untuk meraih prestasi akademik terbaik.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/packages" className="text-sm hover:text-white transition-colors">
                  Paket Bimbel
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-white transition-colors">
                  Daftar
                </Link>
              </li>
            </ul>
          </div>

          {/* Education Levels */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Jenjang</h4>
            <ul className="space-y-2">
              <li className="text-sm">SD (Sekolah Dasar)</li>
              <li className="text-sm">SMP (Sekolah Menengah Pertama)</li>
              <li className="text-sm">SMA (Sekolah Menengah Atas)</li>
              <li className="text-sm">Umum</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <a 
                  href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@bimbelku.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Melayani Online & Offline di berbagai kota</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-background/10 pt-6 text-center">
          <p className="text-sm text-background/50">
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
