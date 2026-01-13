'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/components/providers/i18n-provider';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="font-mono text-sm font-medium">{language === 'zh' ? '中' : 'EN'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('zh')}>中文</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
