"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextParam = searchParams.get("next") || "/";
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isRegistered, setIsRegistered] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;

            if (data?.session) {
                toast.success("Account created successfully!");
                const safeRedirect = nextParam.startsWith("/") ? nextParam : "/";
                router.push(safeRedirect);
                router.refresh();
                return;
            }

            setIsRegistered(true);
            toast.success("Account created! Please verify your email.");
        } catch (error: any) {
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`
                }
            });
            if (error) throw error;
            toast.success("Verification email resent!");
        } catch (error: any) {
            toast.error(error.message || "Failed to resend email");
        } finally {
            setLoading(false);
        }
    };

    if (isRegistered) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-bold">Check your email</h1>
                    <p className="text-muted-foreground">
                        We&apos;ve sent a verification link to <span className="font-semibold text-foreground">{email}</span>. 
                        Please click the link to verify your account.
                    </p>
                    <div className="pt-6 space-y-3">
                        <Button asChild className="w-full">
                            <Link href={nextParam && nextParam !== "/" ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"}>Return to Login</Link>
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={handleResendEmail}
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Resend Verification Link"}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Didn&apos;t receive the email? Check your spam folder or contact support.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            <div className="hidden lg:block relative bg-muted/20">
                <img
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80"
                    alt="Register background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <blockquote className="space-y-4">
                        <h2 className="text-3xl font-display font-medium leading-relaxed">
                            Join thousands of users discovering the best venues across Gujarat.
                        </h2>
                        <ul className="text-sm font-light text-white/80 space-y-2">
                            <li className="flex items-center gap-2">✓ Save your favorite venues</li>
                            <li className="flex items-center gap-2">✓ Connect directly with vendors</li>
                            <li className="flex items-center gap-2">✓ Manage all your bookings</li>
                        </ul>
                    </blockquote>
                </div>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-background relative">
                <Link href="/" className="absolute top-8 right-8 sm:top-12 sm:right-12 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-4 h-4" /> Back to Home
                </Link>

                <div className="w-full max-w-sm mx-auto space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-display font-semibold text-foreground">Create an Account</h1>
                        <p className="text-muted-foreground text-sm">
                            Enter your details to get started with VenueConnect
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

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
                            <label className="text-sm font-medium">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">Must be at least 6 characters long.</p>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white h-11">
                            {loading ? "Creating Account..." : "Sign Up"} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link 
                            href={nextParam && nextParam !== "/" ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"} 
                            className="font-semibold text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
