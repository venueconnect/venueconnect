"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, LogOut, User, Shield, Phone, Loader2, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [signOutLoading, setSignOutLoading] = useState(false);

    // User data
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);

    // Password update
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser() as any;
                if (error || !user) {
                    toast.error("Please login to view your profile");
                    router.push('/login?next=/profile');
                    return;
                }

                setUserEmail(user.email || "");
                setUserName(user.user_metadata?.full_name || user.user_metadata?.name || "");
                setUserPhone(user.user_metadata?.phone || user.phone || "");
                setEmailVerified(!!user.email_confirmed_at);
            } catch (err) {
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router, supabase.auth]);

    const handleSignOut = async () => {
        setSignOutLoading(true);
        try {
            await supabase.auth.signOut();
            toast.success("Signed out successfully");
            router.push('/');
        } catch (error) {
            toast.error("Error signing out");
        } finally {
            setSignOutLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in both password fields");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setPasswordLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            toast.success("Password updated successfully!");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-16">
            <div className="container px-4 max-w-2xl mx-auto">
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">Account Settings</h1>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {userName || "Your Profile"}
                            </h2>
                            <p className="text-sm text-slate-500">Manage your account settings and preferences</p>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Personal Information</h3>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Full Name</p>
                                    <p className="font-medium text-slate-900">{userName || "Not provided"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500">Email Address</p>
                                    <p className="font-medium text-slate-900">{userEmail || "Not provided"}</p>
                                </div>
                            </div>
                            {emailVerified ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <Check className="w-3 h-3" /> Verified
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                    Unverified
                                </span>
                            )}
                        </div>

                        {userPhone && (
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Phone Number</p>
                                        <p className="font-medium text-slate-900">{userPhone}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Security Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Security</h3>

                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-900">Password</p>
                                        <p className="text-xs text-slate-500">Update your password</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                >
                                    {showPasswordForm ? "Cancel" : "Update"}
                                </Button>
                            </div>

                            {showPasswordForm && (
                                <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Input 
                                                id="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                minLength={6}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input 
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                minLength={6}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handlePasswordUpdate}
                                        disabled={passwordLoading}
                                        className="w-full bg-primary hover:bg-primary/90 text-white"
                                    >
                                        {passwordLoading ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                                        ) : (
                                            "Update Password"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sign Out */}
                    <div className="pt-4 border-t border-slate-100">
                        <Button 
                            onClick={handleSignOut} 
                            disabled={signOutLoading}
                            variant="outline" 
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            {signOutLoading ? "Signing out..." : "Sign Out"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
