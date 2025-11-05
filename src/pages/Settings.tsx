import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Shield, Globe, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";

const Settings = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [defaultTab, setDefaultTab] = useState("preferences");

  const [preferences, setPreferences] = useState({
    language: "es",
    currency: "COP",
    timezone: "America/Bogota",
    dateFormat: "DD/MM/YYYY",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "subscription") {
      setDefaultTab("subscription");
    }
    loadPreferences();
  }, [searchParams]);

  const loadPreferences = () => {
    const savedLanguage = localStorage.getItem("language") || "es";
    const savedCurrency = localStorage.getItem("currency") || "COP";
    const savedTimezone = localStorage.getItem("timezone") || "America/Bogota";
    const savedDateFormat = localStorage.getItem("dateFormat") || "DD/MM/YYYY";

    setPreferences({
      language: savedLanguage,
      currency: savedCurrency,
      timezone: savedTimezone,
      dateFormat: savedDateFormat,
    });
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("settings.passwordsDontMatch"),
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: t("common.error"),
        description: t("settings.passwordMinLength"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: t("settings.passwordUpdated"),
        description: t("settings.passwordUpdatedDesc"),
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = () => {
    // Save all preferences to localStorage
    localStorage.setItem("language", preferences.language);
    localStorage.setItem("currency", preferences.currency);
    localStorage.setItem("timezone", preferences.timezone);
    localStorage.setItem("dateFormat", preferences.dateFormat);
    
    // Apply language change immediately
    i18n.changeLanguage(preferences.language);
    
    toast({
      title: t("settings.preferencesSaved"),
      description: t("settings.preferencesSavedDesc"),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Tabs value={defaultTab} onValueChange={setDefaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences" className="gap-2">
            <Globe className="h-4 w-4" />
            {t("settings.preferences")}
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Suscripción
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            {t("settings.security")}
          </TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="subscription" className="space-y-4">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Planes de Suscripción</h2>
            <p className="text-muted-foreground">
              Elige el plan que mejor se adapte a las necesidades de tu negocio
            </p>
          </div>
          <SubscriptionPlans />
          <Card className="mt-6 shadow-lg border-blue-200">
            <CardHeader>
              <CardTitle>Complemento PEPPOL</CardTitle>
              <CardDescription>Interoperabilidad PEPPOL disponible</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">€39,00 / mes</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Valor por documento: €0,01
                    </p>
                  </div>
                  <Button variant="outline">Próximamente</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("settings.platformPreferences")}</CardTitle>
              <CardDescription>{t("settings.platformPreferencesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">{t("settings.language")}</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">{t("settings.defaultCurrency")}</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COP">COP ($)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">{t("settings.timezone")}</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">{t("settings.dateFormat")}</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} className="gap-2">
                  <Save className="h-4 w-4" />
                  {t("settings.savePreferences")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("settings.changePassword")}</CardTitle>
              <CardDescription>{t("settings.changePasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">{t("auth.minPasswordLength")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("settings.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleUpdatePassword} disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      {t("settings.updatePassword")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">{t("settings.accountSecurity")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("settings.twoFactorAuth")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.comingSoon")}</p>
                </div>
                <Button variant="outline" disabled size="sm">
                  Configurar
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("settings.activeSessions")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.activeSessionsDesc")}</p>
                </div>
                <Button variant="outline" size="sm">
                  {t("settings.viewSessions")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
