import { NextRequest } from "next/server";
import {
  Environment,
  getAvailableEnvironments,
  getEnvironmentConfig,
  isEnvironmentConfigured,
} from "@/lib/env-config";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/env - 获取所有可用环境
 * GET /api/env?env=test - 测试指定环境连接
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testEnv = searchParams.get("test") as Environment | null;

  // 如果指定了 test 参数，测试该环境的连接
  if (testEnv) {
    if (!isEnvironmentConfigured(testEnv)) {
      return Response.json(
        {
          success: false,
          error: `环境 "${testEnv}" 未配置`,
        },
        { status: 400 },
      );
    }

    try {
      const client = getSupabaseClient(testEnv);
      // 尝试一个简单的查询来测试连接
      const { error } = await client.from("tasks").select("task_id").limit(1);

      if (error) {
        return Response.json({
          success: false,
          environment: testEnv,
          error: error.message,
        });
      }

      return Response.json({
        success: true,
        environment: testEnv,
        message: "连接成功",
      });
    } catch (error) {
      return Response.json({
        success: false,
        environment: testEnv,
        error: error instanceof Error ? error.message : "连接失败",
      });
    }
  }

  // 返回所有可用环境
  const environments = getAvailableEnvironments().map((env) => ({
    id: env.id,
    label: env.label,
    description: env.description,
    isDefault: env.isDefault || false,
    configured: true,
  }));

  // 添加未配置的环境信息
  const allEnvIds: Environment[] = ["test", "production"];
  for (const envId of allEnvIds) {
    if (!environments.find((e) => e.id === envId)) {
      const config = getEnvironmentConfig(envId);
      if (config) {
        environments.push({
          id: config.id,
          label: config.label,
          description: config.description,
          isDefault: false,
          configured: false,
        });
      }
    }
  }

  return Response.json({
    environments,
    currentDefault:
      getAvailableEnvironments().find((e) => e.isDefault)?.id || "test",
  });
}
