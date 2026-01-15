import { createClient } from "@supabase/supabase-js";

// 禁用缓存
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json({ error: "Supabase 环境变量未配置" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 直接从数据库视图获取预聚合数据（最高效）
    const { data: stats, error: statsError } = await supabase
      .from("task_dashboard_stats")
      .select("*")
      .single();

    if (statsError) {
      console.error("获取统计数据失败:", statsError);
      return Response.json({ error: statsError.message }, { status: 500 });
    }

    // 获取最近任务列表（需要详细字段）
    const { data: recentTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("task_id, task_type, status, created_at")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(10);

    if (tasksError) {
      console.error("获取最近任务失败:", tasksError);
    }

    // 构建仪表盘数据（数据库已预聚合，API 只做简单映射）
    const dashboardData = {
      analytics: {
        totalTasks: stats.total_tasks,
        completedTasks: stats.completed_tasks,
        failedTasks: stats.failed_tasks,
        completionRate: stats.completion_rate / 100, // 转为小数
        tasksByType: stats.tasks_by_type || [],
        tasksByStatus: (stats.tasks_by_status || []).filter(
          (item: { value: number }) => item.value > 0,
        ),
        dailyTasks: stats.daily_tasks || [],
        recentTasks: (recentTasks || []).map((t) => ({
          id: t.task_id.substring(0, 8),
          type: t.task_type,
          status:
            t.status === "Completed"
              ? "已完成"
              : t.status === "Failed"
                ? "失败"
                : t.status === "Pending"
                  ? "待处理"
                  : "处理中",
          date: new Date(t.created_at).toISOString().split("T")[0],
        })),
      },
      form: {
        dateRange: "",
        taskType: "",
      },
    };

    return Response.json(dashboardData);
  } catch (error) {
    console.error("获取仪表盘数据失败:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 },
    );
  }
}
