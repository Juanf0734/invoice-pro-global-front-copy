import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { getApiUrl } from "@/lib/api";

type TipoComprobante = {
  Codigo: number;
  Descripcion: string;
  InfoAdicional: string;
};

type ListItem = {
  Codigo: number;
  Descripcion: string;
  InfoAdicional?: string;
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

type Product = {
  Id: number;
  Descripcion: string;
  CodigoReferencia: string;
  PrecioVenta: number;
  IdTipoImpuesto: number;
};

type InvoiceLine = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  iva: number;
  total: number;
  productCode?: string;
  productId?: number;
};

const steps = [
  { id: 1, title: "Inicio", description: "Tipo de documento" },
  { id: 2, title: "Cliente", description: "Datos del cliente" },
  { id: 3, title: "Productos", description: "Detalle de productos" },
  { id: 4, title: "Resumen", description: "Revisión final" },
];

const NewInvoice = () => {
  const { t } = useTranslation();
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

  // Listas auxiliares
  const [tiposPersona, setTiposPersona] = useState<ListItem[]>([]);
  const [tiposIdentificacion, setTiposIdentificacion] = useState<ListItem[]>([]);
  const [paises, setPaises] = useState<ListItem[]>([]);
  const [departamentos, setDepartamentos] = useState<ListItem[]>([]);
  const [municipios, setMunicipios] = useState<ListItem[]>([]);
  const [regimenesFiscales, setRegimenesFiscales] = useState<ListItem[]>([]);
  
  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);

  // Invoice data
  const [invoiceData, setInvoiceData] = useState({
    tipoComprobante: "",
    fechaExpedicion: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date().toISOString().split('T')[0],
    notasInternas: "",
    notasCliente: "",
  });

  const [creatingInvoice, setCreatingInvoice] = useState(false);

  // Client form data
  const [clientData, setClientData] = useState({
    name: "",
    nit: "",
    tipoPersona: "",
    tipoIdentificacion: "",
    regimenFiscal: "",
    pais: "44", // Colombia por defecto
    departamento: "",
    municipio: "",
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
            title: t("common.error"),
            description: t("newInvoice.sessionNotFound"),
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const response = await fetch(
          getApiUrl("/Auxiliar/ListaTiposComprobante?IncluirSoloPrincipales=true"),
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
          title: t("common.error"),
          description: t("common.unexpectedError"),
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
          getApiUrl(`/Empresa/TraerClientes?IdEmpresa=${companyId}`),
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
          title: t("common.error"),
          description: t("newInvoice.loadingClients"),
          variant: "destructive",
        });
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, [toast]);

  // Cargar listas auxiliares
  useEffect(() => {
    const fetchAuxiliares = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) return;

        const endpoints = [
          { url: getApiUrl('/Auxiliar/ListaTiposPersona'), setter: setTiposPersona },
          { url: getApiUrl('/Auxiliar/ListaTiposIdentificacion'), setter: setTiposIdentificacion },
          { url: getApiUrl('/Auxiliar/ListaPaises'), setter: setPaises },
          { url: getApiUrl('/Auxiliar/ListaRegimenesFiscales'), setter: setRegimenesFiscales },
        ];

        for (const endpoint of endpoints) {
          const response = await fetch(endpoint.url, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const data = await response.json();
          if (data.codResponse === 1 && data.basePresentationList) {
            endpoint.setter(data.basePresentationList);
          }
        }
      } catch (error) {
        console.error("Error fetching auxiliares:", error);
      }
    };

    fetchAuxiliares();
  }, []);

  // Cargar departamentos cuando cambie el país
  useEffect(() => {
    const fetchDepartamentos = async () => {
      if (!clientData.pais) return;
      
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) return;

        const response = await fetch(
          getApiUrl(`/Auxiliar/ListaDepartamentosPais?IdPais=${clientData.pais}`),
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const data = await response.json();
        if (data.codResponse === 1 && data.basePresentationList) {
          setDepartamentos(data.basePresentationList);
        }
      } catch (error) {
        console.error("Error fetching departamentos:", error);
      }
    };

    fetchDepartamentos();
  }, [clientData.pais]);

  // Cargar municipios cuando cambie el departamento
  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!clientData.departamento) return;
      
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) return;

        const response = await fetch(
          getApiUrl(`/Auxiliar/ListaMuniciposDepartamento?IdDepartamento=${clientData.departamento}`),
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const data = await response.json();
        if (data.codResponse === 1 && data.basePresentationList) {
          setMunicipios(data.basePresentationList);
        }
      } catch (error) {
        console.error("Error fetching municipios:", error);
      }
    };

    fetchMunicipios();
  }, [clientData.departamento]);

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const authToken = localStorage.getItem("authToken");
        const companyId = localStorage.getItem("companyId");
        
        if (!authToken || !companyId) return;

        const response = await fetch(
          getApiUrl(`/Producto/TraerProductos?IdEmpresa=${companyId}`),
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        const data = await response.json();
        if (data.codResponse === 1 && data.basePresentationList) {
          setProducts(data.basePresentationList);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleClientSelect = async (clientId: string) => {
    if (!clientId || clientId === "__new__") {
      setSelectedClientId("");
      setSelectedClientDetail(null);
      setClientData({
        name: "",
        nit: "",
        tipoPersona: "",
        tipoIdentificacion: "",
        regimenFiscal: "",
        pais: "44",
        departamento: "",
        municipio: "",
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
        getApiUrl(`/Cliente/TraerCliente?IdCliente=${clientId}&IdEmpresa=${companyId}`),
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
          tipoPersona: client.TipoPersona?.toString() || "",
          tipoIdentificacion: client.TipoIdentificacion?.toString() || "",
          regimenFiscal: client.IdRegimenFiscal?.toString() || "",
          pais: client.IdPais?.toString() || "44",
          departamento: client.IdDepartamento?.toString() || "",
          municipio: client.IdMunicipio?.toString() || "",
          address: client.Ubicacion || "",
          city: client.MunicipioDane || "",
          phone: client.Telefono || "",
          email: client.Correo || "",
        });
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
      toast({
        title: t("common.error"),
        description: t("common.unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setLoadingClientDetail(false);
    }
  };

  const handleAddProductLine = (productId: string) => {
    if (!productId || productId === "__manual__") {
      // Agregar línea manual vacía
      const newLine: InvoiceLine = {
        id: Date.now().toString(),
        productName: "",
        quantity: 1,
        unitPrice: 0,
        iva: 19,
        total: 0,
        productCode: "",
        productId: undefined,
      };
      setInvoiceLines([...invoiceLines, newLine]);
      return;
    }

    const product = products.find(p => p.Id.toString() === productId);
    if (!product) return;

    const newLine: InvoiceLine = {
      id: Date.now().toString(),
      productName: product.Descripcion,
      quantity: 1,
      unitPrice: product.PrecioVenta,
      iva: 19, // Por defecto, podría venir de product.IdTipoImpuesto
      total: product.PrecioVenta * 1.19,
      productCode: product.CodigoReferencia,
      productId: product.Id,
    };
    setInvoiceLines([...invoiceLines, newLine]);
  };

  const handleRemoveLine = (lineId: string) => {
    setInvoiceLines(invoiceLines.filter(line => line.id !== lineId));
  };

  const handleUpdateLine = (lineId: string, field: keyof InvoiceLine, value: any) => {
    setInvoiceLines(invoiceLines.map(line => {
      if (line.id !== lineId) return line;
      
      const updatedLine = { ...line, [field]: value };
      
      // Recalcular total
      const subtotal = updatedLine.quantity * updatedLine.unitPrice;
      updatedLine.total = subtotal * (1 + updatedLine.iva / 100);
      
      return updatedLine;
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoiceLines.reduce((sum, line) => 
      sum + (line.quantity * line.unitPrice), 0
    );
    const iva = invoiceLines.reduce((sum, line) => 
      sum + (line.quantity * line.unitPrice * line.iva / 100), 0
    );
    const total = subtotal + iva;
    
    return { subtotal, iva, total };
  };

  const totals = calculateTotals();

  const handleGenerateInvoice = async () => {
    try {
      setCreatingInvoice(true);

      // Validaciones básicas
      if (!invoiceData.tipoComprobante) {
        toast({
          title: t("common.error"),
          description: t("newInvoice.selectDocType"),
          variant: "destructive",
        });
        return;
      }

      if (!clientData.name || !clientData.nit) {
        toast({
          title: t("common.error"),
          description: t("newInvoice.completeClientData"),
          variant: "destructive",
        });
        return;
      }

      if (invoiceLines.length === 0) {
        toast({
          title: t("common.error"),
          description: t("newInvoice.addProduct"),
          variant: "destructive",
        });
        return;
      }

      const authToken = localStorage.getItem("authToken");
      const companyId = localStorage.getItem("companyId");
      
      if (!authToken || !companyId) {
        toast({
          title: t("common.error"),
          description: t("newInvoice.sessionNotFound"),
          variant: "destructive",
        });
        return;
      }

      // Obtener parámetros de la empresa para la resolución
      const paramsResponse = await fetch(getApiUrl(`/Empresa/TraerParametros?IdEmpresa=${companyId}`), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const paramsData = await paramsResponse.json();
      
      let numAprobacionRes = 0;
      let anoAprobacionRes = new Date().getFullYear();
      let prefijo = "";
      
      if (paramsData.codResponse === 1 && paramsData.basePresentation?.IdResolucion) {
        const resResponse = await fetch(getApiUrl(`/Empresa/TraerResoluciones?IdEmpresa=${companyId}`), {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const resData = await resResponse.json();
        
        if (resData.codResponse === 1 && resData.basePresentationList) {
          const resolucion = resData.basePresentationList.find(
            (r: any) => r.Codigo === paramsData.basePresentation.IdResolucion
          );
          if (resolucion) {
            numAprobacionRes = parseInt(resolucion.Descripcion) || 0;
            anoAprobacionRes = parseInt(resolucion.InfoAdicional) || new Date().getFullYear();
            // Extraer prefijo del InfoAdicional2 (formato: "SETT - ")
            prefijo = resolucion.InfoAdicional2?.replace(" - ", "").trim() || "";
          }
        }
      }

      // Formato de fecha sin milisegundos y sin Z
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:00`;
      };

      const fechaExp = new Date(invoiceData.fechaExpedicion);
      const fechaVenc = new Date(invoiceData.fechaVencimiento || invoiceData.fechaExpedicion);

      // Construir objeto FV_CFDCab - TODOS los valores como strings
      const cabecera = {
        TipoComprobante: String(invoiceData.tipoComprobante),
        Prefijo: "",
        NumFactura: 0,
        IDInterno: selectedClientDetail?.Id?.toString() || clientData.nit,
        NombreVendedor: "",
        Condiciones_Pago: "14",
        FV_TDO_Codigo_TipoOperacion: "4",
        FechaExpedicion: formatDate(fechaExp),
        FechaVencimiento: formatDate(fechaVenc),
        FormaPago: "1",
        InfoAdicional: " ",
        MonedaISO: "COP",
        NumAprobacionRes: String(numAprobacionRes),
        AnoAprobacionRes: String(anoAprobacionRes),
        OrderID: "",
        TasaCambio: "",
        TotalIVA: totals.iva.toFixed(2),
        Total_a_Pagar: totals.total.toFixed(2),
        pague_hasta1: null,
        pague_hasta3: formatDate(fechaExp),
        referencia: "",
        CFD_LineCountNumeric: String(invoiceLines.length),
        CFD_LineExtensionAmount: totals.subtotal.toFixed(2),
        CFD_ResponseCode: "",
        CFD_TaxExclusiveAmount: totals.subtotal.toFixed(2),
        CFD_TaxInclusiveAmount: totals.total.toFixed(2),
        CFD_base_impo_total_nal: "0.00",
        CFD_campo_texto_15: null,
        CFD_fecha_tasadeCambio: formatDate(fechaExp),
        CFD_inf_origen_despacho: "",
        FechaFinalPeriodoFacturado: "",
        FechaInicialPeriodoFacturado: "",
      };

      // Construir detalles FV_CFDDet - matching formato funcional
      const detalles = invoiceLines.map((line, index) => ({
        id: String(index + 1),
        CodigoProducto: line.productCode || line.productName,
        DescripcionProducto: line.productName,
        Cantidad: Number(line.quantity),
        ValorUnitario: Number(line.unitPrice),
        PorIVAProducto: Number(line.iva),
        IVAProducto: Math.round((line.quantity * line.unitPrice * line.iva) / 100),
        IdConcepto: index + 1,
        ItemReferencia: index + 1,
        TipoImpuesto: 1,
        CodigosString: line.productCode || line.productName,
        CON_dato_decimal1: Number(line.quantity * line.unitPrice),
        CON_dato_texto15: "Producto Nacional",
        CON_categoria_1: null,
        CON_dato_fecha: null,
        con_recurrente: false,
        ConCategoria1: "",
        ConceptoFecha: "",
        tableData: { id: index }
      }));

      const documentoElectronico = {
        FV_CFDCab: cabecera,
        FV_CFDDet: detalles,
      };

      console.log("Enviando documento:", documentoElectronico);

      // Enviar al servidor
      const response = await fetch(getApiUrl("/Documento/CreateBilling"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentoElectronico),
      });

      const data = await response.json();

      console.log("=== RESPUESTA DEL SERVIDOR ===");
      console.log("Status:", response.status);
      console.log("Respuesta completa:", JSON.stringify(data, null, 2));
      console.log("==============================");

      if (data.codResponse === 1 || data.messageResponse?.includes("exitosamente") || data.messageResponse?.includes("registrado")) {
        toast({
          title: t("newInvoice.success"),
          description: data.messageResponse || t("newInvoice.invoiceCreated"),
        });
        
        // Redirigir a la lista de facturas
        setTimeout(() => {
          navigate("/invoices");
        }, 2000);
      } else {
        console.error("Error del servidor:", data);
        toast({
          title: t("common.error"),
          description: `${data.messageResponse || t("common.unexpectedError")}. Ver consola para detalles.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: t("common.error"),
        description: t("newInvoice.errorCreating"),
        variant: "destructive",
      });
    } finally {
      setCreatingInvoice(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("newInvoice.title")}</h1>
          <p className="text-muted-foreground">{t("newInvoice.subtitle")}</p>
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
              <CardTitle>{t("newInvoice.initialConfig")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docType">{t("newInvoice.docType")} {t("newInvoice.required")}</Label>
                <Select 
                  disabled={loadingTipos}
                  value={invoiceData.tipoComprobante}
                  onValueChange={(value) => setInvoiceData({...invoiceData, tipoComprobante: value})}
                >
                  <SelectTrigger id="docType">
                    <SelectValue placeholder={loadingTipos ? t("newInvoice.loading") : t("newInvoice.selectType")} />
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
                <Label htmlFor="country">{t("newInvoice.jurisdiction")} {t("newInvoice.required")}</Label>
                <Select defaultValue="co">
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="co">{t("newInvoice.colombia")}</SelectItem>
                    <SelectItem value="es">{t("newInvoice.spain")}</SelectItem>
                    <SelectItem value="int">{t("newInvoice.international")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">{t("newInvoice.issueDate")} {t("newInvoice.required")}</Label>
                  <Input 
                    id="issueDate" 
                    type="date" 
                    value={invoiceData.fechaExpedicion}
                    onChange={(e) => setInvoiceData({...invoiceData, fechaExpedicion: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">{t("newInvoice.dueDate")} {t("newInvoice.required")}</Label>
                  <Input 
                    id="dueDate" 
                    type="date"
                    value={invoiceData.fechaVencimiento}
                    onChange={(e) => setInvoiceData({...invoiceData, fechaVencimiento: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">{t("newInvoice.invoiceNumber")}</Label>
                <Input id="invoiceNumber" placeholder={t("newInvoice.autoGenerated")} disabled />
                <p className="text-xs text-muted-foreground">
                  {t("newInvoice.autoGeneratedDesc")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>{t("newInvoice.information")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium mb-2">{t("newInvoice.electronicBilling")}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("newInvoice.electronicBillingDesc")}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">Colombia</Badge>
                    <span className="text-xs">{t("newInvoice.validatedDian")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700">España</Badge>
                    <span className="text-xs">{t("newInvoice.verifactuCompatible")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-700">Internacional</Badge>
                    <span className="text-xs">{t("newInvoice.standardFormat")}</span>
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
            <CardTitle>{t("newInvoice.clientData")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientSelect">{t("newInvoice.selectClient")}</Label>
              <Select 
                value={selectedClientId} 
                onValueChange={handleClientSelect}
                disabled={loadingClients}
              >
                <SelectTrigger id="clientSelect">
                  <SelectValue placeholder={loadingClients ? t("newInvoice.loadingClients") : t("newInvoice.selectClientPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new__">{t("newInvoice.newClient")}</SelectItem>
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
                <Label htmlFor="tipoPersona">{t("newInvoice.personType")} {t("newInvoice.required")}</Label>
                <Select 
                  value={clientData.tipoPersona}
                  onValueChange={(value) => setClientData({...clientData, tipoPersona: value})}
                >
                  <SelectTrigger id="tipoPersona">
                    <SelectValue placeholder={t("newInvoice.selectPersonType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPersona.map((tipo) => (
                      <SelectItem key={tipo.Codigo} value={tipo.Codigo.toString()}>
                        {tipo.Descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoIdentificacion">{t("newInvoice.identificationType")} {t("newInvoice.required")}</Label>
                <Select 
                  value={clientData.tipoIdentificacion}
                  onValueChange={(value) => setClientData({...clientData, tipoIdentificacion: value})}
                >
                  <SelectTrigger id="tipoIdentificacion">
                    <SelectValue placeholder={t("newInvoice.selectIdentificationType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposIdentificacion.map((tipo) => (
                      <SelectItem key={tipo.Codigo} value={tipo.Codigo.toString()}>
                        {tipo.Descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">{t("newInvoice.clientName")} {t("newInvoice.required")}</Label>
                <Input 
                  id="clientName" 
                  placeholder={t("newInvoice.clientNamePlaceholder")}
                  value={clientData.name}
                  onChange={(e) => setClientData({...clientData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientTax">{t("newInvoice.taxId")} {t("newInvoice.required")}</Label>
                <Input 
                  id="clientTax" 
                  placeholder={t("newInvoice.taxIdPlaceholder")}
                  value={clientData.nit}
                  onChange={(e) => setClientData({...clientData, nit: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regimenFiscal">{t("newInvoice.taxRegime")} {t("newInvoice.required")}</Label>
              <Select 
                value={clientData.regimenFiscal}
                onValueChange={(value) => setClientData({...clientData, regimenFiscal: value})}
              >
                <SelectTrigger id="regimenFiscal">
                  <SelectValue placeholder={t("newInvoice.selectTaxRegime")} />
                </SelectTrigger>
                <SelectContent>
                  {regimenesFiscales.map((regimen) => (
                    <SelectItem key={regimen.Codigo} value={regimen.Codigo.toString()}>
                      {regimen.Descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAddress">{t("newInvoice.address")} {t("newInvoice.required")}</Label>
              <Input 
                id="clientAddress" 
                placeholder={t("newInvoice.addressPlaceholder")}
                value={clientData.address}
                onChange={(e) => setClientData({...clientData, address: e.target.value})}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="clientCountry">{t("newInvoice.country")} {t("newInvoice.required")}</Label>
                <Select 
                  value={clientData.pais}
                  onValueChange={(value) => {
                    setClientData({...clientData, pais: value, departamento: "", municipio: ""});
                    setDepartamentos([]);
                    setMunicipios([]);
                  }}
                >
                  <SelectTrigger id="clientCountry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paises.map((pais) => (
                      <SelectItem key={pais.Codigo} value={pais.Codigo.toString()}>
                        {pais.Descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientDepartment">{t("newInvoice.department")} {t("newInvoice.required")}</Label>
                <Select 
                  value={clientData.departamento}
                  onValueChange={(value) => {
                    setClientData({...clientData, departamento: value, municipio: ""});
                    setMunicipios([]);
                  }}
                  disabled={!clientData.pais}
                >
                  <SelectTrigger id="clientDepartment">
                    <SelectValue placeholder={t("newInvoice.selectDepartment")} />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((dept) => (
                      <SelectItem key={dept.Codigo} value={dept.Codigo.toString()}>
                        {dept.Descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCity">{t("newInvoice.city")} {t("newInvoice.required")}</Label>
                <Select 
                  value={clientData.municipio}
                  onValueChange={(value) => setClientData({...clientData, municipio: value})}
                  disabled={!clientData.departamento}
                >
                  <SelectTrigger id="clientCity">
                    <SelectValue placeholder={t("newInvoice.selectCity")} />
                  </SelectTrigger>
                  <SelectContent>
                    {municipios.map((mun) => (
                      <SelectItem key={mun.Codigo} value={mun.Codigo.toString()}>
                        {mun.Descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">{t("newInvoice.phone")}</Label>
              <Input 
                id="clientPhone" 
                placeholder={t("newInvoice.phonePlaceholder")}
                value={clientData.phone}
                onChange={(e) => setClientData({...clientData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">{t("newInvoice.email")} {t("newInvoice.required")}</Label>
              <Input 
                id="clientEmail" 
                type="email" 
                placeholder={t("newInvoice.emailPlaceholder")}
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
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productSelect">Agregar Producto</Label>
              <div className="flex gap-2">
                <Select 
                  onValueChange={handleAddProductLine}
                  disabled={loadingProducts}
                  value=""
                >
                  <SelectTrigger id="productSelect" className="flex-1">
                    <SelectValue placeholder={loadingProducts ? "Cargando productos..." : "Seleccione un producto"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__manual__">-- Producto Manual --</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.Id} value={product.Id.toString()}>
                        {product.Descripcion} - {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }).format(product.PrecioVenta)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                  {invoiceLines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No hay productos agregados. Seleccione un producto arriba para comenzar.
                      </td>
                    </tr>
                  ) : (
                    invoiceLines.map((line) => (
                      <tr key={line.id} className="border-b">
                        <td className="px-4 py-3">
                          <Input 
                            placeholder="Nombre del producto..."
                            value={line.productName}
                            onChange={(e) => handleUpdateLine(line.id, 'productName', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number" 
                            className="w-20"
                            value={line.quantity}
                            onChange={(e) => handleUpdateLine(line.id, 'quantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number" 
                            className="w-28"
                            value={line.unitPrice}
                            onChange={(e) => handleUpdateLine(line.id, 'unitPrice', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Select 
                            value={line.iva.toString()}
                            onValueChange={(value) => handleUpdateLine(line.id, 'iva', Number(value))}
                          >
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
                          <span className="font-semibold">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(line.total)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveLine(line.id)}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(totals.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(totals.iva)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(totals.total)}
                  </span>
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
                <Label className="text-muted-foreground">Tipo de Comprobante</Label>
                <p className="font-medium">
                  {tiposComprobante.find(t => t.Codigo.toString() === invoiceData.tipoComprobante)?.Descripcion || "No seleccionado"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Cliente</Label>
                <p className="font-medium">{clientData.name || "No seleccionado"}</p>
                <p className="text-sm text-muted-foreground">NIT: {clientData.nit || "N/A"}</p>
                {clientData.email && (
                  <p className="text-sm text-muted-foreground">Email: {clientData.email}</p>
                )}
                {clientData.phone && (
                  <p className="text-sm text-muted-foreground">Teléfono: {clientData.phone}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Fecha Expedición</Label>
                  <p className="font-medium">
                    {invoiceData.fechaExpedicion ? new Date(invoiceData.fechaExpedicion).toLocaleDateString('es-CO') : "No especificada"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vencimiento</Label>
                  <p className="font-medium">
                    {invoiceData.fechaVencimiento ? new Date(invoiceData.fechaVencimiento).toLocaleDateString('es-CO') : "No especificada"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 block">Productos</Label>
                <div className="space-y-2">
                  {invoiceLines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay productos agregados</p>
                  ) : (
                    invoiceLines.map((line) => (
                      <div key={line.id} className="flex justify-between text-sm border-b pb-2">
                        <div className="flex-1">
                          <p className="font-medium">{line.productName}</p>
                          <p className="text-muted-foreground">
                            Cantidad: {line.quantity} × {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(line.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(line.total)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">IVA:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(totals.iva)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(totals.total)}
                    </span>
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
                  value={invoiceData.notasInternas}
                  onChange={(e) => setInvoiceData({...invoiceData, notasInternas: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicNotes">Notas para el Cliente</Label>
                <Textarea
                  id="publicNotes"
                  placeholder="Notas que aparecerán en la factura..."
                  rows={3}
                  value={invoiceData.notasCliente}
                  onChange={(e) => setInvoiceData({...invoiceData, notasCliente: e.target.value})}
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
            <Button 
              className="gap-2"
              onClick={handleGenerateInvoice}
              disabled={creatingInvoice}
            >
              {creatingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Generar Factura
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
