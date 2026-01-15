import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Demo } from "@/components/demo";
import { Code } from "@/components/code";
import { CopyButton } from "@/components/copy-button";

export default function Home() {
  return (
    <>
      {/* 主视觉区 */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-6">
          可预测。有边界。高性能。
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          让用户通过提示词生成仪表盘、小组件、应用和数据可视化 —
          安全地限制在您定义的组件范围内。
        </p>

        <Demo />

        <div className="flex items-center justify-center gap-2 border border-border rounded px-4 py-3 mt-12 mx-auto w-fit">
          <code className="text-sm bg-transparent">
            npm install @json-render/core @json-render/react
          </code>
          <CopyButton text="npm install @json-render/core @json-render/react" />
        </div>

        <div className="flex gap-3 justify-center mt-6">
          <Button size="lg" asChild>
            <Link href="/docs">开始使用</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a
              href="https://github.com/vercel-labs/json-render"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </Button>
        </div>
      </section>

      {/* 工作原理 */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-3">
                01
              </div>
              <h3 className="text-lg font-semibold mb-2">定义您的目录</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                设定边界。定义 AI 可以使用的组件、操作和数据绑定。
              </p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-3">
                02
              </div>
              <h3 className="text-lg font-semibold mb-2">用户提示</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                终端用户描述他们想要什么。AI 生成受限于您目录的 JSON。
              </p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-3">
                03
              </div>
              <h3 className="text-lg font-semibold mb-2">即时渲染</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                流式传输响应。您的组件在 JSON 到达时渐进式渲染。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 代码示例 */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4">定义您的目录</h2>
              <p className="text-muted-foreground mb-6">
                组件、操作和验证函数。
              </p>
              <Code lang="typescript">{`import { createCatalog } from '@json-render/core';
import { z } from 'zod';

export const catalog = createCatalog({
  components: {
    Card: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      hasChildren: true,
    },
    Metric: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(),
        format: z.enum(['currency', 'percent']),
      }),
    },
  },
  actions: {
    export: { params: z.object({ format: z.string() }) },
  },
});`}</Code>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">AI 生成 JSON</h2>
              <p className="text-muted-foreground mb-6">
                受限的输出，您的组件可以原生渲染。
              </p>
              <Code lang="json">{`{
  "key": "dashboard",
  "type": "Card",
  "props": {
    "title": "收入仪表盘",
    "description": null
  },
  "children": [
    {
      "key": "revenue",
      "type": "Metric",
      "props": {
        "label": "总收入",
        "valuePath": "/metrics/revenue",
        "format": "currency"
      }
    }
  ]
}`}</Code>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <h2 className="text-2xl font-semibold mb-12 text-center">功能特性</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "边界控制",
                desc: "AI 只能使用您在目录中定义的组件",
              },
              {
                title: "流式传输",
                desc: "在 JSON 从模型流出时渐进式渲染",
              },
              {
                title: "数据绑定",
                desc: "使用 JSON Pointer 路径的双向绑定",
              },
              {
                title: "操作",
                desc: "由您的应用程序处理的命名操作",
              },
              {
                title: "可见性",
                desc: "基于数据或认证状态的条件显示/隐藏",
              },
              {
                title: "验证",
                desc: "内置和自定义验证函数",
              },
            ].map((feature) => (
              <div key={feature.title}>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 行动召唤 */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-2xl font-semibold mb-4">开始使用</h2>
          <div className="flex items-center justify-center gap-2 border border-border rounded px-4 py-3 mb-8 mx-auto w-fit">
            <code className="text-sm bg-transparent">
              npm install @json-render/core @json-render/react
            </code>
            <CopyButton text="npm install @json-render/core @json-render/react" />
          </div>
          <div>
            <Button asChild>
              <Link href="/docs">查看文档</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
