import Link from "next/link";
import { DocsMobileNav } from "@/components/docs-mobile-nav";

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

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DocsMobileNav />
      <div className="max-w-5xl mx-auto px-6 py-8 lg:py-12 flex gap-16">
        {/* 侧边栏 */}
        <aside className="w-48 shrink-0 hidden lg:block">
          <nav className="sticky top-20 space-y-6">
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
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* 内容区 */}
        <div className="flex-1 min-w-0 max-w-2xl">{children}</div>
      </div>
    </>
  );
}
