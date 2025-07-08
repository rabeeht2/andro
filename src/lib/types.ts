export type Broker = {
  id: string;
  name: string;
};

export type Trade = {
  id: string;
  date: Date;
  amount: number;
  isProfit: boolean;
  brokerId: string;
  notes?: string;
  chartTime?: string;
  tradeTime?: string;
};
