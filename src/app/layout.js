import "./globals.css";
import { ModalProvider } from "@/components/ModalContext";

export const metadata = {
  title: "VividWake Analytics | Admin Mission Control",
  description: "Real-time session journeys and mobile conversion telemetry for VividWake Live Wallpapers",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}
