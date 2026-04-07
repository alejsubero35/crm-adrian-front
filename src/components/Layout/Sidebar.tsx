import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Power, Settings } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/useAuth";
import { useNavigation } from "@/hooks/useNavigation";
import { useUserContext } from "@/hooks/useUserContext";
import { DynamicIcon, IconPackKey } from "@/lib/iconRegistry";
import type { NavigationResponse } from "@/services/navigation.service";
import { useFeatures } from "@/hooks/useFeatures";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type SidebarNavItem = NavigationResponse["items"][number];
type ParentMap = Record<string, SidebarNavItem[]>;

const sortValue = (item: SidebarNavItem) => item.sort ?? item.order ?? 0;
const makeNodeKey = (item: SidebarNavItem) => (item.id != null ? String(item.id) : item.key);

export function AppSidebar() {
  const { logout } = useAuth();
  const { isMobile, setOpenMobile, setOpen, state } = useSidebar();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const { data: navData, isLoading: navLoading } = useNavigation();
  const { data: userCtx } = useUserContext();
  const { hasFeature } = useFeatures();

  const isNavPathActive = useCallback(
    (navPath?: string | null) => {
      if (!navPath) return false;
      const currentFull = `${location.pathname}${location.search || ''}`;
      if (navPath.includes('?')) {
        return currentFull === navPath;
      }
      return location.pathname === navPath;
    },
    [location.pathname, location.search]
  );

  const hasRoleGate = useCallback(
    (token: string) => {
      const raw = String(token || "");
      if (!raw.startsWith("role:")) return false;
      const wanted = raw.slice(5).trim().toLowerCase();
      if (!wanted) return true;
      if (wanted === "super admin" || wanted === "super-admin") {
        return !!userCtx?.is_super_admin;
      }
      const roles = (userCtx?.roles ?? []).map((r) => String(r || "").toLowerCase());
      return roles.includes(wanted) || roles.includes(wanted.replace(/\s+/g, "-"));
    },
    [userCtx?.is_super_admin, userCtx?.roles]
  );

  const passesRequiredFeatures = useCallback(
    (required: unknown) => {
      const requiredFeatures = Array.isArray(required) ? (required as string[]) : [];
      if (!requiredFeatures.length) return true;
      return requiredFeatures.every((f) => {
        const key = String(f || "");
        if (key.startsWith("role:")) return hasRoleGate(key);
        return hasFeature(key);
      });
    },
    [hasFeature, hasRoleGate]
  );

  const itemBase =
    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-4 group-data-[collapsible=icon]:gap-0";
  const itemActive = "bg-sidebar-accent text-sidebar-foreground ring-1 ring-sidebar-ring shadow-sm";
  const iconBase = "h-4 w-4 shrink-0 text-sidebar-accent-foreground group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4";
  const iconActive = "shrink-0 text-sidebar-accent-foreground";

  const closeSidebar = () => {
    try {
      if (isMobile && setOpenMobile) setOpenMobile(false);
      if (!isMobile && setOpen) setOpen(false);
    } catch {
      /* noop */
    }
  };

  const [openMap, setOpenMap] = useState<Record<string, "open" | "closed">>({});
  const toggleOpen = useCallback((key: string) => {
    setOpenMap((prev) => {
      const next: Record<string, "open" | "closed"> = {};
      // Cierra todos los grupos excepto el seleccionado (solo uno abierto a la vez)
      Object.keys(prev).forEach((k) => {
        next[k] = "closed";
      });
      next[key] = prev[key] === "open" ? "closed" : "open";
      return next;
    });
  }, []);

  const navItems = useMemo(() => {
    const items = navData?.items ?? [];
    const perms = userCtx?.permissions ?? [];
    const scope = userCtx?.scope;
    const isSuper = !!userCtx?.is_super_admin;
    return items.filter((it) => {
      if (scope && it.scope && it.scope !== scope) return false;
      const reqPerms = it.required_permissions ?? [];
      if (!isSuper && Array.isArray(reqPerms) && reqPerms.length > 0) {
        return reqPerms.every((p) => perms.includes(p));
      }
      return true;
    });
  }, [navData?.items, userCtx?.permissions, userCtx?.scope, userCtx?.is_super_admin]);

  const hasSettingsInNav = useMemo(() => {
    return (navItems || []).some((it) => (it.path || '').startsWith('/configuraciones'));
  }, [navItems]);

  const { roots, byParent, groupOrder } = useMemo(() => {
    if (!navItems.length) {
      return { roots: [] as SidebarNavItem[], byParent: {} as ParentMap, groupOrder: [] as string[] };
    }

    const seen = new Set<string>();
    const cleaned = navItems.filter((item) => {
      // Do not dedupe by path alone, because parent+child can share the same path (e.g. /productos).
      const key = `${item.id ?? item.key ?? ""}|${item.path || ""}|${item.scope || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const byParentMap: ParentMap = {};
    cleaned.forEach((item) => {
      const pid = item.parent_id == null ? "root" : String(item.parent_id);
      (byParentMap[pid] ||= []).push(item);
    });
    Object.values(byParentMap).forEach((list) => list.sort((a, b) => sortValue(a) - sortValue(b)));

    const rootList = (byParentMap["root"] || []).slice().sort((a, b) => sortValue(a) - sortValue(b));
    const orderPairs: Array<{ name: string; sort: number }> = [];
    rootList.forEach((item) => {
      const name = item.group || "General";
      const sort = sortValue(item) ?? 0;
      const existing = orderPairs.find((p) => p.name === name);
      if (!existing) {
        orderPairs.push({ name, sort });
      } else {
        existing.sort = Math.min(existing.sort, sort);
      }
    });

    orderPairs.sort((a, b) => a.sort - b.sort);
    const order = orderPairs.map((p) => p.name);

    return { roots: rootList, byParent: byParentMap, groupOrder: order };
  }, [navItems]);

  const groupedRoots = useMemo(() => {
    const groups: Record<string, SidebarNavItem[]> = {};
    roots.forEach((item) => {
      const groupName = item.group || "General";
      (groups[groupName] ||= []).push(item);
    });
    return groups;
  }, [roots]);

  const renderGroups = () => {
    if (navLoading) {
      return (
        <SidebarMenu>
          {[...Array(3)].map((_, idx) => (
            <SidebarMenuItem key={`sk-${idx}`}>
              <div className="flex flex-col gap-2 w-full px-3 py-2">
                <div className="skeleton h-6 w-2/3" />
                <div className="skeleton h-5 w-1/2" />
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      );
    }

    if (!roots.length) {
      return (
        <div className="empty-state py-10">
          <div className="empty-state-icon">
            <span className="text-xl font-bold">∅</span>
          </div>
          <p className="text-sm text-muted-foreground text-center px-4">
            Aún no hay navegación asignada a tu rol.
          </p>
        </div>
      );
    }

    return (
      <>
        {groupOrder.map((groupName) => {
          const groupItems = groupedRoots[groupName] || [];
          if (!groupItems.length) return null;
          return (
            <div key={groupName} className="mb-3">
              {groupName && (
                <SidebarGroupLabel className="text-xs uppercase tracking-wide text-sidebar-foreground/60 px-2">
                  {groupName}
                </SidebarGroupLabel>
              )}
              <SidebarMenu>
                {groupItems.map((item) => {
                  // Feature gating: skip items whose required_features are not met
                  if (!passesRequiredFeatures(item.required_features)) return null;
                  const nodeKey = makeNodeKey(item);
                  const children = (item.id != null ? byParent[String(item.id)] : []) || [];
                  const hasChildren = children.length > 0;
                  const isOpen = hasChildren ? openMap[nodeKey] !== "closed" : false;
                  const childActive = hasChildren ? children.some((c) => isNavPathActive(c.path)) : false;
                  const active = isNavPathActive(item.path) || childActive;
                  const isCollapsedDesktop = !isMobile && state === "collapsed";
                  return (
                    <SidebarMenuItem key={nodeKey} className="relative">
                      {!hasChildren ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={item.path || "#"}
                              className={[itemBase, active ? itemActive : ""].join(" ")}
                              onClick={() => {
                                if (isMobile) closeSidebar();
                              }}
                            >
                              <DynamicIcon
                                pack={(item.icon_pack as IconPackKey) || "lucide"}
                                name={item.icon || undefined}
                                className={active ? iconActive : iconBase}
                                size={18}
                              />
                              <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
                                {item.label}
                              </span>
                            </Link>
                          </TooltipTrigger>
                          {isCollapsedDesktop && (
                            <TooltipContent side="right" className="text-xs">
                              {item.label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ) : (
                        <>
                          {isCollapsedDesktop ? (
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className={[itemBase, active ? itemActive : ""].join(" ")}
                                      aria-label={item.label}
                                    >
                                      <DynamicIcon
                                        pack={(item.icon_pack as IconPackKey) || "lucide"}
                                        name={item.icon || undefined}
                                        className={active ? iconActive : iconBase}
                                        size={18}
                                      />
                                      <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
                                        {item.label}
                                      </span>
                                    </button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="text-xs">
                                  {item.label}
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent side="right" align="start" sideOffset={10} className="min-w-56">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                  {item.label}
                                </DropdownMenuLabel>
                                {children.map((child) => {
                                  if (!passesRequiredFeatures(child.required_features)) return null;
                                  const childActive = isNavPathActive(child.path);
                                  return (
                                    <DropdownMenuItem asChild key={makeNodeKey(child)}>
                                      <Link
                                        to={child.path || "#"}
                                        onClick={() => {
                                          if (isMobile) closeSidebar();
                                        }}
                                        className={childActive ? "bg-accent" : ""}
                                      >
                                        <DynamicIcon
                                          pack={(child.icon_pack as IconPackKey) || "lucide"}
                                          name={child.icon || undefined}
                                          className={iconBase}
                                          size={18}
                                        />
                                        <span className="ml-2">{child.label}</span>
                                      </Link>
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <div className={[itemBase, active ? itemActive : ""].join(" ")}>
                              <button
                                type="button"
                                className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                onClick={() => toggleOpen(nodeKey)}
                                aria-label={item.label}
                              >
                                <DynamicIcon
                                  pack={(item.icon_pack as IconPackKey) || "lucide"}
                                  name={item.icon || undefined}
                                  className={active ? iconActive : iconBase}
                                  size={18}
                                />
                                <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
                                  {item.label}
                                </span>
                              </button>
                              <button
                                type="button"
                                aria-label={isOpen ? "Cerrar sección" : "Abrir sección"}
                                onClick={() => toggleOpen(nodeKey)}
                                className="ml-auto p-1 rounded hover:bg-sidebar-accent/40 group-data-[collapsible=icon]:hidden"
                              >
                                <ChevronDown size={16} className="sidebar-chevron" data-open={isOpen} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      {hasChildren && !(!isMobile && state === "collapsed") && (
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              key={`${nodeKey}-children`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="ml-5 mt-2 flex flex-col gap-1 overflow-hidden"
                            >
                              {children.map((child) => {
                                if (!passesRequiredFeatures(child.required_features)) return null;
                                const childActive = isNavPathActive(child.path);
                                return (
                                  <Link
                                    key={makeNodeKey(child)}
                                    to={child.path || "#"}
                                    onClick={() => {
                                      if (isMobile) closeSidebar();
                                    }}
                                    className={[
                                      "text-xs flex items-center gap-2 px-2 py-1 rounded-lg border border-transparent transition-colors",
                                      childActive
                                        ? "bg-sidebar-accent text-sidebar-foreground shadow-sm ring-1 ring-sidebar-ring"
                                        : "text-sidebar-foreground/70 hover:border-sidebar-accent/60"
                                    ].join(" ")}
                                  >
                                    <DynamicIcon
                                      pack={(child.icon_pack as IconPackKey) || "lucide"}
                                      name={child.icon || undefined}
                                      className={childActive ? iconActive : iconBase}
                                      size={18}
                                    />
                                    <span className="truncate group-data-[collapsible=icon]:hidden">{child.label}</span>
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <Sidebar collapsible="icon" className="surface-glass border-r backdrop-blur-xl data-[collapsible=icon]:w-[72px]">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3 group-data-[collapsible=icon]:hidden">
          <img src="/img/ms-icon-310x310.png" alt="Logo Venta Simplyfy" className="h-9 w-9 rounded-xl" />
          <h2 className="text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">Venta Simplyfy</h2>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center py-3">
          <img src="/img/ms-icon-310x310.png" alt="Logo Venta Simplyfy" className="h-9 w-9 rounded-xl" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>{renderGroups()}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {!hasSettingsInNav && (
                  <Link
                    to="/configuraciones"
                    className={[
                      itemBase,
                      location.pathname.startsWith("/configuraciones") ? itemActive : "",
                    ].join(" ")}
                    onClick={() => {
                      if (isMobile) closeSidebar();
                    }}
                  >
                    <Settings
                      className={[
                        iconBase,
                        location.pathname.startsWith("/configuraciones") ? iconActive : "",
                      ].join(" ")}
                    />
                    <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Configuraciones</span>
                  </Link>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeSidebar();
                  }}
                  className={[itemBase, "w-full text-left"].join(" ")}
                >
                  <Power className={iconBase} />
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Cerrar sesión</span>
                </button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="px-4 py-2 text-xs text-sidebar-foreground/80">© {currentYear} Venta Simplyfy</div>
      </SidebarFooter>
    </Sidebar>
  );
}
