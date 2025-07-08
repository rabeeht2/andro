"use client"
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { type DayProps } from 'react-day-picker';
import { format } from 'date-fns';

type TradeCalendarProps = {
  month: Date;
  onMonthChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  dailyTotals: Record<string, number>;
};

export default function TradeCalendar({ month, onMonthChange, onDayClick, dailyTotals }: TradeCalendarProps) {
  
  function DayContent(props: DayProps) {
    const { date, displayMonth } = props;
    
    const dayTotal = dailyTotals[date.toDateString()];
    const hasTrades = dayTotal !== undefined && dayTotal !== 0;

    if (date.getMonth() !== displayMonth.getMonth()) {
        return <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">{format(date, 'd')}</div>;
    }

    const isProfit = hasTrades && dayTotal > 0;
    const isLoss = hasTrades && dayTotal < 0;

    const dayClass = "h-full w-full flex flex-col items-center justify-center rounded-md relative text-sm transition-colors"
    + (isProfit ? ' bg-primary/10 text-primary-foreground' : '')
    + (isLoss ? ' bg-destructive/10 text-destructive-foreground' : '')
    + (hasTrades ? ' hover:bg-accent/20 cursor-pointer' : '');

    return (
        <div className={dayClass}>
            <div className={isProfit || isLoss ? 'font-bold text-foreground' : 'text-foreground'}>
              {format(date, 'd')}
            </div>
            {hasTrades && (
                <div className={`mt-1 text-xs font-bold ${isProfit ? 'text-primary' : 'text-destructive'}`}>
                    {dayTotal > 0 ? '+' : ''}
                    {Math.round(dayTotal)}
                </div>
            )}
        </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-1 md:p-2">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={onMonthChange}
          onDayClick={(day) => day && onDayClick(day)}
          components={{
            DayContent: DayContent
          }}
          className="w-full"
          classNames={{
            day_cell: "h-16 w-16 text-center text-sm p-0.5 relative [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-full w-full p-0 rounded-md focus-visible:ring-1 focus-visible:ring-ring",
            day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            day_today: "ring-2 ring-accent",
            head_cell: "text-muted-foreground rounded-md w-16 font-normal text-[0.8rem]",
          }}
        />
      </CardContent>
    </Card>
  );
}
