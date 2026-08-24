import { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Lock, LogOut, Eye, EyeOff } from 'lucide-react';

export default function ForceChangePassword() {
    const { auth } = usePage<any>().props;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.force-change.update'));
    };

    // Inertia Logout Handler (Attaches CSRF token & redirects to login)
    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
            <Head title="Security Update Required" />

            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col items-center text-center space-y-3 mb-6">
                    <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Password Update Required
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                        Welcome, <strong>{auth.user?.name}</strong>. Your account was created with a temporary password. You must set a new password to continue.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="pl-9 pr-10"
                                placeholder="Enter new password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500 font-medium">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="pl-9 pr-10"
                                placeholder="Confirm new password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                        disabled={processing}
                    >
                        {processing ? 'Updating Password...' : 'Save Password & Continue'}
                    </Button>
                </form>

                {/* Logout Button via Inertia Router */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out of this account
                    </button>
                </div>
            </div>
        </div>
    );
}
