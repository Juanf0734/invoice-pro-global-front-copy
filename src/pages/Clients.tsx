import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, PlusCircle, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";

interface Client {
  IdCliente: number;
  Nombre: string;
  Identificacion: string;
  Email: string;
  Telefono: string;
  Direccion: string;
  Ciudad: string;
  Pais: string;
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredClients = clients.filter(
    (client) =>
      client.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.Identificacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Total clientes:", clients.length);
  console.log("Clientes filtrados:", filteredClients.length);
  console.log("Término de búsqueda:", searchTerm);

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
              placeholder="Buscar clientes por nombre, NIT o email..."
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
                <Card key={client.IdCliente} className="overflow-hidden transition-all hover:shadow-md">
                  <div className="h-2 bg-gradient-primary" />
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      {client.Pais && <Badge variant="outline">{client.Pais}</Badge>}
                    </div>

                    <h3 className="mb-1 text-lg font-semibold">{client.Nombre}</h3>
                    <p className="mb-4 font-mono text-sm text-muted-foreground">{client.Identificacion}</p>

                    <div className="space-y-2 text-sm">
                      {client.Email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{client.Email}</span>
                        </div>
                      )}
                      {client.Telefono && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{client.Telefono}</span>
                        </div>
                      )}
                      {client.Ciudad && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{client.Ciudad}</span>
                        </div>
                      )}
                      {client.Direccion && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <span className="truncate">{client.Direccion}</span>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" className="mt-4 w-full">
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
