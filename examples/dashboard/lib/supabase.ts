import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// 获取仪表盘数据的函数
export async function getDashboardData() {
  // 获取分析指标
  const { data: metrics, error: metricsError } = await supabase
    .from("analytics_metrics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (metricsError && metricsError.code !== "PGRST116") {
    console.error("获取指标数据失败:", metricsError);
  }

  // 获取区域销售数据
  const { data: salesByRegion, error: salesError } = await supabase
    .from("sales_by_region")
    .select("*")
    .order("value", { ascending: false });

  if (salesError) {
    console.error("获取销售数据失败:", salesError);
  }

  // 获取最近交易
  const { data: transactions, error: transactionsError } = await supabase
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

// 插入初始数据（如果表为空）
export async function seedInitialData() {
  // 检查是否已有数据
  const { count } = await supabase
    .from("analytics_metrics")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    console.log("数据库已有数据，跳过初始化");
    return;
  }

  // 插入指标数据
  await supabase.from("analytics_metrics").insert({
    revenue: 125000,
    growth: 0.15,
    customers: 1234,
    orders: 567,
  });

  // 插入区域销售数据
  await supabase.from("sales_by_region").insert([
    { label: "美国", value: 45000 },
    { label: "欧洲", value: 35000 },
    { label: "亚洲", value: 28000 },
    { label: "其他", value: 17000 },
  ]);

  // 插入交易数据
  await supabase.from("transactions").insert([
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

  console.log("初始数据已插入");
}
