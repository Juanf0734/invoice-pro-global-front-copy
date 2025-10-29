import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, PlusCircle, Mail, Phone, MapPin, Building2, User, Hash, Globe } from "lucide-react";
import { toast } from "sonner";

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

  console.log("Total clientes:", clients.length);
  console.log("Clientes filtrados:", filteredClients.length);

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map((client) => (
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
