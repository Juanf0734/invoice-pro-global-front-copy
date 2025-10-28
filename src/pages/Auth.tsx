import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import ebillLogo from "@/assets/ebill-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/Login/autenticacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          User: username,
          Password: password,
        }),
      });

      if (!response.ok) {
        toast({
          title: t("auth.signInError"),
          description: "Credenciales inválidas",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      
      // El token está en messageResponse
      const token = data.messageResponse;
      if (!token) {
        throw new Error("No se recibió el token de autenticación");
      }
      
      localStorage.setItem("authToken", token);
      localStorage.setItem("userName", username);
      
      // Store company information from login response
      if (data.basePresentation?.IdEmpresa) {
        localStorage.setItem("companyId", data.basePresentation.IdEmpresa.toString());
        localStorage.setItem("companyName", data.basePresentation.NombreEmpresa || "");
        localStorage.setItem("companyNit", data.basePresentation.NitEmpresa || "");
      }
      
      toast({
        title: t("auth.welcome"),
        description: t("auth.signInSuccess"),
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("common.unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registro no disponible",
      description: "Por favor contacta al administrador para crear una cuenta",
      variant: "destructive",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={ebillLogo} alt="eBill Pro" className="mx-auto mb-4 h-16 w-auto" />
          <p className="text-muted-foreground">{t("auth.platformSubtitle")}</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t("auth.accessPlatform")}</CardTitle>
            <CardDescription className="text-center">
              {t("auth.accessDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("auth.signIn")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Usuario</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="nombre_usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("auth.password")}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      t("auth.signIn")
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Por favor contacta al administrador para crear una cuenta
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3">
          <p className="text-center text-xs text-muted-foreground">
            {t("auth.termsPrivacy")}
          </p>
          <div className="text-center">
            <Link 
              to="/pricing" 
              className="text-sm text-primary hover:underline font-medium"
            >
              Ver planes y precios →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

