# Strawberry Toolkit - 幻觉检测集成

本项目集成了官方 [pythea](https://github.com/leochlon/pythea)
包，用于在代码审查过程中检测 AI 生成的分析和评论中的幻觉。

## 安装

### 方式 1: 使用系统 Python

```bash
# 安装官方包
pip install pythea

# 或安装完整功能
pip install "pythea[offline]"  # 离线探测
pip install "pythea[vllm]"     # 本地推理
```

### 方式 2: 使用虚拟环境（推荐）

```bash
cd .strawberry
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows
pip install pythea
```

### 环境变量

```bash
# 设置 OpenAI API Key
export OPENAI_API_KEY=sk-...
```

## 使用方法

### 1. MCP 服务器集成（推荐）

将工具注册到 Claude Code：

```bash
claude mcp add hallucination-detector \
  -e OPENAI_API_KEY=$OPENAI_API_KEY -- \
  python -m strawberry.mcp_server
```

然后在 Claude Code 中使用：

- `detect_hallucination`: 自动检测答案中的幻觉
- `audit_trace_budget`: 审计带有显式引用的声明

### 2. CLI 工具

#### 事实召回审计

```bash
python -m strawberry.factual_recall \
  --question "Which US senators from Minnesota graduated from Princeton" \
  --out report.json
```

#### 综合绑定评估

```bash
strawberry run \
  --backend openai \
  --model gpt-4o-2024-08-06 \
  --n 200 --M 10 --distance 512 \
  --query FIRST --null SCRUB_FIRST
```

#### 思维链审计

```bash
strawberry cot \
  --backend openai \
  --generator_model gpt-4o-mini \
  --verifier_model gpt-4o-mini \
  --synthetic --M 10 --distance 256
```

### 3. Python API

```python
from pythea import TheaClient

# Thea API Client
with TheaClient(base_url="https://...") as client:
    resp = client.unified_answer(
        question="What is 2+2?",
        backend="aoai-pool",
        m=6,
    )
    print(resp.get("answer"))
```

## 检测原理

**核心机制**: 清除引用的证据，测量置信度变化。没有变化？模型在产生幻觉。

**检测问题类型**:

- RAG 检索但不阅读
- 思维链引用了忽略的步骤
- 自验证没有真正检查
- 引用混淆（装饰性来源）

## CI/CD 集成

GitHub Actions 已配置自动运行幻觉检测：

```yaml
- name: Run hallucination detection
  env:
    OPENAI_API_KEY: ${{ vars.OPENAI_API_KEY }}
  run: |
    python -m strawberry.factual_recall \
      --question "Review code changes" \
      --out report.json
```

## Codex Skills

项目包含两个证据优先的代理技能：

1. **rca-fix-agent**: 调试代理
   - 重现 → 证据 → 假设 → 验证 ROOT_CAUSE → 修复 → 测试

2. **proof-repair-agent**: 证明修复/合成代理
   - LaTeX + Lean/Coq 机器检查的定理证明

## 结果解读

| Budget Gap (bits) | 含义           | 建议        |
| ----------------- | -------------- | ----------- |
| < 0               | 声明有充分支持 | ✅ 可信     |
| 0 - 2             | 轻度推断       | ⚠️ 可接受   |
| 2 - 10            | 可疑           | 🔍 需要审查 |
| > 10              | 可能是幻觉     | ❌ 不可信   |

## 故障排除

### 安装失败

```bash
# 更新 pip
pip install --upgrade pip

# 使用国内镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pythea
```

### MCP 服务器无法连接

```bash
# 验证安装
python -m strawberry.mcp_server --help

# 检查环境变量
echo $OPENAI_API_KEY
```

## 相关链接

- [官方文档](https://github.com/leochlon/pythea)
- [论文](https://arxiv.org/abs/2501.xxxxx)
- [MCP 协议](https://modelcontextprotocol.io/)

## License

MIT
