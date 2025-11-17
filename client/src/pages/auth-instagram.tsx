import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { SiInstagram } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/lib/AppContext';
import { useToast } from '@/hooks/use-toast';

export default function AuthInstagram() {
  const [, setLocation] = useLocation();
  const { currentClient, updateClient } = useApp();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    document.title = 'Connect Instagram | Post Farming';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Authorize Post Farming to access your Instagram account');
    }
  }, []);

  const handleAuthorize = () => {
    if (!currentClient) {
      toast({
        title: 'No client selected',
        description: 'Please select a client first',
        variant: 'destructive',
      });
      setLocation('/connections');
      return;
    }

    setIsConnecting(true);

    setTimeout(() => {
      const updatedAccounts = currentClient.connectedAccounts.map(account =>
        account.platform === 'instagram'
          ? { ...account, isConnected: true }
          : account
      );

      updateClient({
        ...currentClient,
        connectedAccounts: updatedAccounts,
      });

      toast({
        title: 'Instagram connected',
        description: 'Your Instagram account has been successfully connected',
      });

      setLocation('/connections');
    }, 1500);
  };

  const handleCancel = () => {
    setLocation('/connections');
  };

  if (!currentClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 dark:from-purple-950 dark:to-slate-950 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#515BD4] flex items-center justify-center">
            <SiInstagram className="h-12 w-12 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Connect Instagram</h1>
            <p className="text-muted-foreground">
              Post Farming would like to access your Instagram account
            </p>
          </div>

          <div className="w-full bg-muted p-4 rounded-lg text-left space-y-2">
            <p className="text-sm font-semibold">This app will be able to:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Post photos and videos</li>
              <li>• Read your profile information</li>
              <li>• View post insights</li>
              <li>• Manage comments</li>
            </ul>
          </div>

          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isConnecting}
              className="flex-1"
              data-testid="button-cancel-auth"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAuthorize}
              disabled={isConnecting}
              className="flex-1 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4]"
              data-testid="button-authorize-instagram"
            >
              {isConnecting ? 'Connecting...' : 'Authorize'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This is a demo environment. No actual connection to Instagram is made.
          </p>
        </div>
      </Card>
    </div>
  );
}
