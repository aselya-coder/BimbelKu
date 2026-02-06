import { MessageCircle } from "lucide-react";
import { ADMIN_WHATSAPP_NUMBER } from "@/lib/constants";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  floating?: boolean;
}

export function WhatsAppButton({ 
  message = "Halo, saya tertarik dengan program bimbel", 
  className = "",
  floating = false 
}: WhatsAppButtonProps) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedMessage}`;

  if (floating) {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-all hover:bg-[#128C7E] hover:scale-105 hover:shadow-xl animate-fade-in"
        aria-label="Chat WhatsApp"
      >
        <MessageCircle className="h-6 w-6" fill="currentColor" />
        <span className="hidden sm:inline font-medium">Chat Admin</span>
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-white font-medium transition-all hover:bg-[#128C7E] ${className}`}
    >
      <MessageCircle className="h-5 w-5" fill="currentColor" />
      <span>WhatsApp</span>
    </a>
  );
}
