import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const { t } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      const installDismissed = localStorage.getItem('install-prompt-dismissed')
      if (!installDismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true

    if (isStandalone) {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('install-prompt-dismissed', 'true')
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 p-4 md:bottom-5 md:left-auto md:right-5 md:max-w-md">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5">
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">
            {t('pwa.installTitle') || 'ثبّت التطبيق'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('pwa.installDescription') || 'ثبّت التطبيق على جهازك للوصول السريع'}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={handleInstall}
          className="shrink-0"
        >
          <Download weight="bold" className="ml-2" />
          {t('pwa.install') || 'تثبيت'}
        </Button>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
