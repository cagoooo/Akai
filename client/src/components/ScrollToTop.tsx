import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
    threshold?: number;
}

export function ScrollToTop({ threshold = 500 }: ScrollToTopProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > threshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!visible) return null;

    return (
        <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            aria-label="回到頂部"
        >
            <ArrowUp className="h-5 w-5" />
        </Button>
    );
}
