"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";
import { navItems } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPromptWorkspace = pathname.startsWith("/prompts");
  const [desktopNavCollapsedOverride, setDesktopNavCollapsedOverride] = useState<
    boolean | null
  >(null);
  const isDesktopNavCollapsed = desktopNavCollapsedOverride ?? isPromptWorkspace;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-20 hidden overflow-hidden border-r border-white/10 bg-[#111216] py-5 text-white shadow-2xl transition-[width,padding] duration-300 ease-out lg:block",
          isDesktopNavCollapsed ? "w-20 px-3" : "w-72 px-4"
        )}
      >
        <AnimatedGridPattern
          className="text-white/20 [mask-image:linear-gradient(to_bottom,white,transparent_70%)]"
          duration={7}
          maxOpacity={0.08}
          numSquares={28}
          width={34}
          height={34}
        />
        <div
          className={cn(
            "pointer-events-none absolute top-16 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent transition-all",
            isDesktopNavCollapsed ? "inset-x-4" : "inset-x-6"
          )}
        />

        <BlurFade delay={0.02}>
          <div
            className={cn(
              "relative flex min-w-0 gap-2",
              isDesktopNavCollapsed
                ? "flex-col items-center"
                : "items-center"
            )}
          >
            <Link
              href="/"
              onClick={() => setDesktopNavCollapsedOverride(null)}
              className={cn(
                "relative flex min-w-0 items-center gap-3 rounded-lg px-1",
                isDesktopNavCollapsed ? "justify-center px-0" : "flex-1"
              )}
              aria-label="AI Sales Assistant home"
            >
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <ShineBorder shineColor={["#ffffff", "#f97316", "#ffffff"]} duration={9} />
                <Bot className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "min-w-0 transition-opacity duration-200",
                  isDesktopNavCollapsed && "sr-only opacity-0"
                )}
              >
                <span className="block truncate text-sm font-semibold tracking-wide">
                  AI Sales Assistant
                </span>
                <span className="block truncate text-xs text-white/55">
                  3D Archtech workspace
                </span>
              </span>
            </Link>

            <button
              type="button"
              aria-label={isDesktopNavCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isDesktopNavCollapsed}
              title={isDesktopNavCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setDesktopNavCollapsedOverride(!isDesktopNavCollapsed)}
              className={cn(
                "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-white/55 transition-colors hover:bg-white/[0.09] hover:text-white",
                isDesktopNavCollapsed && "mt-1"
              )}
            >
              {isDesktopNavCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>
        </BlurFade>

        <nav className="relative mt-8 flex flex-col gap-1">
          {navItems.map((item, index) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <BlurFade key={item.href} delay={0.05 + index * 0.025} direction="right">
                <Link
                  href={item.href}
                  onClick={() => setDesktopNavCollapsedOverride(null)}
                  aria-label={isDesktopNavCollapsed ? item.label : undefined}
                  title={isDesktopNavCollapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-md px-3 py-2.5 text-sm font-medium text-white/62 transition-all duration-200 hover:bg-white/[0.06] hover:text-white",
                    isDesktopNavCollapsed && "justify-center px-0",
                    active &&
                      "bg-white/[0.09] text-white shadow-sm ring-1 ring-white/[0.08]"
                  )}
                >
                  {active ? (
                    <ShineBorder
                      borderWidth={1}
                      duration={10}
                      shineColor={["#f06423", "#ffffff", "#f06423"]}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md text-white/50 transition-colors",
                      active && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className={cn(isDesktopNavCollapsed && "sr-only")}>
                    {item.label}
                  </span>
                </Link>
              </BlurFade>
            );
          })}
        </nav>
      </aside>

      <header className="no-print sticky top-0 z-10 overflow-hidden border-b border-white/10 bg-[#111216]/95 px-4 py-3 text-white backdrop-blur lg:hidden">
        <AnimatedGridPattern
          className="text-white/15 [mask-image:linear-gradient(to_right,white,transparent_80%)]"
          duration={8}
          maxOpacity={0.05}
          numSquares={16}
          width={30}
          height={30}
        />
        <div className="relative flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </span>
            AI Sales Assistant
          </Link>
          <span className="text-xs text-white/55">Local demo</span>
        </div>
        <nav className="relative mt-3 grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  "flex h-9 items-center justify-center rounded-md text-white/55 hover:bg-white/[0.08] hover:text-white",
                  active && "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>
      </header>

      <main
        className={cn(
          "relative transition-[padding] duration-300 ease-out",
          isDesktopNavCollapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
        <div className="pointer-events-none fixed inset-y-0 right-0 hidden w-[34rem] opacity-70 lg:block">
          <div className="absolute right-16 top-20 h-72 w-72 rotate-45 border border-primary/10" />
          <div className="absolute right-28 top-32 h-72 w-72 rotate-45 border border-black/10" />
          <div className="absolute right-5 top-56 h-px w-96 rotate-[-28deg] bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        </div>
        <div
          className={cn(
            "relative mx-auto w-full px-4 py-6 sm:px-6",
            isPromptWorkspace ? "max-w-none lg:px-4 xl:px-5" : "max-w-7xl lg:px-8"
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
