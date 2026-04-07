
export interface Invoice {
  reference: string;
  customer: {
    name: string;
    document: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  iva: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
}

export interface DigitalInvoice {
  id: string;
  reference: string;
  date: Date;
  customer: {
    name: string;
    document: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  iva: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'processed' | 'error';
  digitalInvoiceNumber?: string;
}
