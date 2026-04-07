import React from 'react'
import { createRoot } from 'react-dom/client'
import ClosureReceipt, { ClosureReceiptProps } from '@/components/receipt/ClosureReceipt'
import { receiptStyles } from '@/components/receipt/Receipt'

export interface PrintDailyOptions extends ClosureReceiptProps {
  // optional metadata overrides
  closureNumber?: string
  shift?: string
  cashier?: string
}

export function printDailyClosure(props: PrintDailyOptions) {
  try {
    const w = window.open('', 'PRINT_CLOSURE', 'width=400,height=800')
    if (!w) return false
    w.document.write('<!doctype html><html><head><meta charset="utf-8"/>')
  w.document.write(`<style>${receiptStyles}</style>`)
    w.document.write('</head><body><div id="app"></div></body></html>')
    w.document.close()

    const container = w.document.getElementById('app')
    if (!container) return false
    const root = createRoot(container)
    root.render(
      <ClosureReceipt
        company={props.company}
        report={props.report}
        closureNumber={props.closureNumber}
        shift={props.shift}
        cashier={props.cashier}
      />
    )

    setTimeout(() => {
      w.focus()
      w.print()
      w.close()
    }, 250)
    return true
  } catch (e) {
    console.error('printDailyClosure error', e)
    return false
  }
}

export default printDailyClosure
