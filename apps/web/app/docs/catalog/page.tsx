import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "目录 | json-render",
};

export default function CatalogPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">目录</h1>
      <p className="text-muted-foreground mb-8">
        目录定义了 AI 可以生成什么。它是您的边界控制。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">什么是目录？</h2>
      <p className="text-sm text-muted-foreground mb-4">
        目录是一个 schema，定义了：
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>
          <strong className="text-foreground">组件</strong> — AI 可以创建的 UI
          元素
        </li>
        <li>
          <strong className="text-foreground">操作</strong> — AI 可以触发的操作
        </li>
        <li>
          <strong className="text-foreground">验证函数</strong> —
          表单输入的自定义验证器
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-12 mb-4">创建目录</h2>
      <Code lang="typescript">{`import { createCatalog } from '@json-render/core';
import { z } from 'zod';

const catalog = createCatalog({
  components: {
    // 使用其属性 schema 定义每个组件
    Card: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        padding: z.enum(['sm', 'md', 'lg']).default('md'),
      }),
      hasChildren: true, // 可以包含其他组件
    },

    Metric: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(), // 指向数据的 JSON Pointer
        format: z.enum(['currency', 'percent', 'number']),
      }),
    },
  },

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
      }),
    },
  },

  validationFunctions: {
    isValidEmail: {
      description: '验证邮箱格式',
    },
    isPhoneNumber: {
      description: '验证电话号码',
    },
  },
});`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">组件定义</h2>
      <p className="text-sm text-muted-foreground mb-4">
        目录中的每个组件都有：
      </p>
      <Code lang="typescript">{`{
  props: z.object({...}),  // 属性的 Zod schema
  hasChildren?: boolean,    // 是否可以有子元素？
  description?: string,     // 帮助 AI 理解何时使用它
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">生成 AI 提示词</h2>
      <p className="text-sm text-muted-foreground mb-4">
        使用 <code className="text-foreground">generateCatalogPrompt</code> 来为
        AI 创建系统提示词：
      </p>
      <Code lang="typescript">{`import { generateCatalogPrompt } from '@json-render/core';

const systemPrompt = generateCatalogPrompt(catalog);
// 将此作为系统提示词传递给您的 AI 模型`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">下一步</h2>
      <p className="text-sm text-muted-foreground">
        了解如何为您的目录{" "}
        <Link
          href="/docs/components"
          className="text-foreground hover:underline"
        >
          注册 React 组件
        </Link>
        。
      </p>
    </article>
  );
}
