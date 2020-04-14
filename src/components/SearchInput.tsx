import React, { useContext } from 'react';
import { MenuItem } from '@blueprintjs/core';
import { Suggest } from '@blueprintjs/select';

import { NodesContext, StationsContext } from './App';
import styles from './SearchInput.module.scss';

interface Props {
  index: number;
  placeholder: string;
}

const SearchInput: React.FC<Props> = ({ index, placeholder }) => {
  const nodes = useContext(NodesContext);
  const { stations, setStations } = useContext(StationsContext);

  const FromInput = Suggest.ofType<string>();
  return (
    <FromInput
      className={styles.search}
      fill
      resetOnSelect
      disabled={!nodes.length}
      query={stations[index]}
      inputValueRenderer={() => stations[index]}
      items={nodes}
      itemsEqual={(a, b) => a === b}
      itemPredicate={(query, item) => {
        return item.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      }}
      itemDisabled={(item) => {
        if (index === 0) {
          return item === stations[1];
        } else {
          return item === stations[0];
        }
      }}
      itemRenderer={(item, { handleClick, modifiers }) => {
        if (!modifiers.matchesPredicate) {
          return null;
        }
        return (
          <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={item}
            onClick={handleClick}
            text={item}
          />
        );
      }}
      openOnKeyDown={false}
      onItemSelect={(query) => {
        setStations((stations) => {
          if (index === 0) {
            return [query, stations[1]];
          } else {
            return [stations[0], query];
          }
        });
      }}
      noResults={<MenuItem disabled={true} text="No results." />}
      inputProps={{
        placeholder,
        large: true,
        value: stations[index],
      }}
    />
  );
};

export default SearchInput;
