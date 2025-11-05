import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import WelcomeScreen from "@/components/WelcomeScreen";
import BuyScreen from "@/components/BuyScreen";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import VoucherHistory from "@/components/VoucherHistory";

type Screen = "splash" | "welcome" | "buy" | "confirmation" | "history";

interface PurchaseData {
  days: number;
  total: number;
  voucherCode: string;
  securityPin: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    days: 1,
    total: 500,
    voucherCode: "",
    securityPin: "",
  });

  const handleSplashComplete = () => {
    setCurrentScreen("welcome");
  };

  const handleBuyClick = () => {
    setCurrentScreen("buy");
  };

  const handleHistoryClick = () => {
    setCurrentScreen("history");
  };

  const handleBack = () => {
    setCurrentScreen("welcome");
  };

  const handleConfirm = (
    days: number,
    total: number,
    voucherCode: string,
    securityPin: string
  ) => {
    setPurchaseData({ days, total, voucherCode, securityPin });

    // TODO: Save to Supabase database
    // await supabase.from('voucher_purchases').insert({
    //   voucher_code: voucherCode,
    //   days: days,
    //   total: total,
    //   security_pin: securityPin,
    //   created_at: new Date().toISOString()
    // });

    setCurrentScreen("confirmation");
  };

  const handleBackToHome = () => {
    setCurrentScreen("welcome");
  };

  return (
    <>
      {currentScreen === "splash" && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {currentScreen === "welcome" && (
        <WelcomeScreen onBuyClick={handleBuyClick} onHistoryClick={handleHistoryClick} />
      )}

      {currentScreen === "buy" && (
        <BuyScreen onBack={handleBack} onConfirm={handleConfirm} />
      )}

      {currentScreen === "confirmation" && (
        <ConfirmationScreen
          days={purchaseData.days}
          total={purchaseData.total}
          voucherCode={purchaseData.voucherCode}
          securityPin={purchaseData.securityPin}  // ✅ added this line only
          onBackToHome={handleBackToHome}
        />
      )}

      {currentScreen === "history" && <VoucherHistory onBack={handleBack} />}
    </>
  );
};

export default Index;
