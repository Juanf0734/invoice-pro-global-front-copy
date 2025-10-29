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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Productos y Servicios</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gestiona tu catálogo de productos</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <PlusCircle className="h-4 w-4" />
          <span className="sm:inline">Nuevo Producto</span>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
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
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden lg:block overflow-x-auto">
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

              {/* Vista de tarjetas para móvil y tablet */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredProducts.map((product) => (
                  <Card key={product.Id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0">
                          <Package className="h-6 w-6 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate">{product.Descripcion}</h3>
                              {product.DescripcionCorta && (
                                <p className="text-sm text-muted-foreground truncate mt-1">
                                  {product.DescripcionCorta}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="flex-shrink-0">
                              {product.IdTipo === 1 ? "Servicio" : "Producto"}
                            </Badge>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Código:</span>
                              <span className="font-mono">{product.CodigoReferencia}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Costo:</span>
                              <span>{formatPrice(product.Costo)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground text-sm">Precio Venta:</span>
                              <span className="font-semibold text-base">{formatPrice(product.PrecioVenta)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                            <Button variant="outline" size="sm" className="flex-1 gap-2">
                              <Edit className="h-4 w-4" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
