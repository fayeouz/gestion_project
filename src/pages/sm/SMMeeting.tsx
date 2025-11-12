import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { meetingService } from '@/services/meetingService';
import {
    Calendar,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Clock,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MeetingType } from '@/types';
import {formatDuration, getMeetingTypeLabel, MEETING_TYPES,} from '@/types/Meetingconstants';
import {format} from "date-fns";
import { fr } from 'date-fns/locale';

export default function SMMeetings() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const { data: meetings, isLoading } = useQuery({
        queryKey: ['my-meetings'],
        queryFn: () => meetingService.getMyMeetings(),
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const getMeetingTypeColor = (type: MeetingType) => {
        const config = MEETING_TYPES[type];
        const colorMap: Record<string, string> = {
            'blue': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'purple': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'green': 'bg-green-500/20 text-green-400 border-green-500/30',
            'orange': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'indigo': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        };
        return colorMap[config?.color || 'blue'];
    };

    // Filtrage des meetings
    const filteredMeetings = meetings?.filter((meeting) => {
        const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || meeting.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // Statistiques
    const stats = {
        total: meetings?.length || 0,
        daily_standup: meetings?.filter(m => m.type === 'daily_standup').length || 0,
        sprint_planning: meetings?.filter(m => m.type === 'sprint_planning').length || 0,
        sprint_review: meetings?.filter(m => m.type === 'sprint_review').length || 0,
        sprint_retrospective: meetings?.filter(m => m.type === 'sprint_retrospective').length || 0,
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Réunions</h1>
                        <p className="text-muted-foreground">
                            Gérez et planifiez les cérémonies Scrum
                        </p>
                    </div>
                    <Button
                        className="bg-gradient-primary hover:opacity-90"
                        onClick={() => navigate('/sm/meetings/create')}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle Réunion
                    </Button>
                </div>

                {/* Filters */}
                <Card className="bg-gradient-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher des réunions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filtrer par type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les types</SelectItem>
                                        <SelectItem value="daily_standup">Daily Standup</SelectItem>
                                        <SelectItem value="sprint_planning">Sprint Planning</SelectItem>
                                        <SelectItem value="sprint_review">Sprint Review</SelectItem>
                                        <SelectItem value="sprint_retrospective">Sprint Retrospective</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-400">{stats.daily_standup}</div>
                            <p className="text-sm text-muted-foreground">Daily</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-purple-400">{stats.sprint_planning}</div>
                            <p className="text-sm text-muted-foreground">Planning</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-400">{stats.sprint_review}</div>
                            <p className="text-sm text-muted-foreground">Review</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-orange-400">{stats.sprint_retrospective}</div>
                            <p className="text-sm text-muted-foreground">Retro</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Meetings List */}
                {filteredMeetings && filteredMeetings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredMeetings.map((meeting) => <Card
                            key={meeting.id}
                            className="bg-gradient-card border-border/50 hover:shadow-glow transition-all group"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-primary/20 mt-1">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">{meeting.title}</h3>
                                                    <Badge
                                                        variant="outline"
                                                        className={getMeetingTypeColor(meeting.type)}
                                                    >
                                                        {(() => {
                                                            const IconComponent = MEETING_TYPES[meeting.type].icon;
                                                            return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : null;
                                                        })()}
                                                        {getMeetingTypeLabel(meeting.type)}
                                                    </Badge>
                                                </div>
                                                {meeting.description && <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {meeting.description}
                                                </p>}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{formatDuration(meeting.duration)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(meeting.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                                            </div>
                                            {meeting.project && <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>{meeting.project.name}</span>
                                            </div>}
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => navigate(`/sm/meetings/${meeting.id}`)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Voir les détails
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(`/sm/meetings/${meeting.id}/edit`)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>)}
                    </div>
                ) : (
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || typeFilter !== 'all'
                                    ? 'Aucune réunion ne correspond à vos filtres'
                                    : 'Aucune réunion planifiée pour le moment'}
                            </p>
                            {!searchTerm && typeFilter === 'all' && (
                                <Button
                                    className="bg-gradient-primary hover:opacity-90"
                                    onClick={() => navigate('/sm/meetings/create')}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Planifier votre première réunion
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}