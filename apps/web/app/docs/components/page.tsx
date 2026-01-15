import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "组件 | json-render",
};

export default function ComponentsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">组件</h1>
      <p className="text-muted-foreground mb-8">
        注册 React 组件来渲染您的目录类型。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">组件注册表</h2>
      <p className="text-sm text-muted-foreground mb-4">
        创建一个注册表，将目录组件类型映射到 React 组件：
      </p>
      <Code lang="tsx">{`const registry = {
  Card: ({ element, children }) => (
    <div className="card">
      <h2>{element.props.title}</h2>
      {element.props.description && (
        <p>{element.props.description}</p>
      )}
      {children}
    </div>
  ),

  Button: ({ element, onAction }) => (
    <button onClick={() => onAction(element.props.action, {})}>
      {element.props.label}
    </button>
  ),
};`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">组件属性</h2>
      <p className="text-sm text-muted-foreground mb-4">
        每个组件接收以下属性：
      </p>
      <Code lang="typescript">{`interface ComponentProps {
  element: {
    key: string;
    type: string;
    props: Record<string, unknown>;
    children?: UIElement[];
    visible?: VisibilityCondition;
    validation?: ValidationSchema;
  };
  children?: React.ReactNode;  // 已渲染的子元素
  onAction: (name: string, params: object) => void;
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">使用数据绑定</h2>
      <p className="text-sm text-muted-foreground mb-4">
        使用 hooks 来读取和写入数据：
      </p>
      <Code lang="tsx">{`import { useDataValue, useDataBinding } from '@json-render/react';

const Metric = ({ element }) => {
  // 只读值
  const value = useDataValue(element.props.valuePath);

  return (
    <div className="metric">
      <span className="label">{element.props.label}</span>
      <span className="value">{formatValue(value)}</span>
    </div>
  );
};

const TextField = ({ element }) => {
  // 双向绑定
  const [value, setValue] = useDataBinding(element.props.valuePath);

  return (
    <input
      value={value || ''}
      onChange={(e) => setValue(e.target.value)}
      placeholder={element.props.placeholder}
    />
  );
};`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">使用渲染器</h2>
      <Code lang="tsx">{`import { Renderer } from '@json-render/react';

function App() {
  return (
    <Renderer
      tree={uiTree}
      registry={registry}
    />
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">下一步</h2>
      <p className="text-sm text-muted-foreground">
        了解{" "}
        <Link
          href="/docs/data-binding"
          className="text-foreground hover:underline"
        >
          数据绑定
        </Link>{" "}
        以获取动态值。
      </p>
    </article>
  );
}
