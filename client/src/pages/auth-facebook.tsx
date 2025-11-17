import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { SiFacebook } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/lib/AppContext';
import { useToast } from '@/hooks/use-toast';

export default function AuthFacebook() {
  const [, setLocation] = useLocation();
  const { currentClient, updateClient } = useApp();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    document.title = 'Connect Facebook | Post Farming';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Authorize Post Farming to access your Facebook account');
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
        account.platform === 'facebook'
          ? { ...account, isConnected: true }
          : account
      );

      updateClient({
        ...currentClient,
        connectedAccounts: updatedAccounts,
      });

      toast({
        title: 'Facebook connected',
        description: 'Your Facebook account has been successfully connected',
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-950 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-[#1877F2] flex items-center justify-center">
            <SiFacebook className="h-12 w-12 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Connect Facebook</h1>
            <p className="text-muted-foreground">
              Post Farming would like to access your Facebook account
            </p>
          </div>

          <div className="w-full bg-muted p-4 rounded-lg text-left space-y-2">
            <p className="text-sm font-semibold">This app will be able to:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Post on your behalf</li>
              <li>• Read your profile information</li>
              <li>• View post analytics</li>
              <li>• Manage comments and messages</li>
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
              className="flex-1 bg-[#1877F2] hover:bg-[#1877F2]/90"
              data-testid="button-authorize-facebook"
            >
              {isConnecting ? 'Connecting...' : 'Authorize'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This is a demo environment. No actual connection to Facebook is made.
          </p>
        </div>
      </Card>
    </div>
  );
}
