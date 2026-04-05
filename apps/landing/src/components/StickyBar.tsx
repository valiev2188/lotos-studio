"use client";

import { useEffect, useRef, useState } from "react";

const TG_SCHEDULE = "https://t.me/lotos_bot";

export default function StickyBar() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 100) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 10) {
        setVisible(false);
      } else if (currentY < lastScrollY.current - 10) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-lotos-surface/95 backdrop-blur-sm border-t border-lotos-brown/15 shadow-[0_-4px_24px_rgba(119,73,54,0.12)] px-4 py-3 safe-area-pb">
        <div className="max-w-lg mx-auto flex gap-2">
          <a
            href={TG_SCHEDULE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-lotos-brown text-white font-semibold text-[13px] sm:text-[14px] py-3 rounded-full hover:bg-lotos-brownHover transition-all"
          >
            Расписание
          </a>
          <button
            onClick={() => scrollTo("contact")}
            className="flex-1 text-center bg-lotos-purple text-white font-semibold text-[13px] sm:text-[14px] py-3 rounded-full hover:bg-lotos-purpleHover transition-all"
          >
            Пробное занятие
          </button>
          <button
            onClick={() => scrollTo("plans")}
            className="flex-1 text-center bg-lotos-cream text-lotos-brown font-semibold text-[13px] sm:text-[14px] py-3 rounded-full border border-lotos-brown/40 hover:bg-lotos-brownLight transition-all"
          >
            Абонемент
          </button>
        </div>
      </div>
    </div>
  );
}
