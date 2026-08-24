import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react'; // 1. Import usePage
import { useEffect } from 'react'; // 2. Import useEffect
import { Toaster, toast } from 'sonner';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    // 3. Extract flash messages from the global Inertia props
    // These come from your HandleInertiaRequests.php middleware
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success); // Green
        }
        if (flash?.error) {
            toast.error(flash.error); // Red
        }
        if (flash?.info) {
            toast.info(flash.info); // Blue
        }
    }, [flash]);
    return (
        <>
            {/* 6. Render the Toaster component so the pop-ups have a place to appear */}
            <Toaster position="top-right" richColors />

            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
        </>
    );
};
