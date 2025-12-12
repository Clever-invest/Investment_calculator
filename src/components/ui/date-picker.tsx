import * as React from "react"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string // ISO date string YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Форматирование даты в dd.MM.yyyy
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

// Форматирование в ISO YYYY-MM-DD
const toISODate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Выберите дату",
  className 
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Parse ISO string to Date
  const date = value ? new Date(value + 'T00:00:00') : undefined
  
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(toISODate(selectedDate))
      setOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date) : placeholder}
          {date && (
            <X 
              className="ml-auto h-4 w-4 text-muted-foreground hover:text-foreground" 
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-w-[90vw] sm:w-[320px] sm:max-w-[320px] p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="flex items-center justify-between border-t border-border p-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              onChange("")
              setOpen(false)
            }}
          >
            Удалить
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              onChange(toISODate(new Date()))
              setOpen(false)
            }}
          >
            Сегодня
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
