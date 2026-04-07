
import React, { memo, useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { CartSection } from "../pos/CartSection";
import { useCart } from "@/contexts/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ShoppingCart } from 'lucide-react';
import { usePosT } from '@/i18n/pos';
import { usePosLocation } from "@/contexts/PosLocationContext";
import { SendToQueueButton } from "@/components/pos/SendToQueueButton";

export const CartSheet = memo(() => {
  const cart = useCart();
  const t = usePosT();
  const { selectedWarehouseId, selectedBranchId } = usePosLocation();
  const [canCharge, setCanCharge] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('pos:canCharge');
      if (raw == null) return true;
      const parsed = JSON.parse(raw);
      return typeof parsed === 'boolean' ? parsed : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<{ canCharge?: boolean }>).detail;
      if (typeof detail?.canCharge === 'boolean') setCanCharge(detail.canCharge);
    };
    window.addEventListener('pos:canChargeChanged', handler as EventListener);
    return () => window.removeEventListener('pos:canChargeChanged', handler as EventListener);
  }, []);

  const selectedCustomerId = (() => {
    try {
      return localStorage.getItem('pos:selectedCustomer') || '';
    } catch {
      return '';
    }
  })();

  const handleClose = () => {
    try {
      window.dispatchEvent(new CustomEvent('pos:closeCartSheet'));
    } catch (e) {
      // ignore
    }
  };

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="flex flex-col h-full overflow-hidden bg-white rounded-t-2xl shadow-lg"
    >
      {/* Drag handle */}
      <div className="w-full flex justify-center">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full my-3" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-md text-brand-orange">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t('cartSheetTitle')}</h3>
            <p className="text-xs text-gray-500">{cart.cart.length} {t('cartSheetItemsLabel')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-500">{t('cartSheetTotalLabel')}</div>
            <div className="text-base font-semibold">Bs {cart.total.toFixed(2)}</div>
          </div>
          <button onClick={handleClose} aria-label={t('close')} className="p-2 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <CartSection
          cart={cart.cart.map(item => ({
            ...item,
            inventoryCount: item.inventoryCount
          }))}
          subtotal={cart.subtotal}
          iva={cart.iva}
          total={cart.total}
          exchangeRate={cart.exchangeRate}
          selectedPayment={cart.selectedPayment}
          showPaymentUI={cart.showPaymentUI}
          amountPaid={cart.amountPaid}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveFromCart={cart.removeFromCart}
          onPaymentMethodSelect={cart.onPaymentMethodSelect}
          onAmountPaidChange={cart.setAmountPaid}
          onProcessPayment={(payments) => {
            // Ensure mobile sheet triggers the same full payment flow as the page
            // and propagate optional multi-payments payload.
            window.dispatchEvent(new CustomEvent('pos:processPayment', { detail: { payments } }));
          }}
          onCancelPayment={cart.cancelPayment}
          onSavePendingSale={() => {
            window.dispatchEvent(new CustomEvent('pos:savePendingSale'));
          }}
          canCharge={canCharge}
        />
      </div>

      {!canCharge && cart.cart.length > 0 && (
        <div className="p-4 border-t bg-white">
          <SendToQueueButton
            cart={cart.cart}
            clientId={Number(selectedCustomerId || 0)}
            warehouseId={Number(selectedWarehouseId || 0)}
            branchId={selectedBranchId ? Number(selectedBranchId) : null}
            onSuccess={() => {
              cart.clearCart();
              handleClose();
            }}
            className="w-full"
          />
        </div>
      )}
  </motion.div>
  );
});

CartSheet.displayName = "CartSheet";
