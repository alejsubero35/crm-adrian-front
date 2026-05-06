import React from 'react';
import { BadgeDollarSign, Plus, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { EditModal } from '@/components/ui/EditModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { hvacService } from '@/services/hvac.service';
import type { Customer, Plan, Subscription } from '@/types/hvac';

const paymentStatusBadgeClass: Record<string, string> = {
  al_dia: 'bg-emerald-100 text-emerald-800',
  por_vencer: 'bg-amber-100 text-amber-800',
  vencido: 'bg-red-100 text-red-800',
  inactiva: 'bg-slate-200 text-slate-700',
};

const paymentStatusLabel: Record<string, string> = {
  al_dia: 'Al dia',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
  inactiva: 'Inactiva',
};

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [filterPlan, setFilterPlan] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');

  const [createOpen, setCreateOpen] = React.useState(false);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [activeSubscription, setActiveSubscription] = React.useState<Subscription | null>(null);

  const [createForm, setCreateForm] = React.useState({
    customer_id: '',
    plan_id: '',
    amount: '',
    billing_cycle_days: '',
    start_date: '',
    notes: '',
  });
  const [paymentForm, setPaymentForm] = React.useState({
    amount: '',
    paid_at: new Date().toISOString().slice(0, 10),
    method: 'efectivo',
    reference: '',
    notes: '',
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [subs, planList, customerList] = await Promise.all([
        hvacService.getSubscriptions({
          status: filterStatus === 'all' ? undefined : filterStatus,
          plan_id: filterPlan === 'all' ? undefined : Number(filterPlan),
          q: search.trim() || undefined,
        }),
        hvacService.getPlans(),
        hvacService.getCustomers(),
      ]);
      setSubscriptions(subs);
      setPlans(planList);
      setCustomers(customerList);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo cargar suscriptores',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPlan, search, toast]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = React.useMemo(() => {
    const active = subscriptions.filter((s) => s.status === 'active').length;
    const dueSoon = subscriptions.filter((s) => s.payment_status === 'por_vencer').length;
    const overdue = subscriptions.filter((s) => s.payment_status === 'vencido').length;
    return { active, dueSoon, overdue, total: subscriptions.length };
  }, [subscriptions]);

  const columns: DataTableColumn<Subscription>[] = [
    {
      id: 'customer',
      header: 'Suscriptor',
      cell: ({ item }) => (
        <div>
          <p className="font-semibold">{item.customer?.name || 'Sin cliente'}</p>
          <p className="text-xs text-muted-foreground">{item.customer?.email || item.customer?.phone || 'Sin contacto'}</p>
        </div>
      ),
    },
    {
      id: 'plan',
      header: 'Plan',
      cell: ({ item }) => (
        <div>
          <p className="font-medium">{item.plan?.name || 'Sin plan'}</p>
          <p className="text-xs text-muted-foreground">${item.amount.toFixed(2)} / ciclo</p>
        </div>
      ),
    },
    {
      id: 'next_due',
      header: 'Proximo vencimiento',
      cell: ({ item }) => (
        <div>
          <p>{item.next_due_date || '-'}</p>
          <p className="text-xs text-muted-foreground">
            {item.days_overdue && item.days_overdue > 0 ? `${item.days_overdue} dias de atraso` : 'Sin atraso'}
          </p>
        </div>
      ),
      hideBelow: 'lg',
      mobileLabel: 'Vencimiento',
    },
    {
      id: 'payment_status',
      header: 'Estado pago',
      cell: ({ item }) => (
        <Badge className={paymentStatusBadgeClass[item.payment_status] || 'bg-slate-100 text-slate-700'}>
          {paymentStatusLabel[item.payment_status] || item.payment_status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ item }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            setActiveSubscription(item);
            setPaymentForm((prev) => ({ ...prev, amount: String(item.amount) }));
            setPaymentOpen(true);
          }}
        >
          <Wallet className="h-4 w-4 mr-1" />
          Registrar pago
        </Button>
      ),
    },
  ];

  const handleCreateSubscription = async () => {
    try {
      if (!createForm.customer_id || !createForm.plan_id || !createForm.amount) {
        toast({ variant: 'destructive', title: 'Campos requeridos', description: 'Cliente, plan y monto son obligatorios.' });
        return;
      }
      await hvacService.createSubscription({
        customer_id: Number(createForm.customer_id),
        plan_id: Number(createForm.plan_id),
        amount: Number(createForm.amount),
        billing_cycle_days: createForm.billing_cycle_days ? Number(createForm.billing_cycle_days) : undefined,
        start_date: createForm.start_date || undefined,
        notes: createForm.notes || undefined,
      });
      setCreateOpen(false);
      setCreateForm({ customer_id: '', plan_id: '', amount: '', billing_cycle_days: '', start_date: '', notes: '' });
      toast({ variant: 'success', title: 'Suscripción creada' });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo crear suscripción',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    }
  };

  const handleRegisterPayment = async () => {
    if (!activeSubscription) return;
    try {
      if (!paymentForm.amount || !paymentForm.paid_at) {
        toast({ variant: 'destructive', title: 'Monto y fecha son requeridos' });
        return;
      }
      await hvacService.registerSubscriptionPayment(activeSubscription.id, {
        amount: Number(paymentForm.amount),
        paid_at: paymentForm.paid_at,
        method: paymentForm.method || undefined,
        reference: paymentForm.reference || undefined,
        notes: paymentForm.notes || undefined,
      });
      setPaymentOpen(false);
      setActiveSubscription(null);
      toast({ variant: 'success', title: 'Pago registrado' });
      await loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo registrar pago',
        description: error instanceof Error ? error.message : 'Error inesperado.',
      });
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Suscriptores</h1>
          <p className="text-sm text-muted-foreground">Control de planes, vencimientos y estado de pagos.</p>
        </div>
        <Button className="hidden md:inline-flex" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva suscripción
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Activos</p><p className="text-2xl font-bold text-emerald-600">{stats.active}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Por vencer</p><p className="text-2xl font-bold text-amber-600">{stats.dueSoon}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Vencidos</p><p className="text-2xl font-bold text-red-600">{stats.overdue}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Buscar cliente o plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger><SelectValue placeholder="Estado pago" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Suscripción activa</SelectItem>
              <SelectItem value="suspended">Suspendida</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los planes</SelectItem>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={String(plan.id)}>{plan.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void loadData()}>
            <BadgeDollarSign className="h-4 w-4 mr-2" />
            Aplicar
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando suscriptores...</p>
      ) : (
        <DataTable
          items={subscriptions}
          columns={columns}
          rowKey={({ item }) => String(item.id)}
          wrapInCard
        />
      )}

      <div className="fixed bottom-24 left-0 right-0 px-4 z-20 md:hidden">
        <Button className="w-full h-12 shadow-lg" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva suscripción
        </Button>
      </div>

      <EditModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nueva suscripción"
        description="Asigna cliente, plan y configuración de cobro."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateSubscription}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={createForm.customer_id} onValueChange={(value) => setCreateForm((f) => ({ ...f, customer_id: value }))}>
              <SelectTrigger><SelectValue placeholder="Selecciona cliente" /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={createForm.plan_id} onValueChange={(value) => setCreateForm((f) => ({ ...f, plan_id: value }))}>
              <SelectTrigger><SelectValue placeholder="Selecciona plan" /></SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input type="number" value={createForm.amount} onChange={(e) => setCreateForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ciclo (días)</Label>
              <Input type="number" value={createForm.billing_cycle_days} onChange={(e) => setCreateForm((f) => ({ ...f, billing_cycle_days: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Inicio</Label>
            <Input type="date" value={createForm.start_date} onChange={(e) => setCreateForm((f) => ({ ...f, start_date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Input value={createForm.notes} onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
      </EditModal>

      <EditModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        title="Registrar pago"
        description={activeSubscription ? `Suscriptor: ${activeSubscription.customer?.name || '-'}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancelar</Button>
            <Button onClick={handleRegisterPayment}>Guardar pago</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Monto pagado</Label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Fecha pago</Label>
              <Input type="date" value={paymentForm.paid_at} onChange={(e) => setPaymentForm((f) => ({ ...f, paid_at: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Método</Label>
              <Input value={paymentForm.method} onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Referencia</Label>
              <Input value={paymentForm.reference} onChange={(e) => setPaymentForm((f) => ({ ...f, reference: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Input value={paymentForm.notes} onChange={(e) => setPaymentForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
      </EditModal>
    </div>
  );
}

