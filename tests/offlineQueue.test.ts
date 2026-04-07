/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { enqueueInvoice, getAllPending, deletePending } from '../src/lib/offlineQueue';

describe('offlineQueue', () => {
  it('should enqueue and retrieve pending invoices', async () => {
    const payload = { clientId: 1, invoiceTotal: 100 } as Record<string, unknown>;
    const item = await enqueueInvoice(payload);
    expect(item).toHaveProperty('id');

    const list = await getAllPending();
    expect(Array.isArray(list)).toBeTruthy();
    expect(list.find(l => l.id === item.id)).toBeTruthy();

    await deletePending(item.id);
    const after = await getAllPending();
    expect(after.find(l => l.id === item.id)).toBeFalsy();
  });
});
