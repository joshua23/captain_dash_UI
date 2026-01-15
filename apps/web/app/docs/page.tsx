export const metadata = {
  title: "介绍 | json-render",
};

export default function DocsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">介绍</h1>
      <p className="text-muted-foreground mb-8">
        可预测。有边界。高性能。让用户通过提示词生成仪表盘、小组件、应用和数据可视化。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">什么是 json-render？</h2>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        json-render 让终端用户通过自然语言提示词生成 UI —
        安全地限制在您定义的组件范围内。您设定边界：
        有哪些组件、它们接受什么属性、有哪些可用的操作。 AI 生成匹配您 schema 的
        JSON，您的组件原生渲染它。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        为什么选择 json-render？
      </h2>
      <div className="space-y-4 mb-8">
        <div>
          <h3 className="font-medium mb-1">有边界</h3>
          <p className="text-sm text-muted-foreground">
            AI 只能使用您目录中的组件。不会生成任意代码。
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-1">可预测</h3>
          <p className="text-sm text-muted-foreground">
            JSON 输出始终匹配您的 schema。操作按名称声明，由您控制它们的行为。
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-1">高性能</h3>
          <p className="text-sm text-muted-foreground">
            在模型响应时流式传输并渐进式渲染。无需等待完成。
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-12 mb-4">工作原理</h2>
      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
        <li>定义边界 — AI 可以使用哪些组件、操作和数据绑定</li>
        <li>用户提示 — 终端用户用自然语言描述他们想要什么</li>
        <li>AI 生成 JSON — 输出始终可预测，受限于您的目录</li>
        <li>快速渲染 — 在模型响应时流式传输并渐进式渲染</li>
      </ol>
    </article>
  );
}
