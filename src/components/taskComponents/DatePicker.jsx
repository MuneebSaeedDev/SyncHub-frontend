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
        <div className="w-[280px] rounded-[12px] border border-[#dddddd] bg-white p-3 shadow-xl !text-[#181d26]">

            <div className="mb-2.5 flex items-center justify-between px-1">

                <button
                    type="button"
                    onClick={() =>
                        setCurrentMonth(new Date(year, month - 1, 1))
                    }
                    className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#dddddd] bg-white !text-[#41454d] hover:bg-[#f8fafc] hover:!text-[#181d26] transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>

                <span className="!text-xs !font-medium !text-[#181d26]">
                    {currentMonth.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                    })}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        setCurrentMonth(new Date(year, month + 1, 1))
                    }
                    className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#dddddd] bg-white !text-[#41454d] hover:bg-[#f8fafc] hover:!text-[#181d26] transition-colors"
                >
                    <ChevronRight size={14} />
                </button>

            </div>

            <div className="mb-1.5 grid grid-cols-7">

                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(
                    (day, i) => (
                        <div
                            key={i}
                            className="py-1 !text-center !text-[10px] !font-medium !text-[#9297a0]"
                        >
                            {day}
                        </div>
                    )
                )}

            </div>

            <div className="grid grid-cols-7 gap-[2px]">

                {dates.map((date, index) => {

                    const isCurrentMonth = date.getMonth() === month
                    const isSelected = sameDay(date, selectedDate)
                    const isToday = sameDay(date, today)

                    return (
                        <button
                            type="button"
                            key={index}
                            onClick={() => selectDate(date)}
                            className={`cursor-pointer flex aspect-square items-center justify-center rounded-[4px] !text-[11px] !tabular-nums transition-colors
                                ${isSelected
                                    ? 'bg-[#181d26] !font-medium !text-white shadow-xs'
                                    : isToday
                                        ? 'border border-[#181d26] !text-[#181d26] bg-[#f8fafc]'
                                        : isCurrentMonth
                                            ? '!text-[#181d26] hover:bg-[#f8fafc]'
                                            : '!text-[#9297a0] hover:bg-[#f8fafc]/50'
                                }
                            `}
                        >
                            {date.getDate()}
                        </button>
                    )
                })}

            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-[#dddddd] pt-2">

                <button
                    type="button"
                    onClick={clearDate}
                    className="cursor-pointer rounded-[6px] bg-[#f8fafc] border border-[#dddddd] px-2.5 py-1 !text-[11px] !font-normal !text-[#41454d] transition-colors hover:bg-white hover:!text-[#181d26]"
                >
                    Clear
                </button>

                <button
                    type="button"
                    onClick={goToday}
                    className="cursor-pointer rounded-[6px] bg-white border border-[#dddddd] px-2.5 py-1 !text-[11px] !font-normal !text-[#1b61c9] transition-colors hover:!text-[#1a3866] hover:bg-[#f8fafc]"
                >
                    Today
                </button>

            </div>

        </div>
    )
}
