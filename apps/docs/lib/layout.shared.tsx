import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: 'SiphoChris',
  repo: 'supacommerce',
  branch: 'main',
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'supacommerce',
    },
    githubUrl: 'https://github.com/SiphoChris/supacommerce',
  };
}