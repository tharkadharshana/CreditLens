import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

export function getMonthRange(date: Date = new Date()) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return { start, end };
}

export function formatDate(date: Date | string, formatStr = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

export function getDaysInMonth(date: Date = new Date()): number {
  return differenceInDays(endOfMonth(date), startOfMonth(date)) + 1;
}

export function getStatementPeriod(dueDate: number, currentDate: Date = new Date()) {
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth();
  
  if (currentDate.getDate() < dueDate) {
    month -= 1;
  }
  
  if (month < 0) {
    month = 11;
    year -= 1;
  }
  
  const start = new Date(year, month, dueDate);
  const end = new Date(year, month + 1, dueDate - 1);
  
  return { start, end };
}
