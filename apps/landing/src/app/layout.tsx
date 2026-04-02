import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="ru" className={`${onest.variable}`}>
      <body className="bg-estetica-bg text-estetica-text min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
