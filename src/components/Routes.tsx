import React, { useContext, useRef } from 'react';
import { Spinner, NonIdealState } from '@blueprintjs/core';
import classnames from 'classnames';

import { LoadingContext, RoutesContext } from './App';
import Route from './Route';
import styles from './Routes.module.scss';

const Routes: React.FC = () => {
  const loading = useContext(LoadingContext);
  const routes = useContext(RoutesContext);

  const pristineRef = useRef(true);
  if (loading) {
    pristineRef.current = false;
  }

  return (
    <div className={styles.routes}>
      <table
        className={classnames(
          styles.table,
          'bp3-html-table bp3-html-table-bordered bp3-interactive'
        )}
      >
        <tbody>
          {routes.map(({ key, ...props }, i) => (
            <Route key={key} index={i} {...props} />
          ))}
        </tbody>
      </table>
      {loading && <Spinner className={styles.spinner} size={24} />}
      {!loading && !pristineRef.current && !routes.length && (
        <NonIdealState icon="search" title="No route found" />
      )}
    </div>
  );
};

export default Routes;
