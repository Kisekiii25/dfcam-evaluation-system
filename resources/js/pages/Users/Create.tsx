import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, UserPlus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface TrashedUser {
    id: number;
    name: string;
    email: string;
    deleted_at: string;
}

interface PageProps {
    flash?: {
        trashed_user?: TrashedUser;
    };
    trashed_user?: TrashedUser;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'Create',
        href: '#',
    },
];

export default function Create() {
    const { flash, trashed_user: directTrashedUser } = usePage<PageProps>().props;
    const trashedUser = flash?.trashed_user || directTrashedUser;

    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        role: 'student',
        password: '',
        confirm_restore: false,
    });

    // Open restore pop-up when backend flags a soft-deleted account
    useEffect(() => {
        if (trashedUser) {
            setIsRestoreModalOpen(true);
        }
    }, [trashedUser]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'));
    };

    const handleConfirmRestore = () => {
        router.post(
            route('users.store'),
            {
                ...data,
                confirm_restore: true, // Explicitly passes confirm_restore = true to Laravel
            },
            {
                onSuccess: () => {
                    setIsRestoreModalOpen(false);
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Create" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6">

                    {/* Header/Back Action */}
                    <div className="flex items-center justify-between border-b pb-6 gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Create User</h1>
                            <p className="text-sm text-zinc-500">Register a new team member or student.</p>
                        </div>

                        <Link
                            href={route('users.index')}
                            className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-2"}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Users</span>
                        </Link>
                    </div>

                    {/* Main Content Area: Centered Form Card */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border rounded-xl p-6 md:p-8 shadow-sm">

                            <div className="flex items-center gap-3 mb-8 pb-4 border-b">
                                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Account Details</h2>
                                    <p className="text-sm text-zinc-500">Fill in the information to create the account.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Input Group: Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor='name' className={errors.name ? "text-red-500" : ""}>Full Name</Label>
                                    <Input
                                        type='text'
                                        id='name'
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder='e.g Juan Dela Cruz'
                                        className={cn("focus-visible:ring-blue-600", errors.name && "border-red-500 focus-visible:ring-red-500")}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                                </div>

                                {/* Input Group: Email */}
                                <div className="grid gap-2">
                                    <Label htmlFor='email' className={errors.email ? "text-red-500" : ""}>Email Address</Label>
                                    <Input
                                        type='email'
                                        id='email'
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder='email@example.com'
                                        className={cn("focus-visible:ring-blue-600", errors.email && "border-red-500 focus-visible:ring-red-500")}
                                    />
                                    {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                                </div>

                                {/* Input Group: Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor='password' className={errors.password ? "text-red-500" : ""}>Initial Password</Label>
                                    <Input
                                        type='password'
                                        id='password'
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder='Password'
                                        className={cn("focus-visible:ring-blue-600", errors.password && "border-red-500 focus-visible:ring-red-500")}
                                    />
                                    {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                                </div>

                                {/* Radio Group: Role */}
                                <div className="grid gap-3 pt-2">
                                    <Label className={errors.role ? "text-red-500" : ""}>Access Level / Role</Label>
                                    <RadioGroup
                                        value={data.role}
                                        onValueChange={(value) => setData('role', value)}
                                        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                                    >
                                        <div className={cn("relative flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50", data.role === 'student' && "border-blue-600 bg-blue-50/50 dark:bg-blue-950/50")}>
                                            <RadioGroupItem value="student" id="student" className="text-blue-600" />
                                            <Label htmlFor="student" className="font-normal cursor-pointer text-base">Student</Label>
                                        </div>

                                        <div className={cn("relative flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50", data.role === 'admin' && "border-blue-600 bg-blue-50/50 dark:bg-blue-950/50")}>
                                            <RadioGroupItem value="admin" id="admin" className="text-blue-600" />
                                            <Label htmlFor="admin" className="font-normal cursor-pointer text-base">Admin</Label>
                                        </div>

                                        <div className={cn("relative flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50", data.role === 'super-admin' && "border-blue-600 bg-blue-50/50 dark:bg-blue-950/50")}>
                                            <RadioGroupItem value="super-admin" id="super-admin" className="text-blue-600" />
                                            <Label htmlFor="super-admin" className="font-normal cursor-pointer text-base">Super Admin</Label>
                                        </div>
                                    </RadioGroup>
                                    {errors.role && <p className="text-xs text-red-500 font-medium">{errors.role}</p>}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4 border-t mt-8">
                                    <Button type='submit' className="w-full shadow-sm cursor-pointer" disabled={processing}>
                                        {processing ? "Creating..." : "Create User Account"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESTORE TRASHED USER POP-UP DIALOG */}
            <Dialog open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            Previously Deleted Account Found
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm text-zinc-600 dark:text-zinc-300">
                            The email <strong className="text-zinc-900 dark:text-zinc-100">{trashedUser?.email}</strong> was previously registered to <strong className="text-zinc-900 dark:text-zinc-100">{trashedUser?.name}</strong> and deleted on <strong className="text-zinc-900 dark:text-zinc-100">{trashedUser?.deleted_at}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                        <p>
                            <strong>Restoration Warning:</strong> Restoring will reactivate the account for <strong className="underline">{trashedUser?.name}</strong> (<span className="font-mono">{trashedUser?.email}</span>) and recover all prior evaluation progress linked to this record.
                        </p>

                        {data.name && trashedUser?.name && data.name.trim().toLowerCase() !== trashedUser.name.trim().toLowerCase() && (
                            <p className="pt-1.5 border-t border-amber-200/80 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 font-medium">
                                ⚠️ Name change detected: The original profile name <strong>"{trashedUser?.name}"</strong> will be updated to <strong>"{data.name}"</strong>.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsRestoreModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirmRestore}
                            className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                            disabled={processing}
                        >
                            {processing ? "Restoring..." : "Restore Account & History"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
