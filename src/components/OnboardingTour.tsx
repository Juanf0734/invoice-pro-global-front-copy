import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingStep {
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
}

export function OnboardingTour() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const steps: OnboardingStep[] = [
    {
      title: t("onboarding.step1Title"),
      description: t("onboarding.step1Desc"),
      target: "[data-tour='dashboard']",
      position: "bottom",
    },
    {
      title: t("onboarding.step2Title"),
      description: t("onboarding.step2Desc"),
      target: "[data-tour='new-invoice']",
      position: "right",
    },
    {
      title: t("onboarding.step3Title"),
      description: t("onboarding.step3Desc"),
      target: "[data-tour='invoices']",
      position: "right",
    },
    {
      title: t("onboarding.step4Title"),
      description: t("onboarding.step4Desc"),
      target: "[data-tour='clients']",
      position: "right",
    },
    {
      title: t("onboarding.step5Title"),
      description: t("onboarding.step5Desc"),
      target: "[data-tour='products']",
      position: "right",
    },
    {
      title: t("onboarding.step6Title"),
      description: t("onboarding.step6Desc"),
      target: "[data-tour='company']",
      position: "right",
    },
    {
      title: t("onboarding.step7Title"),
      description: t("onboarding.step7Desc"),
      target: "[data-tour='language']",
      position: "bottom",
    },
    {
      title: t("onboarding.step8Title"),
      description: t("onboarding.step8Desc"),
      target: "[data-tour='settings']",
      position: "right",
    },
  ];

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isVisible && currentStep < steps.length) {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-primary", "ring-offset-2", "rounded-md");
      }
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove("ring-2", "ring-primary", "ring-offset-2", "rounded-md");
      }
    };
  }, [currentStep, isVisible]);

  const checkOnboardingStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hasSeenOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
    if (!hasSeenOnboarding) {
      // Small delay to ensure DOM is ready
      setTimeout(() => setIsVisible(true), 500);
    }
  };

  const handleNext = () => {
    if (targetElement) {
      targetElement.classList.remove("ring-2", "ring-primary", "ring-offset-2", "rounded-md");
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (targetElement) {
      targetElement.classList.remove("ring-2", "ring-primary", "ring-offset-2", "rounded-md");
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleSkip = async () => {
    if (targetElement) {
      targetElement.classList.remove("ring-2", "ring-primary", "ring-offset-2", "rounded-md");
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, "true");
    }
    setIsVisible(false);
  };

  const handleFinish = async () => {
    if (targetElement) {
      targetElement.classList.remove("ring-2", "ring-primary", "ring-offset-2", "rounded-md");
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, "true");
    }
    setIsVisible(false);
  };

  const getCardPosition = () => {
    if (!targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    const position = steps[currentStep].position;
    
    const offset = 20;
    
    switch (position) {
      case "bottom":
        return {
          top: `${rect.bottom + offset}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          top: `${rect.top - offset}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translate(-50%, -100%)",
        };
      case "right":
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + offset}px`,
          transform: "translateY(-50%)",
        };
      case "left":
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - offset}px`,
          transform: "translate(-100%, -50%)",
        };
      default:
        return {};
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" />
      
      {/* Tour Card */}
      <Card 
        className="fixed z-50 w-80 shadow-2xl animate-scale-in"
        style={getCardPosition()}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
              <CardDescription className="mt-2">
                {steps[currentStep].description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("onboarding.previous")}
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleFinish}>
              {t("onboarding.finish")}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {t("onboarding.next")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
