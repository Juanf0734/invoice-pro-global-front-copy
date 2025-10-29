import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, FileText, Users, Package, DollarSign, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api";
import { format, subMonths } from "date-fns";

const monthlyData = [
  { month: "Ene", amount: 12500 },
  { month: "Feb", amount: 18200 },
  { month: "Mar", amount: 15800 },
  { month: "Abr", amount: 22400 },
  { month: "May", amount: 19600 },
  { month: "Jun", amount: 28900 },
];

const invoicesByCountry = [
  { country: "España", count: 45 },
  { country: "Colombia", count: 32 },
  { country: "Internacional", count: 23 },
];

interface Invoice {
  Id: number;
  NumeroDocumento: string;
  FechaDocumento: string;
  NitCliente: string;
  NombreCliente: string;
  ValorDocumento: number;
  Estado: string;
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
  const [invoicesCount, setInvoicesCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Calcular fechas del último mes
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        const fechaInicial = format(lastMonth, 'yyyy-MM-dd');
        const fechaFinal = format(now, 'yyyy-MM-dd');

        // Fetch invoices del último mes
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

            // Get last 5 invoices
            const sorted = [...allInvoices].sort((a, b) => 
              new Date(b.FechaDocumento).getTime() - new Date(a.FechaDocumento).getTime()
            );
            setRecentInvoices(sorted.slice(0, 5));
          }
        }

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
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div data-tour="dashboard">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu actividad de facturación</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Próximamente disponible</p>
            </div>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$128,900,000</div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+20.1%</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Emitidas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : invoicesCount}</div>
            <p className="text-xs text-muted-foreground">
              Último mes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : clientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Total de clientes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : productsCount}</div>
            <p className="text-xs text-muted-foreground">
              Total de productos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Próximamente disponible</p>
            </div>
          </div>
          <CardHeader>
            <CardTitle>Facturación Mensual</CardTitle>
            <CardDescription>Ingresos de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Próximamente disponible</p>
            </div>
          </div>
          <CardHeader>
            <CardTitle>Facturas por País</CardTitle>
            <CardDescription>Distribución de facturas emitidas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={invoicesByCountry}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="country" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Facturas Recientes</CardTitle>
          <CardDescription>Últimas 5 facturas emitidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground">Cargando...</p>
            ) : recentInvoices.length === 0 ? (
              <p className="text-center text-muted-foreground">No hay facturas recientes</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div
                  key={invoice.Id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      COL
                    </div>
                    <div>
                      <p className="font-medium">{invoice.NombreCliente}</p>
                      <p className="text-xs text-muted-foreground">{invoice.NumeroDocumento}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">{formatCurrency(invoice.ValorDocumento)}</p>
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-700">
                      {invoice.Estado}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
