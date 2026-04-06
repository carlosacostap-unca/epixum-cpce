import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Diplomatura CPCE",
  description: "Diplomatura Universitaria de Posgrado en Gestión Inteligente de Transformación Digital con Inteligencia Artificial Generativa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-sans">
        {children}
      </body>
    </html>
  );
}