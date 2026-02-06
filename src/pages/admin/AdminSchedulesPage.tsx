import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminSchedulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Jadwal</h1>
        <p className="text-muted-foreground">Kelola jadwal belajar untuk paket bimbel</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Fitur Jadwal</h3>
          <p className="text-muted-foreground mb-4">
            Fitur manajemen jadwal akan tersedia dalam pengembangan selanjutnya. 
            Saat ini, jadwal dapat dikoordinasikan langsung melalui WhatsApp.
          </p>
          <Link to="/admin/packages" className="text-primary hover:underline">
            Kelola Paket Bimbel →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
