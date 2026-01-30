import React, { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  CheckSquare,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  CheckCircle,
  Link,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { TaskPriority, TaskStatus } from '@/types/database';

const TaskManagement: React.FC = () => {
  const { role } = useAuth();
  const { data: tasks, isLoading } = useTasks();
  const { data: profiles } = useProfiles();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    assigned_to: '',
    priority: 'medium' as TaskPriority,
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast({
        title: 'Error',
        description: 'Please enter a task title.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTask.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        link: formData.link || undefined,
        assigned_to: formData.assigned_to || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
      });
      toast({
        title: 'Task created!',
        description: 'The task has been assigned.',
      });
      setFormData({
        title: '',
        description: '',
        link: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask.mutateAsync({ id: taskId, status });
      toast({
        title: 'Task updated',
        description: `Task status changed to ${status.replace('_', ' ')}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast({
        title: 'Task deleted',
        description: 'The task has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredTasks = tasks?.filter((task) => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="badge-error">Urgent</Badge>;
      case 'high':
        return <Badge className="badge-warning">High</Badge>;
      case 'medium':
        return <Badge className="badge-info">Medium</Badge>;
      case 'low':
        return <Badge className="bg-secondary">Low</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-info" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <CheckSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const taskStats = {
    total: tasks?.length || 0,
    todo: tasks?.filter((t) => t.status === 'todo').length || 0,
    inProgress: tasks?.filter((t) => t.status === 'in_progress').length || 0,
    completed: tasks?.filter((t) => t.status === 'completed').length || 0,
  };

  const canCreateTasks = role === 'admin' || role === 'manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your tasks and assignments.
          </p>
        </div>
        {canCreateTasks && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the task..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Link (Optional)
                  </Label>
                  <Input
                    id="link"
                    type="url"
                    placeholder="https://example.com/resource"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value as TaskPriority })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>
                {profiles && profiles.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">Assign To</Label>
                    <Select
                      value={formData.assigned_to}
                      onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.user_id} value={profile.user_id}>
                            {profile.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={createTask.isPending}>
                  {createTask.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter('all')}>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{taskStats.total}</p>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter('todo')}>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-muted-foreground">{taskStats.todo}</p>
            <p className="text-sm text-muted-foreground">To Do</p>
          </CardContent>
        </Card>
        <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter('in_progress')}>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-info">{taskStats.inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter('completed')}>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-success">{taskStats.completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label>Filter by status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      ) : filteredTasks?.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all'
                ? 'Create your first task to get started!'
                : `No ${statusFilter.replace('_', ' ')} tasks.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks?.map((task) => (
            <Card key={task.id} className="glass-card hover:border-primary/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {getPriorityBadge(task.priority)}
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">
                            Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </span>
                        )}
                        {task.link && (
                          <a
                            href={task.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {task.status !== 'completed' && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      {task.status === 'todo' && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Start Task
                        </DropdownMenuItem>
                      )}
                      {canCreateTasks && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
