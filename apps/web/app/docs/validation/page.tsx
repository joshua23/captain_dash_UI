import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "验证 | json-render",
};

export default function ValidationPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">验证</h1>
      <p className="text-muted-foreground mb-8">
        使用内置和自定义函数验证表单输入。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">内置验证器</h2>
      <p className="text-sm text-muted-foreground mb-4">
        json-render 包含常用的验证函数：
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>
          <code className="text-foreground">required</code> — 值必须非空
        </li>
        <li>
          <code className="text-foreground">email</code> — 有效的邮箱格式
        </li>
        <li>
          <code className="text-foreground">minLength</code> — 最小字符串长度
        </li>
        <li>
          <code className="text-foreground">maxLength</code> — 最大字符串长度
        </li>
        <li>
          <code className="text-foreground">pattern</code> — 匹配正则表达式模式
        </li>
        <li>
          <code className="text-foreground">min</code> — 最小数值
        </li>
        <li>
          <code className="text-foreground">max</code> — 最大数值
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-12 mb-4">在 JSON 中使用验证</h2>
      <Code lang="json">{`{
  "type": "TextField",
  "props": {
    "label": "邮箱",
    "valuePath": "/form/email",
    "checks": [
      { "fn": "required", "message": "邮箱为必填项" },
      { "fn": "email", "message": "邮箱格式无效" }
    ],
    "validateOn": "blur"
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">带参数的验证</h2>
      <Code lang="json">{`{
  "type": "TextField",
  "props": {
    "label": "密码",
    "valuePath": "/form/password",
    "checks": [
      { "fn": "required", "message": "密码为必填项" },
      {
        "fn": "minLength",
        "args": { "length": 8 },
        "message": "密码至少需要 8 个字符"
      },
      {
        "fn": "pattern",
        "args": { "pattern": "[A-Z]" },
        "message": "必须包含至少一个大写字母"
      }
    ]
  }
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">自定义验证函数</h2>
      <p className="text-sm text-muted-foreground mb-4">
        在您的目录中定义自定义验证器：
      </p>
      <Code lang="typescript">{`const catalog = createCatalog({
  components: { /* ... */ },
  validationFunctions: {
    isValidPhone: {
      description: '验证电话号码格式',
    },
    isUniqueEmail: {
      description: '检查邮箱是否已被注册',
    },
  },
});`}</Code>

      <p className="text-sm text-muted-foreground mb-4">
        然后在您的 ValidationProvider 中实现它们：
      </p>
      <Code lang="tsx">{`import { ValidationProvider } from '@json-render/react';

function App() {
  const customValidators = {
    isValidPhone: (value) => {
      const phoneRegex = /^\\+?[1-9]\\d{1,14}$/;
      return phoneRegex.test(value);
    },
    isUniqueEmail: async (value) => {
      const response = await fetch(\`/api/check-email?email=\${value}\`);
      const { available } = await response.json();
      return available;
    },
  };

  return (
    <ValidationProvider functions={customValidators}>
      {/* 您的 UI */}
    </ValidationProvider>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">在组件中使用</h2>
      <Code lang="tsx">{`import { useFieldValidation } from '@json-render/react';

function TextField({ element }) {
  const { value, setValue, errors, validate } = useFieldValidation(
    element.props.valuePath,
    element.props.checks
  );

  return (
    <div>
      <label>{element.props.label}</label>
      <input
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => validate()}
      />
      {errors.map((error, i) => (
        <p key={i} className="text-red-500 text-sm">{error}</p>
      ))}
    </div>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">验证时机</h2>
      <p className="text-sm text-muted-foreground mb-4">
        使用 <code className="text-foreground">validateOn</code>{" "}
        控制验证何时运行：
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
        <li>
          <code className="text-foreground">change</code> — 每次输入变化时验证
        </li>
        <li>
          <code className="text-foreground">blur</code> — 字段失去焦点时验证
        </li>
        <li>
          <code className="text-foreground">submit</code> — 仅在表单提交时验证
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-12 mb-4">下一步</h2>
      <p className="text-sm text-muted-foreground">
        了解{" "}
        <Link href="/docs/ai-sdk" className="text-foreground hover:underline">
          AI SDK 集成
        </Link>
        。
      </p>
    </article>
  );
}
