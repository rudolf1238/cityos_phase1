import React, {
  Dispatch,
  ProviderProps,
  ReactElement,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

import { Group } from 'city-os-common/libs/schema';

export interface DivisionsContextValue {
  expanded: string[];
  selected: string[];
  groups: Required<Group>[];
  setExpanded: Dispatch<SetStateAction<string[]>>;
  setSelected: Dispatch<SetStateAction<string[]>>;
}

const DivisionsContext = createContext<DivisionsContextValue>({
  expanded: [],
  selected: [],
  groups: [],
  setExpanded: () => {},
  setSelected: () => {},
});

function DivisionsProvider({
  value,
  children,
}: ProviderProps<DivisionsContextValue>): ReactElement | null {
  return <DivisionsContext.Provider value={value}>{children}</DivisionsContext.Provider>;
}

export default DivisionsProvider;

export function useDivisionsContext(): DivisionsContextValue {
  return useContext(DivisionsContext);
}
