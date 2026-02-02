import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Download, Smartphone, Share, Plus, CheckCircle2, Wifi, Bell, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Wifi, title: 'Works Offline', description: 'Access your data without internet' },
    { icon: Bell, title: 'Push Notifications', description: 'Get reminders and updates' },
    { icon: Zap, title: 'Fast & Responsive', description: 'Native-like performance' },
    { icon: Smartphone, title: 'Home Screen', description: 'Launch like a native app' },
  ];

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="h-20 w-20 mx-auto rounded-3xl gradient-hero flex items-center justify-center">
            <Download className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display">Install Bright Wellbeing</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get the full app experience on your device. Track your wellness anywhere, anytime.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-4 text-center">
                  <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Install Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="font-display">
              {isStandalone ? 'Already Installed! ✨' : 'Install Now'}
            </CardTitle>
            <CardDescription>
              {isStandalone 
                ? 'You\'re using the installed app version' 
                : 'Add to your home screen for the best experience'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isStandalone || installed ? (
              <div className="flex items-center gap-3 p-4 bg-health-green/10 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-health-green" />
                <div>
                  <p className="font-medium text-health-green">App Installed</p>
                  <p className="text-sm text-muted-foreground">You're all set!</p>
                </div>
              </div>
            ) : isIOS ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  On iOS, install manually using Safari:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Share className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">1. Tap the Share button</p>
                      <p className="text-xs text-muted-foreground">At the bottom of Safari</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">2. Add to Home Screen</p>
                      <p className="text-xs text-muted-foreground">Scroll and tap this option</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">3. Tap Add</p>
                      <p className="text-xs text-muted-foreground">Confirm to install</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : deferredPrompt ? (
              <Button onClick={handleInstall} size="lg" className="w-full gradient-bg">
                <Download className="h-5 w-5 mr-2" />
                Install App
              </Button>
            ) : (
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">
                  Installation not available. Try opening this page in Chrome or Edge.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
