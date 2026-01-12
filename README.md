# AI Chat

一个基于 Next.js 16 + TypeScript + shadcn/ui 构建的现代化 AI 对话应用。

## ✨ 特性

- 🚀 **Next.js 16** - 最新版本的 App Router 和 Server Components
- 🎨 **shadcn/ui** - 美观且可定制的 UI 组件库
- 🛡️ **TypeScript** - 完整的类型安全
- 🎯 **ESLint + Prettier** - 代码质量和格式化
- 🔬 **代码审查 Skill** - 自动化的代码质量、安全性、性能和 UI/UX 审查
- 📱 **响应式设计** - 完美支持移动设备
- ♿ **无障碍性** - 符合 WCAG 2.1 AA 标准
- ⚡ **性能优化** - 优化的 bundle 和加载时间

## 🚀 快速开始

### 前置要求

- Node.js 18+ 和 npm 或 bun
- Git

### 安装

1. 克隆仓库
```bash
git clone https://github.com/your-username/ai-chat.git
cd ai-chat
```

2. 安装依赖
```bash
bun install
# 或
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

4. 运行开发服务器
```bash
bun run dev
# 或
npm run dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
ai-chat/
├── src/
│   ├── app/              # Next.js App Router 页面
│   ├── components/        # React 组件
│   │   └── ui/        # shadcn/ui 组件
│   ├── lib/             # 工具函数和库
│   ├── hooks/           # 自定义 React Hooks
│   ├── types/           # TypeScript 类型定义
│   └── config/         # 配置文件
├── .claude/             # Claude Code 配置和 Skills
├── .github/             # GitHub Actions workflows
├── public/              # 静态资源
└── [配置文件]
```

## 🛠️ 开发指南

### 可用脚本

```bash
# 启动开发服务器
bun run dev

# 构建生产版本
bun run build

# 启动生产服务器
bun run start

# 运行 ESLint
bun run lint

# 自动修复 ESLint 问题
bun run lint:fix

# 格式化代码
bun run format

# 检查代码格式
bun run format:check

# 类型检查
bun run typecheck

# 监视类型检查
bun run typecheck:watch

# 清理构建文件
bun run clean
```

### 代码规范

项目使用以下工具确保代码质量：

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Code Review Skill**: 自动化代码审查

### Git 提交前

项目配置了 pre-commit hooks，会自动运行：
```bash
npm run precommit
```

这会自动修复 linting 问题并格式化代码。

## 🔬 代码审查

项目包含一个自定义的代码审查 Skill，可以自动检查：

- **代码质量**: TypeScript 类型、React Hooks、代码风格
- **安全性**: 敏感信息、XSS/CSRF、输入验证
- **性能**: Next.js 优化、React 性能、bundle 大小
- **UI/UX**: shadcn/ui 使用、可访问性、响应式设计

### 使用方式

**手动审查**
```bash
# 审查单个文件
node .claude/skills/code-review/scripts/index.js src/app/page.tsx

# 批量审查目录
node .claude/skills/code-review/scripts/index.js src --directory

# 只审查特定维度
node .claude/skills/code-review/scripts/index.js src/app/page.tsx --only-security
```

**自动触发**
- 文件写入前：自动进行代码质量检查
- 文件写入后：对 >1KB 文件进行完整审查
- Pull Request：自动运行并添加评论

详细信息请查看 [`.claude/skills/code-review/README.md`](.claude/skills/code-review/README.md)。

## 🧪 测试

```bash
# 运行所有测试
bun run test

# 运行测试并生成覆盖率
bun run test:coverage

# 监视模式运行测试
bun run test:watch
```

## 🏗️ 构建和部署

### 构建

```bash
bun run build
```

### 部署

**Vercel**
```bash
vercel
```

**Netlify**
```bash
netlify deploy --prod
```

**Docker**
```bash
docker build -t ai-chat .
docker run -p 3000:3000 ai-chat
```

## 🌐 环境变量

查看 [`.env.example`](.env.example) 文件获取所有可配置的环境变量。

重要的环境变量：

- `JWT_SECRET`: JWT 签名密钥
- `GITHUB_CLIENT_ID`: GitHub OAuth 客户端 ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth 客户端密钥
- `DATABASE_URL`: PostgreSQL 数据库连接字符串
- `NEXTAUTH_SECRET`: NextAuth.js 密钥

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发规范

- 遵循项目的 ESLint 规则
- 使用 Prettier 格式化代码
- 编写有意义的提交消息
- 为新功能添加测试
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 📞 联系方式

- 项目链接: [https://github.com/your-username/ai-chat](https://github.com/your-username/ai-chat)
- 问题反馈: [GitHub Issues](https://github.com/your-username/ai-chat/issues)

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 获取详细的更新历史。
