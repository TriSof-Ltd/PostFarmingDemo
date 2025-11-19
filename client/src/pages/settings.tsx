import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/lib/AppContext';
import { translations } from '@/lib/translations';

export default function Settings() {
  const { language, setLanguage } = useApp();
  const t = translations[language];

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t.profile}</CardTitle>
            <CardDescription>{t.profileDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" alt="Profile" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm" data-testid="button-change-avatar">{t.changeAvatar}</Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t.fullName}</Label>
                <Input id="name" defaultValue="uhakdt@gmail.com" data-testid="input-profile-name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" defaultValue="uhakdt@gmail.com" data-testid="input-profile-email" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>{t.notifications}</CardTitle>
            <CardDescription>{t.notificationsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.emailNotifications}</Label>
                <p className="text-sm text-muted-foreground">{t.emailNotificationsDesc}</p>
              </div>
              <Switch defaultChecked data-testid="switch-email-notifications" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.postReminders}</Label>
                <p className="text-sm text-muted-foreground">{t.postRemindersDesc}</p>
              </div>
              <Switch defaultChecked data-testid="switch-post-reminders" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.securityAlerts}</Label>
                <p className="text-sm text-muted-foreground">{t.securityAlertsDesc}</p>
              </div>
              <Switch defaultChecked data-testid="switch-security-alerts" />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{t.preferences}</CardTitle>
            <CardDescription>{t.preferencesDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.language}</Label>
                <p className="text-sm text-muted-foreground">{t.languageDesc}</p>
              </div>
              <div className="w-[180px]">
                <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t.english}</SelectItem>
                    <SelectItem value="ku">{t.kurdish}</SelectItem>
                    <SelectItem value="ar">{t.arabic}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.autoSaveDrafts}</Label>
                <p className="text-sm text-muted-foreground">{t.autoSaveDraftsDesc}</p>
              </div>
              <Switch defaultChecked data-testid="switch-auto-save" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.showCalendarPreviews}</Label>
                <p className="text-sm text-muted-foreground">{t.showCalendarPreviewsDesc}</p>
              </div>
              <Switch defaultChecked data-testid="switch-calendar-previews" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">{t.cancel}</Button>
          <Button data-testid="button-save-settings">{t.saveChanges}</Button>
        </div>
      </div>
    </div>
  );
}
