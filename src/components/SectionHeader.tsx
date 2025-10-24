import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function SectionHeader({ title, subtitle, className, children }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4 flex-wrap', className)}>
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
