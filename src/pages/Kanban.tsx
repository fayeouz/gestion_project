import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import { Task } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const columns = [
  { id: 'pending', title: 'To Do', color: 'border-warning' },
  { id: 'active', title: 'In Progress', color: 'border-secondary' },
  { id: 'completed', title: 'Done', color: 'border-success' },
];

function DraggableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card className="bg-card border-border/50 hover:shadow-md transition-all cursor-move">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-medium">{task.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          <div className="flex items-center justify-between">
            {task.assignedUser && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/20">
                    {task.assignedUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{task.assignedUser.name}</span>
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              #{task.id}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableColumn({ id, title, tasks, color }: { id: string; title: string; tasks: Task[]; color: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card className={`bg-gradient-card border-t-4 ${color} ${isOver ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 min-h-[400px]">
        <div ref={setNodeRef} className="space-y-3 h-full">
          {tasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Kanban() {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => taskService.getMyTasks(),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      taskService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Task status updated');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasksData?.tasks.find((t) => t.id === Number(event.active.id));
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = Number(active.id);
    const newStatus = over.id as string;
    
    const task = tasksData?.tasks.find((t) => t.id === taskId);
    
    if (task && task.status !== newStatus) {
      updateTaskMutation.mutate({ id: taskId, status: newStatus });
    }
    
    setActiveTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasksData?.tasks.filter((task) => task.status === status) || [];
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground">Drag and drop tasks to update their status</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {columns.map((column) => {
                const tasks = getTasksByStatus(column.id);
                return (
                  <DroppableColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    tasks={tasks}
                    color={column.color}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeTask && (
                <div className="rotate-3 scale-105">
                  <Card className="bg-card border-border/50">
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-medium">{activeTask.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{activeTask.description}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </Layout>
  );
}
