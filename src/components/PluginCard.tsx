import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Download } from 'lucide-react';

interface PluginCardProps {
  name: string;
  description: string;
  category: string;
  price: string;
  rating: number;
  downloads: string;
  installed?: boolean;
  onInstall?: () => void;
}

const PluginCard = ({ 
  name, 
  description, 
  category, 
  price, 
  rating, 
  downloads,
  installed = false,
  onInstall 
}: PluginCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-secondary text-secondary" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Download className="h-3 w-3" />
          <span>{downloads} installs</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="font-semibold text-primary">{price}</span>
        <Button 
          size="sm" 
          variant={installed ? "secondary" : "default"}
          onClick={onInstall}
          disabled={installed}
        >
          {installed ? 'Installed' : 'Add to Farm'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PluginCard;
