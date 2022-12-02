import { makeStyles } from '@material-ui/core/styles';
import React, {
  ComponentProps,
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import clsx from 'clsx';

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  tabs: {
    position: 'relative',
    height: theme.spacing(9),
    overflow: 'auto',

    '& > :first-child.MuiTabScrollButton-root': {
      marginRight: 'auto',
    },

    '& > :last-child.MuiTabScrollButton-root': {
      marginLeft: 'auto',
    },
  },

  tabsDefault: {
    backgroundColor: theme.palette.background.light,
  },

  scroller: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  scrollButtons: {
    zIndex: 1,
  },

  tab: {
    paddingBottom: theme.spacing(1),
    width: theme.spacing(25),
    height: theme.spacing(8.5),
    textTransform: 'none',
    borderStartStartRadius: theme.spacing(1),
    borderStartEndRadius: theme.spacing(1),
  },

  tabSmall: {
    width: theme.spacing(21),
  },

  tabSelected: {
    backgroundColor: theme.palette.background.paper,
  },

  tabWrapper: {
    flexDirection: 'row',
  },

  tabLabel: {
    paddingLeft: theme.spacing(0.5),
  },

  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    height: theme.spacing(1),

    '& > span': {
      borderRadius: theme.spacing(0.5),
      backgroundColor: theme.palette.primary.main,
      width: `calc(100% - ${theme.spacing(2)}px)`,
      height: theme.spacing(0.5),
    },
  },

  flagIcon: {
    marginLeft: theme.spacing(1),
  },

  contents: {
    position: 'relative',
    flexGrow: 1,
  },

  content: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(1),
    overflow: 'auto',

    '&::-webkit-scrollbar': {
      backgroundColor: theme.palette.background.paper,
    },
  },

  roundedContent: {
    borderRadius: theme.spacing(1),
  },
}));

export interface TabPanelSetProps {
  tabTitles: {
    tabId?: string;
    title: string;
    icon?: string | ReactElement;
    flagIcon?: ReactElement;
  }[];
  tabSize?: 'normal' | 'small';
  tabsColor?: 'default' | 'transparent';
  rounded?: boolean;
  index?: number;
  scrollButtons?: ComponentProps<typeof Tabs>['scrollButtons'];
  classes?: {
    root?: string;
    scrollButtons?: string;
  };
  onSelect?: (currentIndex: number) => void | boolean;
}

const TabPanelSet: FunctionComponent<TabPanelSetProps> = ({
  tabTitles,
  tabSize = 'normal',
  tabsColor = 'default',
  rounded = true,
  index: initialIndex,
  scrollButtons = 'auto',
  classes: customClasses,
  onSelect,
  children,
}: PropsWithChildren<TabPanelSetProps>) => {
  const classes = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleChange = useCallback(
    async (_event, newIndex: number) => {
      if (onSelect?.(newIndex) !== false) {
        setCurrentIndex(newIndex);
      }
    },
    [onSelect],
  );

  useEffect(() => {
    if (initialIndex !== undefined && initialIndex !== currentIndex) setCurrentIndex(initialIndex);
  }, [initialIndex, currentIndex]);

  return (
    <div className={classes.root}>
      <Tabs
        // prevent contents props change trigger MUI error due to invalid index value
        value={tabTitles.length > currentIndex ? currentIndex : 0}
        onChange={handleChange}
        textColor="primary"
        variant="scrollable"
        scrollButtons={scrollButtons}
        TabIndicatorProps={{ children: <span />, className: classes.indicator }}
        className={clsx(
          classes.tabs,
          { [classes.tabsDefault]: tabsColor === 'default' },
          customClasses?.root,
        )}
        classes={{
          scroller: classes.scroller,
          scrollButtons: clsx(classes.scrollButtons, customClasses?.scrollButtons),
        }}
      >
        {tabTitles.map((tabTitle) => (
          <Tab
            icon={tabTitle.icon}
            label={
              <>
                <Typography
                  variant={tabTitle.icon ? 'subtitle2' : 'subtitle1'}
                  className={classes.tabLabel}
                >
                  {tabTitle.title}
                </Typography>
                {tabTitle.flagIcon && <span className={classes.flagIcon}>{tabTitle.flagIcon}</span>}
              </>
            }
            classes={{
              root: clsx(classes.tab, {
                [classes.tabSmall]: tabSize === 'small',
              }),
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
            }}
            key={`${tabTitle.title}-${tabTitle.tabId || ''}`}
          />
        ))}
      </Tabs>
      <div className={classes.contents}>
        <div
          role="tabpanel"
          className={clsx(classes.content, {
            [classes.roundedContent]: rounded,
          })}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default TabPanelSet;
