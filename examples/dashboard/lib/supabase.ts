import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Environment,
  getEnvironmentConfig,
  getDefaultEnvironment,
  isEnvironmentConfigured,
} from "./env-config";

// 缓存不同环境的 Supabase 客户端（单例模式）
const clientCache = new Map<Environment, SupabaseClient>();

/**
 * 获取指定环境的 Supabase 客户端
 * 使用单例模式，避免重复创建客户端
 */
export function getSupabaseClient(env?: Environment): SupabaseClient {
  const targetEnv = env || (getDefaultEnvironment().id as Environment);

  // 检查缓存
  if (clientCache.has(targetEnv)) {
    return clientCache.get(targetEnv)!;
  }

  // 获取环境配置
  const config = getEnvironmentConfig(targetEnv);
  if (!config || !config.supabase.url || !config.supabase.anonKey) {
    throw new Error(`环境 "${targetEnv}" 未配置或配置无效`);
  }

  // 创建客户端
  const client = createClient(config.supabase.url, config.supabase.anonKey);

  // 缓存客户端
  clientCache.set(targetEnv, client);

  return client;
}

/**
 * 清除指定环境的客户端缓存（用于重新连接）
 */
export function clearClientCache(env?: Environment): void {
  if (env) {
    clientCache.delete(env);
  } else {
    clientCache.clear();
  }
}

/**
 * 检查指定环境是否可用
 */
export function isEnvironmentAvailable(env: Environment): boolean {
  return isEnvironmentConfigured(env);
}

// 导出默认客户端（向后兼容）
export const supabase = getSupabaseClient();

// 数据库类型定义
export interface AnalyticsMetrics {
  id: number;
  revenue: number;
  growth: number;
  customers: number;
  orders: number;
  created_at: string;
  updated_at: string;
}

export interface SalesByRegion {
  id: number;
  label: string;
  value: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  created_at: string;
}

// 获取仪表盘数据的函数（支持环境参数）
export async function getDashboardData(env?: Environment) {
  const client = getSupabaseClient(env);

  // 获取分析指标
  const { data: metrics, error: metricsError } = await client
    .from("analytics_metrics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (metricsError && metricsError.code !== "PGRST116") {
    console.error("获取指标数据失败:", metricsError);
  }

  // 获取区域销售数据
  const { data: salesByRegion, error: salesError } = await client
    .from("sales_by_region")
    .select("*")
    .order("value", { ascending: false });

  if (salesError) {
    console.error("获取销售数据失败:", salesError);
  }

  // 获取最近交易
  const { data: transactions, error: transactionsError } = await client
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .limit(10);

  if (transactionsError) {
    console.error("获取交易数据失败:", transactionsError);
  }

  return {
    analytics: {
      revenue: metrics?.revenue ?? 0,
      growth: metrics?.growth ?? 0,
      customers: metrics?.customers ?? 0,
      orders: metrics?.orders ?? 0,
      salesByRegion:
        salesByRegion?.map((item) => ({
          label: item.label,
          value: item.value,
        })) ?? [],
      recentTransactions:
        transactions?.map((item) => ({
          id: item.id,
          customer: item.customer,
          amount: item.amount,
          status: item.status,
          date: item.date,
        })) ?? [],
    },
    form: {
      dateRange: "",
      region: "",
    },
  };
}
