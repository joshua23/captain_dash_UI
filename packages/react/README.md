# @json-render/react

**可预测。有边界。高性能。** 用于用户提示词驱动的仪表盘、小组件、应用和数据可视化的 React 渲染器。

## 功能特性

- **可见性过滤**: 组件根据可见性条件自动显示/隐藏
- **操作处理**: 内置操作执行，带确认对话框
- **验证**: 字段验证与错误显示
- **数据绑定**: UI 与数据模型之间的双向数据绑定
- **流式传输**: 从流式 UI 树渐进式渲染

## 安装

```bash
npm install @json-render/react @json-render/core
# 或
pnpm add @json-render/react @json-render/core
```

## 快速开始

### 基本设置

```tsx
import { JSONUIProvider, Renderer, useUIStream } from '@json-render/react';

// 定义您的组件注册表
const registry = {
  Card: ({ element, children }) => (
    <div className="card">
      <h3>{element.props.title}</h3>
      {children}
    </div>
  ),
  Button: ({ element, onAction }) => (
    <button onClick={() => onAction?.(element.props.action)}>
      {element.props.label}
    </button>
  ),
};

// 操作处理器
const actionHandlers = {
  submit: async (params) => {
    await api.submit(params);
  },
  export: (params) => {
    download(params.format);
  },
};

function App() {
  const { tree, isStreaming, send, clear } = useUIStream({
    api: '/api/generate',
  });

  return (
    <JSONUIProvider
      registry={registry}
      initialData={{ user: { name: '张三' } }}
      authState={{ isSignedIn: true }}
      actionHandlers={actionHandlers}
    >
      <input
        placeholder="描述 UI..."
        onKeyDown={(e) => e.key === 'Enter' && send(e.target.value)}
      />
      <Renderer tree={tree} registry={registry} loading={isStreaming} />
    </JSONUIProvider>
  );
}
```

### 直接使用上下文

```tsx
import {
  DataProvider,
  VisibilityProvider,
  ActionProvider,
  ValidationProvider,
  useData,
  useVisibility,
  useActions,
  useFieldValidation,
} from '@json-render/react';

// 数据上下文
function MyComponent() {
  const { data, get, set } = useData();
  const value = get('/user/name');

  return (
    <input
      value={value}
      onChange={(e) => set('/user/name', e.target.value)}
    />
  );
}

// 可见性上下文
function ConditionalComponent({ visible }) {
  const { isVisible } = useVisibility();

  if (!isVisible(visible)) {
    return null;
  }

  return <div>可见内容</div>;
}

// 操作上下文
function ActionButton({ action }) {
  const { execute, loadingActions } = useActions();

  return (
    <button
      onClick={() => execute(action)}
      disabled={loadingActions.has(action.name)}
    >
      {action.name}
    </button>
  );
}

// 验证上下文
function ValidatedInput({ path, checks }) {
  const { errors, validate, touch } = useFieldValidation(path, { checks });
  const [value, setValue] = useDataBinding(path);

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => { touch(); validate(); }}
      />
      {errors.map((err) => <span key={err}>{err}</span>)}
    </div>
  );
}
```

### 流式 UI

```tsx
import { useUIStream } from '@json-render/react';

function StreamingDemo() {
  const {
    tree,        // 当前 UI 树
    isStreaming, // 是否正在流式传输
    error,       // 错误（如果有）
    send,        // 发送提示词
    clear,       // 清除树
  } = useUIStream({
    api: '/api/generate',
    onComplete: (tree) => console.log('完成:', tree),
    onError: (err) => console.error('错误:', err),
  });

  return (
    <div>
      <button onClick={() => send('创建一个仪表盘')}>
        生成
      </button>
      {isStreaming && <span>生成中...</span>}
      {tree && <Renderer tree={tree} registry={registry} />}
    </div>
  );
}
```

## API 参考

### Providers

- `JSONUIProvider` - 所有上下文的组合 provider
- `DataProvider` - 数据模型上下文
- `VisibilityProvider` - 可见性评估上下文
- `ActionProvider` - 操作执行上下文
- `ValidationProvider` - 验证上下文

### Hooks

- `useData()` - 访问数据模型
- `useDataValue(path)` - 获取单个值
- `useDataBinding(path)` - 类似 useState 的双向绑定
- `useVisibility()` - 访问可见性评估
- `useIsVisible(condition)` - 检查条件是否可见
- `useActions()` - 访问操作执行
- `useAction(action)` - 执行特定操作
- `useValidation()` - 访问验证上下文
- `useFieldValidation(path, config)` - 字段级验证

### 组件

- `Renderer` - 渲染 UI 树
- `ConfirmDialog` - 默认确认对话框

### 工具函数

- `useUIStream(options)` - 流式 UI 生成的 hook
- `flatToTree(elements)` - 将扁平列表转换为树

## 组件属性

注册表中的组件接收以下属性：

```typescript
interface ComponentRenderProps<P = Record<string, unknown>> {
  element: UIElement<string, P>;  // 元素定义
  children?: ReactNode;           // 已渲染的子元素
  onAction?: (action: Action) => void;  // 操作回调
  loading?: boolean;              // 流式传输进行中
}
```

## 示例组件

```tsx
function MetricComponent({ element }: ComponentRenderProps) {
  const { label, valuePath, format } = element.props;
  const value = useDataValue(valuePath);

  const formatted = format === 'currency'
    ? new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value)
    : String(value);

  return (
    <div className="metric">
      <span className="label">{label}</span>
      <span className="value">{formatted}</span>
    </div>
  );
}
```
