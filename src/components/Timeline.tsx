import React from 'react';
import { Icon } from '@blueprintjs/core';
import classnames from 'classnames';

import { getLineColor } from '../utils';
import LineLabel from './LineLabel';
import styles from './Timeline.module.scss';

interface Props {
  path: PathNode[];
}

const renderDesc = (type: PathNode['type'], line: string) => {
  if (type === 'start' || type === 'interchange2') {
    return (
      <p className="desc">
        <Icon icon="train" iconSize={12} color="#5C7080" /> Take{' '}
        <LineLabel small line={line} /> Line
      </p>
    );
  }
  if (type === 'interchange1') {
    return (
      <p className="desc">
        <Icon icon="walk" iconSize={12} color="#5C7080" /> Change to{' '}
        <LineLabel small line={line} /> Line
      </p>
    );
  }
  return null;
};

const Timeline: React.FC<Props> = ({ path }) => {
  return (
    <ul className={styles.timeline}>
      {path.map(({ station, line, index, type }) => (
        <li
          key={[station, line, index].join(',')}
          className={classnames(styles[type], styles[getLineColor(line, true)])}
        >
          <p className="title">
            {station} ({line}
            {index})
          </p>
          {renderDesc(type, line)}
        </li>
      ))}
    </ul>
  );
};

export default Timeline;
