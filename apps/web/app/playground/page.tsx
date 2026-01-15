import { Button } from "@/components/ui/button";

export const metadata = {
  title: "演练场 | json-render",
};

export default function PlaygroundPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">演练场</h1>
      <p className="text-muted-foreground mb-12">
        通过实时示例体验 json-render。
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-semibold mb-4">本地运行</h2>
          <p className="text-sm text-muted-foreground mb-4">
            克隆仓库并运行示例仪表盘。
          </p>
          <pre className="text-sm mb-4">
            <code>{`git clone https://github.com/vercel-labs/json-render
cd json-render
pnpm install
pnpm dev`}</code>
          </pre>
          <p className="text-sm text-muted-foreground">
            打开 <code>http://localhost:3001</code> 查看示例仪表盘。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">示例提示词</h2>
          <p className="text-sm text-muted-foreground mb-4">
            在示例仪表盘中尝试这些提示词：
          </p>
          <div className="space-y-2">
            {[
              "创建一个带月度指标的收入仪表盘",
              "构建一个带表格的用户管理面板",
              "设计一个带文本输入框的设置表单",
              "制作一个带提醒的通知中心",
            ].map((prompt) => (
              <div
                key={prompt}
                className="p-3 border border-border rounded text-sm font-mono"
              >
                {prompt}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">在线演练场</h2>
          <p className="text-sm text-muted-foreground mb-6">
            基于浏览器的演练场即将推出。
          </p>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/vercel-labs/json-render"
              target="_blank"
              rel="noopener noreferrer"
            >
              在 GitHub 上加星
            </a>
          </Button>
        </section>
      </div>
    </div>
  );
}
