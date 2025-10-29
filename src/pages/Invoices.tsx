import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Eye, MoreVertical, PlusCircle, Calendar as CalendarIcon, X, Mail, FileText, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, subMonths } from "date-fns";
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
  status: string;
  prefix: string;
  documentType: string;
  pdfUrl: string;
};

const Invoices = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!dateRange?.from || !dateRange?.to) return;
      
      setLoading(true);
      try {
        const authToken = localStorage.getItem("authToken");
        const companyId = localStorage.getItem("companyId");
        
        if (!authToken || !companyId) {
          toast({
            title: "Error",
            description: "No se encontró la sesión. Por favor, inicie sesión nuevamente.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const fechaInicial = format(dateRange.from, "yyyy-MM-dd");
        const fechaFinal = format(dateRange.to, "yyyy-MM-dd");

        const response = await fetch(
          `/api/Documento/TraerDatosDocumentosPeriodo?IdEmpresa=${companyId}&FechaInicial=${fechaInicial}&FechaFinal=${fechaFinal}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al cargar las facturas");
        }

        const data = await response.json();
        
        if (data.codResponse === 1 && data.basePresentationList) {
          const mappedInvoices: Invoice[] = data.basePresentationList.map((item: any) => ({
            id: item.Id_CFD?.toString() || "N/A",
            client: item.NombreCliente || "Cliente desconocido",
            date: item.FechaExpedicion ? format(new Date(item.FechaExpedicion), "dd/MM/yyyy") : "",
            amount: item.ValorTotal ? `$${item.ValorTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : "$0.00",
            status: item.EstadoTramite || "Desconocido",
            prefix: item.Prefijo || "",
            documentType: item.TipoComprobante || "",
            pdfUrl: item.RutaPDF || "",
          }));
          setInvoices(mappedInvoices);
        } else {
          setInvoices([]);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las facturas",
          variant: "destructive",
        });
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [dateRange, toast]);

  useEffect(() => {
    const fetchPdfDetails = async () => {
      if (!selectedInvoice) {
        setPdfUrl("");
        return;
      }

      setLoadingPdf(true);
      try {
        const authToken = localStorage.getItem("authToken");
        const companyId = localStorage.getItem("companyId");

        if (!authToken || !companyId) {
          return;
        }

        const response = await fetch(
          `/api/Documento/TraerDatosDocumento?IdDocumento=${selectedInvoice.id}&IdEmpresa=${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al cargar los detalles del documento");
        }

        const data = await response.json();
        
        if (data.codResponse === 1 && data.basePresentation?.RutaPDF) {
          setPdfUrl(data.basePresentation.RutaPDF);
        } else {
          setPdfUrl("");
        }
      } catch (error) {
        console.error("Error fetching PDF details:", error);
        setPdfUrl("");
      } finally {
        setLoadingPdf(false);
      }
    };

    fetchPdfDetails();
  }, [selectedInvoice]);

  const filteredInvoices = invoices.filter((invoice) => {
    // Filter by search term (client name)
    const matchesSearch = searchTerm
      ? invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // Filter by invoice number
    const matchesInvoiceNumber = invoiceNumber
      ? invoice.id.toLowerCase().includes(invoiceNumber.toLowerCase())
      : true;

    return matchesSearch && matchesInvoiceNumber;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setInvoiceNumber("");
    setDateRange(undefined);
  };

  const hasActiveFilters = searchTerm || invoiceNumber || dateRange?.from || dateRange?.to;
  const locale = i18n.language === 'es' ? es : enUS;

  const handleViewPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast({
        title: "PDF no disponible",
        description: "No hay PDF disponible para esta factura",
        variant: "destructive",
      });
    }
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
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Cargando facturas...</p>
              </div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron facturas</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay facturas en el período seleccionado"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Prefijo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Cliente</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Monto</th>
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
                      <span className="text-sm">{invoice.prefix}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{invoice.documentType}</span>
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
                        {invoice.status}
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
                            if (invoice.pdfUrl) {
                              window.open(invoice.pdfUrl, '_blank');
                            } else {
                              toast({
                                title: "PDF no disponible",
                                description: "No hay PDF disponible para esta factura",
                                variant: "destructive",
                              });
                            }
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
                      <p className="text-xs text-muted-foreground">{invoice.prefix} - {invoice.documentType}</p>
                      <p className="font-semibold truncate">{invoice.client}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="font-normal text-xs"
                    >
                      {invoice.status}
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

                    <div className="flex items-center justify-end gap-2">
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
                          if (invoice.pdfUrl) {
                            window.open(invoice.pdfUrl, '_blank');
                          } else {
                            toast({
                              title: "PDF no disponible",
                              description: "No hay PDF disponible para esta factura",
                              variant: "destructive",
                            });
                          }
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
            </>
          )}
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
              <Button 
                variant="outline" 
                className="gap-2 flex-1 sm:flex-none text-sm"
                onClick={handleSendToDIAN}
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Enviar a DIAN</span>
                <span className="sm:hidden">DIAN</span>
              </Button>
            </div>

            {/* Invoice Details */}
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">ID</p>
                  <p className="font-mono font-semibold text-base md:text-lg">{selectedInvoice?.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Prefijo</p>
                  <p className="font-medium text-sm md:text-base">{selectedInvoice?.prefix}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Tipo de Comprobante</p>
                  <p className="font-medium text-sm md:text-base">{selectedInvoice?.documentType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold text-base md:text-lg">{selectedInvoice?.client}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Fecha de Expedición</p>
                  <p className="font-medium text-sm md:text-base">{selectedInvoice?.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Monto Total</p>
                  <p className="font-bold text-lg md:text-xl">{selectedInvoice?.amount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Estado</p>
                  {selectedInvoice && (
                    <Badge 
                      variant="outline" 
                      className="w-fit text-xs"
                    >
                      {selectedInvoice.status}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {loadingPdf ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Cargando PDF...</p>
                  </div>
                </div>
              ) : pdfUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base md:text-lg">Documento PDF</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pdfUrl, '_blank')}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Abrir en nueva pestaña
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-muted/20">
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                      className="w-full h-[400px] md:h-[500px]"
                      title="Vista previa del PDF"
                      frameBorder="0"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Si el PDF no se visualiza, haz clic en "Abrir en nueva pestaña"
                  </p>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>No hay PDF disponible para esta factura</p>
                </div>
              )}

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
