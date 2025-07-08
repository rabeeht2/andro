"use client"
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { type Trade, type Broker } from '@/lib/types';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type TradeListSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedDate?: Date;
  trades: Trade[];
  brokers: Broker[];
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
};

export default function TradeListSheet({ isOpen, setIsOpen, selectedDate, trades, brokers, onEdit, onDelete }: TradeListSheetProps) {
  const getBrokerName = (brokerId: string) => brokers.find(b => b.id === brokerId)?.name || 'Unknown';

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full md:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Trades for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</SheetTitle>
          <SheetDescription>
            {trades.length > 0 ? 'Here are the trades you made on this day.' : 'No trades recorded for this day.'}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        {trades.length > 0 ? (
          <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="space-y-4">
              {trades.map(trade => (
                <Card key={trade.id} className={trade.isProfit ? 'border-primary/50' : 'border-destructive/50'}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className={`text-xl ${trade.isProfit ? 'text-primary' : 'text-destructive'}`}>
                          {trade.isProfit ? '+' : '-'}${trade.amount.toFixed(2)}
                        </CardTitle>
                        <CardDescription>
                          Broker: {getBrokerName(trade.brokerId)}
                          {(trade.chartTime || trade.tradeTime) && (
                            <span className="block mt-1 text-xs">
                                {trade.chartTime && `Chart: ${trade.chartTime}`}
                                {trade.chartTime && trade.tradeTime && ' / '}
                                {trade.tradeTime && `Trade: ${trade.tradeTime}`}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant={trade.isProfit ? 'default' : 'destructive'} className={trade.isProfit ? 'bg-primary' : ''}>
                        {trade.isProfit ? 'Profit' : 'Loss'}
                      </Badge>
                    </div>
                  </CardHeader>
                  {trade.notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground italic">"{trade.notes}"</p>
                    </CardContent>
                  )}
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(trade)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this trade record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(trade.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground">No trades to show.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
