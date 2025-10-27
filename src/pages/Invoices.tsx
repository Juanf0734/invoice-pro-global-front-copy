import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Eye, MoreVertical, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const invoices = [
  { id: "INV-2025-001", client: "Boutique Real", date: "2025-01-15", amount: "€1,250", status: "paid", country: "Colombia" },
  { id: "INV-2025-002", client: "Tech Solutions SL", date: "2025-01-14", amount: "€3,400", status: "pending", country: "España" },
  { id: "INV-2025-003", client: "Global Trading Inc", date: "2025-01-13", amount: "$2,100", status: "paid", country: "Internacional" },
  { id: "INV-2025-004", client: "Servicios Digitales", date: "2025-01-12", amount: "€890", status: "overdue", country: "Colombia" },
  { id: "INV-2025-005", client: "Consulting Group", date: "2025-01-10", amount: "€5,600", status: "paid", country: "España" },
  { id: "INV-2025-006", client: "Marketing Pro", date: "2025-01-08", amount: "€2,340", status: "pending", country: "España" },
  { id: "INV-2025-007", client: "Design Studio", date: "2025-01-05", amount: "$1,890", status: "paid", country: "Internacional" },
];

const statusConfig = {
  paid: { label: "Pagada", class: "bg-green-100 text-green-700 border-green-200" },
  pending: { label: "Pendiente", class: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  overdue: { label: "Vencida", class: "bg-red-100 text-red-700 border-red-200" },
};

const Invoices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground">Gestiona todas tus facturas electrónicas</p>
        </div>
        <Button onClick={() => navigate("/invoices/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de factura o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Número</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Monto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">País</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium">{invoice.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{invoice.client}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.date}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{invoice.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-normal">
                        {invoice.country}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={statusConfig[invoice.status as keyof typeof statusConfig].class}>
                        {statusConfig[invoice.status as keyof typeof statusConfig].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Duplicar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Anular</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
