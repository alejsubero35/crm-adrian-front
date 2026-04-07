import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Users, ShoppingCart, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Chart as SimpleChart } from "./_Dashboard/Chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
} from "@/components/ui/chart";
import * as Recharts from "recharts";
import { motion } from 'framer-motion';
import { MetricCard } from "@/components/ui/metric-card";
import UsageDashboard from '../components/features/BusinessTier/UsageDashboard';
import { useIsMobile } from "@/hooks/use-mobile";
import { useT } from "@/i18n";

import {
  getDashboardSummery,
  getMonthlySalesPurchases,
  getRecentInvoices,
  getTopClients,
  getTopSellingProducts,
} from '@/services/dashboard'

interface TopProduct { id: number; name: string; sold: number; revenue: number }
interface RecurringClient { id: number; name: string; visits: number; lastPurchase: string }

interface Stats { totalSales: number; ordersToday: number; avgTicket: number; visitors: number }

const Dashboard = () => {
  const isMobile = useIsMobile();
  const t = useT('tenant.dashboard');
  const tc = useT();

  const { data: summeryToday } = useQuery({
    queryKey: ["dashboard", "summery", "Today"],
    queryFn: () => getDashboardSummery('Today'),
  })

  const { data: topSelling } = useQuery({
    queryKey: ["dashboard", "top-selling-products"],
    queryFn: () => getTopSellingProducts(),
  })

  const { data: topClients } = useQuery({
    queryKey: ["dashboard", "top-clients"],
    queryFn: () => getTopClients(),
  })

  const { data: monthlySalesPurchases } = useQuery({
    queryKey: ["dashboard", "monthly-sales-purchases"],
    queryFn: () => getMonthlySalesPurchases(),
  })

  const { data: recentInvoices, isLoading: recentInvoicesLoading } = useQuery({
    queryKey: ["dashboard", "recent-invoices"],
    queryFn: () => getRecentInvoices(),
  })

  const stats: Stats | undefined = useMemo(() => {
    if (!summeryToday) return undefined
    const totalSales = Number(summeryToday.salesAmount ?? 0)
    return {
      totalSales,
      ordersToday: 0,
      avgTicket: 0,
      visitors: 0,
    }
  }, [summeryToday])

  const topProducts: TopProduct[] | undefined = useMemo(() => {
    const products = topSelling?.products || []
    if (!Array.isArray(products)) return undefined
    return products.map((p, idx) => ({
      id: idx + 1,
      name: String((p as any)?.name ?? ''),
      sold: Number((p as any)?.value ?? 0),
      revenue: 0,
    }))
  }, [topSelling])

  const recurring: RecurringClient[] | undefined = useMemo(() => {
    if (!Array.isArray(topClients)) return undefined
    return topClients.map((c, idx) => ({
      id: Number((c as any)?.client_id ?? idx + 1),
      name: String((c as any)?.client?.name ?? 'Cliente'),
      visits: Number((c as any)?.total_invoice ?? 0),
      lastPurchase: '',
    }))
  }, [topClients])

  // Small derived dataset for chart
  const chartData = useMemo(() => {
    // sample series from topProducts
    if (!topProducts || !Array.isArray(topProducts)) return { labels: [], series: [] };
    return {
      labels: topProducts.map((p) => p.name),
      series: topProducts.map((p) => p.sold),
    };
  }, [topProducts]);

  const timeSeries = useMemo(() => {
    const months = monthlySalesPurchases?.months || []
    const sales = monthlySalesPurchases?.sales || []
    if (!Array.isArray(months) || !Array.isArray(sales)) return [] as Array<{ date: string; sales: number }>
    return months.map((m, idx) => ({ date: String(m), sales: Number(sales[idx] ?? 0) }))
  }, [monthlySalesPurchases])

  // pie data from topProducts
  const pieData = (topProducts || []).map(p => ({ name: p.name, value: p.sold }));

  // colors used for the pie slices (matches visual example)
  const PIE_COLORS = isMobile
    ? ['#FF7A1A', '#FF9A3D', '#FFC285', '#FFE0C2', '#FFB047', '#FF8F33']
    : ['#4B6CB7', '#7ED957', '#FFCD4A', '#FF6B6B', '#7FB3D5', '#9B59B6'];

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Listen to window scroll instead of an inner scrollable container
  useEffect(() => {
    const onScroll = () => {
      const y =
        (typeof window !== 'undefined' && window.scrollY) ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setShowScrollTop(y > 200);
    };

    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const navigate = useNavigate();

  const handleCardKey = (e: React.KeyboardEvent, to: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(to);
    }
  };

  interface Sale { id: string; date: string; total: number; items: number; customer?: string }
  const recentSalesListRef = useRef<HTMLDivElement | null>(null);
  const allRecent: Sale[] = useMemo(() => {
    const rows = recentInvoices || []
    if (!Array.isArray(rows)) return []
    return rows.map((r) => ({
      id: String((r as any)?.invoiceLabel ?? (r as any)?.invoiceNo ?? (r as any)?.id ?? ''),
      date: String((r as any)?.invoiceDate ?? ''),
      total: Number((r as any)?.invoiceTotal ?? 0),
      items: 0,
      customer: (r as any)?.client ?? undefined,
    }))
  }, [recentInvoices]);

  return (
    <div>
      <div className="p-6 min-h-screen bg-orange-50/50 md:bg-gray-50 pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto mt-4 lg:mt-6 pb-32">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
              <p className="text-sm text-gray-600">{t('subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hidden sm:inline-flex">{t('actions.export')}</Button>
              <img
                src="/img/apple-icon-180x180.png"
                alt="Venta Simplyfy"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Metric cards redesigned with dotted gradient background and sparkline placeholder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <MetricCard
              title={t('metrics.weeklySales')}
              value={stats ? `${(stats.totalSales / 1000).toFixed(0)}k` : '--'}
              trend={'+2.6%'}
              icon={<ShoppingBag className="w-6 h-6" />}
              gradient="from-sky-50 via-sky-100 to-sky-200"
              lineColor="#0B5FFF"
              onClick={() => navigate('/sales')}
            />
            <MetricCard
              title={t('metrics.newUsers')}
              value={recurring ? `${(recurring.length * 1.35).toFixed(2)}m` : '1.35m'}
              trend={'-0.1%'}
              icon={<Users className="w-6 h-6" />}
              gradient="from-fuchsia-50 via-fuchsia-100 to-fuchsia-200"
              lineColor="#9b87f5"
            />
            <MetricCard
              title={t('metrics.purchaseOrders')}
              value={stats ? `${(stats.ordersToday * 0.036).toFixed(2)}m` : '1.72m'}
              trend={'+2.8%'}
              icon={<ShoppingCart className="w-6 h-6" />}
              gradient="from-amber-50 via-amber-100 to-amber-200"
              lineColor="#FF7A1A"
            />
            <MetricCard
              title={t('metrics.messages')}
              value={stats ? `${Math.round(stats.visitors * 0.75)}` : '234'}
              trend={'+3.6%'}
              icon={<MessageSquare className="w-6 h-6" />}
              gradient="from-rose-50 via-rose-100 to-rose-200"
              lineColor="#FF4D4F"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-4 border-orange-100/70 md:border-border">
              <h3 className="text-lg font-semibold mb-4 text-brand-orange md:text-foreground">{t('sections.productsUnitsSold')}</h3>
              <SimpleChart labels={chartData.labels} series={chartData.series} />

              <div className="mt-6">
                <h4 className="text-md font-medium mb-2 text-brand-orange md:text-foreground">{t('sections.salesLastWeek')}</h4>
                <ChartContainer
                  config={{ sales: { label: t('labels.sales'), color: isMobile ? '#FF7A1A' : 'var(--blue-500)' } }}
                  className="w-full h-56"
                >
                  <Recharts.LineChart data={timeSeries}>
                    <Recharts.CartesianGrid strokeDasharray="3 3" />
                    <Recharts.XAxis dataKey="date" />
                    <Recharts.YAxis />
                    <ChartTooltip />
                    <ChartLegend />
                    <Recharts.Line
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--color-sales, #3b82f6)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </Recharts.LineChart>
                </ChartContainer>
              </div>
            </Card>

            <Card className="p-4 border-orange-100/70 md:border-border">
              <h3 className="text-lg font-semibold mb-4 text-brand-orange md:text-foreground">{t('sections.recurringClients')}</h3>
              <ul className="space-y-3">
                {recurring?.map((r: RecurringClient) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-gray-500">{t('labels.lastPurchase')}: {r.lastPurchase}</div>
                    </div>
                    <div className="text-sm text-brand-orange md:text-gray-700">{r.visits} {t('labels.visits')}</div>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <h4 className="text-md font-medium mb-2 text-brand-orange md:text-foreground">{t('sections.productDistribution')}</h4>
                <ChartContainer config={{ products: { label: t('labels.products') } }} className="w-full h-56">
                  <div className="h-full w-full flex items-center gap-4">
                    {/* Legend (left) */}
                    <ul className="w-1/3 text-sm space-y-2">
                      {pieData.map((d, i) => (
                        <li key={d.name} className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block' }} />
                          <span className="text-gray-600 truncate">{d.name}</span>
                        </li>
                      ))}
                      {pieData.length === 0 && <li className="text-sm text-gray-500">{t('empty.noData')}</li>}
                    </ul>

                    {/* Responsive Pie (right) */}
                    <div className="flex-1 h-full">
                      <Recharts.ResponsiveContainer width="100%" height="100%">
                        <Recharts.PieChart>
                          <ChartTooltip />
                          <Recharts.Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={4}
                            labelLine={isMobile ? false : true}
                            label={isMobile ? false : ({ name }) => (name.length > 12 ? `${name.slice(0, 12)}...` : name)}
                          >
                            {pieData.map((entry, index) => (
                              <Recharts.Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Recharts.Pie>
                        </Recharts.PieChart>
                      </Recharts.ResponsiveContainer>
                    </div>
                  </div>
                </ChartContainer>
              </div>
            </Card>
          </div>

          {/* Recent sales - scrollable with simulated infinite loading */}
          <div className="mt-6">
            <Card className="p-4 border-orange-100/70 md:border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-brand-orange md:text-foreground">{t('sections.recentSales')}</h3>
                <div className="text-sm text-gray-500">{t('sections.lastSixSales')}</div>
              </div>

              <div ref={recentSalesListRef} className="h-64 overflow-auto border border-orange-100/70 md:border-border rounded-md p-2 bg-white">
                {allRecent.length === 0 && recentInvoicesLoading && (
                  <div className="text-center text-sm text-gray-500 py-8">{tc('common.loading')}</div>
                )}
                {allRecent.length === 0 && !recentInvoicesLoading && (
                  <div className="text-center text-sm text-gray-500 py-8">{t('empty.noData')}</div>
                )}

                <ul className="space-y-2">
                  {allRecent.map(s => (
                    <li key={s.id} className="flex items-center justify-between p-2 rounded hover:bg-orange-50 md:hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{s.id} • {s.customer ?? t('labels.finalConsumer')}</div>
                        <div className="text-xs text-gray-500">{new Date(s.date).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${s.total.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{s.items} {t('labels.items')}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Mobile: scroll to top floating button */}
          <button
            onClick={scrollToTop}
            aria-label={t('actions.goUpAria')}
            className={[
              "fixed z-50 right-4 bottom-20 p-3 rounded-full shadow-lg bg-white text-gray-700 transition-opacity",
              showScrollTop ? "opacity-100" : "opacity-0 pointer-events-none",
              "sm:hidden"
            ].join(' ')}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
