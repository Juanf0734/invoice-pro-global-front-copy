import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, PlusCircle, Mail, Phone, MapPin, Building2, User, Hash, Globe, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "react-i18next";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Client {
  Codigo: number;
  Descripcion: string;
  InfoAdicional: string;
}

interface ClientDetail {
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
  PrimerNombre?: string;
  SegundoNombre?: string;
  PrimerApellido?: string;
  SegundoApellido?: string;
}

interface ClientFormData {
  Nombre: string;
  Nit: string;
  DigitoVerificacion: string;
  TipoPersona: number;
  TipoIdentificacion: number;
  IdRegimenFiscal: number;
  Telefono: string;
  Correo: string;
  Direccion: string;
  CodigoPostal: string;
  PaisIso: string;
  IdPais: number;
  DepartamentoDane: string;
  IdDepartamento: number;
  MunicipioDane: string;
  IdMunicipio: number;
  PrimerNombre?: string;
  SegundoNombre?: string;
  PrimerApellido?: string;
  SegundoApellido?: string;
}

const Clients = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 columns x 3 rows
  
  const [formData, setFormData] = useState<ClientFormData>({
    Nombre: "",
    Nit: "",
    DigitoVerificacion: "",
    TipoPersona: 1,
    TipoIdentificacion: 31,
    IdRegimenFiscal: 1,
    Telefono: "",
    Correo: "",
    Direccion: "",
    CodigoPostal: "",
    PaisIso: "CO",
    IdPais: 46,
    DepartamentoDane: "",
    IdDepartamento: 0,
    MunicipioDane: "",
    IdMunicipio: 0,
    PrimerNombre: "",
    SegundoNombre: "",
    PrimerApellido: "",
    SegundoApellido: "",
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("No se encontró el token de autenticación");
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const companyId = payload.IdEmpresa;

        const response = await fetch(
          getApiUrl(`/Empresa/TraerClientes?IdEmpresa=${companyId}`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        
        console.log("API Response:", data);
        console.log("basePresentationList:", data.basePresentationList);
        console.log("Primer cliente:", data.basePresentationList?.[0]);
        
        if (data.codResponse === 1 && data.basePresentationList) {
          setClients(data.basePresentationList);
          console.log("Clientes cargados:", data.basePresentationList.length);
        } else {
          console.log("No se encontraron clientes o error en respuesta");
          toast.error("Error al cargar los clientes");
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Error al cargar los clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleViewDetails = async (clientId: number) => {
    try {
      setLoadingDetail(true);
      setShowDetailDialog(true);
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No se encontró el token de autenticación");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const companyId = payload.IdEmpresa;

      const response = await fetch(
        getApiUrl(`/Cliente/TraerCliente?IdCliente=${clientId}&IdEmpresa=${companyId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.codResponse === 1 && data.basePresentation) {
        setSelectedClient(data.basePresentation);
      } else {
        toast.error("Error al cargar los detalles del cliente");
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
      toast.error("Error al cargar los detalles del cliente");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleNewClient = () => {
    setIsEditMode(false);
    setFormData({
      Nombre: "",
      Nit: "",
      DigitoVerificacion: "",
      TipoPersona: 1,
      TipoIdentificacion: 31,
      IdRegimenFiscal: 1,
      Telefono: "",
      Correo: "",
      Direccion: "",
      CodigoPostal: "",
      PaisIso: "CO",
      IdPais: 46,
      DepartamentoDane: "",
      IdDepartamento: 0,
      MunicipioDane: "",
      IdMunicipio: 0,
      PrimerNombre: "",
      SegundoNombre: "",
      PrimerApellido: "",
      SegundoApellido: "",
    });
    setShowFormDialog(true);
  };

  const handleEditClient = () => {
    if (!selectedClient) return;
    
    setIsEditMode(true);
    setFormData({
      Nombre: selectedClient.Nombre || "",
      Nit: selectedClient.Nit || "",
      DigitoVerificacion: selectedClient.DigitoVerificacion || "",
      TipoPersona: selectedClient.TipoPersona || 1,
      TipoIdentificacion: selectedClient.TipoIdentificacion || 31,
      IdRegimenFiscal: selectedClient.IdRegimenFiscal || 1,
      Telefono: selectedClient.Telefono || "",
      Correo: selectedClient.Correo || "",
      Direccion: selectedClient.Ubicacion || "",
      CodigoPostal: selectedClient.CodigoPostal || "",
      PaisIso: selectedClient.PaisIso || "CO",
      IdPais: selectedClient.IdPais || 46,
      DepartamentoDane: selectedClient.DepartamentoDane || "",
      IdDepartamento: selectedClient.IdDepartamento || 0,
      MunicipioDane: selectedClient.MunicipioDane || "",
      IdMunicipio: selectedClient.IdMunicipio || 0,
      PrimerNombre: selectedClient.PrimerNombre || "",
      SegundoNombre: selectedClient.SegundoNombre || "",
      PrimerApellido: selectedClient.PrimerApellido || "",
      SegundoApellido: selectedClient.SegundoApellido || "",
    });
    setShowDetailDialog(false);
    setShowFormDialog(true);
  };

  const handleDeleteClient = () => {
    setShowDetailDialog(false);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No se encontró el token de autenticación");
        return;
      }

      const response = await fetch(
        getApiUrl("/Cliente/EliminarCliente"),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ IdEmpresa: selectedClient.Id }),
        }
      );

      const data = await response.json();

      if (data.codResponse === 1) {
        toast.success(t("clients.clientDeleted"));
        setShowDeleteDialog(false);
        setSelectedClient(null);
        // Refrescar lista de clientes
        const payload = JSON.parse(atob(token.split(".")[1]));
        const companyId = payload.IdEmpresa;
        const clientsResponse = await fetch(
          getApiUrl(`/Empresa/TraerClientes?IdEmpresa=${companyId}`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const clientsData = await clientsResponse.json();
        if (clientsData.codResponse === 1 && clientsData.basePresentationList) {
          setClients(clientsData.basePresentationList);
        }
      } else {
        toast.error(t("clients.errorDeleting"));
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error(t("clients.errorDeleting"));
    }
  };

  const handleSaveClient = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No se encontró el token de autenticación");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const companyId = parseInt(payload.IdEmpresa);

      const clientData = {
        Nombre: formData.Nombre,
        Nit: formData.Nit,
        DigitoVerificacion: formData.DigitoVerificacion || "0",
        IDInterno: formData.Nit,
        TipoPersona: formData.TipoPersona,
        TipoIdentificacion: formData.TipoIdentificacion,
        IdRegimenFiscal: formData.IdRegimenFiscal,
        Telefono: formData.Telefono || "0",
        Correo: formData.Correo || "",
        Direccion: formData.Direccion || "",
        CodigoPostal: formData.CodigoPostal || "",
        IdPais: formData.IdPais || 46,
        IdDepartamento: formData.IdDepartamento || 0,
        IdMunicipio: formData.IdMunicipio || 0,
        ...(isEditMode && selectedClient && { Id: selectedClient.Id }),
      };

      const requestBody = isEditMode ? clientData : {
        ...clientData,
        IdEmpresaRegistro: companyId
      };

      const endpoint = isEditMode ? "/Cliente/ModificarCliente" : "/Cliente/CrearCliente";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(getApiUrl(endpoint), {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.codResponse === 1) {
        toast.success(isEditMode ? t("clients.clientUpdated") : t("clients.clientCreated"));
        setShowFormDialog(false);
        
        // Refrescar lista de clientes
        const clientsResponse = await fetch(
          getApiUrl(`/Empresa/TraerClientes?IdEmpresa=${companyId}`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const clientsData = await clientsResponse.json();
        if (clientsData.codResponse === 1 && clientsData.basePresentationList) {
          setClients(clientsData.basePresentationList);
        }
      } else {
        toast.error(isEditMode ? t("clients.errorUpdating") : t("clients.errorCreating"));
      }
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error(isEditMode ? t("clients.errorUpdating") : t("clients.errorCreating"));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.InfoAdicional?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (showEllipsisStart) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (showEllipsisEnd) {
        pages.push(-2); // -2 represents ellipsis
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  console.log("Total clientes:", clients.length);
  console.log("Clientes filtrados:", filteredClients.length);
  console.log("Página actual:", currentPage);
  console.log("Total páginas:", totalPages);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("clients.title")}</h1>
          <p className="text-muted-foreground">{t("clients.subtitle")}</p>
        </div>
        <Button className="gap-2" onClick={handleNewClient}>
          <PlusCircle className="h-4 w-4" />
          {t("clients.newClient")}
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("clients.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-2 w-full" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("clients.noClients")}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentClients.map((client) => (
                  <Card key={client.Codigo} className="overflow-hidden transition-all hover:shadow-md">
                    <div className="h-2 bg-gradient-primary" />
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="outline">ID: {client.Codigo}</Badge>
                      </div>

                      <h3 className="mb-1 text-lg font-semibold">{client.Descripcion}</h3>
                      
                      <div className="space-y-2 text-sm mt-4">
                        {client.InfoAdicional && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{client.InfoAdicional}</span>
                          </div>
                        )}
                      </div>

                      <Button variant="outline" className="mt-4 w-full" onClick={() => handleViewDetails(client.Codigo)}>
                        {t("clients.viewDetails")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("clients.showing")} {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} {t("clients.of")} {filteredClients.length} {t("clients.clients")}
                  </p>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          {t("clients.previous")}
                        </Button>
                      </PaginationItem>

                      {getPageNumbers().map((pageNum, index) => (
                        <PaginationItem key={index}>
                          {pageNum === -1 || pageNum === -2 ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="gap-1"
                        >
                          {t("clients.next")}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("clients.clientDetails")}</DialogTitle>
          </DialogHeader>
          
          {loadingDetail ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedClient ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedClient.Nombre || 'Sin nombre'}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedClient.Id}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {selectedClient.Nit && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      NIT
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedClient.Nit}</p>
                  </div>
                )}

                {selectedClient.IDInterno && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      ID Interno
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedClient.IDInterno}</p>
                  </div>
                )}

                {selectedClient.Correo && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedClient.Correo}</p>
                  </div>
                )}

                {selectedClient.Telefono && selectedClient.Telefono !== "0" && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Teléfono
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedClient.Telefono}</p>
                  </div>
                )}

                {selectedClient.PaisIso && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      País
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedClient.PaisIso}</p>
                  </div>
                )}

                {selectedClient.CodigoPostal && selectedClient.CodigoPostal.trim() && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Código Postal
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedClient.CodigoPostal}</p>
                  </div>
                )}

                {selectedClient.Ubicacion && (
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Ubicación
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedClient.Ubicacion}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleEditClient} className="gap-2">
                  <Edit className="h-4 w-4" />
                  {t("clients.editClient")}
                </Button>
                <Button variant="destructive" onClick={handleDeleteClient} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  {t("clients.deleteClient")}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron detalles del cliente
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Dialog - Create/Edit */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? t("clients.editClient") : t("clients.createClient")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">{t("newInvoice.clientName")} *</Label>
                <Input
                  id="nombre"
                  value={formData.Nombre}
                  onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                  placeholder={t("newInvoice.clientNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit">{t("newInvoice.taxId")} *</Label>
                <Input
                  id="nit"
                  value={formData.Nit}
                  onChange={(e) => setFormData({ ...formData, Nit: e.target.value })}
                  placeholder={t("newInvoice.taxIdPlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoPersona">{t("newInvoice.personType")}</Label>
                <Select
                  value={formData.TipoPersona.toString()}
                  onValueChange={(value) => setFormData({ ...formData, TipoPersona: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Persona Jurídica</SelectItem>
                    <SelectItem value="2">Persona Natural</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoIdentificacion">{t("newInvoice.identificationType")}</Label>
                <Select
                  value={formData.TipoIdentificacion.toString()}
                  onValueChange={(value) => setFormData({ ...formData, TipoIdentificacion: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="31">NIT</SelectItem>
                    <SelectItem value="13">Cédula</SelectItem>
                    <SelectItem value="22">Cédula Extranjera</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regimenFiscal">{t("newInvoice.taxRegime")}</Label>
                <Select
                  value={formData.IdRegimenFiscal.toString()}
                  onValueChange={(value) => setFormData({ ...formData, IdRegimenFiscal: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Régimen Común</SelectItem>
                    <SelectItem value="2">Régimen Simplificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.TipoPersona === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primerNombre">{t("clients.firstName")}</Label>
                  <Input
                    id="primerNombre"
                    value={formData.PrimerNombre}
                    onChange={(e) => setFormData({ ...formData, PrimerNombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segundoNombre">{t("clients.secondName")}</Label>
                  <Input
                    id="segundoNombre"
                    value={formData.SegundoNombre}
                    onChange={(e) => setFormData({ ...formData, SegundoNombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primerApellido">{t("clients.firstLastName")}</Label>
                  <Input
                    id="primerApellido"
                    value={formData.PrimerApellido}
                    onChange={(e) => setFormData({ ...formData, PrimerApellido: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segundoApellido">{t("clients.secondLastName")}</Label>
                  <Input
                    id="segundoApellido"
                    value={formData.SegundoApellido}
                    onChange={(e) => setFormData({ ...formData, SegundoApellido: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="correo">{t("newInvoice.email")}</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.Correo}
                  onChange={(e) => setFormData({ ...formData, Correo: e.target.value })}
                  placeholder={t("newInvoice.emailPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">{t("newInvoice.phone")}</Label>
                <Input
                  id="telefono"
                  value={formData.Telefono}
                  onChange={(e) => setFormData({ ...formData, Telefono: e.target.value })}
                  placeholder={t("newInvoice.phonePlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">{t("newInvoice.address")}</Label>
              <Input
                id="direccion"
                value={formData.Direccion}
                onChange={(e) => setFormData({ ...formData, Direccion: e.target.value })}
                placeholder={t("newInvoice.addressPlaceholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pais">{t("newInvoice.country")}</Label>
                <Input
                  id="pais"
                  value={formData.PaisIso}
                  onChange={(e) => setFormData({ ...formData, PaisIso: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigoPostal">{t("company.postalCode")}</Label>
                <Input
                  id="codigoPostal"
                  value={formData.CodigoPostal}
                  onChange={(e) => setFormData({ ...formData, CodigoPostal: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveClient} disabled={isSaving}>
              {isSaving ? t("common.saving") : (isEditMode ? t("clients.updateClient") : t("clients.createClient"))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clients.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("clients.confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
