#!/bin/bash
# SessionStart hook: 自动切换到 Node 22

# 保存当前环境变量
ENV_BEFORE=$(export -p | sort)

# 加载 nvm 并切换到 Node 22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 22 > /dev/null 2>&1

# 将环境变量变化持久化到 Claude 会话
if [ -n "$CLAUDE_ENV_FILE" ]; then
  ENV_AFTER=$(export -p | sort)
  comm -13 <(echo "$ENV_BEFORE") <(echo "$ENV_AFTER") >> "$CLAUDE_ENV_FILE"
fi

# 输出当前 Node 版本作为上下文
echo "Node.js 版本: $(node --version)"

exit 0
