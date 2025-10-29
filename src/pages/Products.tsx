import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, PlusCircle, Package, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  Id: number;
  Descripcion: string;
  DescripcionCorta: string | null;
  CodigoReferencia: string;
  IdEmpresa: number;
  IdUnidadMedida: number;
  Costo: number;
  UltimoCosto: number;
  PrecioVenta: number;
  IdTipoImpuesto: number;
  IdTipo: number;
  CuentaClientes: string | null;
  CuentaIngreso: string | null;
  CuentaImpuestos: string | null;
  SubCentroCostos: string | null;
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        if (data.codResponse === 1 && data.basePresentationList) {
          setProducts(data.basePresentationList);
        } else {
          toast.error("Error al cargar productos");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.Descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.CodigoReferencia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

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
              placeholder="Buscar productos por nombre o código de referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-3 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No se encontraron productos</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza agregando tu primer producto"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Código Ref.</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Costo</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Precio Venta</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.Id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                            <Package className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{product.Descripcion}</p>
                            {product.DescripcionCorta && (
                              <p className="text-sm text-muted-foreground">
                                {product.DescripcionCorta}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">{product.CodigoReferencia}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">
                          {product.IdTipo === 1 ? "Servicio" : "Producto"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm">{formatPrice(product.Costo)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold">{formatPrice(product.PrecioVenta)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
