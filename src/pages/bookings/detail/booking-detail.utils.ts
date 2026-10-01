// src/pages/bookings/detail/booking-detail.utils.ts

export function isTodayOrAfter(d: string) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= date;
}

export function daysUntil(d: string) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
}