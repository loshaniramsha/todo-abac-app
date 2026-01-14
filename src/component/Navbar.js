"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { ListTodo, LogOut, User, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "MANAGER":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold">
          <ListTodo className="h-5 w-5" />
          <span>Todo ABAC</span>
        </Link>

        <Separator orientation="vertical" className="mx-4 h-6" />

        {/* Navigation */}
        <nav className="flex items-center gap-4 flex-1">
          {session && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              {session.user.role === "USER" && (
                <Link
                  href="/todos"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <ListTodo className="h-4 w-4" />
                  My Todos
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isPending ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          ) : session ? (
            <>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{session.user.name}</span>
                <Badge variant={getRoleBadgeVariant(session.user.role)}>
                  {session.user.role}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
