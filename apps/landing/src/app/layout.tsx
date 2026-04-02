import type { Metadata } from "next";
import { Syne, Instrument_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Студия Лотос — Фитнес студия в Ташкенте",
  description:
    "Йога, пилатес, стретчинг, фитнес и медитация в уютной студии в центре Ташкента. Запишитесь на пробное занятие бесплатно.",
  keywords: [
    "фитнес",
    "йога",
    "пилатес",
    "стретчинг",
    "Ташкент",
    "студия",
    "Лотос",
    "медитация",
    "барре",
  ],
  openGraph: {
    title: "Студия Лотос — Фитнес студия в Ташкенте",
    description:
      "Йога, пилатес, стретчинг и фитнес в центре Ташкента. Пробное занятие — бесплатно.",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${syne.variable} ${instrumentSans.variable}`}>
      <body className="bg-cream bg-grain min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
