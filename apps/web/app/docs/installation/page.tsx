import { PackageInstall } from "@/components/package-install";

export const metadata = {
  title: "安装 | json-render",
};

export default function InstallationPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">安装</h1>
      <p className="text-muted-foreground mb-8">
        安装核心包和 React 包以开始使用。
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">安装包</h2>
      <PackageInstall packages="@json-render/core @json-render/react" />

      <h2 className="text-xl font-semibold mt-12 mb-4">对等依赖</h2>
      <p className="text-sm text-muted-foreground mb-4">
        json-render 需要以下对等依赖：
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>
          <code className="text-foreground">react</code> ^19.0.0
        </li>
        <li>
          <code className="text-foreground">zod</code> ^4.0.0
        </li>
      </ul>
      <PackageInstall packages="react zod" />

      <h2 className="text-xl font-semibold mt-12 mb-4">AI 集成</h2>
      <p className="text-sm text-muted-foreground mb-4">
        要将 json-render 与 AI 模型一起使用，您还需要 Vercel AI SDK：
      </p>
      <PackageInstall packages="ai" />
    </article>
  );
}
