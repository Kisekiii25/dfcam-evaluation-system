import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button'; // Combines imports
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, UserRoundPen } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have this utility for class merging

// Define the breadcrumbs specifically for editing
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'Edit',
        href: '#', // Active page
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    role: 'super-admin' | 'admin' | 'student';
}

interface EditProps {
    user: User;
}

export default function Edit({ user }: EditProps) { // Renamed component from Create to Edit

    const { data, setData, patch, errors, processing } = useForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student', // Provide a fallback default
        password: '', // Kept empty as passwords shouldn't be populated
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('users.update', user.id))
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User: ${user.name}`} />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6">

                    {/* Header/Back Action */}
                    <div className="flex items-center justify-between border-b pb-6 gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Modify User</h1>
                            <p className="text-sm text-zinc-500">Update account details for <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user.email}</span></p>
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
                    <div className="flex justify-center mt-4">
                        <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border rounded-xl p-6 md:p-8 shadow-sm">

                            <div className="flex items-center gap-3 mb-8 pb-4 border-b">
                                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
                                    <UserRoundPen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Account Details</h2>
                                    <p className="text-sm text-zinc-500">Edit the user information below.</p>
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
                                        placeholder='Juan Dela Cruz'
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
                                    <Label htmlFor='password' className={errors.password ? "text-red-500" : ""}>New Password <span className="text-xs text-zinc-400 font-normal">(optional)</span></Label>
                                    <Input
                                        type='password'
                                        id='password'
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder='Leave blank to keep current password'
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
                                    <Button type='submit' className="w-full shadow-sm" disabled={processing}>
                                        {processing ? "Updating..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
