import React, { useState, useEffect, useContext } from 'react';
import classnames from 'classnames';

import {
  Classes,
  Card,
  Elevation,
  Button,
  Icon,
  Divider,
} from '@blueprintjs/core';

import { StationsContext } from './App';
import SearchInput from './SearchInput';
import Routes from './Routes';
import styles from './Drawer.module.scss';

const DRAWER_WIDTH = 350;

const Drawer = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDrawerOpen(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const { setStations } = useContext(StationsContext);

  return (
    <Card
      className={styles.drawer}
      elevation={drawerOpen ? Elevation.FOUR : Elevation.ZERO}
      style={{ width: DRAWER_WIDTH, left: drawerOpen ? 0 : -DRAWER_WIDTH }}
    >
      <Button
        className={styles.toggle}
        icon={drawerOpen ? 'caret-left' : 'caret-right'}
        onClick={() => setDrawerOpen((o) => !o)}
      />
      <div className={Classes.DIALOG_HEADER}>
        <Icon icon="train" />
        <h3>MRT Route Finder</h3>
      </div>
      <div className={styles.stations}>
        <div className="left">
          <Icon color="#5C7080" icon="circle" iconSize={12} />
          <Icon color="#5C7080" icon="more" className="path-icon" />
          <Icon color="#5C7080" icon="map-marker" iconSize={14} />
        </div>
        <div className="middle">
          <SearchInput index={0} placeholder="Start from ..." />
          <SearchInput index={1} placeholder="Destination ..." />
        </div>
        <div className="right">
          <Button
            minimal
            icon="swap-vertical"
            title="Swap"
            onClick={() => setStations(([a, b]) => [b, a])}
          />
        </div>
      </div>
      <Routes />
      <div
        className={classnames(
          Classes.DIALOG_FOOTER,
          'bp3-text-small',
          'bp3-text-muted'
        )}
      >
        <a
          href="https://github.com/mdluo/mrt-routes-finder"
          target="_blank"
          rel="noopener noreferrer"
        >
          About
        </a>
        <Divider />
        <a
          href="https://github.com/mdluo/mrt-routes-finder"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </Card>
  );
};

export default Drawer;
