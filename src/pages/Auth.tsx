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
      console.log("Intentando login con usuario:", username);
      
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

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("La respuesta no es JSON. Content-Type:", contentType);
        const text = await response.text();
        console.error("Respuesta recibida:", text.substring(0, 200));
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor de autenticación. Verifica tu conexión.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        toast({
          title: t("auth.signInError"),
          description: "Credenciales inválidas",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      console.log("Datos de login recibidos:", data);
      
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        
        {/* Animated Orbs */}
        <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-primary/40 blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-20 h-[500px] w-[500px] rounded-full bg-accent/50 blur-3xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/30 blur-2xl animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '2s' }} />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Floating Shapes */}
        <div className="absolute top-1/4 left-1/4 h-24 w-24 rounded-lg bg-primary/20 rotate-45 animate-float"
             style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/3 right-1/4 h-20 w-20 rounded-full bg-accent/25 animate-float"
             style={{ animation: 'float 10s ease-in-out infinite 2s' }} />
        <div className="absolute top-2/3 left-1/3 h-28 w-28 rounded-lg bg-primary/15 -rotate-12 animate-float"
             style={{ animation: 'float 12s ease-in-out infinite 4s' }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <img src={ebillLogo} alt="eBill Pro" className="mx-auto mb-4 h-16 w-auto animate-scale-in" />
          <p className="text-muted-foreground">{t("auth.platformSubtitle")}</p>
        </div>

        <Card className="shadow-2xl backdrop-blur-sm bg-background/95 border-primary/10 animate-scale-in">
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

      {/* Add floating animation keyframe */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(10px) rotate(-5deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;

