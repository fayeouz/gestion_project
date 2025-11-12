import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, Trash2, Edit2, X, Search, MoreVertical, Users, Check, CheckCheck, Paperclip, File, Image as ImageIcon, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import chatService, { Message } from '@/services/chatService';
import { projectService } from '@/services/projectService';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ProjectMember {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface MessageWithFile extends Message {
    file_url?: string;
    file_name?: string;
    file_type?: string;
}

export default function Chat() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [messages, setMessages] = useState<MessageWithFile[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [editingMessage, setEditingMessage] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
    const [showMembersDialog, setShowMembersDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    const { toast } = useToast();

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, []);

    const loadProjects = useCallback(async () => {
        try {
            const data = await projectService.getMyProjects();
            setProjects(data);
            if (data.length > 0 && !selectedProject) {
                setSelectedProject(data[0]);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les projets',
                variant: 'destructive',
            });
        }
    }, [selectedProject, toast]);

    const loadProjectMembers = useCallback(async (projectId: number) => {
        try {
            const members = await projectService.getMembers(projectId);
            setProjectMembers(members);
        } catch (error) {
            console.error('Error loading members:', error);
            setProjectMembers([]);
        }
    }, []);

    const loadMessages = useCallback(async (chatProjectId: number) => {
        setLoading(true);
        try {
            const data = await chatService.getMessagesByChatProject(chatProjectId);
            setMessages(data);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [scrollToBottom]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast({
                    title: 'Fichier trop volumineux',
                    description: 'La taille maximale est de 10MB',
                    variant: 'destructive',
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !selectedProject || !user) return;

        setSending(true);
        const messageContent = newMessage.trim();
        const fileToSend = selectedFile;

        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        try {
            let sentMessage;

            if (fileToSend) {
                const formData = new FormData();
                formData.append('content', messageContent || 'Fichier joint');
                formData.append('chat_project_id', selectedProject.id.toString());
                formData.append('user_id', user.id.toString());
                formData.append('file', fileToSend);

                sentMessage = await chatService.sendMessageWithFile(formData);
            } else {
                const messageData = {
                    content: messageContent,
                    chat_project_id: selectedProject.id,
                    user_id: user.id,
                };

                sentMessage = await chatService.sendMessage(messageData);
            }

            if (sentMessage && sentMessage.id) {
                if (!sentMessage.user && user) {
                    sentMessage.user = {
                        id: user.id,
                        name: user.name,
                        email: user.email || '',
                    };
                }

                setMessages(prevMessages => [...prevMessages, sentMessage]);
                setTimeout(scrollToBottom, 100);
            } else {
                await loadMessages(selectedProject.id);
            }
        } catch (error: any) {
            console.error('Send message error:', error);
            toast({
                title: 'Erreur',
                description: "Impossible d'envoyer le message",
                variant: 'destructive',
            });
            await loadMessages(selectedProject.id);
        } finally {
            setSending(false);
        }
    };

    const handleEditMessage = async (messageId: number) => {
        if (!editContent.trim()) return;

        try {
            const updatedMessage = await chatService.updateMessage(messageId, editContent.trim());

            setMessages(prevMessages =>
                prevMessages.map(msg => {
                    if (msg.id === messageId) {
                        return {
                            ...updatedMessage,
                            user: updatedMessage.user || msg.user
                        };
                    }
                    return msg;
                })
            );

            setEditingMessage(null);
            setEditContent('');

            toast({
                title: 'Message modifié',
                description: 'Votre message a été modifié avec succès',
            });
        } catch (error) {
            console.error('Error editing message:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de modifier le message',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        try {
            await chatService.deleteMessage(messageId);
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));

            toast({
                title: 'Message supprimé',
                description: 'Le message a été supprimé avec succès',
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de supprimer le message',
                variant: 'destructive',
            });
        }
    };

    const getFileIcon = (fileType?: string) => {
        if (!fileType) return <File className="h-4 w-4" />;
        if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    useEffect(() => {
        if (selectedProject) {
            loadMessages(selectedProject.id);
            loadProjectMembers(selectedProject.id);
        }
    }, [selectedProject, loadMessages, loadProjectMembers]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages.length, scrollToBottom]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (isYesterday) {
            return 'Hier ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' +
            date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-gradient-to-br from-red-500 to-pink-500',
            'bg-gradient-to-br from-blue-500 to-cyan-500',
            'bg-gradient-to-br from-green-500 to-emerald-500',
            'bg-gradient-to-br from-yellow-500 to-orange-500',
            'bg-gradient-to-br from-purple-500 to-violet-500',
            'bg-gradient-to-br from-pink-500 to-rose-500',
            'bg-gradient-to-br from-indigo-500 to-blue-500',
            'bg-gradient-to-br from-orange-500 to-red-500',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gradient-to-br from-background to-muted/20">
            {/* Sidebar - Liste des projets */}
            <div className="w-96 border-r bg-card/50 backdrop-blur-sm flex flex-col shadow-lg">
                {/* Header */}
                <div className="p-4 border-b bg-card/80 backdrop-blur">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Chats
                        </h2>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Barre de recherche */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un projet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background/50"
                        />
                    </div>
                </div>

                {/* Liste des projets */}
                <ScrollArea className="flex-1">
                    {filteredProjects.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>Aucun projet trouvé</p>
                        </div>
                    ) : (
                        <div>
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => setSelectedProject(project)}
                                    className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                                        selectedProject?.id === project.id
                                            ? 'bg-primary/10 border-primary shadow-sm'
                                            : 'border-transparent hover:bg-muted/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                                            <AvatarFallback className={`${getAvatarColor(project.name)} text-white font-semibold`}>
                                                {getInitials(project.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{project.name}</h3>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {project.description || 'Pas de description'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Zone de chat principale */}
            <div className="flex-1 flex flex-col">
                {!selectedProject ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Users className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Bienvenue sur le Chat</h3>
                            <p className="text-muted-foreground">Sélectionnez un projet pour commencer</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header du chat */}
                        <div className="p-4 border-b flex items-center justify-between bg-card/80 backdrop-blur shadow-sm">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-11 w-11 ring-2 ring-primary/20">
                                    <AvatarFallback className={`${getAvatarColor(selectedProject.name)} text-white font-semibold`}>
                                        {getInitials(selectedProject.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-semibold text-lg">{selectedProject.name}</h2>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {projectMembers.length} membre{projectMembers.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setShowMembersDialog(true)}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Voir les membres ({projectMembers.length})
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Zone des messages */}
                        <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-muted/10 to-transparent">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Chargement des messages...</p>
                                    </div>
                                </div>
                            ) : (
                                <ScrollArea className="h-full" ref={scrollAreaRef}>
                                    <div className="p-6 space-y-4 max-w-5xl mx-auto pb-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                                    <Send className="h-10 w-10 text-primary/40" />
                                                </div>
                                                <p className="text-muted-foreground">
                                                    Aucun message pour le moment.
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Soyez le premier à écrire !
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {messages.map((message, index) => {
                                                    const isOwn = message.user_id === user?.id;
                                                    const showAvatar = index === 0 || messages[index - 1].user_id !== message.user_id;
                                                    const isLastInGroup = index === messages.length - 1 || messages[index + 1].user_id !== message.user_id;

                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${!isLastInGroup ? 'mb-1' : 'mb-4'}`}
                                                        >
                                                            {/* Avatar */}
                                                            {showAvatar ? (
                                                                <Avatar className="h-8 w-8 shrink-0 ring-2 ring-background shadow">
                                                                    <AvatarFallback className={`${getAvatarColor(message.user?.name || 'User')} text-white text-xs font-semibold`}>
                                                                        {getInitials(message.user?.name || 'U')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ) : (
                                                                <div className="w-8 shrink-0" />
                                                            )}

                                                            {/* Message */}
                                                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] flex-1`}>
                                                                {showAvatar && !isOwn && (
                                                                    <span className="text-xs font-medium mb-1 px-2 text-foreground/80">
                                                                        {message.user?.name || 'Utilisateur'}
                                                                    </span>
                                                                )}

                                                                {editingMessage === message.id ? (
                                                                    <div className="flex gap-2 w-full">
                                                                        <Input
                                                                            value={editContent}
                                                                            onChange={(e) => setEditContent(e.target.value)}
                                                                            className="flex-1"
                                                                            autoFocus
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    handleEditMessage(message.id);
                                                                                }
                                                                                if (e.key === 'Escape') {
                                                                                    setEditingMessage(null);
                                                                                    setEditContent('');
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Button size="sm" onClick={() => handleEditMessage(message.id)}>
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                setEditingMessage(null);
                                                                                setEditContent('');
                                                                            }}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="relative group">
                                                                        <div
                                                                            className={`rounded-2xl px-4 py-2.5 shadow-sm transition-all ${
                                                                                isOwn
                                                                                    ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-md'
                                                                                    : 'bg-card border border-border/50 rounded-tl-md'
                                                                            }`}
                                                                        >
                                                                            {message.content && (
                                                                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                                                    {message.content}
                                                                                </p>
                                                                            )}

                                                                            {message.file_url && (
                                                                                <a
                                                                                    href={message.file_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className={`flex items-center gap-2 mt-2 p-2 rounded-lg transition-colors ${
                                                                                        isOwn
                                                                                            ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
                                                                                            : 'bg-muted/50 hover:bg-muted'
                                                                                    }`}
                                                                                >
                                                                                    {getFileIcon(message.file_type)}
                                                                                    <span className="text-xs truncate flex-1">
                                                                                        {message.file_name || 'Fichier joint'}
                                                                                    </span>
                                                                                    <Download className="h-3 w-3" />
                                                                                </a>
                                                                            )}

                                                                            <div className="flex items-center gap-1 mt-1">
                                                                                <span className={`text-[10px] ${
                                                                                    isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                                                                }`}>
                                                                                    {formatTime(message.created_at)}
                                                                                </span>
                                                                                {isOwn && (
                                                                                    <CheckCheck className={`h-3 w-3 ${
                                                                                        isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                                                                    }`} />
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Actions sur hover */}
                                                                        {isOwn && (
                                                                            <div className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? '-left-16' : '-right-16'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    className="h-7 w-7 p-0 hover:bg-muted rounded-full"
                                                                                    onClick={() => {
                                                                                        setEditingMessage(message.id);
                                                                                        setEditContent(message.content);
                                                                                    }}
                                                                                >
                                                                                    <Edit2 className="h-3 w-3" />
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-full"
                                                                                    onClick={() => handleDeleteMessage(message.id)}
                                                                                >
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div ref={messagesEndRef} />
                                            </>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>

                        {/* Formulaire d'envoi */}
                        <div className="p-4 border-t bg-card/80 backdrop-blur shadow-lg">
                            <div className="max-w-5xl mx-auto">
                                {selectedFile && (
                                    <div className="mb-2 flex items-center gap-2 p-2 bg-muted rounded-lg">
                                        {getFileIcon(selectedFile.type)}
                                        <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={removeSelectedFile}
                                            className="h-6 w-6 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full shrink-0"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={sending}
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </Button>

                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Tapez votre message..."
                                        disabled={sending}
                                        className="flex-1 bg-background/50 rounded-full px-5"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={sending || (!newMessage.trim() && !selectedFile)}
                                        size="icon"
                                        className="rounded-full w-11 h-11 shadow-md shrink-0"
                                    >
                                        {sending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Dialog des membres */}
            <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Membres du projet</DialogTitle>
                        <DialogDescription>
                            {selectedProject?.name} · {projectMembers.length} membre{projectMembers.length > 1 ? 's' : ''}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-2">
                            {projectMembers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Aucun membre dans ce projet
                                </p>
                            ) : (
                                projectMembers.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                        <Avatar className="h-10 w-10 ring-2 ring-background">
                                            <AvatarFallback className={`${getAvatarColor(member.name)} text-white font-semibold`}>
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{member.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                            {member.role && (
                                                <p className="text-xs text-muted-foreground capitalize mt-0.5">{member.role}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}