import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Package, Edit, Trash2 } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Consultoría Estratégica",
    description: "Servicio de consultoría empresarial",
    sku: "CONS-001",
    price: "€150/hora",
    category: "Servicios",
    stock: "-",
  },
  {
    id: 2,
    name: "Desarrollo Web",
    description: "Desarrollo de aplicaciones web a medida",
    sku: "DEV-WEB-001",
    price: "€85/hora",
    category: "Servicios",
    stock: "-",
  },
  {
    id: 3,
    name: "Licencia Software Pro",
    description: "Licencia anual de software empresarial",
    sku: "LIC-PRO-001",
    price: "€1,200/año",
    category: "Licencias",
    stock: "50",
  },
  {
    id: 4,
    name: "Diseño Gráfico",
    description: "Paquete de diseño corporativo",
    sku: "DIS-001",
    price: "€450",
    category: "Servicios",
    stock: "-",
  },
  {
    id: 5,
    name: "Hosting Empresarial",
    description: "Servidor dedicado mensual",
    sku: "HOST-ENT-001",
    price: "€89/mes",
    category: "Hosting",
    stock: "Ilimitado",
  },
  {
    id: 6,
    name: "Soporte Técnico Premium",
    description: "Soporte 24/7 prioritario",
    sku: "SUP-PREM-001",
    price: "€299/mes",
    category: "Servicios",
    stock: "-",
  },
];

const categoryColors: Record<string, string> = {
  Servicios: "bg-blue-100 text-blue-700 border-blue-200",
  Licencias: "bg-purple-100 text-purple-700 border-purple-200",
  Hosting: "bg-green-100 text-green-700 border-green-200",
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("authToken");
      const companyId = localStorage.getItem("companyId");
      
      try {
        const response = await fetch(
          `/api/Producto/TraerProductos?IdEmpresa=${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log("=== PRODUCTOS API RESPONSE ===");
        console.log(JSON.stringify(data, null, 2));
        console.log("==============================");
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos y Servicios</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos por nombre, SKU o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Producto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Categoría</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Precio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                          <Package className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={categoryColors[product.category] || "bg-gray-100 text-gray-700"}
                      >
                        {product.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{product.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{product.stock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default Products;
