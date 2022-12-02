import { makeStyles } from '@material-ui/core/styles';

import React, { VoidFunctionComponent } from 'react';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const useStyles = makeStyles((_theme) => ({
  root: {
    position: 'relative',
  },
  readonly: {
    opacity: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
}));

export interface WeekSelectorProps {
  readonly?: boolean;
  defaultValue?: number[];
}

const WeekSelector: VoidFunctionComponent<WeekSelectorProps> = (props: WeekSelectorProps) => {
  const { readonly = false, defaultValue = [] } = props;
  const classes = useStyles();

  const [formats, setFormats] = React.useState<number[]>(defaultValue);

  const handleFormat = (_event: React.MouseEvent<HTMLElement>, newFormats: number[]) => {
    setFormats(newFormats);
  };

  const weekShortLabelList = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <ToggleButtonGroup
      value={formats}
      onChange={handleFormat}
      aria-label="week-selector"
      size="medium"
      className={classes.root}
    >
      {weekShortLabelList.map((weekShortLabel, index) => (
        <ToggleButton value={index} aria-label={weekShortLabel} key={weekShortLabel}>
          {weekShortLabel}
        </ToggleButton>
      ))}
      {readonly && <div className={classes.readonly} />}
    </ToggleButtonGroup>
  );
};

export default WeekSelector;
