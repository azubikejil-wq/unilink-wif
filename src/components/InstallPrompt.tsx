import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(checkInstalled);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true); // Always show button when prompt is available
      
      const hasDismissed = localStorage.getItem('pwa-install-dismissed');
      if (!hasDismissed && !checkInstalled) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowBanner(false);
    setShowButton(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  // Don't show anything if already installed
  if (isInstalled) return null;

  return (
    <>
      {/* Floating Banner */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Card className="p-4 shadow-lg border-2 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">
                  Install UniLink App
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Install our app for faster access and offline support
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleInstall}
                    size="sm"
                    className="text-xs"
                  >
                    Install
                  </Button>
                  <Button 
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Not now
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Fixed Install Button (always visible when installable) */}
      {showButton && !showBanner && (
        <Button
          onClick={handleInstall}
          className="fixed bottom-4 right-4 z-50 shadow-lg"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Install App
        </Button>
      )}
    </>
  );
};

export default InstallPrompt;