import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./globals.css";
import { AutenticacaoProvider } from "@/contexts/autenticacao";

export const metadata: Metadata = {
  title: "Meu Salário",
  description: "Quanto do salário ainda sobra este mês.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8e8ee" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1318" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AutenticacaoProvider>{children}</AutenticacaoProvider>
      </body>
    </html>
  );
}
