import { Code } from "@/components/code";

export const metadata = {
  title: "流式传输 | json-render",
};

export default function StreamingPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">流式传输</h1>
      <p className="text-muted-foreground mb-8">在 AI 生成时渐进式渲染 UI。</p>

      <h2 className="text-xl font-semibold mt-12 mb-4">流式传输工作原理</h2>
      <p className="text-sm text-muted-foreground mb-4">
        json-render 使用 JSONL（JSON Lines）流式传输。当 AI
        生成时，每行代表一个补丁操作：
      </p>
      <Code lang="json">{`{"op":"set","path":"/root","value":{"key":"root","type":"Card","props":{"title":"仪表盘"}}}
{"op":"add","path":"/root/children","value":{"key":"metric-1","type":"Metric","props":{"label":"收入"}}}
{"op":"add","path":"/root/children","value":{"key":"metric-2","type":"Metric","props":{"label":"用户"}}}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">useUIStream Hook</h2>
      <p className="text-sm text-muted-foreground mb-4">
        该 hook 处理解析和状态管理：
      </p>
      <Code lang="tsx">{`import { useUIStream } from '@json-render/react';

function App() {
  const {
    tree,        // 当前 UI 树状态
    isLoading,   // 流式传输时为 true
    error,       // 发生的任何错误
    generate,    // 开始生成的函数
    abort,       // 取消流式传输的函数
  } = useUIStream({
    endpoint: '/api/generate',
  });
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">补丁操作</h2>
      <p className="text-sm text-muted-foreground mb-4">支持的操作：</p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 mb-4">
        <li>
          <code className="text-foreground">set</code> —
          设置路径的值（如需要则创建）
        </li>
        <li>
          <code className="text-foreground">add</code> — 添加到路径的数组
        </li>
        <li>
          <code className="text-foreground">replace</code> — 替换路径的值
        </li>
        <li>
          <code className="text-foreground">remove</code> — 移除路径的值
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-12 mb-4">路径格式</h2>
      <p className="text-sm text-muted-foreground mb-4">
        路径使用基于键的格式来标识元素：
      </p>
      <Code lang="bash">{`/root              -> 根元素
/root/children     -> 根元素的子元素
/elements/card-1   -> key 为 "card-1" 的元素
/elements/card-1/children -> card-1 的子元素`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">服务端设置</h2>
      <p className="text-sm text-muted-foreground mb-4">
        确保您的 API 路由正确流式传输：
      </p>
      <Code lang="typescript">{`export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-opus-4.5',
    system: generateCatalogPrompt(catalog),
    prompt,
  });

  // 返回流式响应
  return new Response(result.textStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">渐进式渲染</h2>
      <p className="text-sm text-muted-foreground mb-4">
        渲染器会在树变化时自动更新：
      </p>
      <Code lang="tsx">{`function App() {
  const { tree, isLoading } = useUIStream({ endpoint: '/api/generate' });

  return (
    <div>
      {isLoading && <LoadingIndicator />}
      <Renderer tree={tree} registry={registry} />
    </div>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">中止流式传输</h2>
      <Code lang="tsx">{`function App() {
  const { isLoading, generate, abort } = useUIStream({
    endpoint: '/api/generate',
  });

  return (
    <div>
      <button onClick={() => generate('创建仪表盘')}>
        生成
      </button>
      {isLoading && (
        <button onClick={abort}>取消</button>
      )}
    </div>
  );
}`}</Code>
    </article>
  );
}
