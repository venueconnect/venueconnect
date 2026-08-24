"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextParam = searchParams.get("next") || "/";
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.toLowerCase().includes("email not confirmed")) {
                    toast.error("Email not verified", {
                        description: "Please check your inbox or spam folder to confirm your email.",
                        action: {
                            label: "Resend Email",
                            onClick: () => handleResendEmail()
                        },
                        duration: 10000
                    });
                    return;
                }
                throw error;
            }

            toast.success("Welcome back!");
            const safeRedirect = nextParam.startsWith("/") ? nextParam : "/";
            router.push(safeRedirect);
        } catch (error: any) {
            toast.error(error.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });
            if (error) throw error;
            toast.success("Verification email resent!");
        } catch (error: any) {
            toast.error(error.message || "Failed to resend email");
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-background relative">
                <Link href="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-4 h-4" /> Back to Home
                </Link>

                <div className="w-full max-w-sm mx-auto space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-display font-semibold text-foreground">Sign In</h1>
                        <p className="text-muted-foreground text-sm">
                            Enter your email and password to access your account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Password</label>
                                <Link href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white h-11">
                            {loading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link 
                            href={nextParam && nextParam !== "/" ? `/register?next=${encodeURIComponent(nextParam)}` : "/register"} 
                            className="font-semibold text-primary hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:block relative bg-muted/20">
                <img
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80"
                    alt="Login background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-display font-medium leading-relaxed">
                            &quot;VenueConnect made planning our corporate retreat effortless. We found the perfect resort in minutes.&quot;
                        </p>
                        <footer className="text-sm font-light text-white/80">
                            — Priya Patel, Event Director
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
