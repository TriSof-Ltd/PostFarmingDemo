import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Shield } from 'lucide-react';
import type { Platform } from '@/lib/types';

export default function Connections() {
  const { currentClient, updateClient } = useApp();
  const { toast } = useToast();

  if (!currentClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">No Client Selected</h2>
        <p className="text-muted-foreground">Please select or add a client to manage social media connections</p>
      </div>
    );
  }

  const handleConnect = (platform: Platform) => {
    // Simulate OAuth connection
    toast({
      title: 'Connecting...',
      description: `Opening ${platform} authentication...`,
    });

    setTimeout(() => {
      const newAccount = {
        id: `${currentClient.id}-${platform}-${Date.now()}`,
        platform,
        username: `${platform}_user_${Math.floor(Math.random() * 10000)}`,
        avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${platform}${Date.now()}`,
        isConnected: true,
        connectedAt: new Date(),
      };

      const existingAccountIndex = currentClient.connectedAccounts.findIndex(
        (acc) => acc.platform === platform
      );

      let updatedAccounts;
      if (existingAccountIndex >= 0) {
        // Update existing account
        updatedAccounts = [...currentClient.connectedAccounts];
        updatedAccounts[existingAccountIndex] = {
          ...updatedAccounts[existingAccountIndex],
          isConnected: true,
          connectedAt: new Date(),
        };
      } else {
        // Add new account
        updatedAccounts = [...currentClient.connectedAccounts, newAccount];
      }

      updateClient({
        ...currentClient,
        connectedAccounts: updatedAccounts,
      });

      toast({
        title: 'Connected!',
        description: `Successfully connected ${platform} account`,
      });
    }, 1500);
  };

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
      name: 'Facebook',
      platform: 'facebook' as Platform,
      icon: SiFacebook,
      color: '#1877F2',
      description: 'Connect your Facebook Page',
    },
    {
      name: 'Instagram',
      platform: 'instagram' as Platform,
      icon: SiInstagram,
      color: '#E4405F',
      description: 'Connect your Instagram Business account',
    },
    {
      name: 'TikTok',
      platform: 'tiktok' as Platform,
      icon: SiTiktok,
      color: '#000000',
      description: 'Connect your TikTok Business account',
    },
  ];

  const getAccountForPlatform = (platform: Platform) => {
    return currentClient.connectedAccounts.find((acc) => acc.platform === platform);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Connections</h1>
          <p className="text-muted-foreground mt-1">Manage your social media account connections</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/security" data-testid="link-security">
            <Shield className="mr-2 h-4 w-4" />
            Security & Account Health
          </Link>
        </Button>
      </div>

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
                      Connected
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        className="flex-1"
                        data-testid={`button-disconnect-${platformInfo.platform}`}
                      >
                        Disconnect
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-settings-${platformInfo.platform}`}>
                        Settings
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleConnect(platformInfo.platform)}
                    data-testid={`button-connect-${platformInfo.platform}`}
                  >
                    Connect
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
