import React from 'react';
import { Icon } from '@blueprintjs/core';
import classnames from 'classnames';

import { getLineColor } from '../utils';
import LineLabel from './LineLabel';
import styles from './Timeline.module.scss';

interface Props {
  path: PathNode[];
}

const renderDesc = (node: PathNode) => {
  const { type, line } = node;
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
        <LineLabel small line={node.nextLine || ''} /> Line
      </p>
    );
  }
  return null;
};

const Timeline: React.FC<Props> = ({ path }) => {
  return (
    <ul className={styles.timeline}>
      {path.map((node) => {
        const { station, line, index, type } = node;
        return (
          <li
            key={[station, line, index].join(',')}
            className={classnames(
              styles[type],
              styles[getLineColor(line, true)]
            )}
          >
            <p className="title">
              {station} ({line}
              {index})
            </p>
            {renderDesc(node)}
          </li>
        );
      })}
    </ul>
  );
};

export default Timeline;
