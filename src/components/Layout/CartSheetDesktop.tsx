import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditCard, X, DollarSign, Phone, Loader2, Plus, Minus, Wallet, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Percent } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchAllPaymentMethods, normalizePaymentMethods } from '@/services/paymentMethods';
import DesktopStatusBar from "./DesktopStatusBar";
import { usePosT } from '@/i18n/pos';
import type { PaymentMethod } from '@/contexts/CartContext';

interface CartSheetDesktopProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchangeRate: number;
  onProcessPayment: (payments?: Array<{ id: string; method: PaymentMethod; amount: number }>) => void;
  disabled?: boolean;
  onSubmitPayments?: (payments: Array<{ id: string; method: PaymentMethod; amount: number }>) => void;
  // Props to show DesktopStatusBar in payment context
  registerName?: string | null;
  userName?: string | null;
  customerName?: string | null;
  pendingCount?: number;
  isOnline?: boolean;
  onOpenPendingSales?: () => void;
  onSavePendingSale?: () => void;
  onCancelPayment?: () => void;
  onSelectPaymentUSD?: () => void;
  onSelectPaymentBS?: () => void;
  onSelectPaymentMovil?: () => void;
  onSelectPaymentBiopago?: () => void;
   onSelectPaymentDebito?: () => void;
  onFocusSearch?: () => void;
  canProcess?: boolean;
  canSavePending?: boolean;
}

// Light duplication of methodUI building; can be refactored later to shared util
const normalizeMethods = (methods: { code: string; id: string|number; name: string }[]) => {
  return methods.map((m) => {
    const code = m.code.toLowerCase();
    let bg = 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200';
    let icon: React.ReactNode = <CreditCard className="mr-2" />;
    let selectCode: PaymentMethod = 'debito';
    if (/(usd|dola)/.test(code)) { bg = 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200'; icon = <DollarSign className="mr-2" />; selectCode = 'usd'; }
    else if (/(bs|bolivar|bolívar)/.test(code)) { bg = 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200'; icon = null; selectCode = 'bs'; }
    else if (/(movil|móvil|pago-movil|pago_movil|pagomovil)/.test(code)) { bg = 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200'; icon = <Phone className="mr-2" />; selectCode = 'movil'; }
    else if (/(debito|débito|tarjeta|pos|tdc|tdd|card)/.test(code)) { bg = 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'; icon = <CreditCard className="mr-2" />; selectCode = 'debito'; }
    else if (/(credito|crédito|fiao)/.test(code)) { bg = 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200'; icon = <CreditCard className="mr-2" />; selectCode = 'credito'; }
    else if (/(biopago|bio\s*pago)/.test(code)) { bg = 'bg-teal-100 hover:bg-teal-200 text-teal-800 border border-teal-200'; icon = <CreditCard className="mr-2" />; selectCode = 'biopago'; }
    return { ...m, bg, icon, selectCode };
  });
};

export const CartSheetDesktop: React.FC<CartSheetDesktopProps> = ({
  open,
  onOpenChange,
  exchangeRate,
  onProcessPayment,
  disabled,
  onSubmitPayments,
  registerName,
  userName,
  customerName,
  pendingCount = 0,
  isOnline = true,
  onOpenPendingSales,
  onSavePendingSale,
  onCancelPayment,
  onSelectPaymentUSD,
  onSelectPaymentBS,
  onSelectPaymentMovil,
  onSelectPaymentBiopago,
  onSelectPaymentDebito,
  onFocusSearch,
  canProcess = true,
  canSavePending = true,
}) => {
  const cartCtx = useCart();
  const { cart, subtotal, iva, total, updateQuantity, removeFromCart } = cartCtx;
  const t = usePosT();

  // Guard: if the cart is empty, block payment interactions and auto-close
  const isCartEmpty = cart.length === 0;
  useEffect(() => {
    if (open && isCartEmpty) {
      // Auto-close when the last product is removed
      onOpenChange(false);
    }
  }, [open, isCartEmpty, onOpenChange]);

  // Métodos de pago desde API (igual que CartSection)
  const [methods, setMethods] = useState<{ id: string|number; name: string; code: string }[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  useEffect(() => {
    let mounted = true;
    setLoadingMethods(true);
    fetchAllPaymentMethods()
      .then(items => { if (!mounted) return; setMethods(normalizePaymentMethods(items)); })
      .catch(() => { if (mounted) setMethods([]); })
      .finally(() => { if (mounted) setLoadingMethods(false); });
    return () => { mounted = false; };
  }, []);
  const methodUI = useMemo(() => normalizeMethods(methods), [methods]);

  // Multi-payment state
  type PartialPaymentMethod = Exclude<PaymentMethod, 'credito'>;
  interface PartialPayment { id: string; method: PartialPaymentMethod; amount: number }
  const [partials, setPartials] = useState<PartialPayment[]>([]);
  const [currentMethod, setCurrentMethod] = useState<PartialPayment['method'] | null>(null);
  const [currentAmount, setCurrentAmount] = useState('');
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const totalPaidBs = useMemo(() => partials.reduce((acc,p)=> acc + (p.method==='usd' ? p.amount*exchangeRate : p.amount),0), [partials, exchangeRate]);
  const totalCents = useMemo(() => Math.round(total * 100), [total]);
  const paidCents = useMemo(() => Math.round(totalPaidBs * 100), [totalPaidBs]);
  const remainingBs = Math.max(0, (totalCents - paidCents) / 100);
  const remainingUsd = exchangeRate > 0 ? remainingBs / exchangeRate : 0;
  const canFinalize = paidCents >= totalCents && partials.length > 0;
  const changeBs = Math.max(0, (paidCents - totalCents) / 100);
  const footerCanProcess = canFinalize && !disabled && !isCartEmpty;
  const footerCanSavePending = !isCartEmpty && canSavePending;

  const addPartial = useCallback(()=>{
    if (isCartEmpty) return; // do not allow payments without products
    if(!currentMethod) return; const amt = parseFloat(currentAmount); if(!amt || amt<=0) return;
    setPartials(prev=>[...prev,{ id: Date.now().toString(), method: currentMethod, amount: amt }]);
    setCurrentAmount(''); setCurrentMethod(null);
  },[currentMethod,currentAmount,isCartEmpty]);

  const fillRemainingAmount = useCallback(() => {
    if (isCartEmpty || !currentMethod) return;
    let value = 0;
    if (currentMethod === 'usd') {
      value = remainingUsd;
    } else {
      value = remainingBs;
    }
    if (!Number.isFinite(value) || value <= 0) return;
    setCurrentAmount(value.toFixed(2));
  }, [isCartEmpty, currentMethod, remainingUsd, remainingBs]);

  const payFull = useCallback(() => {
    if (isCartEmpty || !currentMethod) return;
    let value = 0;
    if (currentMethod === 'usd') {
      value = remainingUsd;
    } else {
      value = remainingBs;
    }
    if (!Number.isFinite(value) || value <= 0) return;

    // Add the remaining amount as a payment immediately
    setPartials(prev => [...prev, { id: Date.now().toString(), method: currentMethod, amount: value }]);
    setCurrentAmount('');
    setCurrentMethod(null);
  }, [isCartEmpty, currentMethod, remainingUsd, remainingBs]);

  const removePartial = useCallback((id:string)=> setPartials(prev=>prev.filter(p=>p.id!==id)),[]);

  const handleSubmitPayment = useCallback(() => {
    if (!footerCanProcess || isCartEmpty) return;
    
    console.log('[CartSheetDesktop] handleSubmitPayment called', {
      partialsCount: partials.length,
      total,
      footerCanProcess,
    });

    if (onSubmitPayments) {
      onSubmitPayments(partials);
    }
    onProcessPayment(partials);
  }, [onSubmitPayments, partials, onProcessPayment, total, footerCanProcess, isCartEmpty]);

  // Reset internal state solo cuando el panel se cierra y el carrito quedó vacío.
  // Si hay productos, preservamos el método y los pagos para que el usuario
  // pueda retomar donde estaba si cierra el sheet por accidente.
  useEffect(() => {
    if (!open && isCartEmpty) {
      setPartials([]);
      setCurrentMethod(null);
      setCurrentAmount('');
    }
  }, [open, isCartEmpty]);

  // Also respond to global reset event (after successful payment) to ensure fresh state
  useEffect(() => {
    const handler = () => {
      setPartials([]);
      setCurrentMethod(null);
      setCurrentAmount('');
    };
    window.addEventListener('pos:resetPaymentUI', handler);
    return () => window.removeEventListener('pos:resetPaymentUI', handler);
  }, []);

  // Keyboard shortcuts scoped to the desktop payment sheet
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return false;
      const tag = t.tagName.toLowerCase();
      const editable = (t as HTMLElement).isContentEditable;
      const isTextField = tag === 'input' || tag === 'textarea' || editable;
      // Permitimos teclas de función aunque el foco esté en un campo de texto
      if (isTextField && /^F\d+$/.test(e.key)) return false;
      return isTextField;
    };

    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      const typing = isTyping(e);
      console.log('[CartSheetDesktop] keydown', {
        key: e.key,
        typing,
        open,
        isCartEmpty,
        footerCanProcess,
        currentMethod,
        currentAmount,
      });

      // Atajos de teclado; dejamos el Enter del input de monto para agregar pagos parciales
      if (typing) return;

      // Enter: procesar pago cuando se puede (por ejemplo, desde la barra de estado o fuera del input)
      if (e.key === 'Enter' || e.key === 'NumpadEnter') {
        if (footerCanProcess) {
          e.preventDefault();
          handleSubmitPayment();
        }
        return;
      }

      // F5/F8: seleccionar Débito en el panel desktop
      if (e.key === 'F5' || e.key === 'F8') {
        e.preventDefault();
        if (!isCartEmpty) {
          setCurrentMethod('debito');
          setTimeout(() => {
            amountInputRef.current?.focus();
          }, 0);
        }
        return;
      }

      // F6: seleccionar Pago Móvil en el panel desktop
      if (e.key === 'F6') {
        e.preventDefault();
        if (!isCartEmpty) {
          setCurrentMethod('movil');
          setTimeout(() => {
            amountInputRef.current?.focus();
          }, 0);
        }
        return;
      }

      // F2: seleccionar Bs en el panel desktop
      if (e.key === 'F2') {
        e.preventDefault();
        if (!isCartEmpty) {
          setCurrentMethod('bs');
          setTimeout(() => {
            amountInputRef.current?.focus();
          }, 0);
        }
        return;
      }

      // F3: seleccionar USD en el panel desktop
      if (e.key === 'F3') {
        e.preventDefault();
        if (!isCartEmpty) {
          setCurrentMethod('usd');
          setTimeout(() => {
            amountInputRef.current?.focus();
          }, 0);
        }
        return;
      }

      // F9: procesar pago desde el panel desktop
      if (e.key === 'F9') {
        e.preventDefault();
        if (footerCanProcess) {
          handleSubmitPayment();
        }
        return;
      }

      // F4: rellenar monto restante (Pay full)
      if (e.key === 'F4') {
        e.preventDefault();
        if (!isCartEmpty) {
          payFull();
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, isCartEmpty, footerCanProcess, handleSubmitPayment, payFull, currentAmount, currentMethod]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cart-sheet-desktop"
          className="fixed inset-0 z-[200] flex items-stretch justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Backdrop */}
          <motion.div
            key="cart-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar panel"
          />
          {/* Panel */}
          <motion.div
            key="cart-sheet-panel"
            initial={{ x: 56, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 56, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.9 }}
            className="relative h-full w-full max-w-3xl bg-white dark:bg-neutral-900 shadow-xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Panel de pago"
          >
          {/* Close button (top-right) */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-black/5 absolute right-3 top-3 z-10 text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            aria-label={t('close')}
            title={t('close')}
          >
            <X className="h-5 w-5" />
          </button>
          {/* Header minimalista con tarjeta métrica (oculto por solicitud) */}
          <div className="hidden p-4 border-b bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div
              className={`relative mx-auto max-w-3xl overflow-hidden rounded-2xl border shadow-sm p-4 md:p-5 transition-colors
                ${canFinalize
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100'
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-100'}`}
            >
              {/* patrón de puntos */}
              <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(theme(colors.white)/.7_1px,transparent_1px)] [background-size:12px_12px]" />

              <div className="relative flex items-center justify-between gap-4">
                {/* Pill resumen */}
                <div
                  className={`inline-flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 font-semibold text-white text-sm md:text-base shadow-sm
                    ${canFinalize
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 ring-1 ring-emerald-400/40'
                      : 'bg-gradient-to-r from-[#f97316] to-[#ea580c] ring-1 ring-orange-400/40'}`}
                  aria-label="Resumen de pago"
                >
                  <Wallet className="w-4 h-4 opacity-90" />
                  <span className="whitespace-nowrap">{t('paidLabel')} Bs {totalPaidBs.toFixed(2)}</span>
                  {remainingBs > 0 && (
                    <span className="whitespace-nowrap opacity-90 inline-flex items-center gap-1"><ArrowDownToLine className="w-4 h-4" /> {t('remainingLabel')} Bs {remainingBs.toFixed(2)}</span>
                  )}
                  {changeBs > 0 && (
                    <span className="whitespace-nowrap text-emerald-200 inline-flex items-center gap-1"><ArrowUpFromLine className="w-4 h-4" /> {t('changeLabel')} Bs {changeBs.toFixed(2)}</span>
                  )}
                  {exchangeRate > 0 && remainingBs > 0 && (
                    <span className="whitespace-nowrap opacity-90">( $ {remainingUsd.toFixed(2)} )</span>
                  )}
                  {canFinalize && remainingBs <= 0 && changeBs === 0 && (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-emerald-100"><CheckCircle2 className="w-4 h-4" /> {t('readyLabel')}</span>
                  )}
                </div>

                {/* Porcentaje */}
                <div className="text-right">
                  <div className="text-xs text-gray-600 dark:text-gray-300">{t('progressLabel')}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{Math.min(100, total>0 ? (totalPaidBs/total)*100 : 0).toFixed(0)}%</div>
                </div>
              </div>

              {/* Sparkline y progreso */}
              <div className="relative mt-3">
                <div className="relative h-10">
                  <svg viewBox="0 0 100 24" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <path d="M0,18 C15,22 25,10 40,14 C55,18 70,8 85,12 C92,14 100,10 100,10" fill="none" stroke={canFinalize ? '#10b981' : '#f4ac78ff'} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              
              </div>

              {/* Cerrar */}
              {/* <button onClick={()=>onOpenChange(false)} className="p-2 rounded-md hover:bg-black/5 absolute right-3 top-3" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button> */}
            </div>
          </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          {/* Left: Items & Summary */}
          <div className="flex flex-col border-r overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-4">
                <div className="sticky top-0 z-10 -mx-4 px-4 py-2 text-[12px] uppercase tracking-wide font-bold text-gray-700 bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/40 border-b border-gray-200 dark:border-neutral-800">
                  <span>
                    {t('productsTitle')} (
                    {cart.reduce((sum, it) => {
                      const step = (it as any).step;
                      const isBulk = typeof step === 'number' && step !== 1;
                      const qty = typeof (it as any).inventoryCount === 'number' ? (it as any).inventoryCount : 1;
                      return sum + (isBulk ? 1 : qty);
                    }, 0)}
                    )
                  </span>
                </div>
                {cart.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      {cart.map(item => {
                        const step: number = typeof (item as { step?: number }).step === 'number' && (item as { step?: number }).step! > 0
                          ? (item as { step?: number }).step!
                          : 1;
                        const canDecrease = item.inventoryCount > step;
                        return (
                          <tr key={item.id} className="align-middle">
                            <td className="py-2 pr-2 w-full">
                              <div className="font-medium truncate">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.unitLabel||''}</div>
                            </td>
                            <td className="py-2 text-right whitespace-nowrap">Bs {(item.regularPrice).toFixed(2)}</td>
                            <td className="py-2 text-center whitespace-nowrap pl-1 ">
                              <div className="inline-flex items-center gap-1">
                                {canDecrease ? (
                                  <Button
                                    size="icon"
                                    onClick={()=> updateQuantity(item.id,false)}
                                    aria-label="Disminuir"
                                    className="btn-gradient-orange h-6 w-6 rounded-full p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="icon"
                                    onClick={()=> removeFromCart(item.id)}
                                    aria-label="Eliminar"
                                    variant="ghost"
                                    className="btn-red-new btn-red-new-hover h-6 w-6 rounded-full p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                                <span className="text-xs w-6 text-center">{item.inventoryCount}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={()=> updateQuantity(item.id,true)}
                                  aria-label="Aumentar"
                                  className="btn-primary-old btn-primary-new-hover h-6 w-6 rounded-full p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-sm text-gray-500 py-10">{t('cartEmptyCompact')}</div>
                )}
              </div>
            </ScrollArea>
            <div className="p-3 border-t bg-white/60 dark:bg-neutral-900/50">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{t('subtotalMetric')}</span>
                  <span>Bs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>{t('taxMetric')}</span>
                  <span>Bs {iva.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span>{t('totalMetric')}</span>
                  <span>
                    Bs {total.toFixed(2)}
                    {exchangeRate ? (
                      <span className="ml-2 text-xs text-gray-500">{t('usdRef')} $ {(total / exchangeRate).toFixed(2)}</span>
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Multi-payment */}
            <div className="flex flex-col overflow-hidden">
              <div className="p-4 space-y-4 overflow-auto">
                {/* Compact Remaining Summary (no card) */}
                <div className="text-center">
                  <div className="text-[35px] font-extrabold text-gray-900">
                    {t('totalMetric')} {t('remainingLabel')}
                  </div>
                  <div className="mt-1 text-[30px] font-extrabold text-gray-900">
                    Bs {remainingBs.toFixed(2)}
                    {exchangeRate > 0 && (
                      <span className="ml-2">/ $ {remainingUsd.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">{t('selectMethod')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {loadingMethods && (
                      <div className="col-span-2 text-center text-xs text-gray-500 py-2">{t('loadingMethods')}</div>
                    )}
                    {!loadingMethods && methodUI.length === 0 && (
                      <div className="col-span-2 text-center text-xs text-gray-500 py-2">{t('noMethods')}</div>
                    )}
                    {!loadingMethods && methodUI.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={()=> {
                          if (!isCartEmpty) {
                            if (m.selectCode === 'credito') {
                              cartCtx.onPaymentMethodSelect('credito');
                              return;
                            }
                            setCurrentMethod(m.selectCode as PartialPaymentMethod);
                            setTimeout(() => { amountInputRef.current?.focus(); }, 0);
                          }
                        }}
                        disabled={isCartEmpty}
                        className={`flex flex-col items-center justify-center w-full h-24 bg-white border rounded-xl shadow-md p-2 transition-all duration-150 cursor-pointer select-none
                          ${currentMethod===m.selectCode ? 'ring-2 ring-[#1B91BF]/70 border-[#1B91BF]' : 'border-gray-200'}
                          ${isCartEmpty ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:border-[#1B91BF]/60'}
                        `}
                        style={{ minHeight: '96px' }}
                      >
                        <span className="mb-2 flex items-center justify-center">
                          {m.selectCode === 'usd' && <DollarSign className="w-7 h-7 text-blue-500" />}
                          {m.selectCode === 'bs' && <Wallet className="w-7 h-7 text-green-500" />}
                          {m.selectCode === 'debito' && <CreditCard className="w-7 h-7 text-gray-500" />}
                          {m.selectCode === 'movil' && <Phone className="w-7 h-7 text-purple-500" />}
                          {m.selectCode === 'credito' && <CreditCard className="w-7 h-7 text-amber-700" />}
                          {m.selectCode === 'biopago' && <CreditCard className="w-7 h-7 text-teal-700" />}
                        </span>
                        <span className="text-sm font-semibold text-gray-700 text-center">
                          {m.selectCode === 'usd'
                            ? t('paymentMethodUsd')
                            : m.selectCode === 'bs'
                            ? t('paymentMethodBs')
                            : m.selectCode === 'debito'
                            ? t('paymentMethodDebit')
                            : m.selectCode === 'movil'
                            ? t('paymentMethodMovil')
                            : m.selectCode === 'credito'
                            ? 'Crédito'
                            : m.selectCode === 'biopago'
                            ? 'Biopago'
                            : m.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {currentMethod && !isCartEmpty && (
                  <div className="space-y-4 p-4 rounded-xl bg-white/80 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-gray-700 flex-1">{t('amountInLabel')} {currentMethod==='usd' ? 'USD' : 'Bs'}:</p>
                      <Input
                        ref={amountInputRef}
                        type="number"
                        value={currentAmount}
                        onChange={e=> setCurrentAmount(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                            e.preventDefault();
                            if (!isCartEmpty && currentMethod && currentAmount) {
                              addPartial();
                            }
                          }
                        }}
                        placeholder={currentMethod==='usd' ? t('amountExampleUsd') : t('amountExampleBs')}
                        className="w-32 border border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-[#1B91BF]/40 focus-visible:border-[#1B91BF]/70"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={addPartial}
                        disabled={!currentAmount || isCartEmpty}
                        className="flex-1 rounded-xl btn-orange-new btn-orange-new-hover border border-transparent disabled:opacity-60 disabled:cursor-not-allowed py-2 text-base"
                      >
                        {t('add')}
                      </Button>
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={payFull}
                        disabled={isCartEmpty || (remainingBs <= 0 && remainingUsd <= 0)}
                        className="flex-1 rounded-xl btn-primary-new btn-primary-new-hover border border-transparent text-base font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed py-2"
                      >
                        {t('fillRemaining')}
                      </Button>
                    </div>
                  </div>
                )}
                {partials.length>0 && (
                  <div className="space-y-3 p-4 rounded-xl bg-white/80 shadow-sm border border-gray-100">
                    <h4 className="text-base font-bold text-gray-700 mb-2">{t('paymentsHeading')}</h4>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-brand-orange">
                      {partials.map(p => (
                        <div key={p.id} className="px-3 py-1 rounded-full text-sm flex items-center gap-2 border font-bold bg-orange-50 border-orange-200 text-orange-700 shadow-sm">
                          <span>{p.method.toUpperCase()} {p.method==='usd' ? '$' : 'Bs'} {p.amount.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={()=> removePartial(p.id)}
                            className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-orange-600 border border-orange-200 hover:bg-orange-500 hover:text-white transition-colors"
                            aria-label="Eliminar pago"
                          >×</button>
                        </div>
                      ))}
                    </div>
                    {changeBs > 0 && (
                      <div className="text-sm font-semibold text-emerald-700">
                        Vuelto: Bs {changeBs.toFixed(2)}
                        {exchangeRate > 0 && (
                          <span> ( $ {(changeBs / exchangeRate).toFixed(2)} )</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-6 border-t bg-white/90 space-y-4 rounded-b-2xl shadow-lg">
                <Button
                  variant="ghost"
                  disabled={!canFinalize || disabled || isCartEmpty}
                  onClick={handleSubmitPayment}
                  className="btn-primary-new btn-primary-new-hover w-full py-4 rounded-3xl border border-transparent flex items-center justify-center gap-3 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B91BF]/30 disabled:opacity-60 disabled:cursor-not-allowed text-lg font-bold"
                >
                  {disabled ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                  {canFinalize ? t('processPayment') : t('completeAmount')}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop status bar scoped to the payment sheet (desktop only) */}
          <div className="hidden lg:block w-full">
            <DesktopStatusBar
              registerName={registerName}
              userName={userName}
              customerName={customerName}
              exchangeRate={exchangeRate}
              isOnline={isOnline}
              pendingCount={pendingCount}
              onOpenPendingSales={onOpenPendingSales || (() => {})}
              onSavePendingSale={onSavePendingSale || (() => {})}
              onProcessPayment={handleSubmitPayment}
              onCancelPayment={onCancelPayment || (() => onOpenChange(false))}
              onSelectPaymentUSD={() => { if (!isCartEmpty) setCurrentMethod('usd'); }}
              onSelectPaymentBS={() => { if (!isCartEmpty) setCurrentMethod('bs'); }}
              onSelectPaymentMovil={() => { if (!isCartEmpty) setCurrentMethod('movil'); }}
              onSelectPaymentBiopago={() => { if (!isCartEmpty) setCurrentMethod('debito'); }}
              onSelectPaymentDebito={() => { if (!isCartEmpty) setCurrentMethod('debito'); }}
              onPayFull={() => { if (!isCartEmpty) payFull(); }}
              onFocusSearch={onFocusSearch || (() => {})}
              canProcess={footerCanProcess}
              canSavePending={footerCanSavePending}
              variant="embedded"
            />
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

CartSheetDesktop.displayName = 'CartSheetDesktop';
