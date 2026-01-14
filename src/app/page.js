import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Users, ListTodo } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-1">
            Attribute-Based Access Control
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Manage Your Todos with{" "}
            <span className="text-primary">Role-Based Permissions</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl">
            A powerful todo application with fine-grained access control. Users,
            Managers, and Admins each have different permissions tailored to
            their role.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <ListTodo className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Create & Manage Todos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create todos with title, description, and status. Track your
                tasks from draft to completion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>ABAC Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Attribute-Based Access Control ensures users can only perform
                actions they&apos;re authorized for.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Role-Based Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Different dashboards and capabilities for Users, Managers, and
                Admins.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Roles Explanation */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Role Permissions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Role */}
            <Card className="border-2 border-blue-200 dark:border-blue-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User</CardTitle>
                  <Badge>USER</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">View own todos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Create new todos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Update own todos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Delete own draft todos</span>
                </div>
              </CardContent>
            </Card>

            {/* Manager Role */}
            <Card className="border-2 border-yellow-200 dark:border-yellow-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Manager</CardTitle>
                  <Badge variant="outline">MANAGER</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">View all todos</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-4 w-4 text-center">✕</span>
                  <span className="text-sm">Cannot create todos</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-4 w-4 text-center">✕</span>
                  <span className="text-sm">Cannot update todos</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-4 w-4 text-center">✕</span>
                  <span className="text-sm">Cannot delete todos</span>
                </div>
              </CardContent>
            </Card>

            {/* Admin Role */}
            <Card className="border-2 border-red-200 dark:border-red-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Admin</CardTitle>
                  <Badge variant="destructive">ADMIN</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">View all todos</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-4 w-4 text-center">✕</span>
                  <span className="text-sm">Cannot create todos</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-4 w-4 text-center">✕</span>
                  <span className="text-sm">Cannot update todos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Delete any todo</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">
                Ready to get started?
              </h3>
              <p className="mb-6 opacity-90">
                Create your account and start managing your todos today.
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link href="/signup">Create Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Todo ABAC App - Built with Next.js, shadcn/ui & Better Auth</p>
        </div>
      </footer>
    </div>
  );
}
