import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Settings,
    Bell,
    Shield,
    Database,
    Mail,
    Palette,
    Save,
    Languages
} from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminSettings() {
    const { language, setLanguage, t } = useLanguage();

    const [settings, setSettings] = useState({
        // General Settings
        siteName: 'Project Management System',
        siteUrl: 'https://example.com',
        adminEmail: 'admin@example.com',

        // Notification Settings
        emailNotifications: true,
        projectUpdates: true,
        taskAssignments: true,
        sprintReminders: true,

        // Security Settings
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,

        // System Settings
        autoBackup: true,
        backupFrequency: 'daily',
        maintenanceMode: false,
    });

    const handleSave = () => {
        // Logic to save settings
        console.log('Saving settings:', settings);
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
                    <p className="text-muted-foreground">{t('settings.description')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* General Settings */}
                    <Card className="bg-gradient-card border-border/50 lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                <CardTitle>{t('settings.general')}</CardTitle>
                            </div>
                            <CardDescription>{t('settings.general.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="siteName">{t('settings.siteName')}</Label>
                                <Input
                                    id="siteName"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siteUrl">{t('settings.siteUrl')}</Label>
                                <Input
                                    id="siteUrl"
                                    type="url"
                                    value={settings.siteUrl}
                                    onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="adminEmail">{t('settings.adminEmail')}</Label>
                                <Input
                                    id="adminEmail"
                                    type="email"
                                    value={settings.adminEmail}
                                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader>
                            <CardTitle>{t('settings.quickActions')}</CardTitle>
                            <CardDescription>{t('settings.quickActions.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                <Database className="h-4 w-4 mr-2" />
                                {t('settings.backupDb')}
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Mail className="h-4 w-4 mr-2" />
                                {t('settings.testEmail')}
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Palette className="h-4 w-4 mr-2" />
                                {t('settings.clearCache')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Language Settings */}
                    <Card className="bg-gradient-card border-border/50 lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Languages className="h-5 w-5 text-primary" />
                                <CardTitle>{t('settings.language')}</CardTitle>
                            </div>
                            <CardDescription>{t('settings.language.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-xs space-y-2">
                                <Label htmlFor="language">{t('settings.language')}</Label>
                                <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
                                    <SelectTrigger id="language">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">
                                            <div className="flex items-center gap-2">
                                                🇬🇧 <span>English</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="fr">
                                            <div className="flex items-center gap-2">
                                                🇫🇷 <span>Français</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {language === 'en'
                                        ? 'Changes will be applied immediately across the entire application'
                                        : 'Les modifications seront appliquées immédiatement dans toute l\'application'
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card className="bg-gradient-card border-border/50 lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                <CardTitle>{t('settings.notifications')}</CardTitle>
                            </div>
                            <CardDescription>{t('settings.notifications.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="emailNotifications">{t('settings.emailNotifications')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.emailNotifications.desc')}
                                    </p>
                                </div>
                                <Switch
                                    id="emailNotifications"
                                    checked={settings.emailNotifications}
                                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="projectUpdates">{t('settings.projectUpdates')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.projectUpdates.desc')}
                                    </p>
                                </div>
                                <Switch
                                    id="projectUpdates"
                                    checked={settings.projectUpdates}
                                    onCheckedChange={(checked) => setSettings({...settings, projectUpdates: checked})}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="taskAssignments">{t('settings.taskAssignments')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.taskAssignments.desc')}
                                    </p>
                                </div>
                                <Switch
                                    id="taskAssignments"
                                    checked={settings.taskAssignments}
                                    onCheckedChange={(checked) => setSettings({...settings, taskAssignments: checked})}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="sprintReminders">{t('settings.sprintReminders')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.sprintReminders.desc')}
                                    </p>
                                </div>
                                <Switch
                                    id="sprintReminders"
                                    checked={settings.sprintReminders}
                                    onCheckedChange={(checked) => setSettings({...settings, sprintReminders: checked})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card className="bg-gradient-card border-border/50">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <CardTitle>{t('settings.security')}</CardTitle>
                            </div>
                            <CardDescription>{t('settings.security.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="twoFactorAuth">{t('settings.twoFactor')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.twoFactor.desc')}
                                    </p>
                                </div>
                                <Switch
                                    id="twoFactorAuth"
                                    checked={settings.twoFactorAuth}
                                    onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="sessionTimeout">{t('settings.sessionTimeout')}</Label>
                                <Input
                                    id="sessionTimeout"
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="passwordExpiry">{t('settings.passwordExpiry')}</Label>
                                <Input
                                    id="passwordExpiry"
                                    type="number"
                                    value={settings.passwordExpiry}
                                    onChange={(e) => setSettings({...settings, passwordExpiry: parseInt(e.target.value)})}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Settings */}
                    <Card className="bg-gradient-card border-border/50 lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-primary" />
                                <CardTitle>{t('settings.system')}</CardTitle>
                            </div>
                            <CardDescription>{t('settings.system.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="autoBackup">{t('settings.autoBackup')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.autoBackup.desc')}
                                    </p>
                                </div>
                                <Switch
                                    id="autoBackup"
                                    checked={settings.autoBackup}
                                    onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="maintenanceMode">{t('settings.maintenanceMode')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.maintenanceMode.desc')}
                                    </p>
                                </div>
                                <Switch
                                    id="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} size="lg" className="bg-gradient-primary hover:opacity-90">
                        <Save className="h-4 w-4 mr-2" />
                        {t('settings.save')}
                    </Button>
                </div>
            </div>
        </Layout>
    );
}