import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line } from "recharts";
import { TrendingUp, TrendingDown, FileText, Users, Package, DollarSign, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { usePreferences } from "@/contexts/PreferencesContext";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface Invoice {
  Id_CFD: number;
  Prefijo: string;
  Numero: number;
  TipoComprobante: string;
  FechaGeneracion: string;
  FechaExpedicion: string;
  NitCliente: string;
  NombreCliente: string;
  ValorTotal: number;
  EstadoDian: string;
  EstadoTramite: string;
  RutaPDF: string;
}

interface Client {
  Id: number;
  Nombre: string;
}

interface Product {
  Id: number;
  Descripcion: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { refreshInvoicesCount, selectedMonth } = usePreferences();
  const [invoicesCount, setInvoicesCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [invoicesByType, setInvoicesByType] = useState<{name: string, value: number}[]>([]);
  const [invoicesByDianStatus, setInvoicesByDianStatus] = useState<{name: string, value: number}[]>([]);
  const [monthlyData, setMonthlyData] = useState<{month: string, amount: number, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = i18n.language === 'es' ? es : enUS;

  useEffect(() => {
    const fetchDashboardData = async () => {
      const companyId = localStorage.getItem("companyId");
      const authToken = localStorage.getItem("authToken");

      if (!companyId || !authToken) {
        setLoading(false);
        return;
      }

      const headers = {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      };

      try {
        // Calcular fechas del mes seleccionado
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);
        const fechaInicial = format(monthStart, 'yyyy-MM-dd');
        const fechaFinal = format(monthEnd, 'yyyy-MM-dd');

        // Fetch invoices del mes seleccionado
        const invoicesResponse = await fetch(
          getApiUrl(`/Documento/TraerDatosDocumentosPeriodo?IdEmpresa=${companyId}&FechaInicial=${fechaInicial}&FechaFinal=${fechaFinal}`),
          { headers }
        );
        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json();
          if (invoicesData.basePresentationList) {
            const allInvoices = invoicesData.basePresentationList as Invoice[];
            
            // Contar todas las facturas del período
            setInvoicesCount(allInvoices.length);

            // Calcular ingresos del mes sumando todos los ValorTotal
            const totalRevenue = allInvoices.reduce((sum, inv) => sum + (inv.ValorTotal || 0), 0);
            setMonthlyRevenue(totalRevenue);

            // Agrupar por tipo de comprobante para la gráfica
            const typeCount = allInvoices.reduce((acc, inv) => {
              const type = inv.TipoComprobante;
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const chartData = Object.entries(typeCount).map(([name, value]) => ({
              name,
              value
            }));
            setInvoicesByType(chartData);

            // Agrupar por estado DIAN para la gráfica
            const dianStatusCount = allInvoices.reduce((acc, inv) => {
              const status = inv.EstadoDian || 'Sin Estado';
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const dianChartData = Object.entries(dianStatusCount).map(([name, value]) => ({
              name,
              value
            }));
            setInvoicesByDianStatus(dianChartData);

            // Get last 5 invoices
            const sorted = [...allInvoices].sort((a, b) => 
              new Date(b.FechaGeneracion).getTime() - new Date(a.FechaGeneracion).getTime()
            );
            setRecentInvoices(sorted.slice(0, 5));
            
            // Refresh the invoices count in the header
            refreshInvoicesCount();
          }
        }

        // Fetch datos de los últimos 3 meses para la gráfica mensual
        const monthlyPromises = [];
        const now = new Date();
        for (let i = 2; i >= 0; i--) {
          const monthDate = subMonths(now, i);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          
          monthlyPromises.push(
            fetch(
              getApiUrl(`/Documento/TraerDatosDocumentosPeriodo?IdEmpresa=${companyId}&FechaInicial=${format(monthStart, 'yyyy-MM-dd')}&FechaFinal=${format(monthEnd, 'yyyy-MM-dd')}`),
              { headers }
            ).then(res => res.json()).then(data => ({
              month: format(monthDate, 'MMM', { locale }),
              data: data.basePresentationList || []
            }))
          );
        }

        const monthlyResults = await Promise.all(monthlyPromises);
        const monthlyChartData = monthlyResults.map(result => ({
          month: result.month,
          amount: result.data.reduce((sum: number, inv: Invoice) => sum + (inv.ValorTotal || 0), 0),
          count: result.data.length
        }));
        setMonthlyData(monthlyChartData);
        console.log('Monthly chart data:', monthlyChartData);

        // Fetch clients
        const clientsResponse = await fetch(
          getApiUrl(`/Empresa/TraerClientes?IdEmpresa=${companyId}`),
          { headers }
        );
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          if (clientsData.basePresentationList) {
            setClientsCount(clientsData.basePresentationList.length);
          }
        }

        // Fetch products
        const productsResponse = await fetch(
          getApiUrl(`/Producto/TraerProductos?IdEmpresa=${companyId}`),
          { headers }
        );
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (productsData.basePresentationList) {
            setProductsCount(productsData.basePresentationList.length);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedMonth]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '$0';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div data-tour="dashboard">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-lg">{t("dashboard.loading")}</p>
        </div>
      ) : (
        <>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.monthlyRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {format(selectedMonth, 'MMMM yyyy', { locale })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.invoicesIssued")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : invoicesCount}</div>
            <p className="text-xs text-muted-foreground">
              {format(selectedMonth, 'MMMM yyyy', { locale })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.activeClients")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : clientsCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.totalClients")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.products")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : productsCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.totalProducts")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t("dashboard.monthlyBilling")}</CardTitle>
            <CardDescription>{t("dashboard.monthlyBillingDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 || monthlyData.every(d => d.amount === 0 && d.count === 0) ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">{t("dashboard.noData")}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.noDataDesc")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    yAxisId="left" 
                    className="text-xs"
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    className="text-xs"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'amount') return [formatCurrency(value), t("dashboard.totalValue")];
                      if (name === 'count') return [value, t("dashboard.quantity")];
                      return [value, name];
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === 'amount') return t("dashboard.totalValue");
                      if (value === 'count') return t("dashboard.quantityInvoices");
                      return value;
                    }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="count"
                    fill="hsl(var(--accent))"
                    radius={[8, 8, 0, 0]}
                    opacity={0.7}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t("dashboard.invoicesByType")}</CardTitle>
            <CardDescription>{t("dashboard.invoicesByTypeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesByType.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">{t("dashboard.noData")}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.noDataByType")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={invoicesByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {invoicesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle>Documentos por Estado DIAN</CardTitle>
            <CardDescription>Distribución de documentos del último mes según estado DIAN</CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesByDianStatus.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay datos disponibles</p>
                <p className="text-sm text-muted-foreground">Aún no hay documentos con estados DIAN registrados</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={invoicesByDianStatus}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => [value, 'Documentos']}
                  />
                  <Legend formatter={() => 'Cantidad de Documentos'} />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  >
                    {invoicesByDianStatus.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name.toUpperCase().includes('EXITOSA') 
                            ? 'hsl(var(--chart-3))' 
                            : entry.name.toUpperCase().includes('FALLIDA')
                            ? 'hsl(var(--chart-5))'
                            : 'hsl(var(--primary))'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("dashboard.recentInvoices")}</CardTitle>
          <CardDescription>{t("dashboard.lastFiveInvoices")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground">{t("common.loading")}</p>
            ) : recentInvoices.length === 0 ? (
              <p className="text-center text-muted-foreground">{t("dashboard.noRecentInvoices")}</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div
                  key={invoice.Id_CFD}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {invoice.Prefijo}
                    </div>
                    <div>
                      <p className="font-medium">{invoice.NombreCliente}</p>
                      <p className="text-xs text-muted-foreground">{invoice.Prefijo}-{invoice.Numero}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(invoice.ValorTotal)}</p>
                      <p className="text-xs text-muted-foreground">{invoice.EstadoTramite}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
};

export default Dashboard;
