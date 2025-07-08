"use client"
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type Trade, type Broker } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  isProfit: z.enum(["profit", "loss"]),
  date: z.date(),
  chartTime: z.string().optional(),
  tradeTime: z.string().optional(),
  brokerId: z.string().min(1, { message: "Please select a broker." }),
  newBrokerName: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
    if (data.brokerId === 'other' && (!data.newBrokerName || data.newBrokerName.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: 'New broker name is required.',
    path: ['newBrokerName'],
});

type FormValues = z.infer<typeof formSchema>;

type TradeFormSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  brokers: Broker[];
  tradeToEdit?: Trade;
  onAddTrade: (trade: Omit<Trade, 'id'>) => void;
  onEditTrade: (trade: Trade) => void;
  onAddNewBroker: (brokerName: string) => string;
};

export default function TradeFormSheet({ isOpen, setIsOpen, brokers, tradeToEdit, onAddTrade, onEditTrade, onAddNewBroker }: TradeFormSheetProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      isProfit: 'profit',
      date: new Date(),
      brokerId: '',
      newBrokerName: '',
      notes: '',
      chartTime: '',
      tradeTime: '',
    },
  });
  
  const brokerId = form.watch('brokerId');

  useEffect(() => {
    if (isOpen) {
        if (tradeToEdit) {
            form.reset({
                amount: Math.abs(tradeToEdit.amount),
                isProfit: tradeToEdit.isProfit ? 'profit' : 'loss',
                date: new Date(tradeToEdit.date),
                brokerId: tradeToEdit.brokerId,
                notes: tradeToEdit.notes || '',
                chartTime: tradeToEdit.chartTime || '',
                tradeTime: tradeToEdit.tradeTime || '',
                newBrokerName: '',
            });
        } else {
            form.reset({
                amount: undefined,
                isProfit: 'profit',
                date: new Date(),
                brokerId: '',
                newBrokerName: '',
                notes: '',
                chartTime: '',
                tradeTime: '',
            });
        }
    }
  }, [tradeToEdit, isOpen, form]);

  const onSubmit = (data: FormValues) => {
    let finalBrokerId = data.brokerId;
    if (data.brokerId === 'other' && data.newBrokerName) {
        finalBrokerId = onAddNewBroker(data.newBrokerName);
    }
    
    const tradeData = {
        amount: data.amount,
        isProfit: data.isProfit === 'profit',
        date: data.date,
        brokerId: finalBrokerId,
        notes: data.notes,
        chartTime: data.chartTime,
        tradeTime: data.tradeTime,
    };

    if (tradeToEdit) {
      onEditTrade({ ...tradeData, id: tradeToEdit.id });
    } else {
      onAddTrade(tradeData);
    }
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full md:max-w-md sm:max-w-sm flex flex-col">
        <SheetHeader>
          <SheetTitle>{tradeToEdit ? 'Edit Trade' : 'Add New Trade'}</SheetTitle>
          <SheetDescription>
            {tradeToEdit ? 'Update the details of your trade.' : 'Log a new profit or loss entry.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-grow p-1 -m-1 pr-4 -mr-4">
            <div className="space-y-6 py-4">
                <FormField
                control={form.control}
                name="isProfit"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                        >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="profit" id="profit" />
                            </FormControl>
                            <FormLabel htmlFor="profit" className="font-normal text-primary">Profit</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="loss" id="loss"/>
                            </FormControl>
                            <FormLabel htmlFor="loss" className="font-normal text-destructive">Loss</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g. 150.75" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}/>

                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                    >
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}/>

                <div className="flex gap-4">
                    <FormField control={form.control} name="chartTime" render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Chart Time</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="tradeTime" render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Trade Time</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                
                <FormField control={form.control} name="brokerId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Broker</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a broker" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {brokers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                <SelectItem value="other">Other...</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                {brokerId === 'other' && (
                    <FormField control={form.control} name="newBrokerName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Broker Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter broker name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                )}

                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g. Good entry on breakout" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            </ScrollArea>
            <SheetFooter className="pt-4 mt-auto">
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">{tradeToEdit ? 'Save Changes' : 'Add Trade'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
