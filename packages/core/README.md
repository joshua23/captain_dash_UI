# @json-render/core

**可预测。有边界。高性能。** 用于安全、用户提示词驱动的 UI 生成的核心库。

## 功能特性

- **条件可见性**: 基于数据路径、认证状态或复杂逻辑表达式显示/隐藏组件
- **丰富的操作**: 带类型参数、确认对话框和成功/错误回调的操作
- **增强验证**: 内置验证函数，支持自定义目录函数
- **类型安全的目录**: 使用 Zod 定义组件 schema，实现完整的类型安全
- **框架无关**: 核心逻辑独立于 UI 框架

## 安装

```bash
npm install @json-render/core
# 或
pnpm add @json-render/core
```

## 快速开始

### 创建目录

```typescript
import { createCatalog } from '@json-render/core';
import { z } from 'zod';

const catalog = createCatalog({
  name: '我的仪表盘',
  components: {
    Card: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
      }),
      hasChildren: true,
      description: '卡片容器',
    },
    Button: {
      props: z.object({
        label: z.string(),
        action: ActionSchema,
      }),
      description: '可点击的按钮',
    },
  },
  actions: {
    submit: { description: '提交表单' },
    export: {
      params: z.object({ format: z.enum(['csv', 'pdf']) }),
      description: '导出数据',
    },
  },
  functions: {
    customValidation: (value) => typeof value === 'string' && value.length > 0,
  },
});
```

### 可见性条件

```typescript
import { visibility, evaluateVisibility } from '@json-render/core';

// 简单的基于路径的可见性
const element1 = {
  key: 'error-banner',
  type: 'Alert',
  props: { message: '错误!' },
  visible: { path: '/form/hasError' },
};

// 基于认证的可见性
const element2 = {
  key: 'admin-panel',
  type: 'Card',
  props: { title: '管理员' },
  visible: { auth: 'signedIn' },
};

// 复杂逻辑
const element3 = {
  key: 'notification',
  type: 'Alert',
  props: { message: '警告' },
  visible: {
    and: [
      { path: '/settings/notifications' },
      { not: { path: '/user/dismissed' } },
      { gt: [{ path: '/items/count' }, 10] },
    ],
  },
};

// 评估可见性
const isVisible = evaluateVisibility(element1.visible, {
  dataModel: { form: { hasError: true } },
});
```

### 丰富的操作

```typescript
import { resolveAction, executeAction } from '@json-render/core';

const buttonAction = {
  name: 'refund',
  params: {
    paymentId: { path: '/selected/id' },
    amount: 100,
  },
  confirm: {
    title: '确认退款',
    message: '向客户退款 $100？',
    variant: 'danger',
  },
  onSuccess: { navigate: '/payments' },
  onError: { set: { '/ui/error': '$error.message' } },
};

// 解析动态值
const resolved = resolveAction(buttonAction, dataModel);
```

### 验证

```typescript
import { runValidation, check } from '@json-render/core';

const config = {
  checks: [
    check.required('邮箱为必填项'),
    check.email('邮箱格式无效'),
    check.maxLength(100, '太长了'),
  ],
  validateOn: 'blur',
};

const result = runValidation(config, {
  value: 'user@example.com',
  dataModel: {},
});

// result.valid = true
// result.errors = []
```

## API 参考

### 可见性

- `evaluateVisibility(condition, context)` - 评估可见性条件
- `evaluateLogicExpression(expr, context)` - 评估逻辑表达式
- `visibility.*` - 创建可见性条件的辅助函数

### 操作

- `resolveAction(action, dataModel)` - 解析操作中的动态值
- `executeAction(context)` - 执行带回调的操作
- `interpolateString(template, dataModel)` - 在字符串中插值 `${path}`

### 验证

- `runValidation(config, context)` - 运行验证检查
- `runValidationCheck(check, context)` - 运行单个验证检查
- `builtInValidationFunctions` - 内置验证器 (required, email, min, max 等)
- `check.*` - 创建验证检查的辅助函数

### 目录

- `createCatalog(config)` - 创建包含组件、操作和函数的目录
- `generateCatalogPrompt(catalog)` - 生成描述目录的 AI 提示词

## 类型

完整类型定义请参见 `src/types.ts`：

- `UIElement` - 基础元素结构
- `UITree` - 扁平树结构
- `VisibilityCondition` - 可见性条件类型
- `LogicExpression` - 逻辑表达式类型
- `Action` - 丰富的操作定义
- `ValidationConfig` - 验证配置
