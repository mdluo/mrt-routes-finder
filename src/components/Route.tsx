import React, { useState, useContext } from 'react';
import { Icon, Collapse } from '@blueprintjs/core';
import classnames from 'classnames';

import { ActiveRouteContext } from './App';
import LineLabel from './LineLabel';
import Timeline from './Timeline';
import styles from './Route.module.scss';

interface Props extends Route {
  index: number;
}

const Route: React.FC<Props> = ({ index, cost, path }) => {
  const totalCost = cost + 3;
  const hours = Math.floor(totalCost / 60);
  const minutes = totalCost - hours * 60;
  const lines = new Set<string>();
  path.forEach(({ line }) => {
    lines.add(line);
  });

  const [showDetail, setShowDetail] = useState(false);

  const { activeRoute, setActiveRoute } = useContext(ActiveRouteContext);

  return (
    <tr>
      <td
        className={classnames(styles.route, { active: activeRoute === index })}
        onClick={() => setActiveRoute(index)}
      >
        <div>
          <Icon icon="stopwatch" color="#5C7080" />
          <span className={styles.duration}>
            {hours ? `${hours} h ` : ''}
            {minutes} min
          </span>
        </div>
        <div className={styles.lines}>
          {[...lines.values()].map((line, i, { length }) => (
            <span key={line}>
              <LineLabel line={line} />{' '}
              {i < length - 1 && (
                <Icon
                  className={styles.divider}
                  icon="chevron-right"
                  color="#5C7080"
                />
              )}{' '}
            </span>
          ))}
        </div>
        <span
          className={styles.details}
          onClick={() => setShowDetail((s) => !s)}
        >
          DETAILS
        </span>
        <Collapse isOpen={showDetail} keepChildrenMounted>
          <Timeline path={path} />
        </Collapse>
      </td>
    </tr>
  );
};

export default Route;
