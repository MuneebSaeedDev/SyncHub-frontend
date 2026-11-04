import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DatePicker({ value, onChange }) {

    const initialDate = value ? new Date(value) : new Date()

    const [currentMonth, setCurrentMonth] = useState(initialDate)
    const [selectedDate, setSelectedDate] = useState(initialDate)

    useEffect(() => {
        if (value) {
            const date = new Date(value)

            if (!isNaN(date.getTime())) {
                setSelectedDate(date)
                setCurrentMonth(date)
            }
        } else {
            setSelectedDate(null)
        }
    }, [value])

    const today = new Date()

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
    const dates = Array.from(
        { length: 42 },
        (_, i) => new Date(year, month, i - firstDay + 1)
    )

    const sameDay = (a, b) =>
        a && b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()

    const selectDate = (date) => {
        setSelectedDate(date)
        onChange?.(date)
    }

    const goToday = () => {
        setCurrentMonth(today)
        selectDate(today)
    }

    const clearDate = () => {
        setSelectedDate(null)
        onChange?.(null)
    }

    return (
        <div className="w-[280px] rounded-xl border border-slate-100 bg-white p-3 shadow-xl">

            <div className="mb-3 flex items-center justify-between px-1">

                <button
                    type="button"
                    onClick={() =>
                        setCurrentMonth(new Date(year, month - 1, 1))
                    }
                    className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    <ChevronLeft size={17} />
                </button>

                <span className="text-xs font-semibold text-slate-800">
                    {currentMonth.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                    })}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        setCurrentMonth(new Date(year, month + 1, 1))
                    }
                    className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    <ChevronRight size={17} />
                </button>

            </div>

            <div className="mb-2 grid grid-cols-7">

                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(
                    (day, i) => (
                        <div
                            key={i}
                            className="py-2 text-center text-[10px] text-slate-500"
                        >
                            {day}
                        </div>
                    )
                )}

            </div>

            <div className="grid grid-cols-7 gap-[3px]">

                {dates.map((date, index) => {

                    const isCurrentMonth = date.getMonth() === month
                    const isSelected = sameDay(date, selectedDate)
                    const isToday = sameDay(date, today)

                    return (
                        <button
                            type="button"
                            key={index}
                            onClick={() => selectDate(date)}
                            className={`cursor-pointer flex aspect-square items-center justify-center rounded-lg border text-[10px] transition-colors
                                ${isSelected
                                    ? 'border-indigo-600 bg-indigo-600 font-semibold text-white'
                                    : isToday
                                        ? 'border-indigo-500 text-slate-800'
                                        : isCurrentMonth
                                            ? 'border-transparent text-slate-700'
                                            : 'border-transparent text-slate-400'
                                }
                                hover:border-indigo-400 hover:bg-indigo-50
                            `}
                        >
                            {date.getDate()}
                        </button>
                    )
                })}

            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">

                <button
                    type="button"
                    onClick={clearDate}
                    className="cursor-pointer rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-medium text-indigo-600 transition-colors hover:bg-slate-100"
                >
                    Clear
                </button>

                <button
                    type="button"
                    onClick={goToday}
                    className="cursor-pointer rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-medium text-indigo-600 transition-colors hover:bg-slate-100"
                >
                    Today
                </button>

            </div>

        </div>
    )
}
