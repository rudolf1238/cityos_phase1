import { makeStyles } from '@material-ui/core/styles';
import React, {
  VoidFunctionComponent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';

import { CascadingMenuItem } from './types';
import useCommonTranslation from '../../hooks/useCommonTranslation';

import Layer from './Layer';

interface CascadingMenuProps {
  menu: CascadingMenuItem[];
  enableBreadcrumb?: boolean;
  path?: string;
  label?: string;
  displayText?: string;
  onPathChange?: (path: string, item: CascadingMenuItem | undefined) => void;
}

const useStyles = makeStyles((theme) => ({
  inputRoot: {
    cursor: 'pointer',
  },

  input: {
    paddingRight: theme.spacing(1),
    overflow: 'hidden',
    direction: 'rtl',
    textAlign: 'left',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    wordBreak: 'keep-all',
    color: theme.palette.group.leaf,
    fontSize: theme.typography.subtitle1.fontSize,
    fontWeight: theme.typography.subtitle1.fontWeight,
    pointerEvents: 'none',
  },

  paper: {
    marginTop: theme.spacing(3),
  },

  menuWrapper: {
    maxWidth: theme.spacing(72),
    height: theme.spacing(30),
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    scrollBehavior: 'smooth',
  },

  actions: {
    borderTop: `1px solid rgba(0, 0, 0, 0.2)`,
    padding: theme.spacing(5, 2),
    width: theme.spacing(75),
  },
}));

const CascadingMenu: VoidFunctionComponent<CascadingMenuProps> = ({
  menu,
  enableBreadcrumb,
  path,
  label,
  displayText,
  onPathChange,
}: CascadingMenuProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');
  const [open, setOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [prevSelectedPath, setPrevSelectedPath] = useState(selectedPath);
  const menuToggleRef = useRef<HTMLDivElement>(null);
  const menuWrapperRef = useRef<HTMLDivElement>(null);

  const selectedItems = useMemo(() => {
    const ids = selectedPath.split('.');
    let selectedItem = menu.find((item) => item.id === ids[0]);
    const items: (CascadingMenuItem | undefined)[] = [selectedItem];
    for (let layer = 1; layer < ids.length; layer += 1) {
      if (selectedItem?.subMenu) {
        selectedItem = selectedItem.subMenu.find((item) => item.id === ids[layer]);
      } else {
        selectedItem = undefined;
      }
      items.push(selectedItem);
    }
    return items;
  }, [menu, selectedPath]);

  const scrollToRight = useCallback(() => {
    if (menuWrapperRef && menuWrapperRef.current) {
      menuWrapperRef.current.scrollLeft = menuWrapperRef.current.scrollWidth;
    }
  }, []);

  const handleToggle = useCallback(() => {
    if (!open) {
      setPrevSelectedPath(selectedPath);
    }
    setOpen(!open);
  }, [open, selectedPath]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedPath(prevSelectedPath);
    handleClose();
  }, [handleClose, prevSelectedPath]);

  const handleApply = useCallback(() => {
    handleClose();
    if (onPathChange) {
      const ids = selectedPath.split('.');
      let selectedItem = menu.find((item) => item.id === ids[0]);
      for (let layer = 1; layer < ids.length; layer += 1) {
        if (!selectedItem?.subMenu) {
          selectedItem = undefined;
          break;
        }
        selectedItem = selectedItem.subMenu.find((item) => item.id === ids[layer]);
      }
      onPathChange(selectedPath, selectedItem);
    }
  }, [handleClose, menu, onPathChange, selectedPath]);

  useEffect(() => {
    if (menu.length > 0 && selectedItems.includes(undefined)) {
      setSelectedPath(menu[0].id);
    }
  }, [menu, path, selectedItems]);

  useEffect(() => {
    if (path !== undefined) {
      setSelectedPath(path);
    }
  }, [path]);

  useLayoutEffect(() => {
    scrollToRight();
  }, [scrollToRight, selectedItems]);

  return (
    <>
      <TextField
        value={
          enableBreadcrumb
            ? selectedItems.map((item) => item?.label || '...').join(' > ')
            : displayText || ''
        }
        variant="outlined"
        type="button"
        label={label}
        fullWidth
        InputLabelProps={{ shrink: true }}
        InputProps={{
          classes: { root: classes.inputRoot, input: classes.input },
          ref: menuToggleRef,
          endAdornment: <ExpandMoreRoundedIcon />,
        }}
        onClick={handleToggle}
      />
      <Popover
        open={open}
        anchorEl={menuToggleRef.current}
        onClose={handleCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onEntered={scrollToRight}
        classes={{ paper: classes.paper }}
      >
        <div className={classes.menuWrapper} ref={menuWrapperRef}>
          <Layer menu={menu} selectedPath={selectedPath} onSelectedPathChange={setSelectedPath} />
        </div>
        <DialogActions className={classes.actions}>
          <Button variant="outlined" color="primary" size="small" fullWidth onClick={handleCancel}>
            {t('Cancel')}
          </Button>
          <Button variant="contained" color="primary" size="small" fullWidth onClick={handleApply}>
            {t('Apply')}
          </Button>
        </DialogActions>
      </Popover>
    </>
  );
};

export default CascadingMenu;
