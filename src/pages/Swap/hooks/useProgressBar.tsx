import React, { useEffect, useState } from 'react';
import { Progress, Tooltip } from 'antd';

const useProgressBar = (
  onExpire: () => void,
  nonce = 0,
  ttl = 30,
  showCounter = true,
): {
  progressBar: number;
  timeToUpdate: number;
  elapsedTime: number;
  ProgressBar: () => JSX.Element;
} => {
  const [lastQuoteTime, setLastQuoteTime] = useState<number>(
    new Date().getTime(),
  );
  const [progressBar, setProgressBar] = useState<number>(100);
  const [timeToUpdate] = useState<number>(ttl * 1000);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  let iv: NodeJS.Timeout;

  const ProgressBar = () => (
    <Tooltip title="Time until the next update">
      <div className="depo_fulfill-progress d-flex align-center justify-center">
        <Progress
          size="small"
          type="circle"
          percent={progressBar}
          showInfo={false}
          className="progress-bar bg-lightgrey"
        />
        {showCounter && (
          <span className="elapsed-time">
            {((timeToUpdate - elapsedTime) / 1000).toFixed(0).replace('-', '')}
          </span>
        )}
      </div>
    </Tooltip>
  );

  useEffect(() => {
    const startedTime = new Date();
    setLastQuoteTime(startedTime.getTime());
    clearInterval(iv);
    setElapsedTime(0);
    setProgressBar(100);
    if (nonce > 0)
      iv = setInterval(() => {
        const currentTime = new Date().getTime();
        const elapsed = currentTime - lastQuoteTime;
        const progress = (elapsed / timeToUpdate) * 100;
        setElapsedTime(elapsed > 0 ? elapsed : 0);
        setProgressBar(100 - progress);
        if (progress >= 100) {
          onExpire();
          setProgressBar(100);
          clearInterval(iv);
        }
      }, 50);
    else clearInterval(iv);
    return () => clearInterval(iv);
  }, [nonce]);
  return {
    progressBar,
    timeToUpdate,
    elapsedTime,
    ProgressBar,
  };
};

export default useProgressBar;
