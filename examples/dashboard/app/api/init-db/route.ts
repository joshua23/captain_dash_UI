import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 使用服务角色密钥创建管理员客户端
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
  try {
    // 检查是否已有数据
    const { count } = await supabaseAdmin
      .from("analytics_metrics")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      return Response.json({
        success: true,
        message: "数据库已初始化，跳过",
      });
    }

    // 插入指标数据
    const { error: metricsError } = await supabaseAdmin
      .from("analytics_metrics")
      .insert({
        revenue: 125000,
        growth: 0.15,
        customers: 1234,
        orders: 567,
      });

    if (metricsError) throw metricsError;

    // 插入区域销售数据
    const { error: salesError } = await supabaseAdmin
      .from("sales_by_region")
      .insert([
        { label: "美国", value: 45000 },
        { label: "欧洲", value: 35000 },
        { label: "亚洲", value: 28000 },
        { label: "其他", value: 17000 },
      ]);

    if (salesError) throw salesError;

    // 插入交易数据
    const { error: transactionsError } = await supabaseAdmin
      .from("transactions")
      .insert([
        {
          id: "TXN001",
          customer: "艾科公司",
          amount: 1500,
          status: "已完成",
          date: "2024-01-15",
        },
        {
          id: "TXN002",
          customer: "博达集团",
          amount: 2300,
          status: "已完成",
          date: "2024-01-14",
        },
        {
          id: "TXN003",
          customer: "创新科技",
          amount: 890,
          status: "待处理",
          date: "2024-01-14",
        },
        {
          id: "TXN004",
          customer: "德信企业",
          amount: 3200,
          status: "已完成",
          date: "2024-01-13",
        },
        {
          id: "TXN005",
          customer: "恩华实业",
          amount: 1100,
          status: "已退款",
          date: "2024-01-12",
        },
      ]);

    if (transactionsError) throw transactionsError;

    return Response.json({
      success: true,
      message: "数据库初始化成功",
    });
  } catch (error) {
    console.error("数据库初始化失败:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    );
  }
}
