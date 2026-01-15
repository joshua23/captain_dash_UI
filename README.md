# json-render

**可预测。有边界。高性能。**

让终端用户通过提示词生成仪表盘、小组件、应用和数据可视化 — 安全地限制在您定义的组件范围内。

```bash
npm install @json-render/core @json-render/react
```

## 为什么选择 json-render？

当用户通过提示词生成 UI 时，您需要保障。json-render 给 AI 一个**受限的词汇表**，使输出始终可预测：

- **有边界** — AI 只能使用您目录中定义的组件
- **可预测** — JSON 输出始终匹配您的 schema
- **高性能** — 在模型响应时流式传输并渐进式渲染

## 快速开始

### 1. 定义您的目录（AI 可使用的内容）

```typescript
import { createCatalog } from '@json-render/core';
import { z } from 'zod';

const catalog = createCatalog({
  components: {
    Card: {
      props: z.object({ title: z.string() }),
      hasChildren: true,
    },
    Metric: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(),      // 绑定到您的数据
        format: z.enum(['currency', 'percent', 'number']),
      }),
    },
    Button: {
      props: z.object({
        label: z.string(),
        action: ActionSchema,        // AI 声明意图，由您处理
      }),
    },
  },
  actions: {
    export_report: { description: '将仪表盘导出为 PDF' },
    refresh_data: { description: '刷新所有指标' },
  },
});
```

### 2. 注册您的组件（如何渲染）

```tsx
const registry = {
  Card: ({ element, children }) => (
    <div className="card">
      <h3>{element.props.title}</h3>
      {children}
    </div>
  ),
  Metric: ({ element }) => {
    const value = useDataValue(element.props.valuePath);
    return <div className="metric">{format(value)}</div>;
  },
  Button: ({ element, onAction }) => (
    <button onClick={() => onAction(element.props.action)}>
      {element.props.label}
    </button>
  ),
};
```

### 3. 让 AI 生成

```tsx
import { DataProvider, ActionProvider, Renderer, useUIStream } from '@json-render/react';

function Dashboard() {
  const { tree, send } = useUIStream({ api: '/api/generate' });

  return (
    <DataProvider initialData={{ revenue: 125000, growth: 0.15 }}>
      <ActionProvider actions={{
        export_report: () => downloadPDF(),
        refresh_data: () => refetch(),
      }}>
        <input
          placeholder="创建一个收入仪表盘..."
          onKeyDown={(e) => e.key === 'Enter' && send(e.target.value)}
        />
        <Renderer tree={tree} components={registry} />
      </ActionProvider>
    </DataProvider>
  );
}
```

**就是这样。** AI 生成 JSON，您安全地渲染它。

---

## 功能特性

### 条件可见性

根据数据、认证状态或复杂逻辑显示/隐藏组件：

```json
{
  "type": "Alert",
  "props": { "message": "发生错误" },
  "visible": {
    "and": [
      { "path": "/form/hasError" },
      { "not": { "path": "/form/errorDismissed" } }
    ]
  }
}
```

```json
{
  "type": "AdminPanel",
  "visible": { "auth": "signedIn" }
}
```

### 丰富的操作

带确认对话框和回调的操作：

```json
{
  "type": "Button",
  "props": {
    "label": "退款",
    "action": {
      "name": "refund",
      "params": {
        "paymentId": { "path": "/selected/id" },
        "amount": { "path": "/refund/amount" }
      },
      "confirm": {
        "title": "确认退款",
        "message": "向客户退款 ${/refund/amount}？",
        "variant": "danger"
      },
      "onSuccess": { "set": { "/ui/success": true } },
      "onError": { "set": { "/ui/error": "$error.message" } }
    }
  }
}
```

### 内置验证

```json
{
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
}
```

---

## 包

| 包 | 描述 |
|---------|-------------|
| `@json-render/core` | 类型、schema、可见性、操作、验证 |
| `@json-render/react` | React 渲染器、providers、hooks |

## 演示

```bash
git clone https://github.com/vercel-labs/json-render
cd json-render
pnpm install
pnpm dev
```

- http://localhost:3000 — 文档 & 演练场
- http://localhost:3001 — 示例仪表盘

## 项目结构

```
json-render/
├── packages/
│   ├── core/        → @json-render/core
│   └── react/       → @json-render/react
├── apps/
│   └── web/         → 文档 & 演练场网站
└── examples/
    └── dashboard/   → 示例仪表盘应用
```

## 工作原理

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  用户提示词  │────▶│  AI + 目录   │────▶│  JSON 树    │
│  "仪表盘"   │     │  (有边界的)  │     │ (可预测的)  │
└─────────────┘     └──────────────┘     └─────────────┘
                                               │
                    ┌──────────────┐            │
                    │   您的 React │◀───────────┘
                    │     组件     │ (流式传输)
                    └──────────────┘
```

1. **定义边界** — AI 可以使用哪些组件、操作和数据绑定
2. **用户提示** — 终端用户用自然语言描述他们想要什么
3. **AI 生成 JSON** — 输出始终可预测，受限于您的目录
4. **快速渲染** — 在模型响应时流式传输并渐进式渲染

## 许可证

Apache-2.0
