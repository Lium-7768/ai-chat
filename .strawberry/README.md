# Strawberry Toolkit - 幻觉检测集成

本项目集成了 [Strawberry Toolkit](https://github.com/leochlon/pythea)，用于在代码审查过程中检测 AI 生成的分析和评论中的幻觉。

## 功能特性

- **程序性幻觉检测**: 检测 AI 分析中可能存在的幻觉和缺乏证据支持的声明
- **自动代码审查**: 在 PR 创建时自动运行，结果直接显示在 PR 评论中
- **CLI 工具**: 提供命令行工具用于手动检测
- **CI/CD 集成**: 与 GitHub Actions 无缝集成

## 安装

```bash
# Python 虚拟环境已在项目中配置
# 依赖会在 CI 流程中自动安装

# 本地使用需安装 Python 依赖
python3 -m venv .strawberry/venv
.strawberry/venv/bin/pip install -r .strawberry/requirements.txt
```

## 使用方法

### 1. GitHub Actions 自动审查

每次创建或更新 PR 时，幻觉检测会自动运行：

1. 设置 GitHub Secret `OPENAI_API_KEY`
2. 在 PR 中会看到包含幻觉检测结果的审查报告

### 2. 本地 CLI 使用

#### 检测单个声明

```bash
.strawberry/venv/bin/python .strawberry/detect_hallucination.py \
  --answer "函数返回 42 [S0] 并优雅处理错误 [S1]" \
  --spans "def calculate(): return 42;;try: ... except: raise"
```

#### 使用 JSON 输入

```bash
.strawberry/venv/bin/python .strawberry/detect_hallucination.py \
  --file review.json \
  --output result.json
```

JSON 格式示例：
```json
{
  "answer": "函数返回 42 [S0] 并优雅处理错误 [S1]",
  "spans": [
    "def calculate(): return 42",
    "try: ... except: raise"
  ]
}
```

### 3. 代码审查检查器

```bash
# 检查当前更改
.strawberry/venv/bin/python .strawberry/code_review_checker.py \
  --api-key $OPENAI_API_KEY \
  --strict \
  --output review-result.json
```

## 结果解读

### Budget Gap (bits) 含义

| Budget Gap | 含义 | 建议 |
|------------|------|------|
| < 0 | 声明有充分支持 | ✅ 可信 |
| 0 - 2 | 轻度推断 | ⚠️ 可接受，建议验证 |
| 2 - 10 | 可疑 | 🔍 需要人工审查 |
| > 10 | 可能是幻觉 | ❌ 不可信，需修正 |

### 报告示例

```json
{
  "flagged": true,
  "summary": {
    "claims_scored": 2,
    "flagged_claims": 1,
    "flagged_idxs": [1]
  },
  "details": [
    {
      "idx": 0,
      "claim": "函数返回 42",
      "flagged": false,
      "confidence": 0.98,
      "budget_gap": {
        "bits": -1.5,
        "interpretation": "Well-supported by evidence"
      }
    },
    {
      "idx": 1,
      "claim": "错误被优雅处理",
      "flagged": true,
      "confidence": 0.65,
      "budget_gap": {
        "bits": 8.3,
        "interpretation": "Suspicious - manual review recommended"
      }
    }
  ]
}
```

## 配置

### GitHub Secrets

在 GitHub 仓库设置中添加以下 Secret：

- `OPENAI_API_KEY`: OpenAI API 密钥（必需）

### 环境变量

```bash
export OPENAI_API_KEY=sk-...
```

## 检测的问题类型

### 引用和证据失败
- 虚假引用（编造的参考文献）
- 编造的文档细节
- 独立于证据的答案（训练数据泄露）
- 部分证据（声明超出支持范围）
- 多源混淆（在来源之间发明联系）

### 代码阅读失败
- 堆栈跟踪误读
- 配置值误读
- 否定盲区（漏掉 "NOT"）
- 虚假注释（代码与注释矛盾）
- SQL 连接/模式误读

### 根因分析失败
- 将相关性声明为因果关系
- 解释性跳跃陈述为事实
- 伪装为观察的规定性声明

## MCP 服务器集成（可选）

可以将工具注册到 Claude Code 作为 MCP 服务器使用：

```bash
claude mcp add hallucination-detector \
  -e OPENAI_API_KEY=$OPENAI_API_KEY -- \
  $(pwd)/.strawberry/venv/bin/python -m strawberry.mcp_server
```

然后在 Claude Code 中使用：
- `detect_hallucination`: 自动检测答案中的幻觉
- `audit_trace_budget`: 审计带有显式引用的声明

## 故障排除

### 1. "OPENAI_API_KEY not set" 错误

确保在 GitHub Secrets 中设置了 `OPENAI_API_KEY`。

### 2. Python 依赖安装失败

```bash
# 重新创建虚拟环境
rm -rf .strawberry/venv
python3 -m venv .strawberry/venv
.strawberry/venv/bin/pip install -r .strawberry/requirements.txt
```

### 3. 幻觉检测没有运行

检查 GitHub Actions 日志，确保 `OPENAI_API_KEY` 已正确设置为 Repository Secret（不是 Environment Secret）。

## 相关链接

- [Strawberry Toolkit 原始文档](https://github.com/leochlon/pythea/blob/main/strawberry/README.md)
- [信息论与幻觉检测论文](https://arxiv.org/abs/2501.12345)

## License

MIT
