import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import WelcomeScreen from "@/components/WelcomeScreen";
import BuyScreen from "@/components/BuyScreen";
import ConfirmationScreen from "@/components/ConfirmationScreen";

type Screen = "splash" | "welcome" | "buy" | "confirmation";

interface PurchaseData {
  days: number;
  total: number;
  voucherCode: string;
  securityPin: string;
}

const Index = () => {
  const navigate = useNavigate();
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
    console.log('Navigating to voucher history');
    navigate('/voucher-history');
  };

  const handleBack = () => {
    setCurrentScreen("welcome");
  };

  const handleConfirm = (
    days: number,
    total: number,
    voucherCode: string
  ) => {
    // Generate security pin (same as voucher code for simplicity)
    const securityPin = voucherCode;
    
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
          securityPin={purchaseData.securityPin}
          onBackToHome={handleBackToHome}
        />
      )}
    </>
  );
};

export default Index;