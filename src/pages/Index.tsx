import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePendingCount } from '@/lib/usePendingCount';
import { syncPendingInvoices } from '@/lib/offlineSync';
import { User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClientSelector from '@/components/pos/ClientSelector';
import { BranchWarehouseSelector } from '@/components/pos/BranchWarehouseSelector';
import { useAccounting } from "../contexts/AccountingContext";
import { useCashRegister } from "@/contexts/CashRegisterContext";
import { useAuth } from "@/contexts/useAuth";
import ModalAperturaCaja from '@/components/ModalAperturaCaja';
import { ProductGrid } from "@/components/pos/ProductGrid";
import { PendingSalesDialog } from "@/components/pos/PendingSalesDialog";
import { CartSection } from "@/components/pos/CartSection";
import { ReceiptPreviewModal, ReceiptData } from "@/components/pos/ReceiptPreviewModal";
// BarcodeScanner removed for cleaner UX
import { printInvoice } from "@/utils/invoicePrinter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart, PaymentMethod } from "@/contexts/CartContext";
import { fetchAllPaymentMethods, normalizePaymentMethods } from "@/services/paymentMethods";
import { getPosCapabilities, getPosSettings } from "@/services/posSettings";
import { useProducts, Product } from "@/contexts/ProductContext";
import { createInvoice, buildInvoicePayload } from "@/services/sales";
import { fetchAllAccounts } from "@/services/accounts";
import { fetchAllClients, ApiClient, createClient } from "@/services/clients";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ShoppingCart } from "lucide-react";
import type { Invoice } from "@/types/invoice";
import { CartSheetDesktop } from "@/components/Layout/CartSheetDesktop";
import { usePosT } from "@/i18n/pos";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { SendToQueueButton } from "@/components/pos/SendToQueueButton";
import { SalesQueueModal } from "@/components/pos/SalesQueueModal";
import { convertDraft, getQueue } from "@/services/posDrafts";
import { usePosLocation } from "@/contexts/PosLocationContext";
import { useUserContext } from "@/hooks/useUserContext";

interface Customer {
  id: string;
  name: string;
  document: string;
  slug?: string | null;
}

// Define PendingSale with a cart of product items explicitly typed
interface PendingSale {
  id: string;
  cart: {
    id: number;
    name: string;
    regularPrice: number;
    inventoryCount: number;
    image?: string;
  }[];
  // store full customer snapshot so the pending sale can be restored even if
  // the global customers list changed later
  customer: Customer | string;
  total: number;
  date: string;
  // also persist UI/payment state so the sale can be resumed exactly as saved
  selectedPayment?: PaymentMethod;
  amountPaid?: string;
  exchangeRate?: number;
  showPaymentUI?: boolean;
}

// Define TransactionItem type to resolve the type error
interface TransactionItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

const Index = () => {
  
  const {
    cart,
    subtotal,
    iva,
    total,
    exchangeRate,
    selectedPayment,
    showPaymentUI,
    amountPaid,
    addToCart: addItemToCart,
    updateQuantity,
    removeFromCart,
    onPaymentMethodSelect,
    startPayment,
    setAmountPaid,
    updateExchangeRate,
    processPayment: processCartPayment,
    cancelPayment,
    savePendingSale: saveCartPendingSale,
    clearCart
  } = useCart();

  const t = usePosT();
  const { selectedWarehouseId, selectedBranchId } = usePosLocation();
  const { data: userCtx } = useUserContext();

  const {
    products,
    isLoading: productsLoading,
    fetchProducts,
    hasMore
  } = useProducts();

  // Mobile detection is used by several callbacks (open client selector, cart sheet close, etc.)
  const isMobileDevice = useIsMobile();
  // No seleccionar cliente por defecto; obligar al usuario a elegir uno
  // Persistir la selección en localStorage para que sobreviva a cambios de vista
  const [selectedCustomer, setSelectedCustomer] = useState<string>(() => {
    try {
      return localStorage.getItem('pos:selectedCustomer') || '';
    } catch (e) {
      return '';
    }
  });

  const [defaultBankAccountId, setDefaultBankAccountId] = useState<number | string | null>(null);

  // Wrapper para actualizar estado y persistir en localStorage
  const selectCustomer = useCallback((id: string) => {
    setSelectedCustomer(id);
    try {
      if (id) localStorage.setItem('pos:selectedCustomer', id);
      else localStorage.removeItem('pos:selectedCustomer');
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = localStorage.getItem('default_bank_account_id');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (active && (typeof parsed === 'number' || typeof parsed === 'string')) {
            setDefaultBankAccountId(parsed);
            return;
          }
        }
      } catch {
        // ignore
      }

      try {
        const accs = await fetchAllAccounts();
        const first = (accs || [])[0];
        if (!first) return;
        if (!active) return;
        setDefaultBankAccountId(first.id);
        try {
          localStorage.setItem('default_bank_account_id', JSON.stringify(first.id));
        } catch {
          // ignore
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      active = false;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [showOpenRegisterModal, setShowOpenRegisterModal] = useState(false);
  const [requireCashSession, setRequireCashSession] = useState<boolean | null>(null);
  const [loadingPosSettings, setLoadingPosSettings] = useState(true);
  const [requireCustomer, setRequireCustomer] = useState<boolean>(true);
  const [canCharge, setCanCharge] = useState<boolean>(true);
  const [sellerCanChargeSetting, setSellerCanChargeSetting] = useState<boolean>(true);
  const [capsCanCharge, setCapsCanCharge] = useState<boolean>(true);
  const [autoPrintReceiptEnabled, setAutoPrintReceiptEnabled] = useState<boolean>(false);
  const [allowNegativeStock, setAllowNegativeStock] = useState<boolean>(false);
  const [showPendingSalesDialog, setShowPendingSalesDialog] = useState(false);
  const [showSalesQueueModal, setShowSalesQueueModal] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [page, setPage] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const pendingCount = usePendingCount();
  const [salesQueueCount, setSalesQueueCount] = useState<number>(0);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  // Controla la apertura del panel de pago en escritorio
  const [desktopPaymentOpen, setDesktopPaymentOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const refreshQueueCount = async () => {
      if (!selectedWarehouseId) {
        if (active) setSalesQueueCount(0);
        return;
      }
      try {
        const res = await getQueue(Number(selectedWarehouseId));
        const next =
          typeof res?.meta?.total === 'number'
            ? res.meta.total
            : Array.isArray(res?.data)
              ? res.data.length
              : Array.isArray(res as any)
                ? (res as any).length
                : 0;
        if (active) setSalesQueueCount(next);
      } catch {
        if (active) setSalesQueueCount(0);
      }
    };

    refreshQueueCount();

    const handler = () => refreshQueueCount();
    window.addEventListener('pos:salesQueueChanged', handler);
    const interval = window.setInterval(refreshQueueCount, 15000);

    return () => {
      active = false;
      window.removeEventListener('pos:salesQueueChanged', handler);
      window.clearInterval(interval);
    };
  }, [selectedWarehouseId]);

  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [creditDueDate, setCreditDueDate] = useState<string>('');

  // Acumula pagos múltiples recibidos desde UI (desktop o móvil)
  // NOTE: Debe declararse ANTES de cualquier callback que lo referencie para evitar
  // "Cannot access 'partialPayments' before initialization" por el TDZ de let/const.
  const [partialPayments, setPartialPayments] = useState<Array<{ id: string; method: PaymentMethod; amount: number }>>([]);
  // Mapa código->id del método de pago (backend)
  const [paymentMethodIdMap, setPaymentMethodIdMap] = useState<Record<PaymentMethod, number|string>>({ usd: '', bs: '', debito: '', movil: '', credito: '', biopago: '' });
  

  useEffect(() => {
    // Cargar id de métodos de pago desde el backend si están disponibles
    (async () => {
      try {
        const apiList = await fetchAllPaymentMethods();
        const normalized = normalizePaymentMethods(apiList);
        const map: Record<PaymentMethod, number|string> = { usd: '', bs: '', debito: '', movil: '', credito: '', biopago: '' };
        normalized.forEach(m => {
          const code = m.code.toLowerCase();
          if (code.includes('usd') || code === '$') map.usd = m.id;
          else if (code.includes('bs') || code.includes('bolivar')) map.bs = m.id;
          else if (code.includes('debito')) map.debito = m.id;
          else if (code.includes('movil') || code.includes('pago movil')) map.movil = m.id;
          else if (code.includes('credito') || code.includes('crédito') || code.includes('fiao')) map.credito = m.id;
          else if (code.includes('biopago') || code.includes('bio pago')) map.biopago = m.id;
        });
        setPaymentMethodIdMap(map);
      } catch (e) {
        // Si falla, mantenemos vacío y usaremos el id local del pago como fallback
      }
    })();
  }, []);

  const handleReceivePayments = useCallback((payments: Array<{ id: string; method: PaymentMethod; amount: number }>) => {
    setPartialPayments(payments);
  }, []);

  const { toast } = useToast();
  const { addTransaction } = useAccounting();
  const {
    currentCashSession,
    isOpen: isOpenFromCtx,
    checkCurrentSession,
    cajaAbierta
  } = useCashRegister();

  // Override isOpen with the value stored in localStorage.caja_status
  // localStorage.caja_status stores the `arqueo` object when a register is open, otherwise null
  const isOpen = (() => {
    try {
      const raw = localStorage.getItem('caja_status');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!parsed;
    } catch (e) {
      return false;
    }
  })();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener user id desde localStorage.auth_user si está disponible (auth_user.data.id)
  const getAuthUserIdFromStorage = () => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return (user as any)?.id ?? (user as any)?.user_id ?? '';
      const parsed = JSON.parse(raw);
      return (parsed && (parsed.data?.id ?? parsed.data?.user_id)) ?? (user as any)?.id ?? (user as any)?.user_id ?? '';
    } catch (e) {
      return (user as any)?.id ?? (user as any)?.user_id ?? '';
    }
  };

  // Cuando la caja se abre (desde el contexto), cerramos la modal y navegamos al POS
  useEffect(() => {
    if (cajaAbierta) {
      try {
        setShowOpenRegisterModal(false);
        navigate('/pos/products');
      } catch (e) {
        // ignore navigation errors
      }
    }
  }, [cajaAbierta, navigate]);

  // Customers loaded from API
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientDocument, setNewClientDocument] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [creatingClient, setCreatingClient] = useState(false);

  useEffect(() => {
    // Al entrar al POS, verificamos si hay una sesión de caja abierta
    (async () => {
      try {
        // Primero verificar si se requiere abrir caja según la configuración
        const [settings, caps] = await Promise.all([
          getPosSettings().catch(() => null),
          getPosCapabilities().catch(() => null),
        ]);

        const requireOpenRegister = settings?.require_cash_session ?? true;
        setRequireCashSession(requireOpenRegister);

        setRequireCustomer(settings?.require_customer ?? true);
        setSellerCanChargeSetting(settings?.seller_can_charge ?? true);
        setAutoPrintReceiptEnabled(settings?.auto_print_receipt ?? false);
        setCapsCanCharge(caps?.can_charge ?? true);
        setAllowNegativeStock(caps?.allow_negative_stock ?? false);

        // Si no se requiere abrir caja, no mostrar ni la pantalla ni el modal
        if (!requireOpenRegister) {
          setShowOpenRegisterModal(false);
          return;
        }
        
        if (user) {
          const session = await checkCurrentSession();
          // Solo ocultar modal si hay una sesión abierta
          if (session && session.status === 'open') {
            setShowOpenRegisterModal(false);
            return;
          }
        }
        // Si no hay sesión abierta y se requiere, mostrar modal de apertura
        setShowOpenRegisterModal(true);
      } catch (e) {
        console.warn('Error verificando sesión de caja:', e);
        setRequireCashSession(true);
        setShowOpenRegisterModal(true);
        setRequireCustomer(true);
        setCanCharge(true);
        setSellerCanChargeSetting(true);
        setCapsCanCharge(true);
        setAutoPrintReceiptEnabled(false);
        setAllowNegativeStock(false);
      } finally {
        setLoadingPosSettings(false);
      }
    })();
  }, [user, checkCurrentSession]);

  useEffect(() => {
    const roles = (userCtx?.roles ?? []).map((r) => String(r ?? '').trim().toLowerCase());
    const isSellerRole = roles.includes('vendedor') || roles.includes('seller');
    const allowedByRole = !isSellerRole || sellerCanChargeSetting;
    const nextCanCharge = (capsCanCharge ?? true) && allowedByRole;
    setCanCharge(nextCanCharge);
    try {
      try {
        localStorage.setItem('pos:canCharge', JSON.stringify(nextCanCharge));
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent('pos:canChargeChanged', { detail: { canCharge: nextCanCharge } }));
    } catch {
      // ignore
    }
  }, [userCtx?.roles, sellerCanChargeSetting, capsCanCharge]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCustomers(true);
        const apiClients = await fetchAllClients();
        if (!mounted) return;
        const mapped: Customer[] = apiClients
          .map((c) => ({
            id: String(c.id ?? ''),
          name: c.name || `Cliente ${c.id}`,
          document: c.clientID || c.document || 'V-00000000',
          slug: c.slug ?? null,
          }))
          .filter((c) => Boolean(c.id));

        // Dedupe by id (Select values must be unique)
        const byId = new Map<string, Customer>();
        for (const c of mapped) {
          if (!byId.has(c.id)) byId.set(c.id, c);
        }
        const unique = Array.from(byId.values());

        setCustomers(unique);
      } catch (e) {
        setCustomersError(e instanceof Error ? e.message : 'No se pudieron cargar los clientes');
      } finally {
        setLoadingCustomers(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  // Define getSelectedCustomer earlier in the file to avoid the reference error
  const getSelectedCustomer = useCallback(() => {
    return customers.find(c => c.id === selectedCustomer);
  }, [customers, selectedCustomer]);

  const walkingCustomerId = useMemo(() => {
    const w = customers.find(c => c.slug === 'walking-customer')
      ?? customers.find(c => (c.name || '').toLowerCase() === 'walking customer');
    return w?.id ? String(w.id) : '';
  }, [customers]);

  const defaultCustomerId = useMemo(() => {
    const first = customers[0];
    return first?.id ? String(first.id) : '';
  }, [customers]);

  useEffect(() => {
    if (loadingPosSettings) return;
    if (requireCustomer) return;
    if (selectedCustomer) return;
    if (defaultCustomerId) {
      selectCustomer(defaultCustomerId);
    }
  }, [loadingPosSettings, requireCustomer, selectedCustomer, defaultCustomerId, selectCustomer]);

  useEffect(() => {
    if (loadingPosSettings) return;
    if (!requireCustomer) return;
    if (!selectedCustomer) return;
    if (walkingCustomerId && selectedCustomer === walkingCustomerId) {
      selectCustomer('');
      return;
    }

    const exists = customers.some(c => String(c.id) === String(selectedCustomer));
    if (!exists) {
      selectCustomer('');
    }
  }, [loadingPosSettings, requireCustomer, selectedCustomer, walkingCustomerId, customers, selectCustomer]);

  // Handle search input changes with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchProducts(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchProducts]);

  // Load pending sales from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pendingSales');
    if (saved) {
      setPendingSales(JSON.parse(saved));
    }
  }, []);


  // Memoize functions to prevent unnecessary recreations
  const updateProductStock = useCallback((productId: number, quantity: number) => {
    console.log('Stock update would be handled by backend for product', productId, 'quantity', quantity);
  }, []);

  const addToCart = useCallback((product: Product) => {
    // Requiere seleccionar un cliente antes de agregar productos
    if (requireCustomer && (!selectedCustomer || (walkingCustomerId && selectedCustomer === walkingCustomerId))) {
      toast({
        title: "Seleccione un cliente",
        description: "Debe seleccionar un cliente antes de agregar productos al carrito.",
        variant: "destructive",
      });
  // Open client selector on mobile to speed workflow
  if (isMobileDevice) window.dispatchEvent(new CustomEvent('pos:openClientSelector'));
      return;
    }

    if (!requireCustomer && !selectedCustomer && defaultCustomerId) {
      selectCustomer(defaultCustomerId);
    }

    if (selectedPayment === 'credito') {
      const ymd = (creditDueDate || '').slice(0, 10);
      if (!ymd) {
        setShowCreditDialog(true);
        toast({ title: 'Fecha de vencimiento requerida', description: 'Indica la fecha de vencimiento para continuar con el crédito.', variant: 'warning' });
        return;
      }
    }
    // Treat missing stock as 0; allow decimals for by-measure products
    if (!allowNegativeStock && (product.inventoryCount ?? 0) <= 0) {
      toast({
        title: "Error",
        description: "No hay stock disponible de este producto",
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    const normalizedSaleType = ((product.saleType ?? (product as any)?.sale_type) || 'unit') as any;
    const isBulk = normalizedSaleType === 'weight' || normalizedSaleType === 'volume';
    const step = product.step || (isBulk ? (product.minQty || 0.1) : 1);
    const minQty = product.minQty || (isBulk ? step : 1);
    const incomingQty = isBulk
      ? (typeof product.selectedQty === 'number'
          ? Math.max(step, product.selectedQty)
          : step)
      : 1;
    const newQty = (existingItem?.inventoryCount || 0) + incomingQty;
    if (!allowNegativeStock && newQty > (product.inventoryCount || 0)) {
      toast({
        title: "Error",
        description: "No hay suficiente stock disponible",
        variant: "destructive",
      });
      return;
    }

    updateProductStock(product.id, incomingQty);

    addItemToCart({
      id: product.id,
      name: product.name,
      regularPrice: product.regularPrice,
      slug: product.slug,
      stock: allowNegativeStock ? 0 : (product.inventoryCount || 0),
      inventoryCount: incomingQty,
      avgPurchasePrice: 1,
      saleType: normalizedSaleType,
      baseUnit: product.baseUnit,
      unitLabel: product.unitLabel,
      step: step,
      minQty: minQty,
    });
  }, [cart, toast, updateProductStock, addItemToCart, selectedCustomer, isMobileDevice, requireCustomer, walkingCustomerId, selectCustomer, allowNegativeStock]);


  const getPaymentMethodText = useCallback((method: PaymentMethod) => {
    switch (method) {
      case 'usd': return 'USD';
      case 'bs': return 'Bs';
      case 'movil': return 'Pago Móvil';
      case 'debito': return 'Débito';
      case 'credito': return 'Crédito';
      case 'biopago': return 'Biopago';
    }
  }, []);

  useEffect(() => {
    if (selectedPayment === 'credito') {
      setShowCreditDialog(true);
    }
  }, [selectedPayment]);

  const calculateChange = useCallback(() => {
    // Si hay pagos parciales, calcula en Bs
    if (partialPayments.length > 0) {
      const paidBs = partialPayments.reduce((acc, p) => acc + (p.method === 'usd' ? p.amount * exchangeRate : p.amount), 0);
      const changeBs = Math.max(0, paidBs - total);
      // En pagos mixtos, el vuelto se expresa en Bs
      return changeBs;
    }
    if (!amountPaid) return 0;
    const paid = parseFloat(amountPaid);
    let finalTotal = total;
    if (selectedPayment === 'usd') {
      finalTotal = total / exchangeRate;
    }
    return Math.max(0, paid - finalTotal);
  }, [partialPayments, amountPaid, total, selectedPayment, exchangeRate]);

  const processPayment = useCallback(async (paymentsArg?: Array<{ id: string; method: PaymentMethod; amount: number }>) => {
    // Usar la lista de pagos recibida (desktop) o caer al estado global (mobile)
    const payments = paymentsArg && paymentsArg.length > 0 ? paymentsArg : partialPayments;

    console.log('[POS] processPayment called', {
      cartCount: cart.length,
      paymentsCount: payments.length,
      selectedPayment,
      amountPaid,
      total,
    });

    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "El carrito está vacío",
        variant: "destructive",
      });
      return;
    }

    // Validaciones: si usamos pagos parciales, aseguramos que cubran el total
    if (payments.length > 0) {
      const paidBs = payments.reduce((acc, p) => acc + (p.method === 'usd' ? p.amount * exchangeRate : p.amount), 0);
      const paidCents = Math.round(paidBs * 100);
      const totalCents = Math.round(total * 100);
      if (paidCents < totalCents) {
        toast({ title: 'Pago incompleto', description: 'El monto pagado no cubre el total de la venta', variant: 'warning' });
        return;
      }
    } else if (!amountPaid && ['usd', 'bs'].includes(selectedPayment)) {
      toast({
        title: "Error",
        description: "Por favor ingrese el monto recibido",
        variant: "destructive",
      });
      return;
    }

    if (selectedPayment !== 'credito' && !['movil', 'debito'].includes(selectedPayment)) {
      let change: number;
      if (payments.length > 0) {
        const paidBs = payments.reduce(
          (acc, p) => acc + (p.method === 'usd' ? p.amount * exchangeRate : p.amount),
          0
        );
        change = Math.max(0, paidBs - total);
      } else {
        change = calculateChange();
        if (change < 0) {
          toast({
            title: "Error",
            description: "El monto pagado es insuficiente",
            variant: "warning",
          });
          return;
        }
      }

      let changeDescription: string;
      if (payments.length === 0 && selectedPayment === 'usd' && exchangeRate > 0 && change > 0) {
        const changeBs = change * exchangeRate;
        changeDescription = `Vuelto: Bs ${changeBs.toFixed(2)} ( $ ${change.toFixed(2)} )`;
      } else {
        const currencyLabel = payments.length > 0 ? 'Bs' : (selectedPayment === 'usd' ? '$' : 'Bs');
        changeDescription = `Vuelto: ${currencyLabel} ${change.toFixed(2)}`;
      }

      void changeDescription;
    }

    const customer = getSelectedCustomer();
    const effectiveCustomer = customer ?? (!requireCustomer && defaultCustomerId
      ? customers.find(c => String(c.id) === String(defaultCustomerId))
      : undefined);

    if (!effectiveCustomer) {
      console.warn('[POS] processPayment aborted: no customer selected');
      toast({
        title: "Seleccione un cliente",
        description: "Debe seleccionar un cliente antes de procesar el pago.",
        variant: "warning",
      });
      return;
    }

    if (requireCustomer && walkingCustomerId && effectiveCustomer.id === walkingCustomerId) {
      toast({
        title: "Seleccione un cliente",
        description: "Debe seleccionar un cliente real antes de procesar el pago.",
        variant: "warning",
      });
      return;
    }
    const reference = `FACT-${Date.now()}`;

    // Build payload to backend focusing on selected products and selected customer id
    let clientIdNum = Number(effectiveCustomer.id);
    if (!Number.isFinite(clientIdNum)) clientIdNum = 0; // fallback to 0 for generic

    const isCredit = selectedPayment === 'credito';

    const bankMethods: PaymentMethod[] = ['movil', 'debito', 'biopago'];
    const isBankMethod = (m: PaymentMethod) => bankMethods.includes(m);

    const paymentsForBackend = (() => {
      if (isCredit) return [];
      if (payments.length > 0) {
        return payments.map(p => ({
          paymentMethodId: paymentMethodIdMap[p.method] ? paymentMethodIdMap[p.method] : undefined,
          id: p.id,
          accountId: isBankMethod(p.method) ? (defaultBankAccountId ?? undefined) : undefined,
          method: p.method,
          amount: p.amount,
          currency: (p.method === 'usd' ? 'USD' : 'BS') as 'USD' | 'BS'
        }));
      }

      const amount = amountPaid ? parseFloat(amountPaid) : total;
      return [{
        paymentMethodId: paymentMethodIdMap[selectedPayment] ? paymentMethodIdMap[selectedPayment] : undefined,
        accountId: isBankMethod(selectedPayment) ? (defaultBankAccountId ?? undefined) : undefined,
        method: selectedPayment,
        amount,
        currency: (selectedPayment === 'usd' ? 'USD' : 'BS') as 'USD' | 'BS'
      }];
    })();

    const isCharging = paymentsForBackend.length > 0;
    if (isCharging && !canCharge) {
      toast({
        title: 'No autorizado',
        description: 'No tienes permisos para procesar pagos en el POS.',
        variant: 'destructive',
      });
      return;
    }
    const payload = buildInvoicePayload({
      clientId: clientIdNum,
      products: cart.map((i) => ({
        id: i.id,
        name: i.name,
        regularPrice: i.regularPrice,
        inventoryCount: i.inventoryCount,
        unitLabel: i.unitLabel,
        saleType: i.saleType,
        baseUnit: i.baseUnit,
        // slug opcional si está presente en el producto original
        slug: products.find(p => p.id === i.id)?.slug ?? undefined,
      })),
      subTotal: subtotal,
      tax: iva,
      total,
      paymentMethod: payments.length > 0 ? 'bs' : selectedPayment,
      amountPaid: isCredit
        ? 0
        : (payments.length > 0
            ? payments.reduce((acc, p) => acc + (p.method === 'usd' ? p.amount * exchangeRate : p.amount), 0)
            : (amountPaid ? parseFloat(amountPaid) : total)),
      due_date: isCredit ? (creditDueDate || '').slice(0, 10) : undefined,
      payments: paymentsForBackend,
      // Asociar venta a la caja abierta
      arqueo_caja_id: (() => {
        try {
          const raw = localStorage.getItem('caja_id');
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          return parsed ?? null;
        } catch {
          return null;
        }
      })(),
      client: {
        id: clientIdNum,
        name: effectiveCustomer.name,
        document: effectiveCustomer.document ?? null,
        email: null,
        phoneNumber: null,
      },
    });

    try {
      setIsProcessingPayment(true);
      console.log('[POS] createInvoice payload', payload);
      // Send to backend
      const apiResponse = await createInvoice(payload);
      console.log('[POS] createInvoice response', apiResponse);
      // If the invoice was queued (offline), do not show success toast because the server did not confirm.
      let wasQueued = false;
      try {
        const resp = apiResponse as unknown as Record<string, unknown>;
        if (resp && resp['queued']) {
          wasQueued = true;
        }
      } catch (e) {
        // ignore
      }

      if (!wasQueued) {
        toast({
          title: 'Venta Procesada con exito',
          variant: 'success',
        });
      }

      // If this sale came from a draft, mark it as converted
      if (currentDraftId) {
        try {
          await convertDraft(currentDraftId, (apiResponse as any)?.data?.id || null);
          console.log('[POS] Draft converted:', currentDraftId);
          try {
            window.dispatchEvent(new CustomEvent('pos:salesQueueChanged'));
          } catch {
            // ignore
          }
        } catch (draftError) {
          console.error('[POS] Error converting draft:', draftError);
          // Don't fail the sale if draft conversion fails
        }
        setCurrentDraftId(null);
      }

      // Local register accounting tracked via backend cash session

      // Fix type error by correctly typing the items array
      addTransaction({
        date: new Date(),
        type: "sale",
        amount: total,
        description: `Venta a ${effectiveCustomer.name}`,
        paymentMethod: getPaymentMethodText(selectedPayment),
        customer: effectiveCustomer.name,
        items: cart.map(item => ({
          id: item.id, // Add id field to match TransactionItem type
          name: item.name,
          quantity: item.inventoryCount,
          price: item.regularPrice
        })),
        document: effectiveCustomer.document,
        reference: reference,
        registerName: currentCashSession?.branch?.name ?? `Caja #${currentCashSession?.id}`,
        registerId: String(currentCashSession?.id ?? '')
      });

      const paidBsForReceipt = payments.length > 0
        ? payments.reduce((acc, p) => acc + (p.method === 'usd' ? p.amount * exchangeRate : p.amount), 0)
        : (amountPaid ? (selectedPayment === 'usd' ? parseFloat(amountPaid) * exchangeRate : parseFloat(amountPaid)) : total);

      const paymentsForReceipt = payments.length > 0
        ? payments.map(p => ({
            label: getPaymentMethodText(p.method),
            amount: p.amount,
            currency: (p.method === 'usd' ? 'USD' : 'Bs') as 'USD' | 'Bs',
          }))
        : [{
            label: getPaymentMethodText(selectedPayment),
            amount: amountPaid ? parseFloat(amountPaid) : total,
            currency: (selectedPayment === 'usd' ? 'USD' : 'Bs') as 'USD' | 'Bs',
          }];

      const invoiceData: ReceiptData = {
        reference,
        customer: { name: effectiveCustomer.name, document: effectiveCustomer.document ?? null },
        items: cart.map(item => ({
          name: item.name,
          quantity: item.inventoryCount,
          price: item.regularPrice
        })),
        subtotal,
        iva,
        total,
        paymentMethod: payments.length > 0 ? 'Mixto' : getPaymentMethodText(selectedPayment),
        amountPaid: payments.length > 0 ? paidBsForReceipt : (amountPaid ? parseFloat(amountPaid) : total),
        change: payments.length > 0 ? Math.max(0, paidBsForReceipt - total) : calculateChange(),
        exchangeRate,
        currency: payments.length > 0 ? 'Bs' : (selectedPayment === 'usd' ? 'USD' : 'Bs'),
        registerName: currentCashSession?.branch?.name ?? `Caja #${currentCashSession?.id}`,
        cashier: user?.name || user?.username || null,
        date: new Date().toISOString(),
        payments: paymentsForReceipt,
      };

      const invoiceForPrint: Invoice = {
        reference: invoiceData.reference,
        customer: {
          name: invoiceData.customer.name,
          document: invoiceData.customer.document ?? ''
        },
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        iva: invoiceData.iva,
        total: invoiceData.total,
        paymentMethod: invoiceData.paymentMethod,
        amountPaid: invoiceData.amountPaid,
        change: invoiceData.change,
      };

      // Always show receipt preview after sale
      setReceiptData(invoiceData);
      setShowReceipt(true);

      if (autoPrintReceiptEnabled) {
        const printed = await printInvoice(invoiceForPrint);
        void printed;
      }

      // Marcar fin de procesamiento y mostrar toast de éxito ANTES de cerrar el panel
      setIsProcessingPayment(false);
      const finalChange = invoiceData.change || 0;
      let finalDescription: string;
      if (payments.length === 0 && selectedPayment === 'usd' && exchangeRate > 0 && finalChange > 0) {
        const finalChangeBs = finalChange * exchangeRate;
        finalDescription = `Factura ${reference} generada • Total: Bs ${total.toFixed(2)} • Vuelto: Bs ${finalChangeBs.toFixed(2)} ( $ ${finalChange.toFixed(2)} )`;
      } else {
        const changeCurrency = payments.length > 0 ? 'Bs' : (selectedPayment === 'usd' ? '$' : 'Bs');
        finalDescription = `Factura ${reference} generada • Total: Bs ${total.toFixed(2)} • Vuelto: ${changeCurrency} ${finalChange.toFixed(2)}`;
      }
      void finalDescription;

      // Completar flujo: limpiar, cerrar sheet y reiniciar UIs
      processCartPayment();
      // limpiar pagos parciales capturados
      setPartialPayments([]);
      setCreditDueDate('');
      // cerrar panel de pago de escritorio y prepararlo para la próxima venta
      setDesktopPaymentOpen(false);
      // notificar a componentes (CartSection / CartSheetDesktop) que reinicien estados locales
      try { window.dispatchEvent(new CustomEvent('pos:resetPaymentUI')); } catch(e) { /* ignore */ }

      // Clear selected customer after successful sale
      try {
        selectCustomer('');
      } catch (e) {
        // ignore
      }

      // If we are on a mobile device, close the cart sheet so the user returns to the products view
      if (isMobileDevice) {
        window.dispatchEvent(new CustomEvent('pos:closeCartSheet'));
      }

      // El toast de éxito ya fue mostrado antes de cerrar el panel
      // Refrescar listado de productos para mantener stock en tiempo casi real
      try {
        await fetchProducts(1, searchTerm);
      } catch (e) {
        console.error('Error refreshing products after sale:', e);
      }
    } catch (error) {
      console.error("Error processing sale:", error);
      setIsProcessingPayment(false);
      toast({
        title: "Error al procesar la venta",
        description: error instanceof Error ? error.message : "Ocurrió un error al procesar la venta",
        variant: "destructive",
      });
    }
  }, [
    isOpen,
    currentCashSession,
    cart,
    amountPaid,
    selectedPayment,
    toast,
    getPaymentMethodText,
    calculateChange,
    getSelectedCustomer,
    total,
    addTransaction,
    subtotal,
    iva,
    processCartPayment,
    exchangeRate,
    products,
    user,
    isMobileDevice,
    selectCustomer,
    partialPayments,
    creditDueDate,
    requireCustomer,
    walkingCustomerId,
    customers,
    canCharge,
    autoPrintReceiptEnabled
  ]);

  const handleConfirmCredit = useCallback(() => {
    const ymd = (creditDueDate || '').slice(0, 10);
    if (!ymd) {
      toast({ title: 'Fecha inválida', description: 'Selecciona una fecha de vencimiento válida.', variant: 'warning' });
      return;
    }
    setShowCreditDialog(false);
    // Para crédito no se requiere "completar monto". Enviamos la venta al backend
    // inmediatamente después de confirmar el vencimiento.
    setTimeout(() => {
      processPayment([]);
    }, 0);
  }, [creditDueDate, toast, processPayment]);

  const handleCloseRegister = useCallback(() => {
    // Close register is now handled via ModalCierreCaja
    // This callback is kept for compatibility but does nothing
    toast({
      title: "Cierre de caja",
      description: "Usa el modal de cierre de caja para cerrar la sesión.",
      variant: "default",
    });
  }, [toast]);

  const savePendingSale = useCallback(() => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "El carrito está vacío",
        variant: "destructive",
      });
      return;
    }

    // Convert cart items to properly typed objects for PendingSale
    const cartWithInventoryCount = cart.map(item => ({
      id: item.id,
      name: item.name,
      regularPrice: item.regularPrice,
      inventoryCount: item.inventoryCount,
      image: item.image
    }));

    // Persist a snapshot of the customer and current cart/payment state so we
    // can fully restore the sale later.
    const selectedCustObj = getSelectedCustomer();
    const newPendingSale: PendingSale = {
      id: Date.now().toString(),
      cart: cartWithInventoryCount,
      customer: selectedCustObj ? { id: selectedCustObj.id, name: selectedCustObj.name, document: selectedCustObj.document } : selectedCustomer,
      total: total,
      date: new Date().toISOString(),
      selectedPayment: selectedPayment,
      amountPaid: amountPaid,
      exchangeRate: exchangeRate,
      showPaymentUI: showPaymentUI,
    };

    const updatedSales = [...pendingSales, newPendingSale];
    setPendingSales(updatedSales);
    localStorage.setItem('pendingSales', JSON.stringify(updatedSales));

    cart.forEach(item => {
      updateProductStock(item.id, -item.inventoryCount);
    });

    saveCartPendingSale();

    toast({
      title: "¡Venta guardada!",
      description: "La venta se ha guardado para procesar más tarde",
      variant: "success",
    });
    // NOTE: keep the selected customer when saving a pending sale.
    // Previously we cleared the selected customer here which caused the client
    // to be removed after saving a sale as pending. We intentionally preserve
    // the selection so the cashier can continue with the same client.
  }, [cart, toast, pendingSales, selectedCustomer, total, updateProductStock, saveCartPendingSale, selectCustomer, amountPaid, exchangeRate, getSelectedCustomer, selectedPayment, showPaymentUI]);

  // Bridge: handle pending sale save requests from the CartSheet (mobile)
  useEffect(() => {
    const handler = () => savePendingSale();
    window.addEventListener('pos:savePendingSale', handler);
    return () => window.removeEventListener('pos:savePendingSale', handler);
  }, [savePendingSale]);

  const deletePendingSale = useCallback((id: string, clearCustomer: boolean = true) => {
    const updatedSales = pendingSales.filter(sale => sale.id !== id);
    setPendingSales(updatedSales);
    localStorage.setItem('pendingSales', JSON.stringify(updatedSales));

    // Note: do not show toast here so callers (wrappers) can customize messages
    // Optionally clear selected customer. When resuming a pending sale we pass
    // `clearCustomer = false` so the client remains selected for processing and
    // will be recorded in the final sale. Default behavior (true) preserves the
    // previous behavior when user explicitly deletes a pending sale from the UI.
    if (clearCustomer) {
      try {
        selectCustomer('');
      } catch (e) {
        // ignore
      }
    }
  }, [pendingSales, selectCustomer]);

  // Wrapper used by PendingSalesDialog so we can detect origin and vary the toast
  const handlePendingDelete = useCallback((id: string, origin?: string) => {
    // call internal delete (keeps existing clearCustomer default)
    deletePendingSale(id, true);
    // customize message if needed based on origin
    // Show a concise message indicating deletion
    toast({ title: 'Venta eliminada', description: '', variant: 'destructive' });
  }, [deletePendingSale, toast]);

  const resumeSale = useCallback((sale: PendingSale, origin?: string) => {
    const unavailableProducts = sale.cart.filter(item => {
      const product = products.find(p => p.id === item.id);
      return !product || (product.inventoryCount || 0) < (item.inventoryCount || 0);
    });

    if (unavailableProducts.length > 0) {
      toast({
        title: "Error",
        description: "Algunos productos no tienen stock suficiente",
        variant: "destructive",
      });
      return;
    }

    sale.cart.forEach(item => {
      addItemToCart({
        id: item.id,
        name: item.name,
        regularPrice: item.regularPrice,
        stock: item.inventoryCount || 0,
        inventoryCount: item.inventoryCount || 1,
        avgPurchasePrice: 1
      });
    });

    // Ensure customers list contains the customer snapshot saved with the sale
    const custId = typeof sale.customer === 'string' ? sale.customer : sale.customer.id;
    if (typeof sale.customer !== 'string') {
      const savedCust = sale.customer;
      setCustomers(prev => {
        if (prev.some(c => c.id === String(savedCust.id))) return prev;
        return [...prev, { id: String(savedCust.id), name: savedCust.name, document: savedCust.document }];
      });
    }

    // Restore selected customer id
    selectCustomer(String(custId));

    // Restore payment-related UI/state if present in the saved pending
    if (sale.selectedPayment) {
      onPaymentMethodSelect(sale.selectedPayment);
    }
    if (typeof sale.amountPaid === 'string' && sale.amountPaid) {
      setAmountPaid(sale.amountPaid);
    }
    if (sale.exchangeRate) {
      updateExchangeRate(sale.exchangeRate);
    }
    if (sale.showPaymentUI) {
      // ensure payment UI is visible when the saved sale had it
      onPaymentMethodSelect(sale.selectedPayment || 'debito');
    }

    sale.cart.forEach(item => {
      updateProductStock(item.id, item.inventoryCount || 0);
    });

    // Remove the pending entry but keep the selected customer so the resumed
    // sale can be processed and the customer will be saved in the invoice
    deletePendingSale(sale.id, false);

    // Indicate the resumed sale is ready to be processed
    toast({ title: 'Venta lista para ser procesada', description: '', variant: 'success' });
    setShowPendingSalesDialog(false);
  }, [products, toast, addItemToCart, updateProductStock, deletePendingSale, selectCustomer, onPaymentMethodSelect, setAmountPaid, updateExchangeRate]);

  const handleOpenNewRegister = useCallback(() => {
    setShowOpenRegisterModal(true);
  }, []);

  const handleSyncNow = useCallback(async () => {
    try {
      // Try client-side sync first
      const res = await syncPendingInvoices();
      if (res.synced > 0) {
        toast({ title: 'Sincronización', description: `${res.synced} ventas sincronizadas.`, variant: 'success' });
      } else {
        // If nothing synced, try to ask SW to process (background sync or immediate)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'pos:triggerSync' });
        }
        toast({ title: 'Sincronización', description: 'Se intentó sincronizar. Si el navegador lo permite, se procesará en segundo plano.', variant: 'default' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo sincronizar ahora', variant: 'destructive' });
    }
  }, [toast]);

  const handleBarcodeScan = useCallback((barcode: string) => {
    const product = products.find(p => p.id.toString() === barcode);
    if (product) {
      addToCart(product);
      toast({
        title: "Producto agregado",
        description: `Se agregó ${product.name} al carrito`,
        variant: "success",
      });
    } else {
      toast({
        title: "Producto no encontrado",
        description: "No se encontró un producto con ese código de barras",
        variant: "destructive",
      });
    }
  }, [products, addToCart, toast]);

  // Local lock to prevent concurrent loadMore invocations (defense in depth)
  const loadMoreLockRef = useRef(false);

  const loadMoreProducts = useCallback(async () => {
    // If another loadMore is in progress, ignore subsequent calls
    if (loadMoreLockRef.current) return;
    // Nothing to do if no more pages
    if (!hasMore) return;
    // Avoid trying to load more while the main list is loading
    if (productsLoading) return;

    loadMoreLockRef.current = true;
    try {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchProducts(nextPage, searchTerm, selectedCategorySlug);
    } finally {
      loadMoreLockRef.current = false;
    }
  }, [productsLoading, hasMore, page, fetchProducts, searchTerm, selectedCategorySlug]);

  // When category changes, reset pagination and refetch
  useEffect(() => {
    (async () => {
      try {
        setPage(1);
        await fetchProducts(1, searchTerm, selectedCategorySlug);
      } catch {
        // ignore
      }
    })();
  }, [selectedCategorySlug]);

  // ProductGrid handles the intersection observer; Index only provides the loadMoreProducts callback

  const cartSectionRef = useRef<HTMLDivElement | null>(null);
  const productsTopRef = useRef<HTMLDivElement | null>(null);
  const productsSearchFocus = useRef<() => void>(() => {});

  const handleSelectPayment = useCallback((method: PaymentMethod) => {
    onPaymentMethodSelect(method);
    if (isMobileDevice) {
      setTimeout(() => {
        cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } else {
      setDesktopPaymentOpen(true);
    }
  }, [onPaymentMethodSelect, isMobileDevice]);

  // Bridge: when the CartSheet (mobile) requests processing, run our full flow
  useEffect(() => {
    const handler = (ev: Event) => {
      // Avoid duplicate clicks while already processing
      if (!isProcessingPayment) {
        try {
          const custom = ev as CustomEvent;
          const payments = (custom?.detail as { payments?: Array<{ id: string; method: PaymentMethod; amount: number }> } | undefined)?.payments;
          if (Array.isArray(payments) && payments.length > 0) {
            processPayment(payments);
            return;
          }
        } catch (e) {
          // ignore
        }
        processPayment();
      }
    };
    window.addEventListener('pos:processPayment', handler);
    return () => window.removeEventListener('pos:processPayment', handler);
  }, [processPayment, isProcessingPayment]);

  // Listen for global event to open Pending Sales dialog (e.g., mobile button)
  useEffect(() => {
    const openHandler = () => setShowPendingSalesDialog(true);
    window.addEventListener('pos:openPendingSales', openHandler);
    return () => window.removeEventListener('pos:openPendingSales', openHandler);
  }, []);

  // Handle mobile footer scroll events
  useEffect(() => {
    const toProducts = () => {
      productsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const toCart = () => {
      cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('pos:scrollToProducts', toProducts);
    window.addEventListener('pos:scrollToCart', toCart);
    return () => {
      window.removeEventListener('pos:scrollToProducts', toProducts);
      window.removeEventListener('pos:scrollToCart', toCart);
    };
  }, []);

  // If a register is open, keep user on the POS index view
  // Navigation is allowed even if a register is open. The sidebar will warn the user if necessary.

  // Keyboard shortcuts (desktop only). We ignore keypresses when user is typing in inputs or textarea.
  useEffect(() => {
  if (isMobileDevice) return;
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return false;
      const tag = t.tagName.toLowerCase();
      const editable = (t as HTMLElement).isContentEditable;
      return tag === 'input' || tag === 'textarea' || editable;
    };

    const handler = (e: KeyboardEvent) => {
      // Ctrl+F: focus search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('pos:focusSearch'));
        return;
      }
      if (isTyping(e)) return; // ignore rest if user is typing

      // Ctrl+S: save pending
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (cart.length > 0) savePendingSale();
        return;
      }
      // F4: open pending sales
      if (e.key === 'F4') {
        e.preventDefault();
        setShowPendingSalesDialog(true);
        return;
      }
      // If the desktop payment sheet is open, let CartSheetDesktop handle F7/F8/F9
      const isDesktopPaymentOpen = !isMobileDevice && desktopPaymentOpen;

      // F7: select Bs payment (only if cart has items) when sheet is not open
      if (e.key === 'F7' && !isDesktopPaymentOpen) {
        e.preventDefault();
        if (cart.length > 0) onPaymentMethodSelect('bs');
        return;
      }
      // F8: select USD payment (only if cart has items) when sheet is not open
      if (e.key === 'F8' && !isDesktopPaymentOpen) {
        e.preventDefault();
        if (cart.length > 0) onPaymentMethodSelect('usd');
        return;
      }
      // F9: si el panel desktop NO está abierto, procesar pago directamente.
      // Si el panel está abierto, F9 lo maneja CartSheetDesktop (handleSubmitPayment).
      if (e.key === 'F9' && !isDesktopPaymentOpen) {
        e.preventDefault();
        if (cart.length > 0 && selectedCustomer) {
          processPayment();
        }
        return;
      }
      // Esc: cancel payment UI if open
      if (e.key === 'Escape') {
        if (showPaymentUI) {
          e.preventDefault();
          cancelPayment();
        }
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    cart.length,
    selectedCustomer,
    savePendingSale,
    setShowPendingSalesDialog,
    onPaymentMethodSelect,
    processPayment,
    showPaymentUI,
    cancelPayment,
    isMobileDevice,
    desktopPaymentOpen,
  ]);

  return (
    <>
  <div className="min-h-screen bg-gray-100 pb-24 md:pb-0 overflow-hidden md:overflow-y-auto">

        {loadingPosSettings || requireCashSession === null ? (
          <LoadingOverlay show title="Cargando" message="Preparando POS..." />
        ) : requireCashSession && !isOpen ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Bienvenido al Punto de Venta</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Para comenzar a realizar ventas, es necesario abrir la caja registradora.
                Por favor, ingresa el monto inicial para iniciar las operaciones.
              </p>
              <Button
                size="lg"
                onClick={handleOpenNewRegister}
                className="mt-4"
              >
                Abrir Caja
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div ref={productsTopRef} className="scroll-mt-32 md:scroll-mt-24" />
              				<div className="space-y-4">
					<div ref={productsTopRef} className="scroll-mt-32 md:scroll-mt-24" />
					<div className="space-y-4 mt-4">
						<ProductGrid
							products={products}
							searchTerm={searchTerm}
							onSearchChange={setSearchTerm}
							categorySlug={selectedCategorySlug}
							onCategoryChange={setSelectedCategorySlug}
							onProductClick={addToCart}
							allowNegativeStock={allowNegativeStock}
							isLoading={productsLoading}
							onLoadMore={loadMoreProducts}
							hasMore={hasMore}
							pendingCount={pendingSales.length}
							exchangeRate={exchangeRate}
							headerAddon={isMobileDevice ? (
								<div className="px-1">
									{!canCharge ? (
										<Button
											type="button"
											variant="ghost"
											disabled={cart.length === 0}
											onClick={() => {
												try {
													window.dispatchEvent(new CustomEvent('pos:openCartSheet'));
												} catch {
													// ignore
												}
											}}
											className="w-full rounded-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-transparent shadow-sm disabled:opacity-60"
										>
											Enviar a caja
										</Button>
									) : (
										salesQueueCount > 0 && (
											<Button
												type="button"
												variant="ghost"
												onClick={() => setShowSalesQueueModal(true)}
												className="w-full rounded-full px-3 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 border border-emerald-600/20 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30 flex items-center justify-center"
											>
												<ShoppingCart className="w-4 h-4 mr-2" />
												<span className="flex-1 text-center">Ver Cola de Ventas ({salesQueueCount})</span>
											</Button>
										)
									)}
								</div>
							) : undefined}
						/>
					</div>
				</div>
			</div>

            <div className="block scroll-mt-36 md:scroll-mt-24" ref={cartSectionRef}>
              <div className="space-y-4 mt-4">
                <Card className="hidden md:block p-4 rounded-2xl border border-gray-100 shadow-sm bg-white/95">
                  {/* Branch/Warehouse Selector */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <BranchWarehouseSelector />
                  </div>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="h-6 w-6 text-brand-orange" />
                            <h2 className="text-xl font-bold text-slate-900">{t("clientLabel")}</h2>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{t("selectClientPlaceholder")}</p>
                        </div>
                        <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              className="btn-primary-new btn-primary-new-hover flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm border border-transparent hover:brightness-110"
                              onClick={() => setShowNewClientModal(true)}
                            >
                             
                              <span>{t("newClientButton")}</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl shadow-xl">
                            {/* Header replicando ModalAperturaCaja */}
                            <div className="bg-gradient-to-r from-primary to-brand-cyan text-white px-4 py-3 flex items-center justify-between">
                              <DialogTitle className="text-lg font-semibold leading-tight">Agregar Cliente</DialogTitle>
                            
                            </div>
                            {/* Form cuerpo */}
                            <div className="p-5">
                              <div className="space-y-4">
                                <input type="hidden" name="status" value="1" />
                                <div className="space-y-1">
                                  <Label htmlFor="client-name" className="text-sm font-medium text-gray-700">Nombre y apellido</Label>
                                  <Input id="client-name" placeholder="Ej: Juan Pérez" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="focus:ring-2 focus:ring-primary/40" />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="client-doc" className="text-sm font-medium text-gray-700">Cédula</Label>
                                  <Input id="client-doc" placeholder="V-12345678" value={newClientDocument} onChange={(e) => setNewClientDocument(e.target.value)} className="focus:ring-2 focus:ring-primary/40" />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="client-phone" className="text-sm font-medium text-gray-700">Teléfono</Label>
                                  <Input id="client-phone" placeholder="0412-5551234" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="focus:ring-2 focus:ring-primary/40" />
                                </div>
                              </div>
                              {/* Footer acciones */}
                              <div className="mt-6 flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => setShowNewClientModal(false)}
                                  className="px-4 py-2 rounded-full"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  disabled={creatingClient || !newClientName.trim() || !newClientDocument.trim()}
                                  className="px-4 py-2 rounded-full btn-primary-new btn-primary-new-hover border border-transparent"
                                  onClick={async () => {
                                    try {
                                      setCreatingClient(true);
                                      const created = await createClient({
                                        name: newClientName.trim(),
                                        document: newClientDocument.trim(),
                                        phoneNumber: newClientPhone.trim() || undefined,
                                      });
                                      setCustomers((prev) => {
                                        const generic = prev.find((p) => p.slug === 'walking-customer');
                                        const others = prev.filter((p) => p.slug !== 'walking-customer');
                                        const newEntry = {
                                          id: String(created.id ?? created.clientID ?? Date.now()),
                                          name: created.name,
                                          document: created.clientID || created.document || newClientDocument.trim(),
                                        } as Customer;
                                        return generic ? [generic, newEntry, ...others] : [newEntry, ...others];
                                      });
                                      selectCustomer(String(created.id ?? created.clientID ?? ''));
                                      setNewClientName("");
                                      setNewClientDocument("");
                                      setNewClientPhone("");
                                      setShowNewClientModal(false);
                                      toast({ title: "Cliente agregado", description: `${created.name} fue agregado correctamente`, variant: "success" });
                                    } catch (e: unknown) {
                                      const msg = e instanceof Error ? e.message : 'No se pudo crear el cliente';
                                      toast({ title: "Error", description: msg, variant: "destructive" });
                                    } finally {
                                      setCreatingClient(false);
                                    }
                                  }}
                                >
                                  {creatingClient ? (
                                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</span>
                                  ) : (
                                    'Guardar'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <ClientSelector
                        customers={customers}
                        selectedCustomer={selectedCustomer}
                        onSelect={(id) => selectCustomer(id)}
                        onOpenNewClient={() => setShowNewClientModal(true)}
                      />
                      </div>
                    </div>
                  </Card>

                  {!isMobileDevice && (
                    <Card className="p-0 overflow-hidden">
                      <CartSection
                        cart={cart}
                        subtotal={subtotal}
                        iva={iva}
                        total={total}
                        exchangeRate={exchangeRate}
                        selectedPayment={selectedPayment}
                        showPaymentUI={showPaymentUI}
                        amountPaid={amountPaid}
                        onUpdateQuantity={updateQuantity}
                        onRemoveFromCart={removeFromCart}
                        onPaymentMethodSelect={handleSelectPayment}
                        onAmountPaidChange={setAmountPaid}
                        onProcessPayment={processPayment}
                        onCancelPayment={cancelPayment}
                        onSavePendingSale={savePendingSale}
                        pendingCount={pendingSales.length}
                        onOpenPendingSales={() => setShowPendingSalesDialog(true)}
                        disabled={isProcessingPayment}
                        onStartPayment={() => setDesktopPaymentOpen(true)}
                        onSubmitPayments={handleReceivePayments}
                        canCharge={canCharge}
                        salesQueueCount={salesQueueCount}
                        onOpenSalesQueue={() => setShowSalesQueueModal(true)}
                      />
                      {/* Send to Queue button for sellers */}
                      {!canCharge && cart.length > 0 && (
                        <div className="p-4 border-t">
                          <SendToQueueButton
                            cart={cart}
                            clientId={Number(selectedCustomer || 0)}
                            warehouseId={Number(selectedWarehouseId || 0)}
                            branchId={selectedBranchId ? Number(selectedBranchId) : null}
                            disabled={isProcessingPayment}
                            onSuccess={() => {
                              clearCart();
                            }}
                            className="w-full"
                          />
                        </div>
                      )}
                    </Card>
                  )}
              </div>
            </div>
          </div>
        )}

        {showOpenRegisterModal && (
          <ModalAperturaCaja
              onClose={() => setShowOpenRegisterModal(false)}
            />
        )}

        <PendingSalesDialog
          open={showPendingSalesDialog}
          onOpenChange={setShowPendingSalesDialog}
          pendingSales={pendingSales}
          customers={customers}
          onResume={resumeSale}
          onDelete={handlePendingDelete}
        />

        {/* Sales Queue Modal for cashiers */}
        <SalesQueueModal
          open={showSalesQueueModal}
          onOpenChange={setShowSalesQueueModal}
          onDraftLoaded={(draft) => {
            setCurrentDraftId(draft.id);
            // Select the client from the draft
            if (draft.client_id) {
              selectCustomer(String(draft.client_id));
            }
            toast({ title: `Venta #${draft.queue_number} cargada`, description: 'Procesa el pago para completar la venta', variant: 'success' });
          }}
        />

        <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crédito / Fiao</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="creditDueDate">Fecha de vencimiento</Label>
              <Input
                id="creditDueDate"
                type="date"
                value={creditDueDate}
                onChange={(e) => setCreditDueDate(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreditDialog(false);
                  if (selectedPayment === 'credito' && !creditDueDate) {
                    onPaymentMethodSelect('debito');
                  }
                }}
              >Cancelar</Button>
              <Button onClick={handleConfirmCredit}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isProcessingPayment && (
        <LoadingOverlay
          show
          title={t("processingPaymentTitle")}
          message={t("processingPaymentMessage")}
        />
      )}
      {/* Panel de pago para escritorio (multi-método) */}
      {!isMobileDevice && (
        <CartSheetDesktop
          open={desktopPaymentOpen}
          onOpenChange={setDesktopPaymentOpen}
          exchangeRate={exchangeRate}
          onProcessPayment={processPayment}
          disabled={isProcessingPayment}
          onSubmitPayments={handleReceivePayments}
          registerName={
            currentCashSession?.branch?.name ??
            (currentCashSession?.id ? `Caja #${currentCashSession.id}` : null)
          }
          userName={user?.name || user?.username || null}
          customerName={customers.find(c => c.id === selectedCustomer)?.name || null}
          pendingCount={pendingSales.length}
          isOnline={true}
          onOpenPendingSales={() => setShowPendingSalesDialog(true)}
          onSavePendingSale={savePendingSale}
          onCancelPayment={cancelPayment}
          onSelectPaymentUSD={() => handleSelectPayment('usd')}
          onSelectPaymentBS={() => handleSelectPayment('bs')}
          onFocusSearch={() => {
            // Dispatch a custom event for ProductGrid to focus its search input
            window.dispatchEvent(new CustomEvent('pos:focusSearch'));
          }}
          canProcess={cart.length > 0 && !!selectedCustomer}
          canSavePending={cart.length > 0}
        />
      )}
      {/* Mobile footer removed (restored previous UI) */}
      {showReceipt && receiptData && (
        <ReceiptPreviewModal
          open={showReceipt}
          onOpenChange={setShowReceipt}
          data={receiptData}
        />
      )}
    </>
  );
};

export default Index;
