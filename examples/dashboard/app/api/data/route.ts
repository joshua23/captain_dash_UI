import { createClient } from "@supabase/supabase-js";
import { Environment } from "@/lib/env-config";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 数据源配置
type DataSource = "tasks" | "users" | "subscriptions" | "notifications";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = (searchParams.get("source") || "tasks") as DataSource;
  const env = searchParams.get("env") as Environment | null;

  // 使用环境感知的 Supabase 客户端
  const supabase = env ? getSupabaseClient(env) : getSupabaseClient();

  try {
    let data;
    switch (source) {
      case "tasks":
        data = await getTasksData(supabase);
        break;
      case "users":
        data = await getUsersData(supabase);
        break;
      case "subscriptions":
        data = await getSubscriptionsData(supabase);
        break;
      case "notifications":
        data = await getNotificationsData(supabase);
        break;
      default:
        return Response.json({ error: "未知数据源" }, { status: 400 });
    }

    // 添加环境信息到响应
    return Response.json({
      ...data,
      _meta: {
        environment: env || "test",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`获取 ${source} 数据失败 (env: ${env || "default"}):`, error);
    return Response.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 },
    );
  }
}

// ==================== 任务数据 ====================
async function getTasksData(supabase: ReturnType<typeof createClient>) {
  // 使用预聚合视图
  const { data: stats } = await supabase
    .from("task_dashboard_stats")
    .select("*")
    .single();

  const { data: recentTasks } = await supabase
    .from("tasks")
    .select("task_id, task_type, status, created_at")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    source: "tasks",
    analytics: {
      totalTasks: stats?.total_tasks || 0,
      completedTasks: stats?.completed_tasks || 0,
      failedTasks: stats?.failed_tasks || 0,
      completionRate: (stats?.completion_rate || 0) / 100,
      tasksByType: stats?.tasks_by_type || [],
      tasksByStatus: (stats?.tasks_by_status || []).filter(
        (item: { value: number }) => item.value > 0,
      ),
      dailyTasks: stats?.daily_tasks || [],
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
  };
}

// ==================== 用户数据 ====================
async function getUsersData(supabase: ReturnType<typeof createClient>) {
  // 获取用户统计
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_deleted", false);

  const { count: activeUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_deleted", false)
    .eq("is_active", true);

  const { count: demoUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_demo_user", true);

  // 按订阅等级分组
  const { data: users } = await supabase
    .from("users")
    .select("subscription_tier, login_type, credits, created_at")
    .eq("is_deleted", false);

  const usersByTier: Record<string, number> = {};
  const usersByLoginType: Record<string, number> = {};
  let totalCredits = 0;

  for (const user of users || []) {
    const tier = user.subscription_tier || "free";
    usersByTier[tier] = (usersByTier[tier] || 0) + 1;

    const loginType = user.login_type || "unknown";
    usersByLoginType[loginType] = (usersByLoginType[loginType] || 0) + 1;

    totalCredits += user.credits || 0;
  }

  // 最近注册用户
  const { data: recentUsers } = await supabase
    .from("users")
    .select(
      "id, display_name, subscription_tier, login_type, created_at, credits",
    )
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    source: "users",
    analytics: {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      demoUsers: demoUsers || 0,
      totalCredits,
      avgCredits: totalUsers ? Math.round(totalCredits / totalUsers) : 0,
      usersByTier: Object.entries(usersByTier).map(([label, value]) => ({
        label:
          label === "free"
            ? "免费用户"
            : label === "premium"
              ? "付费用户"
              : label,
        value,
      })),
      usersByLoginType: Object.entries(usersByLoginType).map(
        ([label, value]) => ({
          label:
            label === "phone"
              ? "手机登录"
              : label === "wechat"
                ? "微信登录"
                : label === "apple"
                  ? "苹果登录"
                  : label,
          value,
        }),
      ),
      recentUsers: (recentUsers || []).map((u) => ({
        id: u.id.substring(0, 8),
        name: u.display_name || "未命名",
        tier: u.subscription_tier || "free",
        loginType: u.login_type || "unknown",
        credits: u.credits || 0,
        date: new Date(u.created_at).toISOString().split("T")[0],
      })),
    },
  };
}

// ==================== 订阅数据 ====================
async function getSubscriptionsData(supabase: ReturnType<typeof createClient>) {
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*");

  const { count: totalSubs } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true });

  const { count: activeSubs } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // 按计划类型分组
  const subsByPlan: Record<string, number> = {};
  const subsByStatus: Record<string, number> = {};
  let totalRevenue = 0;

  for (const sub of subscriptions || []) {
    const plan = sub.plan_type || "unknown";
    subsByPlan[plan] = (subsByPlan[plan] || 0) + 1;

    const status = sub.status || "unknown";
    subsByStatus[status] = (subsByStatus[status] || 0) + 1;

    totalRevenue += sub.amount || 0;
  }

  return {
    source: "subscriptions",
    analytics: {
      totalSubscriptions: totalSubs || 0,
      activeSubscriptions: activeSubs || 0,
      totalRevenue,
      avgRevenue: totalSubs ? (totalRevenue / totalSubs).toFixed(2) : 0,
      subscriptionsByPlan: Object.entries(subsByPlan).map(([label, value]) => ({
        label:
          label === "monthly"
            ? "月度订阅"
            : label === "yearly"
              ? "年度订阅"
              : label,
        value,
      })),
      subscriptionsByStatus: Object.entries(subsByStatus).map(
        ([label, value]) => ({
          label:
            label === "active"
              ? "活跃"
              : label === "cancelled"
                ? "已取消"
                : label === "expired"
                  ? "已过期"
                  : label,
          value,
        }),
      ),
      recentSubscriptions: (subscriptions || []).slice(0, 10).map((s) => ({
        id: s.id.substring(0, 8),
        plan: s.plan_type,
        status: s.status,
        amount: s.amount,
        date: new Date(s.created_at).toISOString().split("T")[0],
      })),
    },
  };
}

// ==================== 通知数据 ====================
async function getNotificationsData(supabase: ReturnType<typeof createClient>) {
  const { count: totalNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_deleted", false);

  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_deleted", false)
    .eq("is_read", false);

  const { count: readNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_deleted", false)
    .eq("is_read", true);

  // 按类型分组
  const { data: notifications } = await supabase
    .from("notifications")
    .select("notification_type, related_type, is_read, created_at")
    .eq("is_deleted", false);

  const notificationsByType: Record<string, number> = {};
  const notificationsByRelatedType: Record<string, number> = {};

  for (const notif of notifications || []) {
    const type = notif.notification_type || "unknown";
    notificationsByType[type] = (notificationsByType[type] || 0) + 1;

    const relatedType = notif.related_type || "unknown";
    notificationsByRelatedType[relatedType] =
      (notificationsByRelatedType[relatedType] || 0) + 1;
  }

  // 最近通知
  const { data: recentNotifications } = await supabase
    .from("notifications")
    .select("id, title, notification_type, is_read, created_at")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    source: "notifications",
    analytics: {
      totalNotifications: totalNotifications || 0,
      unreadNotifications: unreadNotifications || 0,
      readNotifications: readNotifications || 0,
      readRate: totalNotifications
        ? (((readNotifications || 0) / totalNotifications) * 100).toFixed(1)
        : 0,
      notificationsByType: Object.entries(notificationsByType).map(
        ([label, value]) => ({
          label:
            label === "task_complete"
              ? "任务完成"
              : label === "system"
                ? "系统通知"
                : label,
          value,
        }),
      ),
      notificationsByRelatedType: Object.entries(
        notificationsByRelatedType,
      ).map(([label, value]) => ({
        label,
        value,
      })),
      recentNotifications: (recentNotifications || []).map((n) => ({
        id: n.id.substring(0, 8),
        title: n.title,
        type: n.notification_type,
        isRead: n.is_read ? "已读" : "未读",
        date: new Date(n.created_at).toISOString().split("T")[0],
      })),
    },
  };
}
