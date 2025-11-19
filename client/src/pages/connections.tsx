import { useState } from 'react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Shield, ChevronRight } from 'lucide-react';
import type { Platform } from '@/lib/types';
import { translations } from '@/lib/translations';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function Connections() {
  const { currentClient, updateClient, language } = useApp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];

  if (!currentClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">No Client Selected</h2>
        <p className="text-muted-foreground">Please select or add a client to manage social media connections</p>
      </div>
    );
  }

  const handleDisconnect = (accountId: string) => {
    const updatedAccounts = currentClient.connectedAccounts.map((acc) =>
      acc.id === accountId ? { ...acc, isConnected: false } : acc
    );

    updateClient({
      ...currentClient,
      connectedAccounts: updatedAccounts,
    });

    toast({
      title: 'Disconnected',
      description: 'Account has been disconnected',
    });
  };

  const platforms = [
    {
      name: t.facebook,
      platform: 'facebook' as Platform,
      icon: SiFacebook,
      color: '#1877F2',
      description: t.connectFacebook,
    },
    {
      name: t.instagram,
      platform: 'instagram' as Platform,
      icon: SiInstagram,
      color: '#E4405F',
      description: t.connectInstagram,
    },
    {
      name: t.tiktok,
      platform: 'tiktok' as Platform,
      icon: SiTiktok,
      color: '#000000',
      description: t.connectTiktok,
    },
  ];

  const getAccountForPlatform = (platform: Platform) => {
    return currentClient.connectedAccounts.find((acc) => acc.platform === platform);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Collapsible Trust Card */}
        <div className="w-full lg:w-[550px]">
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full border rounded-lg bg-white shadow-sm overflow-hidden transition-all duration-200"
          >
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-green-600 fill-green-600/20" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{t.secureConnectionsTitle}</h3>
                  <p className="text-xs text-muted-foreground">{t.secureConnectionsSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="hidden md:inline-flex bg-green-50 text-green-700 hover:bg-green-100 border-green-200 font-medium text-[10px] px-2 h-5">
                  {t.accountShieldBadge}
                </Badge>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 rounded-full hover:bg-muted">
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            <CollapsibleContent>
              <div className="px-3 pb-3 pt-0">
                <div className="border-t border-border/50 my-2"></div>
                <ul className="space-y-1.5 mt-3 ml-1">
                  <li className="flex items-center gap-2 text-xs text-foreground/80">
                    <span className="h-1 w-1 rounded-full bg-foreground/40 shrink-0" />
                    {t.trustPoint1}
                  </li>
                  <li className="flex items-center gap-2 text-xs text-foreground/80">
                    <span className="h-1 w-1 rounded-full bg-foreground/40 shrink-0" />
                    {t.trustPoint2}
                  </li>
                  <li className="flex items-center gap-2 text-xs text-foreground/80">
                    <span className="h-1 w-1 rounded-full bg-foreground/40 shrink-0" />
                    {t.trustPoint3}
                  </li>
                  <li className="flex items-center gap-2 text-xs text-foreground/80">
                    <span className="h-1 w-1 rounded-full bg-foreground/40 shrink-0" />
                    {t.trustPoint4}
                  </li>
                </ul>
                <div className="mt-3 pt-1">
                  <Link href="/security" className="text-xs text-green-600 hover:text-green-700 hover:underline font-medium inline-flex items-center gap-1">
                    {t.viewSecurityOverview}
                  </Link>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platformInfo) => {
          const account = getAccountForPlatform(platformInfo.platform);
          const isConnected = account?.isConnected;
          const Icon = platformInfo.icon;

          return (
            <Card key={platformInfo.platform} className="hover-elevate" data-testid={`card-${platformInfo.platform}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: platformInfo.color }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{platformInfo.name}</CardTitle>
                    {isConnected && account && (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={account.avatar} alt={account.username} />
                          <AvatarFallback>{account.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{account.username}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{platformInfo.description}</CardDescription>
                {isConnected && account ? (
                  <div className="space-y-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      {t.connected}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        className="flex-1"
                        data-testid={`button-disconnect-${platformInfo.platform}`}
                      >
                        {t.disconnect}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-settings-${platformInfo.platform}`}>
                        {t.settings}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    asChild
                    data-testid={`button-connect-${platformInfo.platform}`}
                  >
                    <Link href={`/auth/${platformInfo.platform}`}>
                      {t.connect}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
