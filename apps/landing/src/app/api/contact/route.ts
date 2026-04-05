import { NextRequest, NextResponse } from "next/server";

const CLASS_TYPE_LABELS: Record<string, string> = {
  group: "Групповое",
  individual: "Индивидуальное",
  trial: "Пробное бесплатно",
};

const CONTACT_METHOD_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  call: "Звонок",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, classType, contactMethod } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Имя и телефон обязательны" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!botToken || !chatId) {
      // В dev-режиме просто логируем
      console.log("New contact form submission:", { name, phone, classType, contactMethod });
      return NextResponse.json({ success: true });
    }

    const text = [
      "🌸 <b>Новая заявка с сайта!</b>",
      "",
      `👤 <b>Имя:</b> ${name}`,
      `📞 <b>Телефон:</b> ${phone}`,
      `🏋️ <b>Тип занятия:</b> ${CLASS_TYPE_LABELS[classType] ?? classType}`,
      `💬 <b>Способ связи:</b> ${CONTACT_METHOD_LABELS[contactMethod] ?? contactMethod}`,
    ].join("\n");

    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    if (!tgRes.ok) {
      const tgError = await tgRes.text();
      console.error("Telegram API error:", tgError);
      // Не возвращаем ошибку клиенту — заявка принята
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
