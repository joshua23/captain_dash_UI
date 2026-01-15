"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// 仪表盘数据类型
export interface DashboardData {
  analytics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    completionRate: number;
    tasksByType: { label: string; value: number }[];
    tasksByStatus: { label: string; value: number }[];
    dailyTasks: { label: string; value: number }[];
    recentTasks: { id: string; type: string; status: string; date: string }[];
  };
  form: {
    dateRange: string;
    taskType: string;
  };
}

// 默认数据
const DEFAULT_DATA: DashboardData = {
  analytics: {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    completionRate: 0,
    tasksByType: [],
    tasksByStatus: [],
    dailyTasks: [],
    recentTasks: [],
  },
  form: {
    dateRange: "",
    taskType: "",
  },
};

interface UseRealtimeDashboardOptions {
  onUpdate?: (data: DashboardData) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeDashboard(
  options: UseRealtimeDashboardOptions = {},
) {
  const [data, setData] = useState<DashboardData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 使用 ref 存储回调，避免依赖变化
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // 获取仪表盘数据（无依赖）
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const dashboardData = await response.json();
        if (dashboardData.analytics) {
          setData(dashboardData);
          setLastUpdate(new Date());
          optionsRef.current.onUpdate?.(dashboardData);
        }
      }
    } catch (error) {
      console.error("获取仪表盘数据失败:", error);
      optionsRef.current.onError?.(
        error instanceof Error ? error : new Error("未知错误"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 设置实时订阅（只运行一次）
  useEffect(() => {
    // 初始加载数据
    fetchData();

    // 避免重复订阅
    if (channelRef.current) {
      return;
    }

    // 设置实时订阅（使用单例客户端）
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // 监听所有事件: INSERT, UPDATE, DELETE
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          console.log("📡 实时更新:", payload.eventType, payload);
          // 当数据变化时重新获取仪表盘数据
          fetchData();
        },
      )
      .subscribe((status) => {
        console.log("📡 订阅状态:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    // 清理函数
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchData]);

  // 手动刷新
  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isConnected,
    lastUpdate,
    refresh,
  };
}
