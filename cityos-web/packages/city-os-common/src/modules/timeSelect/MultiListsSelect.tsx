import { InputProps } from '@material-ui/core/Input';
import { makeStyles } from '@material-ui/core/styles';
import React, {
  ComponentProps,
  Dispatch,
  Fragment,
  MouseEvent,
  ReactElement,
  ReactNode,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Divider from '@material-ui/core/Divider';
import Grow from '@material-ui/core/Fade';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper, { PopperProps as PopperPropsType } from '@material-ui/core/Popper';
import TextField, { TextFieldProps as TextFieldPropsType } from '@material-ui/core/TextField';

import omitUndefinedProps from '../../libs/omitUndefinedProps';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },

  inputRoot: {
    cursor: 'pointer',
  },

  input: {
    cursor: 'pointer',
    textAlign: 'start',
  },

  popper: {
    zIndex: theme.zIndex.modal,
    marginTop: theme.spacing(2),
  },

  portalPopper: {
    width: '100%',
  },

  paper: {
    display: 'flex',
    overflow: 'hidden',
  },

  hiddenPaper: {
    display: 'none',
  },

  menuList: {
    flexBasis: theme.spacing(15),
    flexGrow: 1,
    padding: 0,
    maxHeight: theme.spacing(21),
    overflow: 'auto',
  },

  divider: {
    height: 'inherit',
  },
}));

export type MenuItemValue = number | string | undefined;
type ElementOf<T> = T extends (infer E)[] ? E : never;
type ValueList<T extends string, K extends MenuItemValue> = Record<
  ElementOf<Menu<T, K>['id'][]>,
  K
>;

interface Option<K extends MenuItemValue> {
  value: K;
  text?: string;
  disabled?: boolean;
}

interface Menu<T, K extends MenuItemValue> {
  options: Option<K>[];
  id: T;
  selectedValue?: K;
}

interface SelectMenuProps<T extends string, K extends MenuItemValue> {
  menu: Menu<T, K>;
  setValueList: Dispatch<SetStateAction<ValueList<T, K>>>;
  onSelect: (id: T, selectedValue: K) => void;
}

const SelectMenu = <T extends string, K extends MenuItemValue>({
  menu,
  setValueList,
  onSelect,
}: SelectMenuProps<T, K>): ReactElement => {
  const classes = useStyles();
  const [selected, setSelected] = useState<K | undefined>();

  const handleSelect = useCallback(
    (value) => {
      setSelected(value);
      onSelect(menu.id, value);
    },
    [menu.id, onSelect],
  );

  useEffect(() => {
    setSelected(menu.selectedValue);
  }, [menu.selectedValue]);

  useEffect(() => {
    if (selected === undefined) return;
    setValueList((prev) => {
      const newValueList = { ...prev };
      newValueList[menu.id] = selected;
      return newValueList;
    });
  }, [selected, menu, setValueList]);

  return (
    <MenuList className={classes.menuList}>
      {menu.options.map(({ value, text, disabled }, i) => (
        <MenuItem
          key={i.toString()}
          value={value}
          selected={selected === value}
          disabled={disabled}
          onClick={() => handleSelect(value)}
        >
          {text || value}
        </MenuItem>
      ))}
    </MenuList>
  );
};

const MemoMenu = memo(SelectMenu) as typeof SelectMenu;

interface PartialTextFieldProps
  extends Omit<TextFieldPropsType, 'onClick' | 'type' | 'value' | 'label' | 'InputProps'> {
  InputProps?: Omit<InputProps, 'ref'>;
}

export interface MultiListsSelectProps<T extends string, K extends MenuItemValue> {
  menus: Menu<T, K>[];
  popperSize?: 'shrink' | 'extended';
  icon?: ReactNode;
  label?: string;
  className?: string;
  TextFieldProps?: PartialTextFieldProps;
  PopperProps?: Omit<PopperPropsType, 'anchorEl' | 'keepMounted' | 'open' | 'children'>;
  formatter?: (valueList: ValueList<T, K>) => ComponentProps<typeof TextField>['value'];
  onSelect?: (id: T, selectedValue: K) => void;
}

const MultiListsSelect = <T extends string, K extends MenuItemValue>({
  menus,
  popperSize = 'shrink',
  icon,
  label,
  className,
  TextFieldProps,
  PopperProps,
  formatter,
  onSelect,
}: MultiListsSelectProps<T, K>): ReactElement => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [isGrow, setIsGrow] = useState(false);
  const [valueList, setValueList] = useState<ValueList<T, K>>(
    Object.fromEntries(menus.map((menu) => [menu.id, menu.selectedValue])) as ValueList<T, K>,
  );

  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleSelectClick = useCallback((e: MouseEvent<HTMLInputElement>) => {
    setOpen((prev) => !prev);
    // prevent to trigger clickAway event
    e.stopPropagation();
  }, []);

  const handleClickAway = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSelect = useCallback(
    (id: T, selectedValue: K) => {
      if (id === menus[menus.length - 1].id) {
        setOpen(false);
      }
      if (onSelect) {
        onSelect(id, selectedValue);
      }
    },
    [menus, onSelect],
  );

  return (
    <div className={clsx(classes.root, className)}>
      <TextField
        onClick={handleSelectClick}
        type="button"
        value={formatter ? formatter(valueList) : valueList}
        label={label}
        variant="outlined"
        fullWidth
        {...TextFieldProps}
        InputLabelProps={{ shrink: true, ...TextFieldProps?.InputLabelProps }}
        InputProps={{
          ref: anchorRef,
          endAdornment: icon && <InputAdornment position="end">{icon}</InputAdornment>,
          ...TextFieldProps?.InputProps,
          classes: {
            ...TextFieldProps?.InputProps?.classes,
            root: clsx(classes.inputRoot, TextFieldProps?.InputProps?.classes?.root),
            input: clsx(classes.input, TextFieldProps?.InputProps?.classes?.input),
          },
        }}
      />
      <Popper
        // prevent unmounted to memorize selected item
        keepMounted
        disablePortal
        open={open}
        anchorEl={anchorRef.current}
        transition
        {...PopperProps}
        className={clsx(classes.popper, PopperProps?.className, {
          [classes.portalPopper]: PopperProps?.disablePortal !== false,
        })}
        style={{
          ...omitUndefinedProps({
            width: popperSize === 'extended' ? `${100 * menus.length}%` : undefined,
          }),
          ...PopperProps?.style,
        }}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClickAway}>
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'top' }}
              onEnter={() => setIsGrow(true)}
              onExited={() => setIsGrow(false)}
            >
              <Paper
                className={clsx(classes.paper, !isGrow && classes.hiddenPaper)}
                variant="outlined"
              >
                {menus.map((menu, index) => (
                  <Fragment key={menu.id}>
                    <MemoMenu menu={menu} onSelect={handleSelect} setValueList={setValueList} />
                    {index !== menus.length - 1 && (
                      <Divider orientation="vertical" className={classes.divider} />
                    )}
                  </Fragment>
                ))}
              </Paper>
            </Grow>
          </ClickAwayListener>
        )}
      </Popper>
    </div>
  );
};

export default memo(MultiListsSelect) as typeof MultiListsSelect;
