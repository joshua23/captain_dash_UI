/**
 * 多环境配置管理
 * 支持测试环境和生产环境的 Supabase 连接切换
 */

export type Environment = "test" | "production";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  label: string;
  description: string;
}

export interface EnvironmentConfig {
  id: Environment;
  label: string;
  description: string;
  supabase: SupabaseConfig;
  isDefault?: boolean;
}

// 环境配置 - 从环境变量读取
// 测试环境使用 NEXT_PUBLIC_SUPABASE_* 变量
// 生产环境使用 NEXT_PUBLIC_SUPABASE_PROD_* 变量
export const environments: EnvironmentConfig[] = [
  {
    id: "test",
    label: "测试环境",
    description: "开发和测试用的 Supabase 实例",
    isDefault: true,
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      label: "Test DB",
      description: "测试数据库",
    },
  },
  {
    id: "production",
    label: "生产环境",
    description: "生产用的 Supabase 实例",
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_PROD_URL || "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_PROD_ANON_KEY || "",
      serviceRoleKey: process.env.SUPABASE_PROD_SERVICE_ROLE_KEY,
      label: "Production DB",
      description: "生产数据库",
    },
  },
];

// 获取环境配置
export function getEnvironmentConfig(
  env: Environment,
): EnvironmentConfig | undefined {
  return environments.find((e) => e.id === env);
}

// 获取默认环境
export function getDefaultEnvironment(): EnvironmentConfig {
  const defaultEnv = environments.find((e) => e.isDefault);
  if (defaultEnv) return defaultEnv;
  // 确保至少返回第一个环境配置
  const first = environments[0];
  if (!first) {
    throw new Error("No environments configured");
  }
  return first;
}

// 获取所有可用环境（过滤掉未配置的）
export function getAvailableEnvironments(): EnvironmentConfig[] {
  return environments.filter((env) => env.supabase.url && env.supabase.anonKey);
}

// 验证环境配置是否有效
export function isEnvironmentConfigured(env: Environment): boolean {
  const config = getEnvironmentConfig(env);
  return !!(config?.supabase.url && config?.supabase.anonKey);
}
