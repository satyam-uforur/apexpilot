import { useState, useEffect } from 'react';

export default function useLowEndDevice() {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
    const fewCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const smallScreen = window.innerWidth < 768;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsLowEnd(isMobile || lowMemory || fewCores || smallScreen || prefersReduced);
  }, []);

  return isLowEnd;
}