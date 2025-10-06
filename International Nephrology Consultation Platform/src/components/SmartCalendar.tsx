import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string; // Why it's unavailable (e.g., "Booked", "Google Calendar conflict")
}

interface SmartCalendarProps {
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  consultationType: string;
}

export function SmartCalendar({ 
  selectedDate, 
  selectedTime, 
  onDateSelect, 
  onTimeSelect,
  consultationType 
}: SmartCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  // Map of YYYY-MM-DD -> availability counts for the visible month
  const [monthAvailability, setMonthAvailability] = useState<Record<string, { available: number; total: number }>>({});
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [slotFilter, setSlotFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Generate time slots (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = (): string[] => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Required consecutive 30-min slots by consultation type (cinema-style seats requirement)
  const requiredConsecutiveSlots = () => {
    switch (consultationType) {
      case 'followup':
        return 1; // 30 min
      case 'initial':
      case 'urgent':
        return 2; // ~45 min -> require at least 60 min window for buffer
      default:
        return 1;
    }
  };

  const isInFilter = (time: string) => {
    const [hStr, mStr] = time.split(':');
    const h = parseInt(hStr, 10);
    const mins = h * 60 + parseInt(mStr, 10);
    if (slotFilter === 'all') return true;
    if (slotFilter === 'morning') return mins >= 9 * 60 && mins < 12 * 60;
    if (slotFilter === 'afternoon') return mins >= 12 * 60 && mins < 17 * 60;
    if (slotFilter === 'evening') return mins >= 17 * 60 && mins < 18 * 60 + 1;
    return true;
  };

  const isPastTime = (dateString: string, time: string) => {
    if (!dateString) return false;
    const [h, m] = time.split(':').map((x) => parseInt(x, 10));
    const dt = new Date(dateString + 'T00:00:00');
    dt.setHours(h, m, 0, 0);
    return dt.getTime() < Date.now();
  };

  const evaluateDateSlots = async (date: string): Promise<TimeSlot[]> => {
    const { mockCalendarAPI } = await import('../utils/mockCalendarAPI');
    const bookingsData = await mockCalendarAPI.getExistingBookings(date);
    const existingBookings = bookingsData.slots || [];
    const googleBusySlots = await checkGoogleCalendarAvailability(date);
    const allSlots = generateTimeSlots();
    const need = requiredConsecutiveSlots();
    return allSlots.map((time, idx) => {
      let ok = true;
      let reason: string | undefined;
      for (let i = 0; i < need; i++) {
        const t = allSlots[idx + i];
        if (!t) { ok = false; reason = 'Insufficient time window'; break; }
        const existingSlot = existingBookings.find((slot: any) => slot.time === t);
        const busy = googleBusySlots.includes(t);
        if (!existingSlot?.available) { ok = false; reason = 'Already booked'; break; }
        if (busy) { ok = false; reason = 'Calendar conflict'; break; }
      }
      // Hide past times on same day
      if (ok && isPastTime(date, time)) { ok = false; reason = 'Past time'; }
      return { time, available: ok, reason };
    });
  };

  const jumpToNextAvailable = async () => {
    try {
      const start = selectedDate ? new Date(selectedDate) : new Date();
      start.setHours(0, 0, 0, 0);
      for (let d = 0; d < 60; d++) {
        const target = new Date(start);
        target.setDate(start.getDate() + d);
        const ymd = target.toISOString().split('T')[0];
        const slots = await evaluateDateSlots(ymd);
        const candidate = slots.find(s => s.available && isInFilter(s.time));
        if (candidate) {
          onDateSelect(ymd);
          onTimeSelect(candidate.time);
          return;
        }
      }
    } catch (e) {
      console.error('Next available search failed', e);
    }
  };

  // Check Google Calendar availability using mock API
  const checkGoogleCalendarAvailability = async (date: string): Promise<string[]> => {
    try {
      // Use mock API for development
      const { mockCalendarAPI } = await import('../utils/mockCalendarAPI');
      const data = await mockCalendarAPI.checkAvailability(date);
      return data.busySlots || [];
    } catch (error) {
      console.error('Error checking Google Calendar:', error);
      return [];
    }
  };

  // Fetch availability when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return;
      
      setLoadingSlots(true);
      try {
        const slotsWithAvailability = await evaluateDateSlots(selectedDate);
        setAvailableSlots(slotsWithAvailability);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, consultationType]);

  // Check Google Calendar connection status
  useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        const { mockCalendarAPI } = await import('../utils/mockCalendarAPI');
        const data = mockCalendarAPI.getStatus();
        setGoogleCalendarConnected(data.connected);
      } catch (error) {
        console.error('Error checking Google Calendar status:', error);
      }
    };

    checkGoogleConnection();
  }, []);

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      const { mockCalendarAPI } = await import('../utils/mockCalendarAPI');
      
      // Simulate connection process
      await mockCalendarAPI.connectGoogleCalendar();
      setGoogleCalendarConnected(true);
      
      // Refresh availability if date is selected
      if (selectedDate) {
        // Trigger re-fetch by updating the date
        const currentDate = selectedDate;
        onDateSelect('');
        setTimeout(() => onDateSelect(currentDate), 100);
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isPast = date < today;
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate === date.toISOString().split('T')[0];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isPast,
        isToday,
        isSelected,
        isWeekend,
        dateString: date.toISOString().split('T')[0]
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  // Compute per-day availability for the visible month (cinema-style overview)
  useEffect(() => {
    const computeMonthAvailability = async () => {
      setLoadingMonth(true);
      try {
        const days = generateCalendarDays().filter(d => d.isCurrentMonth && !d.isPast);
        const allSlots = generateTimeSlots();
        const { mockCalendarAPI } = await import('../utils/mockCalendarAPI');

        const results: Record<string, { available: number; total: number }> = {};
        // Compute sequentially to keep it simple and avoid API spam
        for (const d of days) {
          const date = d.dateString;
          const bookingsData = await mockCalendarAPI.getExistingBookings(date);
          const existingBookings = bookingsData.slots || [];
          const googleBusySlots = await checkGoogleCalendarAvailability(date);

          let available = 0;
          const need = requiredConsecutiveSlots();
          for (let idx = 0; idx < allSlots.length; idx++) {
            let ok = true;
            for (let i = 0; i < need; i++) {
              const t = allSlots[idx + i];
              if (!t) { ok = false; break; }
              const existingSlot = existingBookings.find((slot: any) => slot.time === t);
              const isGoogleBusy = googleBusySlots.includes(t);
              if (!existingSlot?.available || isGoogleBusy) { ok = false; break; }
            }
            if (ok) available++;
          }

          results[date] = { available, total: allSlots.length };
        }

        setMonthAvailability(results);
      } catch (err) {
        console.error('Error computing month availability', err);
        setMonthAvailability({});
      } finally {
        setLoadingMonth(false);
      }
    };

    computeMonthAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, consultationType]);

  return (
    <div className="space-y-6">
      {/* Google Calendar Integration Status */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-white text-gray-900 border-b p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const info = monthAvailability[day.dateString];
                const soldOut = day.isCurrentMonth && !day.isPast && info && info.available === 0;
                const handleDayClick = () => {
                  if (!day.isCurrentMonth || day.isPast) return;
                  if (soldOut) {
                    toast.info('No slots available on this date');
                    return;
                  }
                  onDateSelect(day.dateString);
                };

                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: day.isCurrentMonth && !day.isPast && !soldOut ? 1.05 : 1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDayClick}
                    className={`
                      aspect-square p-1.5 text-sm rounded-lg transition-all duration-200 text-center
                      ${day.isCurrentMonth 
                        ? day.isPast 
                          ? 'text-gray-300 cursor-not-allowed'
                          : day.isSelected
                            ? 'bg-[#006f6f] text-white shadow'
                            : soldOut
                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-60'
                              : day.isToday
                                ? 'bg-blue-50 text-blue-800'
                                : 'hover:bg-[#006f6f]/10 hover:text-[#006f6f] text-gray-900'
                        : 'text-gray-300'
                      }
                    `}
                  >
                    {day.day}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader className="p-4 border-b">
            <CardTitle className="flex items-center space-x-2 text-base font-semibold">
              <Clock className="w-5 h-5" />
              <span>Available Time Slots</span>
            </CardTitle>
            {selectedDate && (
              <p className="text-sm text-gray-600">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {!selectedDate && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a date to view available time slots</p>
              </div>
            )}

            {selectedDate && loadingSlots && (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#006f6f] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading available slots...</p>
              </div>
            )}

            {selectedDate && !loadingSlots && (
              <div className="space-y-4">
                {/* Legend removed for a cleaner UI */}

                {/* Time slots grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                  <AnimatePresence>
                    {availableSlots.map((slot, index) => (
                      <motion.div
                        key={slot.time}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant={selectedTime === slot.time ? 'default' : 'outline'}
                          className={`
                            w-full p-3 h-auto justify-start
                            ${selectedTime === slot.time
                              ? 'bg-[#006f6f] hover:bg-[#005555]'
                              : slot.available
                                ? 'hover:border-[#006f6f] hover:text-[#006f6f]'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            }
                          `}
                          onClick={() => {
                            if (!slot.available) {
                              toast.warning(slot.reason === 'Calendar conflict' ? 'Doctor is busy at this time' : slot.reason || 'This time is unavailable');
                              return;
                            }
                            onTimeSelect(slot.time);
                          }}
                        >
                          <div className="flex items-center space-x-2 w-full">
                            <span className={`inline-block w-2 h-2 rounded-full ${slot.available ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div className="text-left flex-1">
                              <div className="font-medium">{slot.time}</div>
                              {!slot.available && slot.reason && (
                                <div className="text-xs opacity-70">{slot.reason === 'Calendar conflict' ? 'Doctor busy' : slot.reason}</div>
                              )}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Empty state */}
                {availableSlots.filter(s => s.available).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No available slots for this date.
                  </div>
                )}

                {availableSlots.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No available slots for this date</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected appointment summary */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-1">Appointment Selected</h3>
              <p className="text-green-700">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {selectedTime}
              </p>
              {googleCalendarConnected && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Verified no conflicts with your Google Calendar
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
