import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type TipoComprobante = {
  Codigo: number;
  Descripcion: string;
  InfoAdicional: string;
};

type Client = {
  Codigo: number;
  Descripcion: string;
  InfoAdicional: string;
};

type ClientDetail = {
  Id: number;
  Nombre: string;
  TipoPersona: number;
  TipoIdentificacion: number;
  Nit: string;
  DigitoVerificacion: string;
  IdRegimenFiscal: number;
  Telefono: string;
  Correo: string;
  Ubicacion: string;
  CodigoPostal: string;
  PaisIso: string;
  IdPais: number;
  DepartamentoDane: string;
  IdDepartamento: number;
  MunicipioDane: string;
  IdMunicipio: number;
  IDInterno: string;
  IdUbicacionFiscal: number;
};

const steps = [
  { id: 1, title: "Inicio", description: "Tipo de documento" },
  { id: 2, title: "Cliente", description: "Datos del cliente" },
  { id: 3, title: "Productos", description: "Detalle de productos" },
  { id: 4, title: "Resumen", description: "Revisión final" },
];

const NewInvoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [tiposComprobante, setTiposComprobante] = useState<TipoComprobante[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientDetail | null>(null);
  const [loadingClientDetail, setLoadingClientDetail] = useState(false);

  // Client form data
  const [clientData, setClientData] = useState({
    name: "",
    nit: "",
    address: "",
    city: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const fetchTiposComprobante = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        
        if (!authToken) {
          toast({
            title: "Error",
            description: "No se encontró la sesión. Por favor, inicie sesión nuevamente.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const response = await fetch(
          "/api/Auxiliar/ListaTiposComprobante?IncluirSoloPrincipales=true",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al cargar los tipos de comprobante");
        }

        const data = await response.json();
        
        if (data.codResponse === 1 && data.basePresentationList) {
          setTiposComprobante(data.basePresentationList);
        }
      } catch (error) {
        console.error("Error fetching tipos de comprobante:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los tipos de comprobante",
          variant: "destructive",
        });
      } finally {
        setLoadingTipos(false);
      }
    };

    fetchTiposComprobante();
  }, [toast, navigate]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const authToken = localStorage.getItem("authToken");
        const companyId = localStorage.getItem("companyId");
        
        if (!authToken || !companyId) {
          return;
        }

        const response = await fetch(
          `/api/Empresa/TraerClientes?IdEmpresa=${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al cargar los clientes");
        }

        const data = await response.json();
        
        if (data.codResponse === 1 && data.basePresentationList) {
          setClients(data.basePresentationList);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        });
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, [toast]);

  const handleClientSelect = async (clientId: string) => {
    if (!clientId || clientId === "__new__") {
      setSelectedClientId("");
      setSelectedClientDetail(null);
      setClientData({
        name: "",
        nit: "",
        address: "",
        city: "",
        phone: "",
        email: "",
      });
      return;
    }

    try {
      setLoadingClientDetail(true);
      setSelectedClientId(clientId);
      
      const authToken = localStorage.getItem("authToken");
      const companyId = localStorage.getItem("companyId");
      
      if (!authToken || !companyId) {
        return;
      }

      const response = await fetch(
        `/api/Cliente/TraerCliente?IdCliente=${clientId}&IdEmpresa=${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar los detalles del cliente");
      }

      const data = await response.json();
      
      if (data.codResponse === 1 && data.basePresentation) {
        const client = data.basePresentation;
        setSelectedClientDetail(client);
        
        // Auto-fill form
        setClientData({
          name: client.Nombre || "",
          nit: client.Nit || "",
          address: client.Ubicacion || "",
          city: client.MunicipioDane || "",
          phone: client.Telefono || "",
          email: client.Correo || "",
        });
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del cliente",
        variant: "destructive",
      });
    } finally {
      setLoadingClientDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Factura</h1>
          <p className="text-muted-foreground">Crear un nuevo documento de facturación</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 flex-1 ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Configuración Inicial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docType">Tipo de Comprobante *</Label>
                <Select disabled={loadingTipos}>
                  <SelectTrigger id="docType">
                    <SelectValue placeholder={loadingTipos ? "Cargando..." : "Seleccione un tipo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposComprobante.map((tipo) => (
                      <SelectItem key={tipo.Codigo} value={tipo.Codigo.toString()}>
                        {tipo.Descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Jurisdicción *</Label>
                <Select defaultValue="co">
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="co">Colombia (DIAN)</SelectItem>
                    <SelectItem value="es">España (Verifactu)</SelectItem>
                    <SelectItem value="int">Internacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Fecha de Expedición *</Label>
                  <Input id="issueDate" type="date" defaultValue="2025-01-27" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                  <Input id="dueDate" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Número de Factura</Label>
                <Input id="invoiceNumber" placeholder="Auto-generado" disabled />
                <p className="text-xs text-muted-foreground">
                  Se generará automáticamente al guardar
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium mb-2">Facturación Electrónica</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta factura cumplirá con los requisitos legales de facturación electrónica
                  según la jurisdicción seleccionada.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">Colombia</Badge>
                    <span className="text-xs">Validado DIAN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700">España</Badge>
                    <span className="text-xs">Verifactu compatible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-700">Internacional</Badge>
                    <span className="text-xs">Formato estándar</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientSelect">Seleccionar Cliente Existente</Label>
              <Select 
                value={selectedClientId} 
                onValueChange={handleClientSelect}
                disabled={loadingClients}
              >
                <SelectTrigger id="clientSelect">
                  <SelectValue placeholder={loadingClients ? "Cargando clientes..." : "Seleccione un cliente"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new__">-- Nuevo Cliente --</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.Codigo} value={client.Codigo.toString()}>
                      {client.Descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingClientDetail && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente *</Label>
                <Input 
                  id="clientName" 
                  placeholder="Cliente_Ejemplo"
                  value={clientData.name}
                  onChange={(e) => setClientData({...clientData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientTax">NIT/CIF *</Label>
                <Input 
                  id="clientTax" 
                  placeholder="111111111"
                  value={clientData.nit}
                  onChange={(e) => setClientData({...clientData, nit: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAddress">Dirección *</Label>
              <Input 
                id="clientAddress" 
                placeholder="CRA 63 NO 17-91"
                value={clientData.address}
                onChange={(e) => setClientData({...clientData, address: e.target.value})}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="clientCountry">País *</Label>
                <Select defaultValue="co">
                  <SelectTrigger id="clientCountry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">España</SelectItem>
                    <SelectItem value="co">Colombia</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCity">Ciudad *</Label>
                <Input 
                  id="clientCity" 
                  placeholder="BOGOTA, D.C."
                  value={clientData.city}
                  onChange={(e) => setClientData({...clientData, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Teléfono</Label>
                <Input 
                  id="clientPhone" 
                  placeholder="0"
                  value={clientData.phone}
                  onChange={(e) => setClientData({...clientData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email *</Label>
              <Input 
                id="clientEmail" 
                type="email" 
                placeholder="alejandranino@fymtech.com"
                value={clientData.email}
                onChange={(e) => setClientData({...clientData, email: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalle de Productos/Servicios</CardTitle>
              <Button variant="outline" size="sm">
                Agregar Línea
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Producto/Servicio</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Cantidad</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Precio Unit.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">IVA %</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3">
                      <Input placeholder="Nombre del producto..." />
                    </td>
                    <td className="px-4 py-3">
                      <Input type="number" defaultValue="1" className="w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <Input type="number" placeholder="0.00" className="w-28" />
                    </td>
                    <td className="px-4 py-3">
                      <Select defaultValue="19">
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="19">19%</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">$0</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">$0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA:</span>
                  <span className="font-medium">$0</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">$0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Resumen de la Factura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Número de Factura</Label>
                <p className="font-mono text-lg font-medium">INV-2025-008</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Cliente</Label>
                <p className="font-medium">Cliente_Ejemplo</p>
                <p className="text-sm text-muted-foreground">NIT: 111111111</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Fecha Expedición</Label>
                  <p className="font-medium">27/01/2025</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vencimiento</Label>
                  <p className="font-medium">27/02/2025</p>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="font-medium">$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">IVA (19%):</span>
                    <span className="font-medium">$0</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary">$0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Notas y Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notas Internas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas que solo verás tú..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicNotes">Notas para el Cliente</Label>
                <Textarea
                  id="publicNotes"
                  placeholder="Notas que aparecerán en la factura..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Borrador
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}>
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button className="gap-2">
              <Check className="h-4 w-4" />
              Generar Factura
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
