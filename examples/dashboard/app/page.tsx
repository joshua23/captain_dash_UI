"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DataProvider,
  ActionProvider,
  VisibilityProvider,
  Renderer,
} from "@json-render/react";
import { componentRegistry } from "@/components/ui";
import { useDynamicUIStream } from "@/hooks/useDynamicUIStream";

type DataSource = "tasks" | "users" | "subscriptions" | "notifications";

// 数据源显示名称
const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  tasks: "📋 任务数据",
  users: "👤 用户数据",
  subscriptions: "💳 订阅数据",
  notifications: "🔔 通知数据",
};

// 默认空数据
const EMPTY_DATA = { analytics: {} };

export default function DashboardPage() {
  const [prompt, setPrompt] = useState("");
  const [data, setData] = useState<Record<string, unknown>>(EMPTY_DATA);
  const [currentSource, setCurrentSource] = useState<DataSource | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataVersion, setDataVersion] = useState(0); // 用于强制刷新 DataProvider

  const { tree, isStreaming, error, dataSource, send, clear } =
    useDynamicUIStream({
      api: "/api/generate",
      onError: (err) => console.error("生成错误:", err),
      onDataSourceChange: (source) => {
        console.log("📊 数据源切换到:", source);
      },
    });

  // 当数据源变化时，获取对应数据
  useEffect(() => {
    if (dataSource && dataSource !== currentSource) {
      setIsLoadingData(true);

      fetch(`/api/data?source=${dataSource}`)
        .then((res) => res.json())
        .then((newData) => {
          console.log(`✅ 已加载 ${dataSource} 数据:`, newData);
          setCurrentSource(dataSource);
          setData(newData);
          // 递增版本号强制 DataProvider 使用新数据重新挂载
          setDataVersion((v) => v + 1);
        })
        .catch((err) => {
          console.error(`❌ 加载 ${dataSource} 数据失败:`, err);
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }
  }, [dataSource, currentSource]);

  const ACTION_HANDLERS = {
    export_report: () => alert("正在导出报告..."),
    refresh_data: () => {
      if (currentSource) {
        fetch(`/api/data?source=${currentSource}`)
          .then((res) => res.json())
          .then(setData);
      }
    },
    view_details: (params: Record<string, unknown>) =>
      alert(`详情: ${JSON.stringify(params)}`),
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim()) return;
      await send(prompt);
    },
    [prompt, send],
  );

  const handleClear = useCallback(() => {
    clear();
    setData(EMPTY_DATA);
    setCurrentSource(null);
  }, [clear]);

  // 示例提示词 - 分组展示
  const exampleGroups = [
    {
      label: "任务",
      examples: ["任务统计仪表盘", "任务状态分布饼图", "每日任务趋势图"],
    },
    {
      label: "用户",
      examples: ["用户统计概览", "用户登录方式分布", "最近注册用户列表"],
    },
    {
      label: "订阅",
      examples: ["订阅收入统计", "订阅计划分布", "活跃订阅列表"],
    },
    {
      label: "通知",
      examples: ["通知统计仪表盘", "通知类型分布", "未读通知概览"],
    },
  ];

  const hasElements = tree && Object.keys(tree.elements).length > 0;

  // 使用 dataSource 作为 key，确保数据切换时重新渲染
  // 使用 dataVersion 确保数据更新时 DataProvider 重新挂载
  const dataKey = `${currentSource || "empty"}-${dataVersion}`;

  return (
    <DataProvider key={dataKey} initialData={data}>
      <VisibilityProvider>
        <ActionProvider handlers={ACTION_HANDLERS}>
          <div
            style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}
          >
            <header style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  智能仪表盘
                </h1>
                {currentSource && (
                  <span
                    style={{
                      padding: "4px 12px",
                      background: "#3b82f620",
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                      color: "#3b82f6",
                    }}
                  >
                    {DATA_SOURCE_LABELS[currentSource]}
                  </span>
                )}
                {isLoadingData && (
                  <span
                    style={{
                      padding: "4px 8px",
                      background: "var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    加载数据中...
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "var(--muted)",
                  fontSize: 16,
                }}
              >
                输入任意问题，AI 自动选择数据源并生成可视化组件
              </p>
            </header>

            <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：用户统计概览、任务完成率趋势、订阅收入分析..."
                  disabled={isStreaming}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--foreground)",
                    fontSize: 16,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={isStreaming || !prompt.trim()}
                  style={{
                    padding: "12px 24px",
                    background: isStreaming
                      ? "var(--border)"
                      : "var(--foreground)",
                    color: "var(--background)",
                    border: "none",
                    borderRadius: "var(--radius)",
                    fontSize: 16,
                    fontWeight: 500,
                    opacity: isStreaming || !prompt.trim() ? 0.5 : 1,
                  }}
                >
                  {isStreaming ? "生成中..." : "生成"}
                </button>
                {hasElements && (
                  <button
                    type="button"
                    onClick={handleClear}
                    style={{
                      padding: "12px 16px",
                      background: "transparent",
                      color: "var(--muted)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: 16,
                    }}
                  >
                    清除
                  </button>
                )}
              </div>

              {/* 分组示例 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {exampleGroups.map((group) => (
                  <div
                    key={group.label}
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        width: 40,
                        flexShrink: 0,
                      }}
                    >
                      {group.label}
                    </span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {group.examples.map((ex) => (
                        <button
                          key={ex}
                          type="button"
                          onClick={() => setPrompt(ex)}
                          style={{
                            padding: "4px 10px",
                            background: "var(--card)",
                            color: "var(--muted)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            fontSize: 12,
                          }}
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </form>

            {error && (
              <div
                style={{
                  padding: 16,
                  marginBottom: 24,
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "#ef4444",
                  fontSize: 14,
                }}
              >
                {error.message}
              </div>
            )}

            <div
              style={{
                minHeight: 300,
                padding: 24,
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              {!hasElements && !isStreaming ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "var(--muted)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 16 }}>
                    输入提示词来生成仪表盘组件
                  </p>
                  <p style={{ margin: "8px 0 0", fontSize: 13 }}>
                    支持任务、用户、订阅、通知等多种数据源
                  </p>
                </div>
              ) : tree ? (
                <Renderer
                  tree={tree}
                  registry={componentRegistry}
                  loading={isStreaming || isLoadingData}
                />
              ) : null}
            </div>

            {/* 调试信息 */}
            {hasElements && (
              <details style={{ marginTop: 24 }}>
                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: 14,
                    color: "var(--muted)",
                  }}
                >
                  🔧 调试信息
                </summary>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 12, color: "var(--muted)" }}>
                      数据源:
                    </strong>
                    <pre
                      style={{
                        marginTop: 4,
                        padding: 12,
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        overflow: "auto",
                        fontSize: 11,
                        color: "var(--muted)",
                      }}
                    >
                      {currentSource || "未选择"}
                    </pre>
                  </div>
                  <div>
                    <strong style={{ fontSize: 12, color: "var(--muted)" }}>
                      当前数据:
                    </strong>
                    <pre
                      style={{
                        marginTop: 4,
                        padding: 12,
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        overflow: "auto",
                        fontSize: 11,
                        color: "var(--muted)",
                        maxHeight: 200,
                      }}
                    >
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <strong style={{ fontSize: 12, color: "var(--muted)" }}>
                      生成的 JSON 树:
                    </strong>
                    <pre
                      style={{
                        marginTop: 4,
                        padding: 12,
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        overflow: "auto",
                        fontSize: 11,
                        color: "var(--muted)",
                        maxHeight: 200,
                      }}
                    >
                      {JSON.stringify(tree, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
}
