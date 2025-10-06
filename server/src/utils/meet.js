export function generateMeetLink(date, timeSlot) {
  const slug = `${date}-${String(timeSlot || '').replace(/\s+/g, '')}`.replace(/[^a-zA-Z0-9-]/g, '');
  return `https://meet.jit.si/NephroConsult-${slug}`;
}
