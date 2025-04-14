"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ModernLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // If successful login/register
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify({ id: data.userId, username: formData.username }));
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 p-4">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            LAN_TALK
          </h1>
          <p className="text-blue-200 mt-2">Secure communication within your local network</p>
        </div>

        <Card className="border border-blue-800 bg-slate-900/60 backdrop-blur-md shadow-[0_0_15px_rgba(66,153,225,0.25)]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{isLogin ? "Login" : "Register"}</CardTitle>
            <CardDescription className="text-blue-300">
              {isLogin
                ? "Sign in to connect with your network"
                : "Create an account to join your network"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 text-sm rounded bg-red-900/50 border border-red-800 text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-blue-200">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="bg-slate-800/80 border-blue-800 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-200">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-slate-800/80 border-blue-800 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium py-2 transition-all duration-200 shadow-[0_0_10px_rgba(66,153,225,0.5)]"
                >
                  {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {isLogin ? "Need an account? Register" : "Already have an account? Sign in"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
