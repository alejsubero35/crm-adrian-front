import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Printer, Plus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { hvacService } from '@/services/hvac.service';
import type { QrBatch, QrItem } from '@/types/hvac';
import { qrBatchSchema, type QrBatchFormData } from '@/validations/hvac.schema';
import Can from '@/components/Can';

export default function QrGeneratorPage() {
  const { toast } = useToast();
  const [qrs, setQrs] = useState<QrItem[]>([]);
  const [batches, setBatches] = useState<QrBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [markingPrinted, setMarkingPrinted] = useState(false);

  const form = useForm<QrBatchFormData>({
    resolver: zodResolver(qrBatchSchema),
    defaultValues: { quantity: 50 },
  });

  const generatedCount = useMemo(() => qrs.length, [qrs]);
  const selectedBatch = useMemo(
    () => batches.find((batch) => String(batch.id) === selectedBatchId) ?? null,
    [batches, selectedBatchId]
  );
  const selectedBatchPrinted = !!selectedBatch?.printed_at;

  const buildQrUrl = (uuid: string) => `${window.location.origin}/scan/${uuid}`;

  const formatBatchLabel = (batch: QrBatch): string => {
    const created = batch.created_at
      ? new Date(batch.created_at).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Sin fecha';
    const count = batch.qrs_count || batch.quantity;
    return `Lote #${batch.id} · ${count} etiquetas · ${created}`;
  };

  const loadQrsForBatch = async (batchId: number) => {
    const batchQrs = await hvacService.getQrsByBatch(batchId);
    setQrs(batchQrs);
  };

  const loadBatches = async (preferBatchId?: number) => {
    try {
      setLoadingBatches(true);
      const batchList = await hvacService.getQrBatches();
      setBatches(batchList);

      if (batchList.length === 0) {
        setSelectedBatchId('');
        setQrs([]);
        return;
      }

      const preferredId = preferBatchId
        ? String(preferBatchId)
        : selectedBatchId && batchList.some((batch) => String(batch.id) === selectedBatchId)
          ? selectedBatchId
          : String(batchList[0].id);

      setSelectedBatchId(preferredId);
      await loadQrsForBatch(Number(preferredId));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudieron cargar los lotes',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    void loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadLabelsHtml = () => {
    if (!generatedCount) return;

    const labelsHtml = qrs
      .map(
        (item) => `
          <div class="label">
            <div class="label-row">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(buildQrUrl(item.uuid))}" alt="QR ${item.uuid}" class="qr" />
              <img src="${window.location.origin}/img/img_qr.jpg" alt="Diseño IJF" class="design" />
            </div>
          </div>
        `
      )
      .join('\n');

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Etiquetas QR - IJF CRM</title>
  <style>
    * { box-sizing: border-box; font-family: Arial, sans-serif; }
    body { margin: 0; padding: 20px; color: #0f172a; }
    h1 { margin: 0 0 6px; font-size: 18px; }
    p.meta { margin: 0 0 16px; font-size: 12px; color: #64748b; }
    .grid { display: grid; grid-template-columns: repeat(2, auto); justify-content: start; gap: 6mm; }
    .label { width: fit-content; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 6px; page-break-inside: avoid; }
    .label-row { display: flex; align-items: center; justify-content: flex-start; gap: 8px; }
    .qr { width: 108px; height: 108px; display: block; flex-shrink: 0; }
    .design { width: 188px; height: auto; display: block; object-fit: contain; flex-shrink: 0; }
    @media print {
      body { padding: 4mm; }
      .grid { grid-template-columns: repeat(2, auto); justify-content: start; gap: 4mm; }
      .label { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Etiquetas QR - IJF CRM</h1>
  <p class="meta">Lote: ${selectedBatch ? `#${selectedBatch.id}` : 'N/A'} | Cantidad: ${generatedCount} | Generado: ${new Date().toLocaleString('es-ES')}</p>
  <div class="grid">
    ${labelsHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiquetas-qr-lote-${selectedBatch?.id ?? 'manual'}-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadQrCsv = () => {
    if (!generatedCount) return;

    const rows = [
      'uuid,qr_url',
      ...qrs.map((item) => `${item.uuid},${buildQrUrl(item.uuid)}`),
    ];
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrs-lote-${selectedBatch?.id ?? 'manual'}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async (values: QrBatchFormData) => {
    try {
      setLoading(true);
      const response = await hvacService.generateQrs(values.quantity);
      const data = Array.isArray(response.data) ? response.data : response.data.data ?? [];
      setQrs(data);
      const newBatchId = response.batch?.id;
      await loadBatches(newBatchId);
      toast({
        variant: 'success',
        title: 'QRs generados',
        description: `Se generaron ${values.quantity} etiquetas en estado available${newBatchId ? ` (lote #${newBatchId})` : ''}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo generar',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPrinted = async () => {
    if (!selectedBatch) return;

    try {
      setMarkingPrinted(true);
      const response = await hvacService.markBatchPrinted(selectedBatch.id);
      toast({
        variant: 'success',
        title: 'Lote actualizado',
        description: response.message || `Lote #${selectedBatch.id} marcado como impreso.`,
      });
      await loadBatches(selectedBatch.id);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo marcar el lote',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    } finally {
      setMarkingPrinted(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <style>
        {`
          @media print {
            header, nav, aside, .no-print {
              display: none !important;
            }
            .print-page {
              display: block !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .print-grid {
              display: grid !important;
              grid-template-columns: repeat(2, auto) !important;
              justify-content: start !important;
              gap: 4mm !important;
            }
            .print-label {
              width: fit-content !important;
              border: 1px dashed #d1d5db !important;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="space-y-1 no-print">
        <h1 className="text-2xl font-bold">Generador de etiquetas QR</h1>
        <p className="text-sm text-muted-foreground">Generación masiva e impresión en hoja de etiquetas.</p>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle>Generacion masiva</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={form.handleSubmit(handleGenerate)}>
            <label className="text-sm font-medium">Lote para imprimir/descargar</label>
            <Select
              value={selectedBatchId}
              onValueChange={async (value) => {
                setSelectedBatchId(value);
                await loadQrsForBatch(Number(value));
              }}
              disabled={loadingBatches || batches.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingBatches ? 'Cargando lotes...' : 'Selecciona un lote'} />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={String(batch.id)}>
                    {formatBatchLabel(batch)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBatch ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Rango UUID: {selectedBatch.first_qr_uuid ?? '-'} {selectedBatch.last_qr_uuid ? `→ ${selectedBatch.last_qr_uuid}` : ''}
                </p>
                <p className="text-xs">
                  Estado impresión:{' '}
                  <span className={selectedBatchPrinted ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                    {selectedBatchPrinted ? `Impreso (${new Date(selectedBatch.printed_at as string).toLocaleString('es-ES')})` : 'Pendiente'}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No hay lotes disponibles todavía.
              </p>
            )}

            <label className="text-sm font-medium">Cantidad de QRs</label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              value={form.watch('quantity')}
              onChange={(event) => form.setValue('quantity', Number(event.target.value), { shouldValidate: true })}
            />
            {form.formState.errors.quantity ? (
              <p className="text-xs text-red-500">{form.formState.errors.quantity.message}</p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Can check="qrs.generate">
                <Button className="h-12 w-full min-w-0 sm:flex-1" disabled={loading} type="submit">
                  <Plus className="h-4 w-4 shrink-0" />
                  {loading ? 'Generando...' : 'Generar QRs'}
                </Button>
              </Can>
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full shrink-0 px-5 sm:w-auto"
                onClick={() => window.print()}
                disabled={!generatedCount}
              >
                <Printer className="h-4 w-4 shrink-0" />
                Imprimir
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <Button
                type="button"
                variant="outline"
                className="h-auto min-h-11 w-full min-w-0 flex-1 whitespace-normal px-3 py-2.5 !inline-flex items-start justify-start gap-2 text-left sm:items-center sm:justify-center sm:text-center"
                onClick={downloadLabelsHtml}
                disabled={!generatedCount}
              >
                <Download className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
                <span className="min-w-0 flex-1 leading-snug">Descargar para imprenta (.html)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full min-w-0 shrink-0 sm:flex-1"
                onClick={downloadQrCsv}
                disabled={!generatedCount}
              >
                <Download className="h-4 w-4 shrink-0" />
                Descargar CSV
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={handleMarkPrinted}
              disabled={!selectedBatch || selectedBatchPrinted || markingPrinted}
            >
              {markingPrinted
                ? 'Actualizando...'
                : selectedBatchPrinted
                  ? 'Lote ya marcado como impreso'
                  : 'Marcar lote como impreso'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="print-page">
        <div className="mb-2 text-sm text-muted-foreground no-print">
          {generatedCount
            ? `${generatedCount} etiquetas listas ${selectedBatch ? `(lote #${selectedBatch.id})` : ''}`
            : 'Aun no hay etiquetas generadas'}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 justify-start gap-3 print-grid">
          {qrs.map((item) => (
            <Card key={item.uuid} className="print-label w-fit">
              <CardContent className="p-1.5">
                <div className="flex items-center justify-start gap-2">
                  <QRCodeSVG value={`${window.location.origin}/scan/${item.uuid}`} size={104} />
                  <img src="/img/img_qr.jpg" alt="Diseño IJF" className="w-[188px] h-auto object-contain shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
