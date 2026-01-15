import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "快速开始 | json-render",
};

export default function QuickStartPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">快速开始</h1>
      <p className="text-muted-foreground mb-8">
        5 分钟内启动并运行 json-render。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">1. 定义您的目录</h2>
      <p className="text-sm text-muted-foreground mb-4">
        创建一个目录来定义 AI 可以使用哪些组件：
      </p>
      <Code lang="typescript">{`// lib/catalog.ts
import { createCatalog } from '@json-render/core';
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
    Button: {
      props: z.object({
        label: z.string(),
        action: z.string(),
      }),
    },
    Text: {
      props: z.object({
        content: z.string(),
      }),
    },
  },
  actions: {
    submit: {
      params: z.object({ formId: z.string() }),
    },
    navigate: {
      params: z.object({ url: z.string() }),
    },
  },
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">2. 创建您的组件</h2>
      <p className="text-sm text-muted-foreground mb-4">
        注册用于渲染每种目录类型的 React 组件：
      </p>
      <Code lang="tsx">{`// components/registry.tsx
export const registry = {
  Card: ({ element, children }) => (
    <div className="p-4 border rounded-lg">
      <h2 className="font-bold">{element.props.title}</h2>
      {element.props.description && (
        <p className="text-gray-600">{element.props.description}</p>
      )}
      {children}
    </div>
  ),
  Button: ({ element, onAction }) => (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={() => onAction(element.props.action, {})}
    >
      {element.props.label}
    </button>
  ),
  Text: ({ element }) => (
    <p>{element.props.content}</p>
  ),
};`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">3. 创建 API 路由</h2>
      <p className="text-sm text-muted-foreground mb-4">
        设置用于 AI 生成的流式 API 路由：
      </p>
      <Code lang="typescript">{`// app/api/generate/route.ts
import { streamText } from 'ai';
import { generateCatalogPrompt } from '@json-render/core';
import { catalog } from '@/lib/catalog';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const systemPrompt = generateCatalogPrompt(catalog);

  const result = streamText({
    model: 'anthropic/claude-opus-4.5',
    system: systemPrompt,
    prompt,
  });

  return new Response(result.textStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">4. 渲染 UI</h2>
      <p className="text-sm text-muted-foreground mb-4">
        使用 providers 和渲染器来显示 AI 生成的 UI：
      </p>
      <Code lang="tsx">{`// app/page.tsx
'use client';

import { DataProvider, ActionProvider, VisibilityProvider, Renderer, useUIStream } from '@json-render/react';
import { registry } from '@/components/registry';

export default function Page() {
  const { tree, isLoading, generate } = useUIStream({
    endpoint: '/api/generate',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    generate(formData.get('prompt') as string);
  };

  return (
    <DataProvider initialData={{}}>
      <VisibilityProvider>
        <ActionProvider handlers={{
          submit: (params) => console.log('提交:', params),
          navigate: (params) => console.log('导航:', params),
        }}>
          <form onSubmit={handleSubmit}>
            <input
              name="prompt"
              placeholder="描述您想要什么..."
              className="border p-2 rounded"
            />
            <button type="submit" disabled={isLoading}>
              生成
            </button>
          </form>

          <div className="mt-8">
            <Renderer tree={tree} registry={registry} />
          </div>
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">下一步</h2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
        <li>
          深入了解{" "}
          <Link
            href="/docs/catalog"
            className="text-foreground hover:underline"
          >
            目录
          </Link>
        </li>
        <li>
          探索{" "}
          <Link
            href="/docs/data-binding"
            className="text-foreground hover:underline"
          >
            数据绑定
          </Link>{" "}
          以获取动态值
        </li>
        <li>
          添加{" "}
          <Link
            href="/docs/actions"
            className="text-foreground hover:underline"
          >
            操作
          </Link>{" "}
          以实现交互性
        </li>
        <li>
          实现{" "}
          <Link
            href="/docs/visibility"
            className="text-foreground hover:underline"
          >
            条件可见性
          </Link>
        </li>
      </ul>
    </article>
  );
}
