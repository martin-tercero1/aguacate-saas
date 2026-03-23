'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  id: string
  date: string
  title: string
  subtitle?: string
  color?: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function CalendarView({ events, onDateClick, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()
  
  // Generate calendar grid
  const calendarDays: (number | null)[] = []
  
  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }
  
  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => event.date.startsWith(dateStr))
  }
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  const today = new Date()
  const isToday = (day: number) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear()
  }
  
  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h3 className="ml-2 text-lg font-semibold text-foreground">
            {MONTHS[month]} {year}
          </h3>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Hoy
        </Button>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAYS_OF_WEEK.map((day) => (
          <div 
            key={day} 
            className="py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : []
          
          return (
            <div
              key={index}
              className={cn(
                "min-h-[80px] border-b border-r border-border p-1",
                "last:border-r-0 [&:nth-child(7n)]:border-r-0",
                day && "cursor-pointer hover:bg-muted/50 transition-colors",
                !day && "bg-muted/20"
              )}
              onClick={() => {
                if (day && onDateClick) {
                  onDateClick(new Date(year, month, day))
                }
              }}
            >
              {day && (
                <>
                  <div 
                    className={cn(
                      "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm",
                      isToday(day) 
                        ? "bg-primary text-primary-foreground font-semibold" 
                        : "text-foreground"
                    )}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-xs cursor-pointer",
                          event.color || "bg-primary/20 text-primary"
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick?.(event)
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 2} mas
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
