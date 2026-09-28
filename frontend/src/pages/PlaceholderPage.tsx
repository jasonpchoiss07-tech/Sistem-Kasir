import type { LucideIcon } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/ui';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

/**
 * Basic route placeholder used for areas whose functionality is built in a
 * later step. Renders the page header plus an empty state.
 */
export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title="Belum tersedia"
        description="Fitur ini akan dibuat pada tahap berikutnya."
      />
    </div>
  );
}
