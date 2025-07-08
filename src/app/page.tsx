"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';

import { type Trade, type Broker } from '@/lib/types';
import MonthlySummary from '@/components/monthly-summary';
import TradeCalendar from '@/components/trade-calendar';
import TradeFormSheet from '@/components/trade-form-sheet';
import TradeListSheet from '@/components/trade-list-sheet';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast"

const initialBrokers: Broker[] = [
  { id: 'qx', name: 'Qx' },
  { id: 'po', name: 'Po' },
];

const getInitialTrades = (): Trade[] => {
  if (typeof window === 'undefined') return [];
  const savedTrades = localStorage.getItem('trades');
  if (savedTrades) {
    const parsedTrades = JSON.parse(savedTrades);
    return parsedTrades.map((t: any) => ({ ...t, date: new Date(t.date) }));
  }
  const today = new Date();
  return [
    { id: '1', date: new Date(today.getFullYear(), today.getMonth(), 2), amount: 150.75, isProfit: true, brokerId: 'qx', notes: 'Good entry on AAPL', chartTime: '09:35', tradeTime: '09:36' },
    { id: '2', date: new Date(today.getFullYear(), today.getMonth(), 2), amount: 50.25, isProfit: false, brokerId: 'po', notes: 'Mistake trade on TSLA', chartTime: '10:10', tradeTime: '10:10' },
    { id: '3', date: new Date(today.getFullYear(), today.getMonth(), 10), amount: 250.00, isProfit: true, brokerId: 'qx', chartTime: '11:00', tradeTime: '11:01' },
    { id: '4', date: new Date(today.getFullYear(), today.getMonth(), 15), amount: 120.50, isProfit: false, brokerId: 'po' },
    { id: '5', date: new Date(today.getFullYear(), today.getMonth(), 15), amount: 300.00, isProfit: true, brokerId: 'qx', notes: 'Caught the morning dip', chartTime: '14:20', tradeTime: '14:22' },
  ];
}

const getInitialBrokers = (): Broker[] => {
    if (typeof window === 'undefined') return initialBrokers;
    const savedBrokers = localStorage.getItem('brokers');
    return savedBrokers ? JSON.parse(savedBrokers) : initialBrokers;
}

export default function Home() {
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  
  useEffect(() => {
    setTrades(getInitialTrades());
    setBrokers(getInitialBrokers());
  }, []);

  useEffect(() => {
    if (trades.length > 0) {
      localStorage.setItem('trades', JSON.stringify(trades));
    }
    if (brokers.length > 0) {
        localStorage.setItem('brokers', JSON.stringify(brokers));
    }
  }, [trades, brokers]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false);
  const [isTradeListOpen, setIsTradeListOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>();

  const handleDayClick = (day: Date) => {
    const dayTrades = trades.filter(trade => trade.date.toDateString() === day.toDateString());
    if (dayTrades.length > 0) {
      setSelectedDate(day);
      setIsTradeListOpen(true);
    }
  };
  
  const handleAddTrade = (tradeData: Omit<Trade, 'id'>) => {
    const newTrade = { ...tradeData, id: Date.now().toString() };
    setTrades([...trades, newTrade]);
    toast({ title: "Trade added!", description: "Your new trade has been successfully logged." });
  };

  const handleEditTrade = (updatedTrade: Trade) => {
    setTrades(trades.map(t => t.id === updatedTrade.id ? updatedTrade : t));
    setEditingTrade(undefined);
    toast({ title: "Trade updated!", description: "Your trade has been successfully saved." });
  };

  const handleDeleteTrade = (tradeId: string) => {
    setTrades(trades.filter(t => t.id !== tradeId));
    setIsTradeListOpen(false);
    toast({ title: "Trade deleted!", variant: "destructive", description: "Your trade has been removed." });
  };
  
  const openEditForm = (trade: Trade) => {
    setIsTradeListOpen(false);
    setEditingTrade(trade);
    setIsTradeFormOpen(true);
  }

  const handleAddNewBroker = (brokerName: string) => {
    const newBroker = { id: brokerName.toLowerCase().replace(/\s+/g, '-') + Date.now(), name: brokerName };
    setBrokers([...brokers, newBroker]);
    return newBroker.id;
  };
  
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    trades.forEach(trade => {
      const dateString = trade.date.toDateString();
      const amount = trade.isProfit ? trade.amount : -trade.amount;
      if (totals[dateString]) {
        totals[dateString] += amount;
      } else {
        totals[dateString] = amount;
      }
    });
    return totals;
  }, [trades]);

  const tradesForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return trades.filter(trade => trade.date.toDateString() === selectedDate.toDateString());
  }, [trades, selectedDate]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-4 md:p-6 font-body relative">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary font-headline">Trade Insights</h1>
        <p className="text-muted-foreground">Your daily trading journal</p>
      </header>
      
      <main className="flex-grow space-y-8">
        <MonthlySummary trades={trades} currentMonth={currentMonth} />
        
        <TradeCalendar 
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          onDayClick={handleDayClick}
          dailyTotals={dailyTotals}
        />
      </main>
      
      <Button 
        onClick={() => { setEditingTrade(undefined); setIsTradeFormOpen(true); }}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-accent hover:bg-accent/90 z-20"
        size="icon"
      >
        <Plus className="h-8 w-8 text-accent-foreground" />
        <span className="sr-only">Add Trade</span>
      </Button>

      <TradeFormSheet
        isOpen={isTradeFormOpen}
        setIsOpen={setIsTradeFormOpen}
        brokers={brokers}
        onAddTrade={handleAddTrade}
        onEditTrade={handleEditTrade}
        onAddNewBroker={handleAddNewBroker}
        tradeToEdit={editingTrade}
      />
      
      <TradeListSheet
        isOpen={isTradeListOpen}
        setIsOpen={setIsTradeListOpen}
        selectedDate={selectedDate}
        trades={tradesForSelectedDay}
        brokers={brokers}
        onEdit={openEditForm}
        onDelete={handleDeleteTrade}
      />
    </div>
  );
}
