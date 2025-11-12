import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Search,
    BookOpen,
    CheckSquare,
    Target,
    GripVertical,
    ChevronDown,
    ChevronRight,
    MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import { UserStory } from '@/types';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ProjectBacklog() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['backlog', 'sprint']));

    // ✅ UNE SEULE REQUÊTE pour récupérer tout
    const { data: backlogData, isLoading } = useQuery({
        queryKey: ['project-backlog-stats', id],
        queryFn: () => projectService.getProjectBacklogWithStats(Number(id)),
        enabled: !!id,
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-secondary text-secondary-foreground';
            case 'active': return 'bg-primary text-primary-foreground';
            case 'completed': return 'bg-success text-success-foreground';
            default: return 'bg-muted';
        }
    };

    // Extraire les données
    const project = backlogData?.project;
    const userStories = backlogData?.userStories || [];
    const stats = backlogData?.stats || {
        total: 0,
        in_backlog: 0,
        in_sprint: 0,
        completed: 0,
    };

    const backlogStories = userStories.filter(story => !story.sprint_id);
    const sprintStories = userStories.filter(story => story.sprint_id);

    const filteredBacklogStories = backlogStories.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    if (!project) {
        return (
            <Layout>
                <div className="space-y-6 animate-fade-in">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Project not found</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => navigate('/pm/backlogs')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Backlogs
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/pm/backlogs')}
                        className="mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Backlogs
                    </Button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                            <p className="text-muted-foreground">Product Backlog</p>
                        </div>
                    </div>
                </div>

                {/* Stats - Utilise les stats du backend */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-sm text-muted-foreground">Total Stories</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-muted-foreground">{stats.in_backlog}</div>
                            <p className="text-sm text-muted-foreground">In Backlog</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-warning">{stats.in_sprint}</div>
                            <p className="text-sm text-muted-foreground">In Sprint</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-success">{stats.completed}</div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card className="bg-gradient-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search user stories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Backlog Sections */}
                <div className="space-y-4">
                    {/* Sprint Stories Section */}
                    {sprintStories.length > 0 && (
                        <Card className="bg-gradient-card border-border/50">
                            <Collapsible
                                open={openSections.has('sprint')}
                                onOpenChange={() => toggleSection('sprint')}
                            >
                                <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {openSections.has('sprint') ? (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                )}
                                                <Target className="h-5 w-5 text-warning" />
                                                <div className="text-left">
                                                    <CardTitle>Sprint Backlog</CardTitle>
                                                    <CardDescription>{sprintStories.length} stories</CardDescription>
                                                </div>
                                            </div>
                                            <Badge className="bg-warning">{sprintStories.length}</Badge>
                                        </div>
                                    </CollapsibleTrigger>
                                </CardHeader>
                                <CollapsibleContent>
                                    <CardContent className="space-y-2">
                                        {sprintStories.map((story) => (
                                            <UserStoryCard key={story.id} story={story} />
                                        ))}
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    )}

                    {/* Product Backlog Section */}
                    <Card className="bg-gradient-card border-border/50">
                        <Collapsible
                            open={openSections.has('backlog')}
                            onOpenChange={() => toggleSection('backlog')}
                        >
                            <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                                <CollapsibleTrigger className="w-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {openSections.has('backlog') ? (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            )}
                                            <BookOpen className="h-5 w-5 text-primary" />
                                            <div className="text-left">
                                                <CardTitle>Product Backlog</CardTitle>
                                                <CardDescription>{filteredBacklogStories.length} stories</CardDescription>
                                            </div>
                                        </div>
                                        <Badge className="bg-primary">{filteredBacklogStories.length}</Badge>
                                    </div>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent className="space-y-2">
                                    {filteredBacklogStories.length > 0 ? (
                                        filteredBacklogStories.map((story) => (
                                            <UserStoryCard key={story.id} story={story} />
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                            <p className="text-muted-foreground mb-4">
                                                {searchTerm ? 'No stories match your search' : 'No stories in backlog'}
                                            </p>
                                            {!searchTerm && (
                                                <Button
                                                    className="bg-gradient-primary hover:opacity-90"
                                                    onClick={() => navigate('/pm/create-userStory')}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create First Story
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

// User Story Card Component
function UserStoryCard({ story }: { story: UserStory }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-secondary text-secondary-foreground';
            case 'active': return 'bg-primary text-primary-foreground';
            case 'completed': return 'bg-success text-success-foreground';
            default: return 'bg-muted';
        }
    };

    return (
        <div className="group p-4 rounded-lg border border-border bg-card hover:bg-muted/20 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Story Content */}
                <div className="flex-1 min-w-0 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                                <h3 className="font-semibold truncate">{story.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {story.description || 'No description'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(story.status)}>
                                {story.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {story.progress !== undefined && story.progress > 0 && (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span className="font-medium">{story.progress}%</span>
                            </div>
                            <Progress value={story.progress} className="h-1.5" />
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                            {story.tasks && story.tasks.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <CheckSquare className="h-4 w-4" />
                                    <span>{story.tasks.filter(t => t.status === 'completed').length}/{story.tasks.length}</span>
                                </div>
                            )}
                            {story.sprint_id && (
                                <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    <span className="text-xs">Sprint {story.sprint_id}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            ID: {story.id}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}