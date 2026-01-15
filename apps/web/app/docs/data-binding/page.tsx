import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "数据绑定 | json-render",
};

export default function DataBindingPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">数据绑定</h1>
      <p className="text-muted-foreground mb-8">
        使用 JSON Pointer 路径将 UI 组件连接到您的应用程序数据。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">JSON Pointer 路径</h2>
      <p className="text-sm text-muted-foreground mb-4">
        json-render 使用 JSON Pointer (RFC 6901) 作为数据路径：
      </p>
      <Code lang="json">{`// 给定以下数据：
{
  "user": {
    "name": "Alice",
    "email": "alice@example.com"
  },
  "metrics": {
    "revenue": 125000,
    "growth": 0.15
  }
}

// 这些路径访问：
"/user/name"        -> "Alice"
"/metrics/revenue"  -> 125000
"/metrics/growth"   -> 0.15`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">DataProvider</h2>
      <p className="text-sm text-muted-foreground mb-4">
        用 DataProvider 包装您的应用以启用数据绑定：
      </p>
      <Code lang="tsx">{`import { DataProvider } from '@json-render/react';

function App() {
  const initialData = {
    user: { name: 'Alice' },
    form: { email: '', message: '' },
  };

  return (
    <DataProvider initialData={initialData}>
      {/* 您的 UI */}
    </DataProvider>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">读取数据</h2>
      <p className="text-sm text-muted-foreground mb-4">
        使用 <code className="text-foreground">useDataValue</code>{" "}
        进行只读访问：
      </p>
      <Code lang="tsx">{`import { useDataValue } from '@json-render/react';

function UserGreeting() {
  const name = useDataValue('/user/name');
  return <h1>你好，{name}！</h1>;
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">双向绑定</h2>
      <p className="text-sm text-muted-foreground mb-4">
        使用 <code className="text-foreground">useDataBinding</code>{" "}
        进行读写访问：
      </p>
      <Code lang="tsx">{`import { useDataBinding } from '@json-render/react';

function EmailInput() {
  const [email, setEmail] = useDataBinding('/form/email');

  return (
    <input
      type="email"
      value={email || ''}
      onChange={(e) => setEmail(e.target.value)}
    />
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">使用数据上下文</h2>
      <p className="text-sm text-muted-foreground mb-4">
        访问完整的数据上下文以用于高级用例：
      </p>
      <Code lang="tsx">{`import { useData } from '@json-render/react';

function DataDebugger() {
  const { data, setData, getValue, setValue } = useData();

  // 读取任意路径
  const revenue = getValue('/metrics/revenue');

  // 写入任意路径
  const updateRevenue = () => setValue('/metrics/revenue', 150000);

  // 替换所有数据
  const resetData = () => setData({ user: {}, form: {} });

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">在 JSON UI 树中</h2>
      <p className="text-sm text-muted-foreground mb-4">
        AI 可以在组件属性中引用数据路径：
      </p>
      <Code lang="json">{`{
  "type": "Metric",
  "props": {
    "label": "总收入",
    "valuePath": "/metrics/revenue",
    "format": "currency"
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">下一步</h2>
      <p className="text-sm text-muted-foreground">
        了解{" "}
        <Link href="/docs/actions" className="text-foreground hover:underline">
          操作
        </Link>{" "}
        以处理用户交互。
      </p>
    </article>
  );
}
