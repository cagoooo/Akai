/**
 * 星級評分元件
 * 可互動或唯讀的星級評分顯示
 */

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

export function StarRating({
    rating,
    onChange,
    readonly = false,
    size = 'md',
    showValue = false,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (star: number) => {
        if (!readonly) {
            setHoverRating(star);
        }
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleClick = (star: number) => {
        if (!readonly && onChange) {
            onChange(star);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-1">
            <div
                className="flex gap-0.5"
                onMouseLeave={handleMouseLeave}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        className={cn(
                            'transition-colors focus:outline-none',
                            !readonly && 'cursor-pointer hover:scale-110',
                            readonly && 'cursor-default'
                        )}
                        aria-label={`${star} 星`}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                'transition-colors',
                                star <= displayRating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                            )}
                        />
                    </button>
                ))}
            </div>
            {showValue && (
                <span className="ml-1 text-sm text-muted-foreground">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
