import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavSection } from '@/types'; // Use NavSection instead of NavItem
import { Link, usePage } from '@inertiajs/react';

// Accept 'items' prop as an array of NavSection objects
export function NavMain({ items = [] }: { items: NavSection[] }) {
    const page = usePage();

    return (
        <>
            {items.map((section) => (
                <SidebarGroup key={section.title}>
                    {/* Render the label dynamically from the section title */}
                    <SidebarGroupLabel>{section.title}</SidebarGroupLabel>

                    <SidebarMenu>
                        {/* Loop through the links nested INSIDE this specific section */}
                        {section.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={item.url === page.url}>
                                    <Link href={item.url} prefetch >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
