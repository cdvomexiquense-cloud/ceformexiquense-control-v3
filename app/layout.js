import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'AcademiaPro - Gestión de Academia de Fútbol',
  description: 'Sistema integral para academias de fútbol: jugadores, pagos, adeudos y finanzas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
