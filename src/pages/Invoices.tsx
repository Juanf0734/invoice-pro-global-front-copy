import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Eye, MoreVertical, PlusCircle, Calendar as CalendarIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const filteredInvoices = invoices.filter((invoice) => {
    // Filter by search term (client name)
    const matchesSearch = searchTerm
      ? invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // Filter by invoice number
    const matchesInvoiceNumber = invoiceNumber
      ? invoice.id.toLowerCase().includes(invoiceNumber.toLowerCase())
      : true;

    // Filter by date range
    const matchesDateRange = dateRange?.from || dateRange?.to
      ? (() => {
          const invoiceDate = new Date(invoice.date);
          const fromMatch = dateRange.from ? invoiceDate >= dateRange.from : true;
          const toMatch = dateRange.to ? invoiceDate <= dateRange.to : true;
          return fromMatch && toMatch;
        })()
      : true;

    return matchesSearch && matchesInvoiceNumber && matchesDateRange;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setInvoiceNumber("");
    setDateRange(undefined);
  };

  const hasActiveFilters = searchTerm || invoiceNumber || dateRange?.from || dateRange?.to;
  const locale = i18n.language === 'es' ? es : enUS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("invoices.title")}</h1>
          <p className="text-muted-foreground">{t("invoices.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/invoices/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {t("nav.newInvoice")}
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("invoices.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant={showFilters ? "default" : "outline"} 
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                {t("invoices.filters")}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("invoices.number")}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="INV-2025-001"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("invoices.date")}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "PPP", { locale })} -{" "}
                              {format(dateRange.to, "PPP", { locale })}
                            </>
                          ) : (
                            format(dateRange.from, "PPP", { locale })
                          )
                        ) : (
                          <span>{t("invoices.selectDateRange")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        locale={locale}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
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
