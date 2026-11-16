import "./globals.css";
import { ModalProvider } from "@/components/ModalContext";
import WebAnalyticsTracker from "@/components/WebAnalyticsTracker";

export const metadata = {
  title: "VividWake — 4K Live Wallpapers & Admin Telemetry",
  description: "Real-time session journeys and mobile conversion telemetry for VividWake Live Wallpapers",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>
        <ModalProvider>{children}</ModalProvider>
        <WebAnalyticsTracker />
      </body>
    </html>
  );
}
