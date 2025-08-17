// FILE: app/components/dashboard/StreakCalendar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

// --- Type Definitions ---
interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

interface TodosState {
    [dateKey: string]: Todo[];
}

// --- Helper Functions ---
const formatDateKey = (date: Date): string => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
};

// --- Mock Data ---
const initialTodos: TodosState = {
    [formatDateKey(new Date(new Date().setDate(new Date().getDate() - 2)))]: [{ id: 1, text: 'Review Polity Notes', completed: true }],
    [formatDateKey(new Date(new Date().setDate(new Date().getDate() - 1)))]: [{ id: 1, text: 'Write GS1 Answer', completed: true }],
    [formatDateKey(new Date())]: [
        { id: 1, text: 'Read The Hindu editorial', completed: true },
        { id: 2, text: 'Practice CSAT paper', completed: false }
    ],
};


export default function StreakCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState<(number | null)[]>([]);
    const [todos, setTodos] = useState<TodosState>(initialTodos);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [streaks, setStreaks] = useState({ current: 0, longest: 0 });

    // --- Logic for Streaks and Calendar Generation ---
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedCompletedDates = Object.keys(todos)
            .filter(key => todos[key] && todos[key].length > 0 && todos[key].every(t => t.completed))
            .map(key => new Date(key))
            .sort((a, b) => b.getTime() - a.getTime());

        let longest = 0;
        let current = 0;
        let tempStreak = 0;

        if (sortedCompletedDates.length > 0) {
            tempStreak = 1;
            longest = 1;

            for (let i = 0; i < sortedCompletedDates.length - 1; i++) {
                const diff = (sortedCompletedDates[i].getTime() - sortedCompletedDates[i + 1].getTime()) / (1000 * 3600 * 24);
                if (diff === 1) {
                    tempStreak++;
                } else {
                    if (tempStreak > longest) longest = tempStreak;
                    tempStreak = 1;
                }
            }
            if (tempStreak > longest) longest = tempStreak;
            
            const todayIsComplete = formatDateKey(today) === formatDateKey(sortedCompletedDates[0]);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayIsComplete = formatDateKey(yesterday) === formatDateKey(sortedCompletedDates[0]);

            if (todayIsComplete || yesterdayIsComplete) {
                 let currentTempStreak = 1;
                 for (let i = 0; i < sortedCompletedDates.length - 1; i++) {
                     const diff = (sortedCompletedDates[i].getTime() - sortedCompletedDates[i + 1].getTime()) / (1000 * 3600 * 24);
                     if (diff === 1) currentTempStreak++;
                     else break;
                 }
                 current = todayIsComplete ? currentTempStreak : 0;
            }
        }
        setStreaks({ current, longest });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        const daysArray: (number | null)[] = Array(firstDayOfMonth).fill(null);
        for (let day = 1; day <= daysInMonth; day++) {
            daysArray.push(day);
        }
        setCalendarDays(daysArray);

    }, [currentDate, todos]);

    const handleDayClick = (day: number | null) => {
        if (!day) return;
        setSelectedDay(day);
    };

    const handleAddTodo = (day: number, text: string) => {
        if (!text.trim()) return;
        const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        const newTodo: Todo = { id: Date.now(), text, completed: false };
        setTodos(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), newTodo] }));
    };

    const handleToggleTodo = (day: number, todoId: number) => {
        const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        setTodos(prev => ({
            ...prev,
            [dateKey]: prev[dateKey].map(todo =>
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            )
        }));
    };
    
    const selectedDayTodos = selectedDay ? todos[formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay))] || [] : [];

    return (
        <div className="card p-6 relative overflow-hidden">
            <div className={`transition-all duration-300 ${selectedDay ? 'blur-sm pointer-events-none' : ''}`}>
                <h3 className="text-xl font-bold text-slate-900 mb-4 font-serif">Study Streak</h3>
                <div className="flex justify-around text-center mb-4">
                    <div>
                        <p className="text-3xl font-extrabold" style={{ color: 'var(--secondary-accent)' }}>{streaks.current}</p>
                        <p className="text-xs text-slate-500">Current</p>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold text-slate-800">{streaks.longest}</p>
                        <p className="text-xs text-slate-500">Longest</p>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-sm text-slate-700">{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</p>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 font-semibold">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                        {calendarDays.map((day, index) => {
                            const dateKey = day ? formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)) : '';
                            const dayTodos = todos[dateKey] || [];
                            const allCompleted = dayTodos.length > 0 && dayTodos.every(t => t.completed);
                            const hasIncomplete = dayTodos.length > 0 && !allCompleted;

                            return (
                                <div key={index} className="relative">
                                    <button onClick={() => handleDayClick(day)} disabled={!day} className={`flex items-center justify-center w-8 h-8 rounded-full text-xs transition-colors ${!day ? 'cursor-default' : 'cursor-pointer hover:bg-slate-100'} ${new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() ? 'today' : ''} ${allCompleted ? 'streak' : ''}`}>
                                        {day}
                                        {allCompleted && <span className="absolute bottom-0 right-0 text-green-600 text-xs">✔</span>}
                                        {hasIncomplete && <span className="absolute bottom-0 right-0 text-slate-400 text-lg leading-none">●</span>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* To-Do List Popover (In-Card Modal) */}
            <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm p-6 flex flex-col transition-opacity duration-300 ${selectedDay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-md">Tasks for {currentDate.toLocaleString('default', { month: 'short' })} {selectedDay}</h4>
                    <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
                </div>
                <div className="flex-grow space-y-2 max-h-40 overflow-y-auto pr-2">
                    {selectedDay && selectedDayTodos.map(todo => (
                        <div key={todo.id} className="flex items-center">
                            <input type="checkbox" id={`todo-${todo.id}`} checked={todo.completed} onChange={() => handleToggleTodo(selectedDay, todo.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                            <label htmlFor={`todo-${todo.id}`} className={`ml-2 text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{todo.text}</label>
                        </div>
                    ))}
                    {selectedDay && selectedDayTodos.length === 0 && <p className="text-xs text-slate-400">No tasks for this day.</p>}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (selectedDay) { const input = e.currentTarget.elements.namedItem('todo-input') as HTMLInputElement; handleAddTodo(selectedDay, input.value); input.value = ''; } }} className="mt-3 flex">
                    <input name="todo-input" type="text" placeholder="Add a task..." className="text-sm w-full border-slate-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    <button type="submit" className="ml-2 px-3 py-1 bg-indigo-600 text-white text-lg font-bold rounded-md hover:bg-indigo-700">+</button>
                </form>
            </div>
        </div>
    );
}