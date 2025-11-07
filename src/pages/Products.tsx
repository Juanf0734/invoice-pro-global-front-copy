import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, PlusCircle, Package, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newProduct, setNewProduct] = useState({
    Descripcion: "",
    DescripcionCorta: "",
    CodigoReferencia: "",
    IdUnidadMedida: 29980,
    Costo: "",
    PrecioVenta: "",
    IdTipoImpuesto: 16413,
    IdTipo: 1,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("authToken");
      const companyId = localStorage.getItem("companyId");
      
      try {
        const response = await fetch(
          getApiUrl(`/Producto/TraerProductos?IdEmpresa=${companyId}`),
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

  const handleCreateProduct = async () => {
    if (!newProduct.Descripcion || !newProduct.CodigoReferencia) {
      toast.error("Descripción y código de referencia son obligatorios");
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem("authToken");
    const companyId = localStorage.getItem("companyId");

    try {
      const response = await fetch(getApiUrl("/Producto/AgregarProducto"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newProduct,
          IdEmpresa: parseInt(companyId || "0"),
          Costo: parseFloat(newProduct.Costo) || 0,
          PrecioVenta: parseFloat(newProduct.PrecioVenta) || 0,
        }),
      });

      const data = await response.json();

      if (data.codResponse === 1) {
        toast.success("Producto creado exitosamente");
        setShowCreateDialog(false);
        setNewProduct({
          Descripcion: "",
          DescripcionCorta: "",
          CodigoReferencia: "",
          IdUnidadMedida: 29980,
          Costo: "",
          PrecioVenta: "",
          IdTipoImpuesto: 16413,
          IdTipo: 1,
        });
        // Recargar productos
        const fetchResponse = await fetch(
          getApiUrl(`/Producto/TraerProductos?IdEmpresa=${companyId}`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const fetchData = await fetchResponse.json();
        if (fetchData.codResponse === 1 && fetchData.basePresentationList) {
          setProducts(fetchData.basePresentationList);
        }
      } else {
        toast.error(data.messageResponse || "Error al crear producto");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error al crear producto");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("products.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t("products.subtitle")}</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setShowCreateDialog(true)}>
          <PlusCircle className="h-4 w-4" />
          <span className="sm:inline">{t("products.newProduct")}</span>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("products.searchPlaceholder")}
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
              <h3 className="mt-4 text-lg font-semibold">{t("products.noProducts")}</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? t("products.tryOtherTerms")
                  : t("products.addFirstProduct")}
              </p>
            </div>
          ) : (
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">{t("products.product")}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">{t("products.refCode")}</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">{t("products.type")}</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">{t("products.cost")}</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">{t("products.salePrice")}</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">{t("common.actions")}</th>
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
                            {product.IdTipo === 1 ? t("products.service") : t("products.product")}
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
                              {product.IdTipo === 1 ? t("products.service") : t("products.product")}
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
                              {t("common.edit")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t("common.delete")}
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

      {/* Diálogo de creación */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("products.newProduct")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Input
                id="descripcion"
                value={newProduct.Descripcion}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, Descripcion: e.target.value })
                }
                placeholder="Nombre del producto o servicio"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descripcionCorta">Descripción Corta</Label>
              <Input
                id="descripcionCorta"
                value={newProduct.DescripcionCorta}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, DescripcionCorta: e.target.value })
                }
                placeholder="Descripción breve (opcional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codigoReferencia">Código de Referencia *</Label>
              <Input
                id="codigoReferencia"
                value={newProduct.CodigoReferencia}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, CodigoReferencia: e.target.value })
                }
                placeholder="Código único del producto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={newProduct.IdTipo.toString()}
                onValueChange={(value) =>
                  setNewProduct({ ...newProduct, IdTipo: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Servicio</SelectItem>
                  <SelectItem value="2">Producto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="costo">Costo</Label>
                <Input
                  id="costo"
                  type="number"
                  step="0.01"
                  value={newProduct.Costo}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, Costo: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precioVenta">Precio de Venta</Label>
                <Input
                  id="precioVenta"
                  type="number"
                  step="0.01"
                  value={newProduct.PrecioVenta}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, PrecioVenta: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isSaving}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreateProduct} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Crear Producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
