
import type { Invoice } from "@/types/invoice";
import { FiscalPrinter } from "./fiscalPrinter";

let fiscalPrinter: FiscalPrinter | null = null;

// Helpers to safely parse and format monetary values
const safePrice = (p: unknown): number => {
  if (typeof p === 'number') return Number.isFinite(p) ? p : 0;
  if (typeof p === 'string') {
    // accept both '10,00' and '10.00' formatted strings
    const normalized = p.replace(/[,\s]+/g, '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatPrice = (p: unknown) => safePrice(p).toFixed(2);

export const connectFiscalPrinter = async (port?: string) => {
  try {
    fiscalPrinter = new FiscalPrinter(port);
    const result = await fiscalPrinter.connect();
    console.log('Conexión con impresora fiscal:', result);
    return result;
  } catch (error) {
    console.error('Error conectando con impresora fiscal:', error);
    return {
      success: false,
      message: 'Error conectando con impresora fiscal',
      errorCode: 'CONNECTION_ERROR'
    };
  }
};

export const printInvoice = async (invoice: Invoice, useFiscalPrinter: boolean = false) => {
  if (useFiscalPrinter && fiscalPrinter) {
    try {
      const result = await fiscalPrinter.printFiscalInvoice({
        items: invoice.items,
        customer: invoice.customer,
        paymentMethod: invoice.paymentMethod,
        total: invoice.total
      });
      console.log('Resultado impresión fiscal:', result);
      return result.success;
    } catch (error) {
      console.error('Error en impresión fiscal:', error);
      return false;
    }
  }

  const isUsdPayment = invoice.paymentMethod === 'USD';
  const paid = safePrice(invoice.amountPaid);
  const change = safePrice(invoice.change);
  const totalBs = safePrice(invoice.total);

  let cambioLinea: string;
  if (isUsdPayment && change > 0 && paid > change && totalBs > 0) {
    const effectiveRate = totalBs / (paid - change);
    const changeBs = change * effectiveRate;
    cambioLinea = `Cambio: Bs ${formatPrice(changeBs)} ( $ ${formatPrice(change)} )`;
  } else {
    cambioLinea = `Cambio: ${isUsdPayment ? '$' : 'Bs'} ${formatPrice(invoice.change)}`;
  }

  // Impresión normal no fiscal
  const printContent = `
FACTURA DE VENTA
${invoice.reference}
${new Date().toLocaleString()}

Cliente: ${invoice.customer.name}
Documento: ${invoice.customer.document}

--------------------------------
${invoice.items.map(item => `
${item.name}
${item.quantity} x $${formatPrice(item.price)} = $${formatPrice((Number(item.quantity) || 0) * safePrice(item.price))}
`).join('\n')}
--------------------------------

Subtotal: Bs ${formatPrice(invoice.subtotal)}
IVA (16%): Bs ${formatPrice(invoice.iva)}
Total: Bs ${formatPrice(invoice.total)}

Método de pago: ${invoice.paymentMethod}
Monto recibido: ${invoice.paymentMethod === 'USD' ? '$' : 'Bs'} ${formatPrice(invoice.amountPaid)}
${cambioLinea}

¡Gracias por su compra!
`;

  console.log('Imprimiendo factura no fiscal:', printContent);
  return true;
};

export const printDailyX = async () => {
  if (!fiscalPrinter) {
    console.error('Impresora fiscal no conectada');
    return false;
  }

  try {
    const result = await fiscalPrinter.getDailyX();
    console.log('Resultado reporte X:', result);
    return result.success;
  } catch (error) {
    console.error('Error obteniendo reporte X:', error);
    return false;
  }
};

export const printDailyZ = async () => {
  if (!fiscalPrinter) {
    console.error('Impresora fiscal no conectada');
    return false;
  }

  try {
    const result = await fiscalPrinter.getDailyZ();
    console.log('Resultado reporte Z:', result);
    return result.success;
  } catch (error) {
    console.error('Error obteniendo reporte Z:', error);
    return false;
  }
};

export const disconnectFiscalPrinter = async () => {
  if (!fiscalPrinter) {
    return {
      success: false,
      message: 'No hay impresora fiscal conectada'
    };
  }

  try {
    const result = await fiscalPrinter.disconnect();
    fiscalPrinter = null;
    return result;
  } catch (error) {
    console.error('Error desconectando impresora fiscal:', error);
    return {
      success: false,
      message: 'Error desconectando impresora fiscal'
    };
  }
};
