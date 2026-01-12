# Contributing

感谢您对 AI Chat 项目的关注！我们欢迎各种形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能
- 📖 改进文档
- 🔨 提交代码
- ✅ 编写测试

## 开发流程

### 1. 设置开发环境

```bash
git clone https://github.com/your-username/ai-chat.git
cd ai-chat
bun install
cp .env.example .env
bun run dev
```

### 2. 创建功能分支

```bash
git checkout -b feature/your-feature-name
# 或者
git checkout -b fix/your-bug-fix
```

### 3. 遵循代码规范

- 使用 TypeScript 进行类型安全
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 运行 `bun run precommit` 在提交前
- 通过代码审查检查

### 4. 编写测试

```bash
bun run test
bun run test:coverage
```

确保：
- 测试覆盖率 >= 80%
- 所有测试通过
- 编写有意义的测试名称

### 5. 提交更改

使用 Conventional Commits 规范：

```bash
git add .
git commit -m "feat: add new authentication flow"
git commit -m "fix: resolve issue with login button"
git commit -m "docs: update installation guide"
```

提交类型：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

### 6. 推送到分支

```bash
git push origin feature/your-feature-name
```

### 7. 创建 Pull Request

- 填写 PR 模板
- 关联相关的 Issue
- 添加描述性的标题
- 确保所有 CI 检查通过

## 代码审查标准

### 必须
- ✅ 通过所有 ESLint 检查
- ✅ 通过 TypeScript 类型检查
- ✅ 通过 Prettier 格式检查
- ✅ 通过自定义代码审查（>= 80 分）
- ✅ 所有测试通过
- ✅ 代码覆盖率 >= 80%

### 推荐
- ✅ 添加有意义的注释
- ✅ 编写清晰的提交消息
- ✅ 更新相关文档
- ✅ 添加适当的错误处理
- ✅ 考虑可访问性

## 项目结构

```
src/
├── app/              # Next.js App Router 页面
├── components/        # React 组件
│   ├── providers/  # Context Providers
│   └── ui/        # shadcn/ui 组件
├── lib/             # 工具函数和库
├── hooks/           # 自定义 React Hooks
├── types/           # TypeScript 类型定义
└── config/          # 应用配置
```

## 报告 Bug

在报告 Bug 时，请包含：

- 📋 Bug 描述
- 🔍 复现步骤
- 🎯 预期行为
- ❌ 实际行为
- 💻 环境信息
  - Node.js 版本
  - 操作系统
  - 浏览器版本
- 📸 截图或录屏（如适用）

## 功能请求

在提出功能请求时：

- 📝 清晰描述功能
- 🎯 说明使用场景
- 💡 提供可能的实现思路
- 🔗 关联相关 Issue

## 文档改进

文档是项目的重要组成部分。您可以：

- 修正拼写和语法错误
- 添加缺失的信息
- 改进示例代码
- 添加使用场景
- 翻译文档

## 许可证

通过提交 Pull Request，您同意您的贡献将根据项目的 MIT 许可证进行许可。

## 获取帮助

如果您需要帮助：

1. 查看 [README.md](README.md)
2. 查看 [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md)
3. 搜索现有的 [Issues](https://github.com/your-username/ai-chat/issues)
4. 创建新的 Issue 并使用 `help` 标签

## 社区规范

- 🤝 尊重所有贡献者
- 🎧 建设性地讨论
- 📚 保持学习和开放的态度
- 🙏 感谢反馈和帮助

## 识别贡献者

我们会在项目的 CONTRIBUTORS.md 文件中列出所有贡献者。请确保您的 GitHub 账户信息正确。

感谢您的贡献！🎉
