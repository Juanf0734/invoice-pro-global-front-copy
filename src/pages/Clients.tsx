import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Mail, Phone, MapPin, Building2 } from "lucide-react";

const clients = [
  {
    id: 1,
    name: "Boutique Real",
    taxId: "900123895",
    email: "juandavidpinzonpruebasqa@fymtech.com",
    phone: "0",
    address: "calle 49 sur # 95a - 63",
    city: "Bogotá",
    country: "Colombia",
    invoices: 12,
    totalBilled: "€15,000",
  },
  {
    id: 2,
    name: "Tech Solutions SL",
    taxId: "B12345678",
    email: "contacto@techsolutions.es",
    phone: "+34 912 345 678",
    address: "Calle Mayor 45",
    city: "Madrid",
    country: "España",
    invoices: 24,
    totalBilled: "€45,600",
  },
  {
    id: 3,
    name: "Global Trading Inc",
    taxId: "US-123456789",
    email: "info@globaltrading.com",
    phone: "+1 555 0123",
    address: "123 Business Ave",
    city: "New York",
    country: "USA",
    invoices: 8,
    totalBilled: "$18,900",
  },
];

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card key={client.id} className="overflow-hidden transition-all hover:shadow-md">
                <div className="h-2 bg-gradient-primary" />
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline">{client.country}</Badge>
                  </div>

                  <h3 className="mb-1 text-lg font-semibold">{client.name}</h3>
                  <p className="mb-4 font-mono text-sm text-muted-foreground">{client.taxId}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{client.city}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Facturas</p>
                        <p className="font-semibold">{client.invoices}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total Facturado</p>
                        <p className="font-semibold text-primary">{client.totalBilled}</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="mt-4 w-full">
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
