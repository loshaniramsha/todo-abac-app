// export default function LoginPage() {
//     return (
//         <div className="p-6">
//             <h1 className="text-xl font-bold">Welcome to Login</h1>
//             <p>Select role for demo (USER / MANAGER / ADMIN)</p>
//         </div>

//     )
// }

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { ROLES } from "@/lib/roles";
import { ROLES } from "@/lib/role";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: ROLES.USER,
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (isSignup) {
      console.log("SIGN UP DATA", form);
    } else {
      console.log("SIGN IN DATA", {
        username: form.username,
        password: form.password,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isSignup ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            {isSignup
              ? "Sign up to start managing your todos"
              : "Sign in to continue"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Username */}
          <Input
            placeholder="Username"
            value={form.username}
            onChange={e => handleChange("username", e.target.value)}
          />

          {/* Password */}
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => handleChange("password", e.target.value)}
          />

          {/* Role (Only for Signup) */}
          {isSignup && (
            <Select
              value={form.role}
              onValueChange={value => handleChange("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROLES.USER}>User</SelectItem>
                <SelectItem value={ROLES.MANAGER}>Manager</SelectItem>
                <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Action Button */}
          <Button className="w-full" onClick={handleSubmit}>
            {isSignup ? "Sign Up" : "Sign In"}
          </Button>

          {/* Toggle */}
          <p className="text-center text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
