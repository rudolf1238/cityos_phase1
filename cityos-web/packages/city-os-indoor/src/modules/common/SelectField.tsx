import React, {
  ComponentProps,
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  memo,
} from 'react';

import { makeStyles } from '@material-ui/core/styles';

import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import TextField from '@material-ui/core/TextField';

interface SelectFieldProps
  extends Pick<ComponentProps<typeof TextField>, 'label' | 'value' | 'inputProps' | 'onChange'> {
  renderValue?: (value: unknown) => ReactNode | undefined;
  children?: ReactNode;
  defaultValue?: unknown;
  styles?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const useStyles = makeStyles((theme) => ({
  menu: {
    marginTop: theme.spacing(2),
  },
  menuList: {
    padding: 0,
  },
}));

const SelectField: FunctionComponent<SelectFieldProps> = ({
  label,
  value,
  inputProps,
  renderValue,
  defaultValue,
  children,
  styles,
  onChange,
  ref,
}: PropsWithChildren<SelectFieldProps>) => {
  const classes = useStyles();

  return (
    <TextField
      inputRef={ref}
      select
      fullWidth
      variant="outlined"
      type="text"
      InputLabelProps={{ shrink: true }}
      label={label}
      value={value}
      inputProps={inputProps}
      defaultValue={defaultValue}
      SelectProps={{
        IconComponent: ExpandMoreRoundedIcon,
        displayEmpty: true,
        MenuProps: {
          getContentAnchorEl: null,
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          className: classes.menu,
          MenuListProps: {
            className: classes.menuList,
          },
          PaperProps: {
            variant: 'outlined',
          },
        },
        renderValue,
      }}
      className={styles}
      onChange={onChange}
    >
      {children}
    </TextField>
  );
};

export default memo(SelectField);
