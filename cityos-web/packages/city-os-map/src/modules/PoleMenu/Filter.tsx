import { makeStyles } from '@material-ui/core/styles';
import React, { ElementType, MouseEventHandler, VoidFunctionComponent } from 'react';

import Chip from '@material-ui/core/Chip';

import { FilterType } from '../MapProvider';

import CheckAllIcon from '../../assets/icon/checkAll.svg';
import ErrorIcon from '../../assets/icon/error.svg';
import NoScheduleIcon from '../../assets/icon/noSchedule.svg';

const useStyles = makeStyles((theme) => ({
  label: {
    paddingRight: theme.spacing(1),
    color: theme.palette.grey[300],
  },
}));

const filterIcons: Record<FilterType, ElementType> = {
  [FilterType.ALL]: CheckAllIcon,
  [FilterType.ERROR]: ErrorIcon,
  [FilterType.NO_SCHEDULE]: NoScheduleIcon,
};

interface FilterProps {
  type: FilterType;
  label: string;
  isFocus: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const Filter: VoidFunctionComponent<FilterProps> = ({
  type,
  label,
  isFocus,
  onClick,
}: FilterProps) => {
  const classes = useStyles();
  const Icon = filterIcons[type];

  return (
    <Chip
      label={label}
      variant="outlined"
      clickable
      onClick={onClick}
      classes={{ label: isFocus ? undefined : classes.label }}
      color={isFocus ? 'primary' : 'default'}
      // deleteIcon would show only if onDelete is set
      onDelete={onClick}
      deleteIcon={<Icon />}
    />
  );
};

export default Filter;
