import React from 'react';
import { render } from '@testing-library/react';
import Route from './Route';

describe('render time cost', () => {
  test('minutes', () => {
    const { getByText } = render(
      <Route key="key" index={0} cost={1} path={[]} />
    );
    expect(getByText('4 min')).toBeInTheDocument();
  });

  test('hours', () => {
    const { getByText } = render(
      <Route key="key" index={0} cost={60} path={[]} />
    );
    expect(getByText('1 h 3 min')).toBeInTheDocument();
  });
});
