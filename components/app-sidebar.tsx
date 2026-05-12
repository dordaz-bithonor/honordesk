"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ListTodo, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/pin";
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-2 py-3">
        <span className="px-2 text-sm font-semibold tracking-tight">HonorDesk</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/" />}
                  isActive={pathname === "/"}
                  tooltip="Clientes"
                >
                  <LayoutGrid />
                  <span>Clientes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/backlog" />}
                  isActive={pathname.startsWith("/backlog") || pathname.startsWith("/tasks")}
                  tooltip="Backlog"
                >
                  <ListTodo />
                  <span>Backlog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button type="button" variant="outline" size="sm" className="w-full justify-center gap-2" onClick={() => void logout()}>
          <LogOut className="size-4" />
          Salir
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
