import { redirect } from 'next/navigation';
import { isOwnerOrAdmin } from '@/lib/get-member-role';

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasAccess = await isOwnerOrAdmin();

  if (!hasAccess) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
