'use client'

import * as React from 'react'

import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type CalendarEvent = {
  time?: string
  title: string
  description?: string
}

function formatKey(date: Date | undefined) {
  if (!date) return ''
  // yyyy-mm-dd
  return date.toISOString().split('T')[0]
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  )

  // Example events; replace with real data later
  const eventsByDate = React.useMemo<Record<string, CalendarEvent[]>>(
    () => ({
      [formatKey(new Date())]: [
        { time: '10:00 AM', title: 'Daily standup' },
        { time: '2:30 PM', title: 'Customer call' },
      ],
    }),
    [],
  )

  const events = eventsByDate[formatKey(selectedDate)] || []

  return (
    <div className="container mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-none">Calendar</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse dates and view events. Inspired by Origin UI experiments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pick a date</CardTitle>
            <CardDescription>Select a day to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className=""
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? selectedDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'No date selected'}
            </CardTitle>
            <CardDescription>
              {events.length > 0
                ? `${events.length} event${events.length > 1 ? 's' : ''}`
                : 'No events for this date'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {events.length === 0 && (
                <li className="text-muted-foreground text-sm">Nothing scheduled.</li>
              )}
              {events.map((evt, idx) => (
                <li
                  key={`${formatKey(selectedDate)}-${idx}`}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{evt.title}</div>
                    {evt.time && (
                      <div className="text-muted-foreground text-sm">{evt.time}</div>
                    )}
                  </div>
                  {evt.description && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {evt.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


