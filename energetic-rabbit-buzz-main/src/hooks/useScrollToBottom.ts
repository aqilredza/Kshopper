import { useRef, useCallback, useEffect } from 'react';

export const useScrollToBottom = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, []);

  // Scroll to bottom when ref is first set
  useEffect(() => {
    if (scrollRef.current) {
      scrollToBottom();
    }
  }, [scrollToBottom]);

  return { scrollRef, scrollToBottom };
};