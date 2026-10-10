import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

/**
 * Root route (`/`). Redirects to the home page of the default locale.
 *
 * @returns {never} Never returns; `redirect` throws a Next.js redirect.
 */
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
