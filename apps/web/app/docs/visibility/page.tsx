import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "可见性 | json-render",
};

export default function VisibilityPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">可见性</h1>
      <p className="text-muted-foreground mb-8">
        根据数据、认证状态或逻辑条件显示或隐藏组件。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">VisibilityProvider</h2>
      <p className="text-sm text-muted-foreground mb-4">
        用 VisibilityProvider 包装您的应用以启用条件渲染：
      </p>
      <Code lang="tsx">{`import { VisibilityProvider } from '@json-render/react';

function App() {
  return (
    <DataProvider initialData={data}>
      <VisibilityProvider>
        {/* 组件现在可以使用可见性条件 */}
      </VisibilityProvider>
    </DataProvider>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">基于路径的可见性</h2>
      <p className="text-sm text-muted-foreground mb-4">
        根据数据值显示/隐藏：
      </p>
      <Code lang="json">{`{
  "type": "Alert",
  "props": { "message": "表单有错误" },
  "visible": { "path": "/form/hasErrors" }
}

// 当 /form/hasErrors 为真值时可见`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">基于认证的可见性</h2>
      <p className="text-sm text-muted-foreground mb-4">
        根据认证状态显示/隐藏：
      </p>
      <Code lang="json">{`{
  "type": "AdminPanel",
  "visible": { "auth": "signedIn" }
}

// 选项："signedIn"、"signedOut"、"admin" 等`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">逻辑表达式</h2>
      <p className="text-sm text-muted-foreground mb-4">
        使用逻辑运算符组合条件：
      </p>
      <Code lang="json">{`// AND - 所有条件必须为真
{
  "type": "SubmitButton",
  "visible": {
    "and": [
      { "path": "/form/isValid" },
      { "path": "/form/hasChanges" }
    ]
  }
}

// OR - 任一条件为真即可
{
  "type": "HelpText",
  "visible": {
    "or": [
      { "path": "/user/isNew" },
      { "path": "/settings/showHelp" }
    ]
  }
}

// NOT - 反转条件
{
  "type": "WelcomeBanner",
  "visible": {
    "not": { "path": "/user/hasSeenWelcome" }
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">比较运算符</h2>
      <Code lang="json">{`// 等于
{
  "visible": {
    "eq": [{ "path": "/user/role" }, "admin"]
  }
}

// 大于
{
  "visible": {
    "gt": [{ "path": "/cart/total" }, 100]
  }
}

// 可用：eq、ne、gt、gte、lt、lte`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">复杂示例</h2>
      <Code lang="json">{`{
  "type": "RefundButton",
  "props": { "label": "处理退款" },
  "visible": {
    "and": [
      { "auth": "signedIn" },
      { "eq": [{ "path": "/user/role" }, "support"] },
      { "gt": [{ "path": "/order/amount" }, 0] },
      { "not": { "path": "/order/isRefunded" } }
    ]
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">在组件中使用</h2>
      <Code lang="tsx">{`import { useIsVisible } from '@json-render/react';

function ConditionalContent({ element, children }) {
  const isVisible = useIsVisible(element.visible);

  if (!isVisible) return null;
  return <div>{children}</div>;
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">下一步</h2>
      <p className="text-sm text-muted-foreground">
        了解{" "}
        <Link
          href="/docs/validation"
          className="text-foreground hover:underline"
        >
          表单验证
        </Link>
        。
      </p>
    </article>
  );
}
