import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'orange' | 'blue' | 'white';
  className?: string;
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-32 w-32',
};

const variantClasses = {
  default: 'border-gray-500',
  orange: 'border-orange-500',
  blue: 'border-blue-600',
  white: 'border-white',
};

export function Loader({ 
  size = 'md', 
  variant = 'default', 
  className,
  text,
  showText = false
}: LoaderProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-b-2",
        sizeClasses[size],
        variantClasses[variant],
        className
      )} />
      {showText && text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
}

interface PageLoaderProps {
  text?: string;
  className?: string;
}

export function PageLoader({ text = "Loading...", className }: PageLoaderProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <div className="text-center">
        <Loader size="xl" variant="orange" />
        {text && <p className="text-gray-600 mt-4">{text}</p>}
      </div>
    </div>
  );
}

interface ButtonLoaderProps {
  text?: string;
  className?: string;
}

export function ButtonLoader({ text, className }: ButtonLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader size="sm" variant="white" />
      {text && <span className="ml-2 text-sm">{text}</span>}
    </div>
  );
}
