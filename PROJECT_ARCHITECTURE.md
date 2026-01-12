# 项目架构文档

本文档描述 AI Chat 项目的基础架构和配置。

## 🏗️ 技术栈

### 核心框架
- **Next.js 16.1.1** - React 框架，App Router，Server Components
- **React 19.2.3** - UI 库
- **TypeScript 5** - 类型安全

### UI 组件
- **shadcn/ui** - 基于 Radix UI 的组件库
- **Radix UI** - 无障碍的原始组件
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **lucide-react** - 图标库
- **tw-animate-css** - 动画效果

### 开发工具
- **ESLint 9** - 代码质量检查
- **Prettier 3.2.5** - 代码格式化
- **husky 9.0.11** - Git hooks
- **lint-staged 15.2.9** - 提交前文件检查
- **TypeScript** - 类型检查

### 包管理
- **bun** - 高性能的 JavaScript 包管理器

## 📁 项目结构

```
ai-chat/
├── .claude/                    # Claude Code 配置
│   ├── skills/                  # Claude Skills
│   │   └── code-review/      # 代码审查 Skill
│   │       ├── SKILL.md
│   │       ├── README.md
│   │       ├── scripts/
│   │       └── config/
│   └── settings.local.json      # 本地 Claude 设置
├── .github/                    # GitHub Actions
│   └── workflows/
│       └── code-review.yml    # 自动代码审查
├── .vscode/                   # VS Code 配置
│   └── settings.json
├── src/                        # 源代码
│   ├── app/                    # Next.js App Router
│   ├── components/              # React 组件
│   │   └── ui/              # shadcn/ui 组件
│   ├── lib/                   # 工具函数
│   ├── hooks/                 # React Hooks
│   ├── types/                 # TypeScript 类型
│   └── config/                # 应用配置
├── public/                     # 静态资源
└── [配置文件]                 # 项目配置
```

## ⚙️ 配置文件

### ESLint 配置 (`eslint.config.mjs`)
- 自定义 TypeScript 规则
- React Hooks 规则
- 代码风格检查
- 命名约定规则
- 导入排序规则

### Prettier 配置 (`.prettierrc`)
- 代码格式化规则
- 文件类型特定配置
- 行长度限制（100 字符）
- 尾随逗号（ES5）

### TypeScript 配置 (`tsconfig.json`)
- 严格模式启用
- 路径别名配置
- 增量编译
- 严格的类型检查规则

### Next.js 配置 (`next.config.ts`)
- React 严格模式
- SWC 压缩
- 图片优化配置
- 实验性 CSS 优化
- 包导入优化

### Git 配置 (`.gitignore`)
- 忽略依赖、构建产物、环境变量
- 忽略 IDE 文件
- 忽略日志文件

### Editor 配置 (`.editorconfig`)
- 统一编辑器设置
- 缩进、换行符
- 文件类型特定配置

### VS Code 配置 (`.vscode/settings.json`)
- 推荐扩展
- 格式化器设置
- TypeScript 设置
- Tailwind CSS 支持

### 环境变量 (`.env.example`)
- JWT 密钥
- OAuth 配置
- 数据库 URL
- API 密钥
- 功能标志

## 🔄 开发工作流

### Git Hooks
```bash
pre-commit:
  ├── ESLint 检查和自动修复
  └── Prettier 格式化
```

### 可用脚本
```bash
bun run dev           # 启动开发服务器
bun run build         # 构建生产版本
bun run start         # 启动生产服务器
bun run lint          # 运行 ESLint
bun run lint:fix      # 自动修复 ESLint 问题
bun run format        # 格式化代码
bun run format:check  # 检查代码格式
bun run typecheck     # TypeScript 类型检查
bun run clean         # 清理构建文件
```

## 🔒 代码审查系统

### 本地审查
```bash
# 审查单个文件
node .claude/skills/code-review/scripts/index.js src/app/page.tsx

# 批量审查目录
node .claude/skills/code-review/scripts/index.js src --directory

# 特定维度审查
node .claude/skills/code-review/scripts/index.js src/app/page.tsx --only-security
```

### 自动触发
- **PreToolUse**: 文件写入前代码质量检查
- **PostToolUse**: 文件写入后完整审查
- **GitHub Actions**: Pull Request 时自动审查

### 审查维度
1. **代码质量** - TypeScript、React Hooks、代码风格
2. **安全性** - 敏感信息、XSS/CSRF、输入验证
3. **性能** - Next.js 优化、React 性能、Bundle 大小
4. **UI/UX** - shadcn/ui、可访问性、响应式设计

## 🎨 UI/UX 指南

### shadcn/ui 组件使用
- 使用提供的组件变体
- 遵循组件的最佳实践
- 使用 `asChild` 模式复用样式
- 正确使用 `variant` 和 `size` 属性

### 可访问性
- 为按钮提供 aria-label
- 图片包含 alt 文本
- 支持键盘导航
- 确保足够的颜色对比度
- 表单元素正确关联标签

### 响应式设计
- 使用 Tailwind 的响应式前缀（sm:, md:, lg:, xl:, 2xl:）
- 移动优先设计
- 测试多种屏幕尺寸
- 避免固定宽度和高度

### 暗黑模式
- 使用 `dark:` 变体
- 测试亮色和暗色主题
- 确保在两种模式下都可用

## 🚀 部署

### 构建准备
1. 运行 `bun run typecheck`
2. 运行 `bun run lint`
3. 运行 `bun run build`
4. 检查构建输出

### Vercel 部署
```bash
vercel
```

### Docker 部署
```bash
docker build -t ai-chat .
docker run -p 3000:3000 ai-chat
```

## 📊 性能优化

### Next.js 优化
- 使用 Server Components
- 使用 `next/image` 组件
- 使用 `next/link` 组件
- 实现动态导入
- 配置 ISR 和 revalidation

### React 优化
- 使用 `useMemo` 缓存昂贵计算
- 使用 `useCallback` 稳定函数引用
- 使用 `React.memo` 优化组件重渲染
- 避免不必要的 `useEffect`

### Bundle 优化
- 使用 tree-shaking
- 按需导入
- 代码分割
- 延迟加载组件

## 🔐 安全最佳实践

### 环境变量
- 所有敏感信息使用环境变量
- 不要提交 `.env` 文件
- 使用不同的开发/生产密钥

### 代码安全
- 避免使用 `eval` 和 `innerHTML`
- 验证所有用户输入
- 使用参数化查询
- 实现适当的认证和授权

### 依赖管理
- 定期更新依赖
- 使用 `npm audit` 检查漏洞
- 固定依赖版本
- 审查新依赖的安全性

## 📚 文档

### 项目文档
- `README.md` - 项目概览和快速开始
- `PROJECT_ARCHITECTURE.md` - 本文档
- `.claude/skills/code-review/README.md` - 代码审查使用指南

### 组件文档
- 在组件文件中添加 JSDoc 注释
- 创建组件示例
- 记录 props 和用法

## 🤝 贡献指南

### 开发流程
1. Fork 仓库
2. 创建特性分支
3. 遵循代码规范
4. 运行测试和审查
5. 提交 Pull Request

### 代码规范
- 通过 ESLint 检查
- 通过 Prettier 格式化
- 通过 TypeScript 类型检查
- 通过代码审查
- 编写清晰的提交消息

### 提交消息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

类型：
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式（不影响代码运行）
- refactor: 重构
- perf: 性能优化
- test: 测试相关
- chore: 构建/工具链相关

## 🔧 故障排除

### 常见问题

1. **TypeScript 错误**
   - 运行 `bun run typecheck`
   - 检查 `tsconfig.json` 路径配置
   - 清理 `.next` 缓存

2. **ESLint 错误**
   - 运行 `bun run lint:fix`
   - 检查自定义规则
   - 查看特定规则文档

3. **构建失败**
   - 清理缓存：`bun run clean`
   - 检查 Node.js 版本（需要 18+）
   - 查看构建日志

4. **样式问题**
   - 检查 Tailwind 配置
   - 验证 shadcn/ui 组件安装
   - 检查 CSS 优先级

## 📞 支持

如有问题，请：
1. 查看项目文档
2. 搜索现有 Issues
3. 创建新的 Issue，包含：
   - 环境信息
   - 复现步骤
   - 预期行为
   - 实际行为
   - 错误日志

## 📝 更新日志

所有更改都记录在 `CHANGELOG.md` 中，遵循以下格式：

```markdown
## [版本] - YYYY-MM-DD

### Added
- 新功能列表

### Changed
- 更改列表

### Deprecated
- 弃用功能列表

### Removed
- 移除功能列表

### Fixed
- 修复列表

### Security
- 安全修复列表
```
