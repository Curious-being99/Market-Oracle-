import { useState, useEffect } from "react";

export const Typewriter = ({ text, delay }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, delay || 0);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let timer: NodeJS.Timeout;

    const handleStep = () => {
      if (!isDeleting) {
        if (displayedText.length < text.length) {
          setDisplayedText(text.slice(0, displayedText.length + 1));
        } else {
          // Finished typing, pause, then start deleting
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, 3500); // Let the message dwell for 3.5 seconds
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(text.slice(0, displayedText.length - 1));
        } else {
          // Finished deleting, wait, then start typing again
          timer = setTimeout(() => {
            setIsDeleting(false);
          }, 1200); // 1.2s delay before re-typing
        }
      }
    };

    // Fast deletion speed, slightly slower typing speed for realistic pressure
    const speed = isDeleting ? 12 : 25;
    timer = setTimeout(handleStep, speed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, text, hasStarted]);

  return (
    <span className="relative">
      {displayedText}
      <span className="inline-block w-[2px] h-[1.1em] ml-[2px] align-middle bg-rose-500/80 animate-pulse" />
    </span>
  );
};

