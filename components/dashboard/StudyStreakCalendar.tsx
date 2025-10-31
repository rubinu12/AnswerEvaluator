"use client";

import { useState, useEffect } from 'react';
import { Flame, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function StudyStreakCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1));
  const [calendarDays, setCalendarDays] = useState<(number | null)[]>([]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingEmptyDays = Array(firstDayOfMonth).fill(null);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    setCalendarDays([...leadingEmptyDays, ...daysArray]);
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const activeDays = [4, 7, 9, 11, 12, 14, 15, 16, 18, 19, 21, 22, 23];
  
  return (
    // [FIX] Padding is now smaller on the smallest screens
    <div className="relative bg-white p-4 xs:p-6 rounded-2xl shadow-lg border border-gray-200/60 transition-transform duration-300 hover:scale-[1.02]">
      <Star className="absolute -top-3 -right-3 h-8 w-8 text-orange-300" fill="currentColor" />

      <div className="flex items-center gap-3">
        {/* [FIX] Icon container is slightly smaller on the smallest screens */}
        <div className="flex h-9 w-9 xs:h-10 xs:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
          <Flame className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
        </div>
        {/* [FIX] Header font size is now responsive */}
        <h2 className="text-lg xs:text-xl font-semibold text-gray-800">Study Streak</h2>
      </div>

      {/* [FIX] Reduced gap between stat cards */}
      <div className="grid grid-cols-2 gap-2 xs:gap-4 mt-6 text-center">
        {/* [FIX] Reduced padding inside stat cards */}
        <div className="bg-orange-50/80 p-2 xs:p-3 rounded-lg border border-orange-100">
          {/* [FIX] Reduced font size of streak number */}
          <p className="text-2xl xs:text-3xl font-bold text-orange-500">12</p>
          <p className="text-xs text-orange-800/70 font-medium">Current Streak</p>
        </div>
        <div className="bg-slate-100/80 p-2 xs:p-3 rounded-lg border border-slate-200">
          <p className="text-2xl xs:text-3xl font-bold text-slate-600">28</p>
          <p className="text-xs text-slate-500 font-medium">Longest Streak</p>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 btn">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <p className="font-semibold text-center text-gray-600 text-sm">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
          <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 btn">
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* [FIX] Reduced gap between calendar day names */}
        <div className="grid grid-cols-7 gap-x-1 text-center text-xs text-gray-400 font-medium">
          <div>Su</div> <div>Mo</div> <div>Tu</div> <div>We</div> <div>Th</div> <div>Fr</div> <div>Sa</div>
        </div>
        {/* [FIX] Reduced gap between calendar dates */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 mt-2 text-center text-sm">
          {calendarDays.map((day, index) => (
            // [FIX] Reduced height of the container for each date
            <div key={index} className="flex justify-center items-center h-7 xs:h-8">
              {day && (
                // [FIX] Reduced size of the date circle/square itself
                <span className={`flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 rounded-lg font-semibold
                  ${activeDays.includes(day) ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' : 'text-gray-600'}
                `}>
                  {day}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>This Month Progress</span>
          <span>20/31 days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>
    </div>
  );
}