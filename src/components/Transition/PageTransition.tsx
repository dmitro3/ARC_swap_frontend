/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Layout } from 'antd';
import './transitions.scss';

const PageTransition: React.FC<{
  type?: string;
  totalTime?: number;
}> = ({ children, type = 'fade', totalTime = 300 }) => {
  const history = useHistory();
  const content = document.getElementById('route-transition');
  const sequence = [
    'leave enter-to',
    'leave leave-to',
    'enter leave-to',
    'enter enter-to',
  ];
  const [location, setLocation] = useState<string>();

  const transition = (stage: string) =>
    new Promise((resolve) => {
      if (content) {
        const stages = stage.split(' ').join(` ${type}-`);
        content.className = `${type}-${stages}`;
        setTimeout(() => {
          resolve(true);
        }, totalTime / 2);
      }
    });

  const perform = async (path: string) => {
    if (content) {
      for (let i = 0; i < sequence.length; i++) {
        if (i === 2) history.push(path);
        await transition(sequence[i]);
      }
      content.className = '';
    } else {
      history.push(path);
      // eslint-disable-next-line no-console
      console.warn("Couldn't find #main-content for transition.");
    }
  };

  useEffect(() => {
    window.addEventListener('page-change', ($e: any) => {
      const path = $e.detail;
      if (typeof path === 'string') {
        setLocation(path);
      }
    });

    const currentPath = window.location.pathname;
    if (currentPath !== '/') {
      setLocation(currentPath);
    }
  }, []);

  useEffect(() => {
    if (location?.length) {
      perform(location);
    }
  }, [location]);

  return (
    <Layout className="layoutContent">
      <div id="route-transition">
        <div className="d-flex justify-center">{children}</div>
      </div>
    </Layout>
  );
};

export default PageTransition;
