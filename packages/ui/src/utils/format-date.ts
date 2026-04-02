const WEEKDAYS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
}

export function formatWeekday(date: Date | string): string {
  const d = new Date(date);
  return WEEKDAYS_RU[d.getDay()];
}

export function formatDateTime(date: Date | string): string {
  return `${formatWeekday(date)}, ${formatDate(date)} в ${formatTime(date)}`;
}
