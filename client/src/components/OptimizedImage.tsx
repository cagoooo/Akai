
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  skeleton?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallback = "/placeholder.svg",
  skeleton = true,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (imgRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const actualSrc = img.dataset.src;
            if (actualSrc) {
              img.src = actualSrc;
              observer.unobserve(img);
            }
          }
        });
      });
      
      observer.observe(imgRef.current);
      
      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    }
  }, []);

  return (
    <div className="relative">
      {(!isLoaded && skeleton) && (
        <div 
          className={cn(
            "skeleton-loading absolute inset-0",
            className
          )} 
          style={{ 
            width: props.width, 
            height: props.height 
          }}
        />
      )}
      <img
        ref={imgRef}
        data-src={src}
        src={skeleton ? undefined : src}
        alt={alt}
        className={cn(
          "lazy-image",
          isLoaded && "loaded",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
      {error && (
        <img
          src={fallback}
          alt={`${alt} (fallback)`}
          className={className}
          {...props}
        />
      )}
    </div>
  );
}
