import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavSection, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, UserPlus, LibraryBig, GraduationCap, Users, Layers } from 'lucide-react';
import AppLogo from './app-logo';

const navSections: NavSection[] = [
    {
        title: "Platform", // Label for the first group
        items: [
            {
                title: 'Dashboard',
                url: '/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: "System Management", // Label for the second group
        items: [
            {
                title: 'Users',
                url: '/users',
                icon: Users,
            },
            {
                title: 'Subjects',
                url: '/subjects',
                icon: LibraryBig,
            },
            {
                title: 'Academic',
                url: '/courses',
                icon: GraduationCap,
            },
            {
                title: 'Questionnaire',
                url: '/questions',
                icon: Layers,
            },
            {
                title: 'Teachers',
                url: '/teachers',
                icon: UserPlus,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navSections} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
