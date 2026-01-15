import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// 手动读取 .env.local 文件
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  } catch (e) {
    console.error("无法读取 .env.local 文件");
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("缺少 Supabase 环境变量");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 探测数据库中的表
async function probeExistingTables() {
  console.log("🔍 探测数据库中的表...\n");

  const tablesToProbe = [
    "tasks",
    "users",
    "profiles",
    "orders",
    "products",
    "customers",
    "analytics",
    "events",
    "logs",
    "sessions",
    "accounts",
    "subscriptions",
    "comments",
    "posts",
    "categories",
    "tags",
    "files",
    "messages",
    "notifications",
    "settings",
  ];

  const existingTables: {
    name: string;
    columns: string[];
    count: number | null;
    sample: Record<string, unknown> | null;
  }[] = [];

  for (const tableName of tablesToProbe) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);

      if (!error) {
        const columns = data && data[0] ? Object.keys(data[0]) : [];

        const { count } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });

        existingTables.push({
          name: tableName,
          columns,
          count,
          sample: data?.[0] || null,
        });
      }
    } catch {
      // 表不存在，跳过
    }
  }

  console.log("=".repeat(70));
  console.log("📊 数据库表结构");
  console.log("=".repeat(70));

  for (const table of existingTables) {
    console.log(`\n📋 表名: ${table.name}`);
    console.log(`   记录数: ${table.count}`);
    console.log(
      `   字段 (${table.columns.length}): ${table.columns.join(", ")}`,
    );

    if (table.sample) {
      console.log("\n   示例数据:");
      for (const [key, value] of Object.entries(table.sample)) {
        const displayValue =
          typeof value === "string" && value.length > 50
            ? value.substring(0, 50) + "..."
            : JSON.stringify(value);
        console.log(`     - ${key}: ${displayValue}`);
      }
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`✅ 共发现 ${existingTables.length} 个可访问的表`);
  console.log("=".repeat(70));

  return existingTables;
}

probeExistingTables().catch(console.error);
