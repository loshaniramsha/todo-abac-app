"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Clock, User } from "lucide-react";
import { canAccess } from "@/lib/abac";

const statusColors = {
  draft: "secondary",
  in_progress: "default",
  completed: "outline",
};

const statusLabels = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function TodoCard({
  todo,
  currentUser,
  onStatusChange,
  onDelete,
  isUpdating,
  isDeleting,
}) {
  const canUpdate = canAccess({
    role: currentUser.role,
    action: "Update",
    todo,
    userId: currentUser.id,
  });

  const canDelete = canAccess({
    role: currentUser.role,
    action: "Delete",
    todo,
    userId: currentUser.id,
  });

  const isOwner = todo.user_id === currentUser.id;

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{todo.title}</CardTitle>
          <Badge variant={statusColors[todo.status]}>
            {statusLabels[todo.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {todo.description && (
          <p className="text-sm text-muted-foreground">{todo.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(todo.createdAt).toLocaleDateString()}
          </div>
          {!isOwner && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              User ID: {todo.user_id.slice(0, 8)}...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          {canUpdate && (
            <Select
              value={todo.status}
              onValueChange={(value) => onStatusChange(todo.id, value)}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}

          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(todo.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}

          {!canUpdate && !canDelete && (
            <span className="text-xs text-muted-foreground italic">
              View only
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
