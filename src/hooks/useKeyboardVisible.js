import { useState, useEffect } from 'react';

/**
 * Returns true when the mobile virtual keyboard is likely open.
 * Strategy: compare visualViewport height vs window.innerHeight.
 * A drop of > 25% is a reliable keyboard signal.
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return; // SSR / unsupported

    let rafId;

    const check = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // keyboard is open if visual viewport is significantly smaller than layout
        const ratio = vv.height / window.innerHeight;
        setIsKeyboardVisible(ratio < 0.75);
      });
    };

    vv.addEventListener('resize', check);
    vv.addEventListener('scroll', check);

    return () => {
      vv.removeEventListener('resize', check);
      vv.removeEventListener('scroll', check);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return isKeyboardVisible;
}
