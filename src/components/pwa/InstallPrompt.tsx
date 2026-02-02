import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not dismissed before
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show iOS prompt after delay
    if (isIOSDevice && !isStandaloneMode) {
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-40 lg:left-auto lg:right-4 lg:max-w-sm"
      >
        <Card className="shadow-2xl border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold font-display">Install App</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get the full experience with our app. Works offline!
                </p>

                {isIOS ? (
                  <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                    <p className="flex items-center gap-2">
                      <Share className="h-4 w-4" />
                      Tap <strong>Share</strong>
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <Plus className="h-4 w-4" />
                      Then <strong>Add to Home Screen</strong>
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={handleInstall} className="gradient-bg">
                      <Download className="h-4 w-4 mr-1" />
                      Install
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDismiss}>
                      Not now
                    </Button>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
