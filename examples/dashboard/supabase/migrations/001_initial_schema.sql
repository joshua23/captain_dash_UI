-- 分析指标表
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id SERIAL PRIMARY KEY,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  growth DECIMAL(5, 4) NOT NULL DEFAULT 0,
  customers INTEGER NOT NULL DEFAULT 0,
  orders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 区域销售表
CREATE TABLE IF NOT EXISTS sales_by_region (
  id SERIAL PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(20) PRIMARY KEY,
  customer VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT '待处理',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS (Row Level Security)
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_by_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略（允许匿名用户读取）
CREATE POLICY "允许公开读取指标" ON analytics_metrics FOR SELECT USING (true);
CREATE POLICY "允许公开读取销售" ON sales_by_region FOR SELECT USING (true);
CREATE POLICY "允许公开读取交易" ON transactions FOR SELECT USING (true);

-- 创建服务角色写入策略
CREATE POLICY "服务角色可写入指标" ON analytics_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "服务角色可写入销售" ON sales_by_region FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "服务角色可写入交易" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- 插入初始数据
INSERT INTO analytics_metrics (revenue, growth, customers, orders)
VALUES (125000, 0.15, 1234, 567)
ON CONFLICT DO NOTHING;

INSERT INTO sales_by_region (label, value) VALUES
  ('美国', 45000),
  ('欧洲', 35000),
  ('亚洲', 28000),
  ('其他', 17000)
ON CONFLICT DO NOTHING;

INSERT INTO transactions (id, customer, amount, status, date) VALUES
  ('TXN001', '艾科公司', 1500, '已完成', '2024-01-15'),
  ('TXN002', '博达集团', 2300, '已完成', '2024-01-14'),
  ('TXN003', '创新科技', 890, '待处理', '2024-01-14'),
  ('TXN004', '德信企业', 3200, '已完成', '2024-01-13'),
  ('TXN005', '恩华实业', 1100, '已退款', '2024-01-12')
ON CONFLICT DO NOTHING;
