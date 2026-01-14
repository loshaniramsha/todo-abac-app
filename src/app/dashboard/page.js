"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import TodoCard from "@/component/TodoCard";
import TodoForm from "@/component/TodoForm";
import { ListTodo, Eye, Trash2, Plus, Shield, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Redirect if not authenticated
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  // Fetch todos
  const {
    data: todos = [],
    isLoading: todosLoading,
    error: todosError,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: () => fetch("/api/todos").then((res) => res.json()),
    enabled: !!session,
  });

  // Create todo mutation
  const createMutation = useMutation({
    mutationFn: (newTodo) =>
      fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create todo");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // Update todo mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, status }) =>
      fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update todo");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // Delete todo mutation
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      fetch(`/api/todos/${id}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete todo");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const { user } = session;

  const getRoleInfo = () => {
    switch (user.role) {
      case "USER":
        return {
          title: "User Dashboard",
          description: "Create, view, update, and delete your own todos.",
          icon: ListTodo,
          permissions: [
            { icon: Eye, text: "View your own todos", allowed: true },
            { icon: Plus, text: "Create new todos", allowed: true },
            { icon: ListTodo, text: "Update your own todos", allowed: true },
            { icon: Trash2, text: "Delete your draft todos", allowed: true },
          ],
        };
      case "MANAGER":
        return {
          title: "Manager Dashboard",
          description: "View all todos across the organization.",
          icon: Eye,
          permissions: [
            { icon: Eye, text: "View all todos", allowed: true },
            { icon: Plus, text: "Create new todos", allowed: false },
            { icon: ListTodo, text: "Update todos", allowed: false },
            { icon: Trash2, text: "Delete todos", allowed: false },
          ],
        };
      case "ADMIN":
        return {
          title: "Admin Dashboard",
          description: "View all todos and delete any todo.",
          icon: Shield,
          permissions: [
            { icon: Eye, text: "View all todos", allowed: true },
            { icon: Plus, text: "Create new todos", allowed: false },
            { icon: ListTodo, text: "Update todos", allowed: false },
            { icon: Trash2, text: "Delete any todo", allowed: true },
          ],
        };
      default:
        return {
          title: "Dashboard",
          description: "Unknown role",
          icon: AlertCircle,
          permissions: [],
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  const stats = {
    total: todos.length,
    draft: todos.filter((t) => t.status === "draft").length,
    inProgress: todos.filter((t) => t.status === "in_progress").length,
    completed: todos.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <RoleIcon className="h-8 w-8" />
            {roleInfo.title}
          </h1>
          <p className="text-muted-foreground mt-1">{roleInfo.description}</p>
        </div>
        <Badge
          variant={
            user.role === "ADMIN"
              ? "destructive"
              : user.role === "MANAGER"
              ? "outline"
              : "secondary"
          }
          className="text-sm"
        >
          {user.role}
        </Badge>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Todos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.draft}
            </div>
            <p className="text-xs text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roleInfo.permissions.map((perm, idx) => {
              const PermIcon = perm.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded ${
                    perm.allowed
                      ? "text-green-600 bg-green-50 dark:bg-green-950"
                      : "text-muted-foreground bg-muted"
                  }`}
                >
                  <PermIcon className="h-4 w-4" />
                  <span className="text-sm">{perm.text}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Todo Form - Only for USER role */}
        {user.role === "USER" && (
          <div className="lg:col-span-1">
            <TodoForm
              onSubmit={(data) => createMutation.mutateAsync(data)}
              isSubmitting={createMutation.isPending}
            />
          </div>
        )}

        {/* Todos List */}
        <div className={user.role === "USER" ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {user.role === "USER" ? "My Todos" : "All Todos"}
                </span>
                {todosLoading && (
                  <span className="text-sm text-muted-foreground">
                    Loading...
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todosError ? (
                <div className="text-destructive text-center py-8">
                  Error loading todos. Please try again.
                </div>
              ) : todos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No todos found.</p>
                  {user.role === "USER" && (
                    <p className="text-sm">Create your first todo above!</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todos.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      currentUser={user}
                      onStatusChange={(id, status) =>
                        updateMutation.mutate({ id, status })
                      }
                      onDelete={(id) => deleteMutation.mutate(id)}
                      isUpdating={updateMutation.isPending}
                      isDeleting={deleteMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
