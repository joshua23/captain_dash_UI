"use client";

import { useState, useCallback, useRef } from "react";
import type { UITree, UIElement, JsonPatch } from "@json-render/core";
import { setByPath } from "@json-render/core";

type DataSource = "tasks" | "users" | "subscriptions" | "notifications";

interface UseDynamicUIStreamOptions {
  api: string;
  onError?: (error: Error) => void;
  onDataSourceChange?: (source: DataSource) => void;
}

interface UseDynamicUIStreamReturn {
  tree: UITree | null;
  isStreaming: boolean;
  error: Error | null;
  dataSource: DataSource | null;
  send: (prompt: string, context?: Record<string, unknown>) => Promise<void>;
  clear: () => void;
}

// 从流中解析 DATA_SOURCE
function parseDataSource(line: string): DataSource | null {
  const match = line.match(
    /^DATA_SOURCE:\s*(tasks|users|subscriptions|notifications)/i,
  );
  return match ? (match[1].toLowerCase() as DataSource) : null;
}

// 应用 JSON 补丁到 UI 树
function applyPatch(tree: UITree, patch: JsonPatch): UITree {
  const newTree = { ...tree, elements: { ...tree.elements } };

  switch (patch.op) {
    case "set":
    case "add":
    case "replace": {
      // Handle root path
      if (patch.path === "/root") {
        newTree.root = patch.value as string;
        return newTree;
      }

      // Handle elements paths
      if (patch.path.startsWith("/elements/")) {
        const pathParts = patch.path.slice("/elements/".length).split("/");
        const elementKey = pathParts[0];

        if (!elementKey) return newTree;

        if (pathParts.length === 1) {
          // Setting entire element
          newTree.elements[elementKey] = patch.value as UIElement;
        } else {
          // Setting property of element
          const element = newTree.elements[elementKey];
          if (element) {
            const propPath = "/" + pathParts.slice(1).join("/");
            const newElement = { ...element };
            setByPath(
              newElement as unknown as Record<string, unknown>,
              propPath,
              patch.value,
            );
            newTree.elements[elementKey] = newElement;
          }
        }
      }
      break;
    }
    case "remove": {
      if (patch.path.startsWith("/elements/")) {
        const elementKey = patch.path.slice("/elements/".length).split("/")[0];
        if (elementKey) {
          const { [elementKey]: _, ...rest } = newTree.elements;
          newTree.elements = rest;
        }
      }
      break;
    }
  }

  return newTree;
}

export function useDynamicUIStream(
  options: UseDynamicUIStreamOptions,
): UseDynamicUIStreamReturn {
  const [tree, setTree] = useState<UITree | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (prompt: string, context?: Record<string, unknown>) => {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsStreaming(true);
      setError(null);
      setDataSource(null);

      // 初始化空树
      let currentTree: UITree = { root: null, elements: {} };
      setTree(currentTree);

      try {
        const response = await fetch(options.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, context }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let foundDataSource = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // 检查 DATA_SOURCE
            if (!foundDataSource) {
              const source = parseDataSource(trimmedLine);
              if (source) {
                foundDataSource = true;
                setDataSource(source);
                options.onDataSourceChange?.(source);
                continue;
              }
            }

            // 解析 JSON 补丁
            if (trimmedLine.startsWith("{")) {
              try {
                const patch = JSON.parse(trimmedLine) as JsonPatch;
                currentTree = applyPatch(currentTree, patch);
                setTree({ ...currentTree });
              } catch {
                // 忽略非 JSON 行
              }
            }
          }
        }

        // 处理剩余的 buffer
        if (buffer.trim()) {
          const source = parseDataSource(buffer.trim());
          if (source && !foundDataSource) {
            setDataSource(source);
            options.onDataSourceChange?.(source);
          } else if (buffer.trim().startsWith("{")) {
            try {
              const patch = JSON.parse(buffer.trim()) as JsonPatch;
              currentTree = applyPatch(currentTree, patch);
              setTree({ ...currentTree });
            } catch {
              // 忽略
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err);
          options.onError?.(err);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [options],
  );

  const clear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setTree(null);
    setError(null);
    setDataSource(null);
  }, []);

  return {
    tree,
    isStreaming,
    error,
    dataSource,
    send,
    clear,
  };
}
