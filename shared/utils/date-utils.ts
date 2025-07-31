import { addDays, format, getDay } from 'date-fns';

export const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export function getNextDays(days: number = 4): Date[] {
  const today = new Date();
  const nextDays: Date[] = [];

  for (let i = 0; i < days; i++) {
    nextDays.push(addDays(today, i));
  }

  return nextDays;
}

export function getWeekdayName(date: Date): Weekday {
  return WEEKDAYS[getDay(date)];
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function generateTimeSlots(date: Date, openTime: string, closeTime: string, slotDuration: number = 30): string[] {
  const slots: string[] = [];

  // Parse time strings like "09:00" and "18:00"
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const startTime = openHour * 60 + openMinute;
  const endTime = closeHour * 60 + closeMinute;

  // Generate slots
  for (let time = startTime; time < endTime; time += slotDuration) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;

    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);

    slots.push(slotDate.toISOString());
  }

  return slots;
}

export function getAvailableTourSlots(
  weekdayTemplates: Array<{
    week_day: string;
    open_time: string;
    close_time: string;
  }>,
  days: number = 4
): Array<{ date: string; slots: string[] }> {
  const nextDays = getNextDays(days);
  const result: Array<{ date: string; slots: string[] }> = [];

  for (const date of nextDays) {
    const dayName = getWeekdayName(date);
    const dateKey = formatDate(date);

    // Find if this weekday is available
    const weekdayTemplate = weekdayTemplates.find(template => template.week_day === dayName);

    if (weekdayTemplate && weekdayTemplate.open_time && weekdayTemplate.close_time) {
      // Generate slots for this date based on operating hours
      const slots = generateTimeSlots(date, weekdayTemplate.open_time, weekdayTemplate.close_time);
      result.push({
        date: dateKey,
        slots: slots,
      });
    }
    // If weekday not available, don't add to result (skip that day)
  }

  return result;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return formatDate(date) === formatDate(today);
}

export function isFuture(date: Date): boolean {
  const today = new Date();
  return date > today;
}

export function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function endOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}
