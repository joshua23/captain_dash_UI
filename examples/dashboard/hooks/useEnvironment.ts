"use client";

import { useState, useEffect, useCallback } from "react";

export type Environment = "test" | "production";

export interface EnvironmentInfo {
  id: Environment;
  label: string;
  description: string;
  isDefault: boolean;
  configured: boolean;
}

interface UseEnvironmentReturn {
  currentEnv: Environment;
  environments: EnvironmentInfo[];
  isLoading: boolean;
  error: string | null;
  setEnvironment: (env: Environment) => void;
  testConnection: (env: Environment) => Promise<boolean>;
}

const ENV_STORAGE_KEY = "captain-dash-environment";

export function useEnvironment(): UseEnvironmentReturn {
  const [currentEnv, setCurrentEnv] = useState<Environment>("test");
  const [environments, setEnvironments] = useState<EnvironmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从 localStorage 加载保存的环境设置
  useEffect(() => {
    const saved = localStorage.getItem(ENV_STORAGE_KEY);
    if (saved && (saved === "test" || saved === "production")) {
      setCurrentEnv(saved as Environment);
    }
  }, []);

  // 获取可用环境列表
  useEffect(() => {
    fetch("/api/env")
      .then((res) => res.json())
      .then((data) => {
        setEnvironments(data.environments || []);
        // 如果当前环境未配置，切换到默认环境
        const currentConfigured = data.environments?.find(
          (e: EnvironmentInfo) => e.id === currentEnv && e.configured,
        );
        if (!currentConfigured) {
          const defaultEnv = data.environments?.find(
            (e: EnvironmentInfo) => e.isDefault && e.configured,
          );
          if (defaultEnv) {
            setCurrentEnv(defaultEnv.id);
          }
        }
      })
      .catch((err) => {
        console.error("获取环境列表失败:", err);
        setError("无法获取环境列表");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentEnv]);

  // 切换环境
  const setEnvironment = useCallback((env: Environment) => {
    setCurrentEnv(env);
    localStorage.setItem(ENV_STORAGE_KEY, env);
    // 清除客户端缓存，强制重新连接
    setError(null);
  }, []);

  // 测试环境连接
  const testConnection = useCallback(
    async (env: Environment): Promise<boolean> => {
      try {
        const res = await fetch(`/api/env?test=${env}`);
        const data = await res.json();
        return data.success === true;
      } catch {
        return false;
      }
    },
    [],
  );

  return {
    currentEnv,
    environments,
    isLoading,
    error,
    setEnvironment,
    testConnection,
  };
}
