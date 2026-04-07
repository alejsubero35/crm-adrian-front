import React from 'react'
import { createRoot } from 'react-dom/client'
import { Receipt, receiptStyles, ReceiptProps } from '../components/receipt/Receipt'

export function printInvoice(data: ReceiptProps["invoice"], company?: ReceiptProps["company"]) {
  try {
    const w = window.open('', 'PRINT', 'width=400,height=600')
    if (!w) return false
    // Write minimal HTML with styles
    w.document.write('<!doctype html><html><head><meta charset="utf-8"/>')
    w.document.write(`<style>${receiptStyles}</style>`)
    w.document.write('</head><body><div id="app"></div></body></html>')
    w.document.close()

    const container = w.document.getElementById('app')
    if (!container) return false
    const root = createRoot(container)
    root.render(<Receipt company={company} invoice={data} />)

    // Give it a tick to render
    setTimeout(() => {
      w.focus()
      w.print()
      w.close()
    }, 250)
    return true
  } catch {
    return false
  }
}
