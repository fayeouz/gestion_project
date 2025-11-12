import { MeetingType } from '@/types';
import {ClipboardList, LucideIcon, RotateCcw, Sun, Target} from "lucide-react";

/**
 * Configuration des types de meetings Scrum avec leurs propriétés
 */
export const MEETING_TYPES: Record<MeetingType, {
    label: string;
    description: string;
    minDuration: number; // en minutes
    maxDuration: number; // en minutes
    recommendedDuration: number; // en minutes
    icon?: LucideIcon;
    color?: string;
}> = {
    daily_standup: {
        label: 'Daily Standup',
        description: 'Synchronisation quotidienne de l\'équipe',
        minDuration: 15,
        maxDuration: 15,
        recommendedDuration: 15,
        icon: Sun,
        color: 'blue',
    },
    sprint_planning: {
        label: 'Sprint Planning',
        description: 'Planification du prochain sprint',
        minDuration: 60,
        maxDuration: 480, // 8 heures
        recommendedDuration: 240, // 4 heures pour sprint de 2 semaines
        icon: ClipboardList,
        color: 'purple',
    },
    sprint_review: {
        label: 'Sprint Review',
        description: 'Démonstration des incréments du sprint',
        minDuration: 60,
        maxDuration: 240, // 4 heures
        recommendedDuration: 120, // 2 heures pour sprint de 2 semaines
        icon: Target,
        color: 'green',
    },
    sprint_retrospective: {
        label: 'Sprint Retrospective',
        description: 'Rétrospective d\'équipe sur le sprint',
        minDuration: 45,
        maxDuration: 180, // 3 heures
        recommendedDuration: 90, // 1h30 pour sprint de 2 semaines
        icon: RotateCcw,
        color: 'orange',
    }
};

/**
 * Options pour les sélecteurs de type de meeting
 */
export const MEETING_TYPE_OPTIONS = Object.entries(MEETING_TYPES).map(([value, config]) => ({
    value: value as MeetingType,
    label: config.label,
    description: config.description,
    icon: config.icon,
}));

/**
 * Obtenir le label d'un type de meeting
 */
export const getMeetingTypeLabel = (type: MeetingType): string => {
    return MEETING_TYPES[type]?.label || type;
};

/**
 * Obtenir la durée recommandée pour un type de meeting
 */
export const getRecommendedDuration = (type: MeetingType): number => {
    return MEETING_TYPES[type]?.recommendedDuration || 60;
};

/**
 * Valider la durée d'un meeting selon son type
 */
export const validateMeetingDuration = (type: MeetingType, duration: number): {
    valid: boolean;
    message?: string;
} => {
    const config = MEETING_TYPES[type];

    if (!config) {
        return { valid: false, message: 'Type de meeting invalide' };
    }

    if (duration < config.minDuration) {
        return {
            valid: false,
            message: `La durée minimum pour ${config.label} est de ${config.minDuration} minutes`,
        };
    }

    if (duration > config.maxDuration) {
        return {
            valid: false,
            message: `La durée maximum pour ${config.label} est de ${config.maxDuration} minutes`,
        };
    }

    return { valid: true };
};

/**
 * Formater la durée en heures et minutes
 */
export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
};