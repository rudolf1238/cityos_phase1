import React, { VoidFunctionComponent } from 'react';
import clsx from 'clsx';

import 'flag-icon-css/css/flag-icon.min.css';

interface FlagIconProps {
  code: string; // ISO 3166-1-alpha-2 code of a country
  squared?: boolean;
}

const FlagIcon: VoidFunctionComponent<FlagIconProps> = ({ code, squared }: FlagIconProps) => (
  <span className={clsx('flag-icon', `flag-icon-${code}`, squared && 'flag-icon-squared')} />
);

export default FlagIcon;
