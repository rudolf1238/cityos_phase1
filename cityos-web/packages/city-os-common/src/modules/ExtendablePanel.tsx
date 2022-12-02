import { makeStyles } from '@material-ui/core/styles';
import React, {
  ComponentProps,
  ReactNode,
  VoidFunctionComponent,
  useEffect,
  useState,
} from 'react';
import clsx from 'clsx';

import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    transition: 'all 0.5s ease-in-out',
    width: 0,
    maxWidth: `calc(100vw - ${theme.spacing(3)}px)`,

    '&$open > $toggle': {
      transform: 'rotate(180deg)',
    },
  },

  open: {
    width: 'auto',

    '&$bottom': {
      height: 'auto',
    },
  },

  toggle: {
    position: 'absolute',
    top: theme.spacing(12),
    left: '100%',
    zIndex: theme.zIndex.appBar,
    border: `1px solid ${theme.palette.grey[100]}`,
    borderRadius: 0,
    boxShadow: 'none',
    opacity: 0.9,
    '&:hover':
      theme.palette.type === 'dark'
        ? {
            backgroundColor: theme.palette.action.selected,
          }
        : {},
    backgroundColor: theme.palette.background.paper,
    padding: 0,
    minWidth: theme.spacing(3),
    minHeight: theme.spacing(5.5),
    color: theme.palette.grey[500],
  },

  startIcon: {
    margin: 0,
  },

  content: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },

  bottom: {
    top: 'auto',
    right: 0,
    width: 'auto',
    maxWidth: 'none',
    height: 0,

    '& > $toggle': {
      top: 'auto',
      right: theme.spacing(2),
      bottom: '100%',
      left: 'auto',
      minWidth: theme.spacing(5.5),
      minHeight: theme.spacing(3),
    },
  },

  right: {
    marginLeft: 'auto',

    '& > $toggle': {
      right: '100%',
      left: 'auto',
    },
  },

  arrowRight: {
    transform: 'rotate(180deg)',
  },
}));

interface CustomClasses {
  root?: string;
  toggle?: string;
}

interface ExtendablePanelProps {
  size: number | string;
  direction?: 'left' | 'bottom' | 'right';
  open?: boolean;
  PaperProps?: ComponentProps<typeof Paper>;
  disableCollapseButton?: boolean;
  onToggle?: (open: boolean) => void;
  classes?: CustomClasses;
  children: ReactNode;
}

const ExtendablePanel: VoidFunctionComponent<ExtendablePanelProps> = ({
  size,
  direction = 'left',
  open: initialOpen = false,
  PaperProps,
  disableCollapseButton = false,
  onToggle,
  classes: customClasses,
  children,
}: ExtendablePanelProps) => {
  const isBottom = direction === 'bottom';
  const classes = useStyles();
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  return (
    <div
      className={clsx(customClasses?.root, classes.root, {
        [classes.open]: open,
        [classes.bottom]: isBottom,
        [classes.right]: direction === 'right',
      })}
      style={
        isBottom
          ? {
              height: open ? size : undefined,
            }
          : {
              width: open ? size : undefined,
            }
      }
    >
      <Paper square {...PaperProps} className={clsx(classes.content, PaperProps?.className)}>
        {children}
      </Paper>
      {!disableCollapseButton && (
        <Button
          startIcon={
            isBottom ? (
              <ArrowDropUp />
            ) : (
              <ArrowRight className={clsx({ [classes.arrowRight]: direction === 'right' })} />
            )
          }
          variant="outlined"
          onClick={() => {
            const newOpen = !open;
            setOpen(newOpen);
            if (onToggle) {
              onToggle(newOpen);
            }
          }}
          classes={{
            root: clsx(classes.toggle, customClasses?.toggle),
            startIcon: classes.startIcon,
          }}
        />
      )}
    </div>
  );
};

export default ExtendablePanel;
