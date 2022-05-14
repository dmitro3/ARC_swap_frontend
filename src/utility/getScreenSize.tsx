import { useState, useLayoutEffect } from 'react';

function getScreenSize(): number {
  const [screenSize, setScreenSize] = useState(0);

  useLayoutEffect(() => {
    function updateScreenSize() {
      setScreenSize(window.innerWidth);
    }
    window.addEventListener('resize', updateScreenSize);
    updateScreenSize();
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

export default getScreenSize;
