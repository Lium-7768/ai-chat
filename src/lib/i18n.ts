export const translations = {
  en: {
    common: {
      loading: 'Loading...',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirm: 'Confirm',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back, {name}!',
      description: 'This is your dashboard overview',
      tabs: {
        overview: 'Overview',
        github: 'GitHub Repos',
        settings: 'Settings',
      },
      quickActions: 'Quick Actions',
      manageGithub: 'Manage GitHub Repos',
      openSettings: 'Open Settings',
      accountInfo: 'Account Information',
      loginMethod: 'Login Method',
      githubAuth: 'GitHub Authorization',
      githubAuthed: 'Authorized',
      userId: 'User ID',
      email: 'Email',
      username: 'Username',
    },
    github: {
      title: 'GitHub Repository Management',
      description: 'Manage your GitHub repositories',
      createRepo: 'Create New Repository',
      repoName: 'Repository Name',
      repoDescription: 'Description (optional)',
      privateRepo: 'Private Repository',
      createButton: 'Create Repository',
      creating: 'Creating...',
      myRepos: 'My Repositories ({count})',
      noRepos: 'No repositories',
      loading: 'Loading...',
      loadFailed: 'Failed to load repositories, please check GitHub authorization',
      createFailed: 'Failed to create repository',
      deleteFailed: 'Failed to delete repository',
      unknownLanguage: 'Unknown Language',
    },
    deleteConfirmation: {
      title: 'Confirm Delete Repository',
      description:
        'Are you sure you want to delete repository <strong>{repo}</strong>? This action cannot be undone.',
    },
    settings: {
      title: 'Settings',
      description: 'Manage your account settings',
      accountInfo: 'Account Information',
      githubIntegration: 'GitHub Integration',
      githubAuthorized: 'You are logged in via GitHub and can manage GitHub repositories',
      theme: 'Theme',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      english: 'English',
      chinese: '中文',
    },
  },
  zh: {
    common: {
      loading: '加载中...',
      logout: '登出',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      confirm: '确认',
    },
    dashboard: {
      title: '控制面板',
      welcome: '欢迎回来，{name}!',
      description: '这是您的控制面板概览',
      tabs: {
        overview: '概览',
        github: 'GitHub仓库',
        settings: '设置',
      },
      quickActions: '快速操作',
      manageGithub: '管理GitHub仓库',
      openSettings: '打开设置',
      accountInfo: '账户信息',
      loginMethod: '登录方式',
      githubAuth: 'GitHub授权',
      githubAuthed: '已授权',
      userId: '用户ID',
      email: '邮箱',
      username: '用户名',
    },
    github: {
      title: 'GitHub仓库管理',
      description: '管理您的GitHub仓库',
      createRepo: '创建新仓库',
      repoName: '仓库名称',
      repoDescription: '描述（可选）',
      privateRepo: '私有仓库',
      createButton: '创建仓库',
      creating: '创建中...',
      myRepos: '我的仓库 ({count})',
      noRepos: '暂无仓库',
      loading: '加载中...',
      loadFailed: '加载仓库失败，请检查GitHub授权',
      createFailed: '创建仓库失败',
      deleteFailed: '删除仓库失败',
      unknownLanguage: '未知语言',
    },
    deleteConfirmation: {
      title: '确认删除仓库',
      description: '您确定要删除仓库 <strong>{repo}</strong> 吗？此操作无法撤销。',
    },
    settings: {
      title: '设置',
      description: '管理您的账户设置',
      accountInfo: '账户信息',
      githubIntegration: 'GitHub集成',
      githubAuthorized: '您已通过GitHub登录，可以管理GitHub仓库',
      theme: '主题',
      language: '语言',
      light: '浅色',
      dark: '深色',
      system: '系统',
      english: 'English',
      chinese: '中文',
    },
  },
};

export type Language = 'en' | 'zh';
export type TranslationKey = keyof typeof translations.en;
export type TranslationPath = string;

export function getTranslation(
  lang: Language,
  path: string,
  params?: Record<string, string>
): string {
  const keys = path.split('.');
  let value: unknown = translations[lang];

  for (const key of keys) {
    value = (value as Record<string, unknown>)[key];
    if (value === undefined) {
      return path;
    }
  }

  if (typeof value !== 'string') {
    return path;
  }

  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) =>
      params[paramKey] !== undefined ? params[paramKey] : match
    );
  }

  return value;
}
