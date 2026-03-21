export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToDateInput(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function dateInputToEndOfDayIso(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T23:59:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

