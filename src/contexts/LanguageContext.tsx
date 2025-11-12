import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.projects': 'Projects',
        'nav.tasks': 'Tasks',
        'nav.meetings': 'Meetings',
        'nav.team': 'Team',
        'nav.settings': 'Settings',
        'nav.users': 'Users',
        'nav.profile': 'Profile',
        'nav.logout': 'Logout',

        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.welcome': 'Welcome back',
        'dashboard.overview': 'Overview of your projects and activities',

        // Projects
        'projects.title': 'Projects',
        'projects.create': 'New Project',
        'projects.myProjects': 'My Projects',
        'projects.allProjects': 'All Projects',
        'projects.active': 'Active',
        'projects.completed': 'Completed',
        'projects.archived': 'Archived',
        'projects.members': 'members',
        'projects.tasks': 'tasks',
        'projects.description': 'Manage your projects and collaborate with your team',
        'projects.noProjects': 'No projects yet',
        'projects.createFirst': 'Create your first project to get started',
        'projects.search': 'Search projects...',
        'projects.filterStatus': 'Filter by status',
        'projects.viewDetails': 'View Details',
        'projects.edit': 'Edit',
        'projects.delete': 'Delete',

        // Tasks
        'tasks.title': 'Tasks',
        'tasks.create': 'New Task',
        'tasks.myTasks': 'My Tasks',
        'tasks.allTasks': 'All Tasks',
        'tasks.status.todo': 'To Do',
        'tasks.status.in_progress': 'In Progress',
        'tasks.status.done': 'Done',
        'tasks.priority.low': 'Low',
        'tasks.priority.medium': 'Medium',
        'tasks.priority.high': 'High',
        'tasks.assignedTo': 'Assigned to',
        'tasks.dueDate': 'Due date',
        'tasks.noTasks': 'No tasks available',
        'tasks.createFirst': 'Create your first task',

        // Meetings
        'meetings.title': 'Meetings',
        'meetings.create': 'New Meeting',
        'meetings.schedule': 'Schedule a Meeting',
        'meetings.details': 'Meeting Details',
        'meetings.description': 'Manage and schedule Scrum ceremonies',
        'meetings.type': 'Meeting Type',
        'meetings.duration': 'Duration (minutes)',
        'meetings.project': 'Project',
        'meetings.title.label': 'Meeting Title',
        'meetings.description.label': 'Description (Optional)',
        'meetings.agenda': 'Add meeting agenda, goals, or notes...',
        'meetings.type.daily_standup': 'Daily Standup',
        'meetings.type.sprint_planning': 'Sprint Planning',
        'meetings.type.sprint_review': 'Sprint Review',
        'meetings.type.sprint_retrospective': 'Sprint Retrospective',
        'meetings.desc.daily_standup': 'Daily team synchronization',
        'meetings.desc.sprint_planning': 'Planning for the next sprint',
        'meetings.desc.sprint_review': 'Sprint increment demonstration',
        'meetings.desc.sprint_retrospective': 'Team retrospective on the sprint',
        'meetings.recommended': 'Recommended duration',
        'meetings.range': 'Range',
        'meetings.notify': 'All project members will be automatically notified about this meeting via the notification system.',
        'meetings.creating': 'Creating & Notifying...',
        'meetings.noMeetings': 'No meetings scheduled yet',
        'meetings.scheduleFirst': 'Schedule Your First Meeting',
        'meetings.search': 'Search meetings...',
        'meetings.filterType': 'Filter by type',
        'meetings.allTypes': 'All Types',
        'meetings.stats.total': 'Total',
        'meetings.stats.daily': 'Daily',
        'meetings.stats.planning': 'Planning',
        'meetings.stats.review': 'Review',
        'meetings.stats.retro': 'Retro',

        // Team
        'team.title': 'Team',
        'team.members': 'Team Members',
        'team.addMember': 'Add Member',
        'team.role': 'Role',
        'team.email': 'Email',
        'team.joined': 'Joined',

        // Settings
        'settings.title': 'System Settings',
        'settings.description': 'Manage system configuration and preferences',
        'settings.general': 'General Settings',
        'settings.general.desc': 'Configure basic system information',
        'settings.siteName': 'Site Name',
        'settings.siteUrl': 'Site URL',
        'settings.adminEmail': 'Admin Email',
        'settings.language': 'Language',
        'settings.language.desc': 'Select your preferred language',
        'settings.quickActions': 'Quick Actions',
        'settings.quickActions.desc': 'Common administrative tasks',
        'settings.backupDb': 'Backup Database',
        'settings.testEmail': 'Test Email',
        'settings.clearCache': 'Clear Cache',
        'settings.notifications': 'Notification Settings',
        'settings.notifications.desc': 'Manage system notification preferences',
        'settings.emailNotifications': 'Email Notifications',
        'settings.emailNotifications.desc': 'Send email notifications to users',
        'settings.projectUpdates': 'Project Updates',
        'settings.projectUpdates.desc': 'Notify about project changes',
        'settings.taskAssignments': 'Task Assignments',
        'settings.taskAssignments.desc': 'Notify when tasks are assigned',
        'settings.sprintReminders': 'Sprint Reminders',
        'settings.sprintReminders.desc': 'Remind about upcoming sprint deadlines',
        'settings.security': 'Security',
        'settings.security.desc': 'Security and authentication settings',
        'settings.twoFactor': '2FA',
        'settings.twoFactor.desc': 'Two-factor authentication',
        'settings.sessionTimeout': 'Session Timeout (minutes)',
        'settings.passwordExpiry': 'Password Expiry (days)',
        'settings.system': 'System Settings',
        'settings.system.desc': 'Database and maintenance configuration',
        'settings.autoBackup': 'Automatic Backup',
        'settings.autoBackup.desc': 'Enable automatic database backups',
        'settings.maintenanceMode': 'Maintenance Mode',
        'settings.maintenanceMode.desc': 'Put the system in maintenance mode',
        'settings.save': 'Save Changes',

        // Common
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.create': 'Create',
        'common.update': 'Update',
        'common.loading': 'Loading...',
        'common.search': 'Search...',
        'common.filter': 'Filter',
        'common.actions': 'Actions',
        'common.status': 'Status',
        'common.priority': 'Priority',
        'common.date': 'Date',
        'common.time': 'Time',
        'common.duration': 'Duration',
        'common.description': 'Description',
        'common.title': 'Title',
        'common.name': 'Name',
        'common.email': 'Email',
        'common.password': 'Password',
        'common.confirm': 'Confirm',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.optional': 'Optional',
        'common.required': 'Required',
        'common.select': 'Select',
        'common.selectPlaceholder': 'Select an option',
        'common.noResults': 'No results found',
        'common.viewDetails': 'View Details',
    },
    fr: {
        // Navigation
        'nav.dashboard': 'Tableau de bord',
        'nav.projects': 'Projets',
        'nav.tasks': 'Tâches',
        'nav.meetings': 'Réunions',
        'nav.team': 'Équipe',
        'nav.settings': 'Paramètres',
        'nav.users': 'Utilisateurs',
        'nav.profile': 'Profil',
        'nav.logout': 'Déconnexion',

        // Dashboard
        'dashboard.title': 'Tableau de bord',
        'dashboard.welcome': 'Bon retour',
        'dashboard.overview': 'Aperçu de vos projets et activités',

        // Projects
        'projects.title': 'Projets',
        'projects.create': 'Nouveau Projet',
        'projects.myProjects': 'Mes Projets',
        'projects.allProjects': 'Tous les Projets',
        'projects.active': 'Actifs',
        'projects.completed': 'Terminés',
        'projects.archived': 'Archivés',
        'projects.members': 'membres',
        'projects.tasks': 'tâches',
        'projects.description': 'Gérez vos projets et collaborez avec votre équipe',
        'projects.noProjects': 'Aucun projet',
        'projects.createFirst': 'Créez votre premier projet pour commencer',
        'projects.search': 'Rechercher des projets...',
        'projects.filterStatus': 'Filtrer par statut',
        'projects.viewDetails': 'Voir les détails',
        'projects.edit': 'Modifier',
        'projects.delete': 'Supprimer',

        // Tasks
        'tasks.title': 'Tâches',
        'tasks.create': 'Nouvelle Tâche',
        'tasks.myTasks': 'Mes Tâches',
        'tasks.allTasks': 'Toutes les Tâches',
        'tasks.status.todo': 'À faire',
        'tasks.status.in_progress': 'En cours',
        'tasks.status.done': 'Terminé',
        'tasks.priority.low': 'Basse',
        'tasks.priority.medium': 'Moyenne',
        'tasks.priority.high': 'Haute',
        'tasks.assignedTo': 'Assigné à',
        'tasks.dueDate': 'Date limite',
        'tasks.noTasks': 'Aucune tâche disponible',
        'tasks.createFirst': 'Créez votre première tâche',

        // Meetings
        'meetings.title': 'Réunions',
        'meetings.create': 'Nouvelle Réunion',
        'meetings.schedule': 'Planifier une réunion',
        'meetings.details': 'Détails de la réunion',
        'meetings.description': 'Gérez et planifiez les cérémonies Scrum',
        'meetings.type': 'Type de réunion',
        'meetings.duration': 'Durée (minutes)',
        'meetings.project': 'Projet',
        'meetings.title.label': 'Titre de la réunion',
        'meetings.description.label': 'Description (Optionnelle)',
        'meetings.agenda': 'Ajoutez l\'ordre du jour, les objectifs ou des notes...',
        'meetings.type.daily_standup': 'Daily Standup',
        'meetings.type.sprint_planning': 'Sprint Planning',
        'meetings.type.sprint_review': 'Sprint Review',
        'meetings.type.sprint_retrospective': 'Sprint Retrospective',
        'meetings.desc.daily_standup': 'Synchronisation quotidienne de l\'équipe',
        'meetings.desc.sprint_planning': 'Planification du prochain sprint',
        'meetings.desc.sprint_review': 'Démonstration des incréments du sprint',
        'meetings.desc.sprint_retrospective': 'Rétrospective d\'équipe sur le sprint',
        'meetings.recommended': 'Durée recommandée',
        'meetings.range': 'Plage',
        'meetings.notify': 'Tous les membres du projet seront automatiquement notifiés de cette réunion via le système de notification.',
        'meetings.creating': 'Création & Notification...',
        'meetings.noMeetings': 'Aucune réunion planifiée',
        'meetings.scheduleFirst': 'Planifiez votre première réunion',
        'meetings.search': 'Rechercher des réunions...',
        'meetings.filterType': 'Filtrer par type',
        'meetings.allTypes': 'Tous les types',
        'meetings.stats.total': 'Total',
        'meetings.stats.daily': 'Daily',
        'meetings.stats.planning': 'Planning',
        'meetings.stats.review': 'Review',
        'meetings.stats.retro': 'Retro',

        // Team
        'team.title': 'Équipe',
        'team.members': 'Membres de l\'équipe',
        'team.addMember': 'Ajouter un membre',
        'team.role': 'Rôle',
        'team.email': 'Email',
        'team.joined': 'Rejoint le',

        // Settings
        'settings.title': 'Paramètres Système',
        'settings.description': 'Gérez la configuration et les préférences du système',
        'settings.general': 'Paramètres Généraux',
        'settings.general.desc': 'Configurez les informations de base du système',
        'settings.siteName': 'Nom du site',
        'settings.siteUrl': 'URL du site',
        'settings.adminEmail': 'Email administrateur',
        'settings.language': 'Langue',
        'settings.language.desc': 'Sélectionnez votre langue préférée',
        'settings.quickActions': 'Actions Rapides',
        'settings.quickActions.desc': 'Tâches administratives courantes',
        'settings.backupDb': 'Sauvegarder la base de données',
        'settings.testEmail': 'Tester l\'email',
        'settings.clearCache': 'Vider le cache',
        'settings.notifications': 'Paramètres de notification',
        'settings.notifications.desc': 'Gérez les préférences de notification du système',
        'settings.emailNotifications': 'Notifications par email',
        'settings.emailNotifications.desc': 'Envoyer des notifications par email aux utilisateurs',
        'settings.projectUpdates': 'Mises à jour de projet',
        'settings.projectUpdates.desc': 'Notifier des changements de projet',
        'settings.taskAssignments': 'Affectations de tâches',
        'settings.taskAssignments.desc': 'Notifier lors de l\'affectation de tâches',
        'settings.sprintReminders': 'Rappels de sprint',
        'settings.sprintReminders.desc': 'Rappeler les échéances de sprint à venir',
        'settings.security': 'Sécurité',
        'settings.security.desc': 'Paramètres de sécurité et d\'authentification',
        'settings.twoFactor': '2FA',
        'settings.twoFactor.desc': 'Authentification à deux facteurs',
        'settings.sessionTimeout': 'Délai d\'expiration de session (minutes)',
        'settings.passwordExpiry': 'Expiration du mot de passe (jours)',
        'settings.system': 'Paramètres Système',
        'settings.system.desc': 'Configuration de la base de données et de la maintenance',
        'settings.autoBackup': 'Sauvegarde automatique',
        'settings.autoBackup.desc': 'Activer les sauvegardes automatiques de la base de données',
        'settings.maintenanceMode': 'Mode maintenance',
        'settings.maintenanceMode.desc': 'Mettre le système en mode maintenance',
        'settings.save': 'Enregistrer les modifications',

        // Common
        'common.cancel': 'Annuler',
        'common.save': 'Enregistrer',
        'common.delete': 'Supprimer',
        'common.edit': 'Modifier',
        'common.create': 'Créer',
        'common.update': 'Mettre à jour',
        'common.loading': 'Chargement...',
        'common.search': 'Rechercher...',
        'common.filter': 'Filtrer',
        'common.actions': 'Actions',
        'common.status': 'Statut',
        'common.priority': 'Priorité',
        'common.date': 'Date',
        'common.time': 'Heure',
        'common.duration': 'Durée',
        'common.description': 'Description',
        'common.title': 'Titre',
        'common.name': 'Nom',
        'common.email': 'Email',
        'common.password': 'Mot de passe',
        'common.confirm': 'Confirmer',
        'common.yes': 'Oui',
        'common.no': 'Non',
        'common.optional': 'Optionnel',
        'common.required': 'Requis',
        'common.select': 'Sélectionner',
        'common.selectPlaceholder': 'Sélectionnez une option',
        'common.noResults': 'Aucun résultat trouvé',
        'common.viewDetails': 'Voir les détails',
    },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // Charger la langue depuis localStorage ou utiliser 'en' par défaut
        const saved = localStorage.getItem('app_language');
        return (saved as Language) || 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    useEffect(() => {
        // Optionnel : changer la langue du document HTML
        document.documentElement.lang = language;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};