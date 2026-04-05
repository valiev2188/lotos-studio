"use client";

import { useState } from "react";

type FormState = {
  name: string;
  phone: string;
  classType: string;
  contactMethod: string;
  agreed: boolean;
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    classType: "group",
    contactMethod: "whatsapp",
    agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed) {
      setError("Пожалуйста, согласитесь с политикой конфиденциальности");
      return;
    }
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Пожалуйста, заполните имя и телефон");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Что-то пошло не так. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-lotos-purpleLight flex items-center justify-center text-3xl mb-6">
          ✓
        </div>
        <h3 className="font-syne font-bold text-2xl text-lotos-text mb-3">
          Заявка отправлена!
        </h3>
        <p className="text-lotos-muted text-lg max-w-sm">
          Мы свяжемся с вами в ближайшее время удобным способом.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Тип занятия */}
      <div>
        <p className="font-semibold text-lotos-text mb-3">Тип занятия</p>
        <div className="flex flex-wrap gap-3">
          {[
            { value: "group", label: "Групповое" },
            { value: "individual", label: "Индивидуальное" },
            { value: "trial", label: "Пробное бесплатно" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-full border-2 transition-all text-sm font-medium ${
                form.classType === opt.value
                  ? "border-lotos-purple bg-lotos-purpleLight text-lotos-purple"
                  : "border-lotos-brown/30 text-lotos-muted hover:border-lotos-purple/50"
              }`}
            >
              <input
                type="radio"
                name="classType"
                value={opt.value}
                checked={form.classType === opt.value}
                onChange={(e) => setForm({ ...form, classType: e.target.value })}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Способ связи */}
      <div>
        <p className="font-semibold text-lotos-text mb-3">Способ связи</p>
        <div className="flex flex-wrap gap-3">
          {[
            { value: "whatsapp", label: "WhatsApp" },
            { value: "telegram", label: "Telegram" },
            { value: "call", label: "Звонок" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-full border-2 transition-all text-sm font-medium ${
                form.contactMethod === opt.value
                  ? "border-lotos-purple bg-lotos-purpleLight text-lotos-purple"
                  : "border-lotos-brown/30 text-lotos-muted hover:border-lotos-purple/50"
              }`}
            >
              <input
                type="radio"
                name="contactMethod"
                value={opt.value}
                checked={form.contactMethod === opt.value}
                onChange={(e) => setForm({ ...form, contactMethod: e.target.value })}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Имя */}
      <div>
        <label className="block font-semibold text-lotos-text mb-2" htmlFor="contact-name">
          Ваше имя
        </label>
        <input
          id="contact-name"
          type="text"
          placeholder="Например, Камила"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="form-input"
          required
        />
      </div>

      {/* Телефон */}
      <div>
        <label className="block font-semibold text-lotos-text mb-2" htmlFor="contact-phone">
          Номер телефона
        </label>
        <input
          id="contact-phone"
          type="tel"
          placeholder="+998 90 123 45 67"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="form-input"
          required
        />
      </div>

      {/* Согласие */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          className={`mt-0.5 w-5 h-5 min-w-5 rounded-md border-2 flex items-center justify-center transition-all ${
            form.agreed
              ? "bg-lotos-purple border-lotos-purple"
              : "border-lotos-brown/40 group-hover:border-lotos-purple/50"
          }`}
          onClick={() => setForm({ ...form, agreed: !form.agreed })}
        >
          {form.agreed && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          checked={form.agreed}
          onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
          className="sr-only"
        />
        <span className="text-sm text-lotos-muted leading-relaxed">
          Я согласен(а) с{" "}
          <a href="#" className="text-lotos-purple underline underline-offset-2 hover:text-lotos-purpleHover">
            политикой конфиденциальности
          </a>
        </span>
      </label>

      {/* Ошибка */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Кнопка */}
      <button
        type="submit"
        disabled={loading}
        className="btn-purple w-full py-4 text-[17px] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Отправляем..." : "Отправить заявку"}
      </button>
    </form>
  );
}
