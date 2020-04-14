import React from 'react';
import classnames from 'classnames';

import { getLineColor } from '../utils';
import styles from './LineLabel.module.scss';

interface Props {
  line: string;
  small?: boolean;
  extra?: string;
}

const LineLabel: React.FC<Props> = ({ line, small, extra }) => {
  return (
    <span
      className={classnames(styles.line, { [styles.small]: small })}
      style={{ backgroundColor: getLineColor(line) }}
    >
      {line}
      {extra}
    </span>
  );
};

export default LineLabel;
