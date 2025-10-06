import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar as DayCalendar } from './ui/calendar';
import { toast } from 'sonner';

interface TimeSlot { time: string; available: boolean; reason?: string }

interface Props {
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  consultationType: string;
}

// Generate 30-min slots between 9:00 and 18:00
const ALL_TIMES = (() => {
  const out: string[] = [];
  for (let h = 9; h < 18; h++) {
    out.push(`${String(h).padStart(2,'0')}:00`);
    out.push(`${String(h).padStart(2,'0')}:30`);
  }
  return out;
})();

// Format date as YYYY-MM-DD in LOCAL time to avoid UTC off-by-one issues
const ymd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function SimpleDateTimePicker({ selectedDate, selectedTime, onDateSelect, onTimeSelect, consultationType }: Props) {
  const [month, setMonth] = useState<Date>(() => {
    if (!selectedDate) return new Date();
    const [yy, mm, dd] = selectedDate.split('-').map(Number);
    return new Date(yy, (mm || 1) - 1, dd || 1);
  });
  const [timesForSelectedDate, setTimesForSelectedDate] = useState<TimeSlot[]>([]);
  const [disabledDatesForTime, setDisabledDatesForTime] = useState<Set<string>>(new Set());
  const today = useMemo(() => { const t = new Date(); t.setHours(0,0,0,0); return t; }, []);

  const requiredConsecutiveSlots = () => {
    switch (consultationType) {
      case 'followup': return 1; // 30 min
      case 'initial':
      case 'urgent': return 2;   // require at least 60 min window
      default: return 1;
    }
  };

  const isPastTime = (dateString: string, time: string) => {
    if (!dateString) return false;
    const [hh, mm] = time.split(':').map(Number);
    const dt = new Date(`${dateString}T00:00:00`);
    dt.setHours(hh, mm, 0, 0);
    return dt.getTime() < Date.now();
  };

  // Evaluate all slots for a date
  const evaluateDateSlots = async (date: string): Promise<TimeSlot[]> => {
    const { mockCalendarAPI } = await import('../utils/mockCalendarAPI');
    const bookingsData = await mockCalendarAPI.getExistingBookings(date);
    const existingBookings = bookingsData.slots || [];
    const busy = (await mockCalendarAPI.checkAvailability(date)).busySlots || [];
    const need = requiredConsecutiveSlots();
    return ALL_TIMES.map((time, idx) => {
      let ok = true; let reason: string | undefined;
      for (let i = 0; i < need; i++) {
        const t = ALL_TIMES[idx + i];
        if (!t) { ok = false; reason = 'Insufficient time window'; break; }
        const existingSlot = existingBookings.find((s: any) => s.time === t);
        const isBusy = busy.includes(t);
        if (!existingSlot?.available) { ok = false; reason = 'Already booked'; break; }
        if (isBusy) { ok = false; reason = 'Calendar conflict'; break; }
      }
      if (ok && isPastTime(date, time)) { ok = false; reason = 'Past time'; }
      return { time, available: ok, reason };
    });
  };

  // Update available times when date changes
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!selectedDate) { setTimesForSelectedDate([]); return; }
      const slots = await evaluateDateSlots(selectedDate);
      if (!active) return;
      setTimesForSelectedDate(slots);
      // Auto-clear invalid selected time
      if (selectedTime) {
        const match = slots.find(s => s.time === selectedTime);
        if (!match?.available) {
          onTimeSelect('');
          toast.info('The selected time is not available for this date');
        }
      }
    };
    run();
    return () => { active = false; };
  }, [selectedDate, consultationType]);

  // Pre-compute disabled dates for the visible month when a time is selected
  useEffect(() => {
    let active = true;
    const compute = async () => {
      const start = new Date(month); start.setDate(1);
      const end = new Date(month); end.setMonth(month.getMonth() + 1, 0);
      const set = new Set<string>();
      const { mockCalendarAPI } = await import('../utils/mockCalendarAPI');
      const bookingsCache: Record<string, any[]> = {};
      const busyCache: Record<string, string[]> = {};
      const need = requiredConsecutiveSlots();

      // If no specific time chosen, we only disable past days
      if (!selectedTime) { setDisabledDatesForTime(set); return; }

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = new Date(d);
        day.setHours(0,0,0,0);
        if (day < today) { set.add(ymd(day)); continue; }
        const key = ymd(day);
        if (!bookingsCache[key]) {
          const data = await mockCalendarAPI.getExistingBookings(key);
          bookingsCache[key] = data.slots || [];
          busyCache[key] = (await mockCalendarAPI.checkAvailability(key)).busySlots || [];
        }
        const idx = ALL_TIMES.indexOf(selectedTime);
        let ok = true;
        for (let i = 0; i < need; i++) {
          const t = ALL_TIMES[idx + i];
          if (!t) { ok = false; break; }
          const existingSlot = bookingsCache[key].find((s: any) => s.time === t);
          if (!existingSlot?.available || busyCache[key].includes(t)) { ok = false; break; }
        }
        if (!ok) set.add(key);
      }
      if (!active) return;
      setDisabledDatesForTime(set);
    };
    compute();
    return () => { active = false; };
  }, [selectedTime, month, consultationType]);

  // Build disabled matcher for DayPicker
  const disabledMatcher = useMemo(() => {
    return [
      { before: today },
      (date: Date) => disabledDatesForTime.has(ymd(date))
    ] as any;
  }, [disabledDatesForTime, today]);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return undefined;
    const [yy, mm, dd] = selectedDate.split('-').map(Number);
    return new Date(yy, (mm || 1) - 1, dd || 1);
  }, [selectedDate]);

  // Build time options with disabled flags when a date is selected
  const timeOptions = useMemo(() => {
    if (!selectedDate) return ALL_TIMES.map(t => ({ time: t, disabled: false }));
    const map = new Map(timesForSelectedDate.map(s => [s.time, s.available] as const));
    return ALL_TIMES.map(t => ({ time: t, disabled: map.has(t) ? !map.get(t)! : false }));
  }, [selectedDate, timesForSelectedDate]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="p-3 border-b bg-white/60">
          <CardTitle className="text-sm font-semibold">Date</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full flex justify-center">
            <div className="max-w-xs w-full">
              <DayCalendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selectedDateObj}
                onSelect={(d) => {
                  if (!d) return;
                  const key = ymd(d);
                  if (disabledDatesForTime.has(key) || d < today) {
                    toast.info('This date is not available for the selected time');
                    return;
                  }
                  onDateSelect(key);
                }}
                disabled={disabledMatcher as any}
                showOutsideDays
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 border-b bg-white/60">
          <CardTitle className="text-sm font-semibold">Time</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {!selectedDate && (
            <div className="text-center text-gray-500 py-6 text-sm">Select a date to view times</div>
          )}
          {selectedDate && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {ALL_TIMES.map((time) => {
                const available = timesForSelectedDate.find(s => s.time === time)?.available ?? false;
                const isSelected = selectedTime === time;
                return (
                  <Button
                    key={time}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`h-10 ${isSelected ? 'bg-[#006f6f] hover:bg-[#005555] text-white' : ''}`}
                    disabled={!available}
                    onClick={() => {
                      if (!available) {
                        const reason = timesForSelectedDate.find(s => s.time === time)?.reason;
                        toast.info(reason === 'Calendar conflict' ? 'Doctor is busy at this time' : reason || 'This time is unavailable');
                        return;
                      }
                      onTimeSelect(time);
                    }}
                  >
                    {time}
                  </Button>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Unavailable times are disabled. Selecting a time will disable unavailable dates in the calendar.</p>
        </CardContent>
      </Card>
    </div>
  );
}
