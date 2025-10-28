import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Eye, MoreVertical, PlusCircle, Calendar as CalendarIcon, X, Mail, FileText, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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

const invoices: Invoice[] = [
  { id: "INV-2025-001", client: "Boutique Real", date: "2025-01-15", amount: "€1,250", status: "paid" as const, country: "Colombia" },
  { id: "INV-2025-002", client: "Tech Solutions SL", date: "2025-01-14", amount: "€3,400", status: "pending" as const, country: "España" },
  { id: "INV-2025-003", client: "Global Trading Inc", date: "2025-01-13", amount: "$2,100", status: "paid" as const, country: "Internacional" },
  { id: "INV-2025-004", client: "Servicios Digitales", date: "2025-01-12", amount: "€890", status: "overdue" as const, country: "Colombia" },
  { id: "INV-2025-005", client: "Consulting Group", date: "2025-01-10", amount: "€5,600", status: "paid" as const, country: "España" },
  { id: "INV-2025-006", client: "Marketing Pro", date: "2025-01-08", amount: "€2,340", status: "pending" as const, country: "España" },
  { id: "INV-2025-007", client: "Design Studio", date: "2025-01-05", amount: "$1,890", status: "paid" as const, country: "Internacional" },
];

const statusConfig = {
  paid: { label: "Pagada", class: "bg-green-100 text-green-700 border-green-200" },
  pending: { label: "Pendiente", class: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  overdue: { label: "Vencida", class: "bg-red-100 text-red-700 border-red-200" },
};

type Invoice = {
  id: string;
  client: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  country: string;
};

const Invoices = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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

  const handleViewPDF = () => {
    toast({
      title: "Generando PDF",
      description: "El PDF de la factura se está generando...",
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Enviando correo",
      description: `Notificación enviada a ${selectedInvoice?.client}`,
    });
  };

  const handleSendToDIAN = () => {
    toast({
      title: "Enviando a DIAN",
      description: "La factura está siendo enviada a la DIAN de Colombia...",
    });
  };

  const handleSendToVerifactu = () => {
    toast({
      title: "Enviando a Verifactu",
      description: "La factura está siendo enviada a Verifactu (España)...",
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("invoices.title")}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t("invoices.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/invoices/new")} className="gap-2 w-full sm:w-auto">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{t("nav.newInvoice")}</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("invoices.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={showFilters ? "default" : "outline"} 
                  className="gap-2 flex-1 sm:flex-none"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("invoices.filters")}</span>
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
                    <PopoverContent className="w-auto p-0 bg-background" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        locale={locale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedInvoice(invoice)}
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: "Descargando PDF",
                              description: `Descargando ${invoice.id}...`,
                            });
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
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

          {/* Mobile Card View */}
          <div className="md:hidden divide-y">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedInvoice(invoice)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium">{invoice.id}</p>
                      <p className="font-semibold truncate">{invoice.client}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={statusConfig[invoice.status].class}
                    >
                      {statusConfig[invoice.status].label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Fecha</p>
                      <p>{invoice.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Monto</p>
                      <p className="font-semibold">{invoice.amount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-xs">
                      {invoice.country}
                    </Badge>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(invoice);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast({
                            title: "Descargando PDF",
                            description: `Descargando ${invoice.id}...`,
                          });
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details Drawer */}
      <Drawer open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="px-4 md:px-6">
            <DrawerTitle className="text-xl md:text-2xl">Detalle de Factura</DrawerTitle>
            <DrawerDescription className="text-sm">
              Información completa de la factura {selectedInvoice?.id}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 md:px-6 pb-4 overflow-y-auto">
            {/* Action Bar */}
            <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-2 p-3 md:p-4 bg-muted/50 rounded-lg border">
              <Button 
                variant="outline" 
                className="gap-2 flex-1 sm:flex-none text-sm"
                onClick={handleViewPDF}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Ver PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 flex-1 sm:flex-none text-sm"
                onClick={handleSendEmail}
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Enviar correo al cliente</span>
                <span className="sm:hidden">Correo</span>
              </Button>
              {selectedInvoice?.country === "Colombia" && (
                <Button 
                  variant="outline" 
                  className="gap-2 flex-1 sm:flex-none text-sm"
                  onClick={handleSendToDIAN}
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Enviar a DIAN</span>
                  <span className="sm:hidden">DIAN</span>
                </Button>
              )}
              {selectedInvoice?.country === "España" && (
                <Button 
                  variant="outline" 
                  className="gap-2 flex-1 sm:flex-none text-sm"
                  onClick={handleSendToVerifactu}
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Enviar a Verifactu</span>
                  <span className="sm:hidden">Verifactu</span>
                </Button>
              )}
            </div>

            {/* Invoice Details */}
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Número de Factura</p>
                  <p className="font-mono font-semibold text-base md:text-lg">{selectedInvoice?.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold text-base md:text-lg">{selectedInvoice?.client}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium text-sm md:text-base">{selectedInvoice?.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Monto</p>
                  <p className="font-bold text-lg md:text-xl">{selectedInvoice?.amount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">País</p>
                  <Badge variant="outline" className="w-fit text-xs">
                    {selectedInvoice?.country}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Estado</p>
                  {selectedInvoice && (
                    <Badge 
                      variant="outline" 
                      className={`${statusConfig[selectedInvoice.status].class} text-xs`}
                    >
                      {statusConfig[selectedInvoice.status].label}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 md:space-y-3">
                <h3 className="font-semibold text-base md:text-lg">Información Adicional</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Esta factura fue generada automáticamente por el sistema eBill Pro.
                </p>
              </div>
            </div>
          </div>

          <DrawerFooter className="px-4 md:px-6">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">Cerrar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Invoices;
