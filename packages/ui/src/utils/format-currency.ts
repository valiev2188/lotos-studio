export function formatUZS(amount: number): string {
  return new Intl.NumberFormat('ru-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' UZS';
}
