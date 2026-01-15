"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

const navigation = [
  {
    title: "入门指南",
    items: [
      { title: "介绍", href: "/docs" },
      { title: "安装", href: "/docs/installation" },
      { title: "快速开始", href: "/docs/quick-start" },
    ],
  },
  {
    title: "核心概念",
    items: [
      { title: "目录", href: "/docs/catalog" },
      { title: "组件", href: "/docs/components" },
      { title: "数据绑定", href: "/docs/data-binding" },
      { title: "操作", href: "/docs/actions" },
      { title: "可见性", href: "/docs/visibility" },
      { title: "验证", href: "/docs/validation" },
    ],
  },
  {
    title: "指南",
    items: [
      { title: "AI SDK 集成", href: "/docs/ai-sdk" },
      { title: "流式传输", href: "/docs/streaming" },
    ],
  },
  {
    title: "API 参考",
    items: [
      { title: "@json-render/core", href: "/docs/api/core" },
      { title: "@json-render/react", href: "/docs/api/react" },
    ],
  },
];

// Flatten all pages for current page lookup
const allPages = navigation.flatMap((section) => section.items);

export function DocsMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentPage = useMemo(() => {
    const page = allPages.find((page) => page.href === pathname);
    return page ?? allPages[0];
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden sticky top-[calc(3.5rem+1px)] z-40 w-full px-6 py-3 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between focus:outline-none">
        <div className="text-sm font-medium">{currentPage?.title}</div>
        <div className="w-8 h-8 flex items-center justify-center">
          <List className="h-4 w-4 text-muted-foreground" />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto p-6">
        <SheetTitle className="mb-6">目录</SheetTitle>
        <nav className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`text-sm block py-2 transition-colors ${
                        pathname === item.href
                          ? "text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
