import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Printer, Plus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { hvacService } from '@/services/hvac.service';
import type { QrItem } from '@/types/hvac';
import { qrBatchSchema, type QrBatchFormData } from '@/validations/hvac.schema';

export default function QrGeneratorPage() {
  const { toast } = useToast();
  const [qrs, setQrs] = useState<QrItem[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<QrBatchFormData>({
    resolver: zodResolver(qrBatchSchema),
    defaultValues: { quantity: 50 },
  });

  const generatedCount = useMemo(() => qrs.length, [qrs]);

  const handleGenerate = async (values: QrBatchFormData) => {
    try {
      setLoading(true);
      const response = await hvacService.generateQrs(values.quantity);
      const data = Array.isArray(response.data) ? response.data : response.data.data ?? [];
      setQrs(data);
      toast({
        variant: 'success',
        title: 'QRs generados',
        description: `Se generaron ${values.quantity} etiquetas en estado available.`,
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
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 8mm !important;
            }
            .print-label {
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

            <div className="flex gap-2">
              <Button className="flex-1 h-12" disabled={loading} type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Generando...' : 'Generar QRs'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 px-5"
                onClick={() => window.print()}
                disabled={!generatedCount}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="print-page">
        <div className="mb-2 text-sm text-muted-foreground no-print">
          {generatedCount ? `${generatedCount} etiquetas listas` : 'Aun no hay etiquetas generadas'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print-grid">
          {qrs.map((item) => (
            <Card key={item.uuid} className="print-label">
              <CardContent className="p-3 flex flex-col items-center gap-2">
                <img src="/img/ms-icon-310x310.png" alt="Logo" className="h-8 w-8 object-contain" />
                <QRCodeSVG value={`${window.location.origin}/scan/${item.uuid}`} size={112} />
                <p className="text-[11px] text-center break-all leading-tight">{item.uuid}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
