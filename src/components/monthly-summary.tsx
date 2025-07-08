"use client"
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { type Trade } from '@/lib/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

type MonthlySummaryProps = {
  trades: Trade[];
  currentMonth: Date;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Date
              </span>
              <span className="font-bold text-muted-foreground">{label}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Net P/L
              </span>
              <span className={`font-bold ${data.net >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {data.net < 0 ? '-' : ''}${Math.abs(data.net).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
  
    return null;
};

export default function MonthlySummary({ trades, currentMonth }: MonthlySummaryProps) {
  const { totalProfit, totalLoss, netProfit, chartData } = useMemo(() => {
    const monthlyTrades = trades.filter(trade => isSameMonth(new Date(trade.date), currentMonth));
    
    let profit = 0;
    let loss = 0;

    const dailyNet = new Map<string, number>();

    monthlyTrades.forEach(trade => {
      const dayKey = format(new Date(trade.date), 'yyyy-MM-dd');
      const amount = trade.isProfit ? trade.amount : -trade.amount;

      if(trade.isProfit) profit += trade.amount;
      else loss += trade.amount;

      dailyNet.set(dayKey, (dailyNet.get(dayKey) || 0) + amount);
    });
    
    const monthInterval = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const data = monthInterval.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const net = dailyNet.get(dayKey) || 0;
        return {
            name: format(day, 'd'),
            net: net,
        }
    });

    return {
      totalProfit: profit,
      totalLoss: loss,
      netProfit: profit - loss,
      chartData: data,
    };
  }, [trades, currentMonth]);

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loss</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalLoss)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net P/L</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {netProfit < 0 ? '-' : ''}{formatCurrency(netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Daily net profit/loss for {format(currentMonth, 'MMMM yyyy')}</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }} />
                    <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.net >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
