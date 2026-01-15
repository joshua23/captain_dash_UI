import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "AI SDK 集成 | json-render",
};

export default function AiSdkPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">AI SDK 集成</h1>
      <p className="text-muted-foreground mb-8">
        将 json-render 与 Vercel AI SDK 结合使用以实现无缝流式传输。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">安装</h2>
      <Code lang="bash">npm install ai</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">API 路由设置</h2>
      <Code lang="typescript">{`// app/api/generate/route.ts
import { streamText } from 'ai';
import { generateCatalogPrompt } from '@json-render/core';
import { catalog } from '@/lib/catalog';

export async function POST(req: Request) {
  const { prompt, currentTree } = await req.json();

  const systemPrompt = generateCatalogPrompt(catalog);

  // 可选：包含当前 UI 状态作为上下文
  const contextPrompt = currentTree
    ? \`\\n\\n当前 UI 状态：\\n\${JSON.stringify(currentTree, null, 2)}\`
    : '';

  const result = streamText({
    model: 'anthropic/claude-opus-4.5',
    system: systemPrompt + contextPrompt,
    prompt,
  });

  return new Response(result.textStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">客户端 Hook</h2>
      <p className="text-sm text-muted-foreground mb-4">
        在客户端使用 <code className="text-foreground">useUIStream</code>：
      </p>
      <Code lang="tsx">{`'use client';

import { useUIStream } from '@json-render/react';

function GenerativeUI() {
  const { tree, isLoading, error, generate } = useUIStream({
    endpoint: '/api/generate',
  });

  return (
    <div>
      <button
        onClick={() => generate('创建一个带指标的仪表盘')}
        disabled={isLoading}
      >
        {isLoading ? '生成中...' : '生成'}
      </button>

      {error && <p className="text-red-500">{error.message}</p>}

      <Renderer tree={tree} registry={registry} />
    </div>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">提示词工程</h2>
      <p className="text-sm text-muted-foreground mb-4">
        <code className="text-foreground">generateCatalogPrompt</code>{" "}
        函数创建一个优化的提示词，它会：
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>列出所有可用的组件及其属性</li>
        <li>描述可用的操作</li>
        <li>指定预期的 JSON 输出格式</li>
        <li>包含示例以获得更好的生成效果</li>
      </ul>

      <h2 className="text-xl font-semibold mt-12 mb-4">自定义系统提示词</h2>
      <Code lang="typescript">{`const basePrompt = generateCatalogPrompt(catalog);

const customPrompt = \`
\${basePrompt}

额外说明：
- 始终使用 Card 组件来分组相关内容
- 对于指标优先使用水平布局 (Row)
- 使用一致的间距 padding="md"
\`;`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">下一步</h2>
      <p className="text-sm text-muted-foreground">
        了解{" "}
        <Link
          href="/docs/streaming"
          className="text-foreground hover:underline"
        >
          渐进式流式传输
        </Link>
        。
      </p>
    </article>
  );
}
