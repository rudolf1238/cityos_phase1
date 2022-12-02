import React, { VoidFunctionComponent, memo, useMemo } from 'react';

import { ComponentId } from '../libs/type';

import BaseMapContainerSample from './Components/BaseMapContainerSample';
import DivisionSelectorSample from './Components/DivisionSelectorSample';
import HeaderSample from './Components/HeaderSample';

interface ComponentContentProps {
  id: ComponentId;
}

const ComponentContent: VoidFunctionComponent<ComponentContentProps> = ({
  id,
}: ComponentContentProps) => {
  const content = useMemo(() => {
    switch (id) {
      case ComponentId.DIVISION_SELECTOR:
        return <DivisionSelectorSample />;
      case ComponentId.HEADER:
        return <HeaderSample />;
      case ComponentId.BASE_MAP_CONTAINER:
        return <BaseMapContainerSample />;
      default:
        return null;
    }
  }, [id]);

  return content;
};

export default memo(ComponentContent);
