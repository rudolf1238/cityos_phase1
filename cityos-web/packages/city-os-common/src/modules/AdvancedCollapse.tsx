import React, { FunctionComponent, useEffect, useState } from 'react';

import Collapse, { CollapseProps } from '@material-ui/core/Collapse';

interface AdvancedCollapsePropsWithChildren extends CollapseProps {
  disableInitialState?: boolean;
}

const AdvancedCollapse: FunctionComponent<AdvancedCollapsePropsWithChildren> = ({
  disableInitialState = false,
  in: open,
  children,
  ...props
}: AdvancedCollapsePropsWithChildren) => {
  const [isInit, setIsInit] = useState(!disableInitialState);

  useEffect(() => {
    setIsInit(false);
  }, []);

  return (
    <Collapse {...props} in={isInit ? !open : open}>
      {children}
    </Collapse>
  );
};

export default AdvancedCollapse;
