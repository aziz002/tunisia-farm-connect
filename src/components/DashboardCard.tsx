import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  subtitle?: string;
  trend?: string;
  iconColor?: string;
  children?: ReactNode;
}

const DashboardCard = ({ 
  title, 
  icon: Icon, 
  value, 
  subtitle, 
  trend,
  iconColor = 'text-primary',
  children 
}: DashboardCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-primary mt-1">{trend}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
