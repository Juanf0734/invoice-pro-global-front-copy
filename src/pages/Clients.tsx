import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, PlusCircle, Mail, Phone, MapPin, Building2, User, Hash, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
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
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 columns x 3 rows

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
          `/api/Empresa/TraerClientes?IdEmpresa=${companyId}`,
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
        `/api/Cliente/TraerCliente?IdCliente=${clientId}&IdEmpresa=${companyId}`,
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
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes por identificación o email..."
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
              <p className="text-muted-foreground">No se encontraron clientes</p>
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
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} de {filteredClients.length} clientes
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
                          Anterior
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
                          Siguiente
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
            <DialogTitle>Detalles del Cliente</DialogTitle>
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
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron detalles del cliente
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
