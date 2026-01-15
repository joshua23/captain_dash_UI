import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "操作 | json-render",
};

export default function ActionsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">操作</h1>
      <p className="text-muted-foreground mb-8">
        使用命名操作安全地处理用户交互。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">为什么使用命名操作？</h2>
      <p className="text-sm text-muted-foreground mb-4">
        AI 不是生成任意代码，而是通过名称声明<em>意图</em>。
        您的应用程序提供实现。这是一个核心边界控制。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">定义操作</h2>
      <p className="text-sm text-muted-foreground mb-4">
        在您的目录中定义可用的操作：
      </p>
      <Code lang="typescript">{`const catalog = createCatalog({
  components: { /* ... */ },
  actions: {
    submit_form: {
      params: z.object({
        formId: z.string(),
      }),
      description: '提交表单',
    },
    export_data: {
      params: z.object({
        format: z.enum(['csv', 'pdf', 'json']),
        filters: z.object({
          dateRange: z.string().optional(),
        }).optional(),
      }),
    },
    navigate: {
      params: z.object({
        url: z.string(),
      }),
    },
  },
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">ActionProvider</h2>
      <p className="text-sm text-muted-foreground mb-4">
        为您的应用提供操作处理器：
      </p>
      <Code lang="tsx">{`import { ActionProvider } from '@json-render/react';

function App() {
  const handlers = {
    submit_form: async (params) => {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify({ formId: params.formId }),
      });
      return response.json();
    },

    export_data: async (params) => {
      const blob = await generateExport(params.format, params.filters);
      downloadBlob(blob, \`export.\${params.format}\`);
    },

    navigate: (params) => {
      window.location.href = params.url;
    },
  };

  return (
    <ActionProvider handlers={handlers}>
      {/* 您的 UI */}
    </ActionProvider>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">在组件中使用操作</h2>
      <Code lang="tsx">{`const Button = ({ element, onAction }) => (
  <button onClick={() => onAction(element.props.action, {})}>
    {element.props.label}
  </button>
);

// 或使用 useAction hook
import { useAction } from '@json-render/react';

function SubmitButton() {
  const submitForm = useAction('submit_form');

  return (
    <button onClick={() => submitForm({ formId: 'contact' })}>
      提交
    </button>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">带确认的操作</h2>
      <p className="text-sm text-muted-foreground mb-4">
        AI 可以声明需要用户确认的操作：
      </p>
      <Code lang="json">{`{
  "type": "Button",
  "props": {
    "label": "删除账户",
    "action": {
      "name": "delete_account",
      "params": { "userId": "123" },
      "confirm": {
        "title": "删除账户？",
        "message": "此操作无法撤销。",
        "variant": "danger"
      }
    }
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">操作回调</h2>
      <p className="text-sm text-muted-foreground mb-4">处理成功和错误状态：</p>
      <Code lang="json">{`{
  "type": "Button",
  "props": {
    "label": "保存",
    "action": {
      "name": "save_changes",
      "params": { "documentId": "doc-1" },
      "onSuccess": {
        "set": { "/ui/savedMessage": "更改已保存！" }
      },
      "onError": {
        "set": { "/ui/errorMessage": "$error.message" }
      }
    }
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">下一步</h2>
      <p className="text-sm text-muted-foreground">
        了解{" "}
        <Link
          href="/docs/visibility"
          className="text-foreground hover:underline"
        >
          条件可见性
        </Link>
        。
      </p>
    </article>
  );
}
