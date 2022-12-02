import { makeStyles } from '@material-ui/core/styles';
import React, {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import PageviewIcon from '@material-ui/icons/Pageview';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { Action, DeviceType, Subject } from '../../libs/schema';
import { useStore } from '../../reducers';
import subjectRoutes from '../../libs/subjectRoutes';
import useCommonTranslation from '../../hooks/useCommonTranslation';
import useSubjectTranslation from '../../hooks/useSubjectTranslation';

import { BaseMenuItemProps, NestedList, NestedListItem, RequireOnlyOne } from './NestedList';
import Auth from '../Auth';
import AutomationIcon from '../../assets/icon/automation.svg';
import DashboardIcon from '../../assets/icon/dashboard.svg';
import DeviceIcon from '../DeviceIcon';
import DevicesIcon from '../../assets/icon/devices.svg';
import DivisionIcon from '../../assets/icon/division.svg';
import DownloadStatusButton from './DownloadStatusButton';
import ElasticSearchIcon from '../../assets/icon/elastic-search.svg';
import Logo from '../Logo';
import PermissionSelector from './PermissionSelector';
import ProfileMenu from './ProfileMenu';
import RemoveIcon from '../../assets/icon/remove.svg';
import RoleIcon from '../../assets/icon/role.svg';
import ScrollToTop from '../ScrollToTop';
import UsersIcon from '../../assets/icon/users.svg';

interface BaseMenuItemWithSubjectProps extends Omit<BaseMenuItemProps, 'subItems'> {
  subItems?: MenuItemWithSubject[];
  subjects?: Subject[];
}

type MenuItemWithSubject = RequireOnlyOne<BaseMenuItemWithSubjectProps, 'link' | 'subItems'>;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
  },

  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },

  toolbar: {
    gap: theme.spacing(2),
  },

  menuButton: {
    transitionDuration: '0.5s',
    transitionProperty: 'all',
    borderRadius: 0,
    padding: theme.spacing(2),
    color: theme.palette.grey[400],

    '&:hover': {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
  },

  menuButtonActive: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,

    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },

  brand: {
    width: 'auto',
    height: 36,
  },

  rightMenu: {
    marginLeft: 'auto',
  },

  profile: {
    margin: theme.spacing(0, 2, 0, 1),
    padding: theme.spacing(2),
  },

  username: {
    textTransform: 'none',
    color: theme.palette.info.main,
  },

  drawer: {
    flexShrink: 0,
  },

  drawerPaper: {
    position: 'relative',
  },

  nestedList: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: theme.spacing(1),
    height: '100%',
    overflowX: 'clip',
  },

  space: {
    flexGrow: 1,
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'auto',
  },

  container: {
    position: 'relative',
    flexGrow: 1,
    backgroundColor: theme.palette.background.container,
    overflow: 'auto',
  },
}));

function getFilteredItems(
  menuItems: MenuItemWithSubject[],
  viewableSubjects: Subject[],
): MenuItemWithSubject[] {
  return menuItems.filter(
    (item) => !item.subjects || item.subjects.some((s) => viewableSubjects.includes(s)),
  );
}

function getViewableMenuItems(
  menuItems: MenuItemWithSubject[],
  viewableSubjects: Subject[],
): ReactNode[] {
  return getFilteredItems(menuItems, viewableSubjects).reduce<ReactNode[]>(
    (acc, { subItems, link, ...item }) => {
      if (subItems && !link) {
        acc.push(
          <NestedListItem
            {...item}
            key={item.nodeId}
            subItems={getFilteredItems(subItems, viewableSubjects).map(
              ({ subjects: _, ...rest }) => rest,
            )}
          />,
        );
      }
      if (!subItems && link) {
        acc.push(<NestedListItem {...item} key={item.nodeId} link={link} />);
      }
      return acc;
    },
    [],
  );
}

const MainLayout: FunctionComponent<{
  onBottom?: () => void;
  scrollPercent?: (percent: number) => void;
}> = ({
  children,
  onBottom,
  scrollPercent,
}: PropsWithChildren<{ onBottom?: () => void; scrollPercent?: (percent: number) => void }>) => {
  const classes = useStyles();
  const { t } = useCommonTranslation(['common', 'mainLayout', 'indoor']);
  const { tSubject } = useSubjectTranslation();
  const {
    download,
    userProfile: { permissionGroup, profile },
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleProfileClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleProfileClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleMenuClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleMenuToggle = useCallback((newIsExpanded: boolean) => {
    setIsExpanded(newIsExpanded);
  }, []);

  const viewableSubjects = useMemo<Subject[]>(
    () =>
      permissionGroup?.permission.rules?.reduce<Subject[]>(
        (list, { action, subject }) => (action === Action.VIEW ? list.concat(subject) : list),
        [],
      ) ?? [],
    [permissionGroup?.permission],
  );

  const primaryMenuItems = useMemo(() => {
    const features: MenuItemWithSubject[] = [];
    if (process.env.NEXT_PUBLIC_FEAT_DASHBOARD) {
      features.push({
        nodeId: 'dashboard',
        labelIcon: <DashboardIcon />,
        labelText: tSubject(Subject.DASHBOARD),
        link: subjectRoutes[Subject.DASHBOARD],
        subjects: [Subject.DASHBOARD],
      });
    }
    if (process.env.NEXT_PUBLIC_FEAT_MAP) {
      features.push({
        nodeId: 'smartPole',
        labelIcon: <DeviceIcon type={DeviceType.LAMP} />,
        labelText: tSubject(Subject.LIGHTMAP),
        link: subjectRoutes[Subject.LIGHTMAP],
        subjects: [Subject.LIGHTMAP],
      });
    }
    if (process.env.NEXT_PUBLIC_FEAT_INDOOR) {
      features.push({
        nodeId: 'indoor',
        labelIcon: <DeviceIcon type={DeviceType.BUILDING} />,
        labelText: t('common:Building'),
        link: subjectRoutes[Subject.INDOOR],
        subjects: [Subject.INDOOR],
      });
    }

    if (process.env.NEXT_PUBLIC_FEAT_SURVEILLANCE || process.env.NEXT_PUBLIC_FEAT_EVENTS) {
      const ivsItems = [];
      if (process.env.NEXT_PUBLIC_FEAT_SURVEILLANCE) {
        ivsItems.push({
          nodeId: 'ivsSurveillance',
          labelText: tSubject(Subject.IVS_SURVEILLANCE),
          link: subjectRoutes[Subject.IVS_SURVEILLANCE],
          subjects: [Subject.IVS_SURVEILLANCE],
        });
      }
      if (process.env.NEXT_PUBLIC_FEAT_EVENTS) {
        ivsItems.push({
          nodeId: 'ivsEvents',
          labelText: tSubject(Subject.IVS_EVENTS),
          link: subjectRoutes[Subject.IVS_EVENTS],
          subjects: [Subject.IVS_EVENTS],
        });
      }
      features.push({
        nodeId: 'ivs',
        labelIcon: <DeviceIcon type={DeviceType.CAMERA} />,
        labelText: t('mainLayout:IVS'),
        subjects: [Subject.IVS_SURVEILLANCE, Subject.IVS_EVENTS],
        subItems: ivsItems,
      });
    }

    if (process.env.NEXT_PUBLIC_FEAT_WIFI) {
      features.push({
        nodeId: 'wifi',
        labelIcon: <DeviceIcon type={DeviceType.WIFI} />,
        labelText: t('mainLayout:WIFI'),
        link: subjectRoutes[Subject.WIFI],
        subjects: [Subject.WIFI],
      });
    }

    if (process.env.NEXT_PUBLIC_FEAT_AUTOMATION) {
      const automationItems = [];
      automationItems.push(
        {
          nodeId: 'auditLog',
          labelText: t('mainLayout:Audit Log'),
          link: '/audit-log',
        },
        {
          nodeId: 'subscriptionSettings',
          labelText: t('mainLayout:Subscription Settings'),
          link: '/subscription-settings',
        },
        {
          nodeId: 'ruleManagement',
          labelText: tSubject(Subject.AUTOMATION_RULE_MANAGEMENT),
          link: subjectRoutes[Subject.AUTOMATION_RULE_MANAGEMENT],
          subjects: [Subject.AUTOMATION_RULE_MANAGEMENT],
        },
      );

      features.push({
        nodeId: 'automation',
        labelIcon: <AutomationIcon />,
        labelText: t('mainLayout:Automation'),
        subItems: automationItems,
      });
    }
    // Added by Shiger CHT, date:2022/05/28
    if (process.env.NEXT_PUBLIC_FEAT_ESIGNAGE) {
      features.push({
        nodeId: 'eSignage',
        labelIcon: <DeviceIcon type={DeviceType.DISPLAY} />,
        labelText: t('mainLayout:ESignage'),
        link: subjectRoutes[Subject.ESIGNAGE],
        subjects: [Subject.ESIGNAGE],
      });
    }

    return getViewableMenuItems(features, viewableSubjects);
  }, [t, tSubject, viewableSubjects]);

  const secondaryMenuItems = useMemo(
    () =>
      getViewableMenuItems(
        [
          {
            nodeId: 'abnormal',
            labelIcon: <DeviceIcon type={DeviceType.UNKNOWN} />,
            labelText: t('mainLayout:Abnormal Management'),
            subjects: [Subject.DEVICE],
            subItems: [
              {
                nodeId: 'abnormalManagement',
                labelText: t('mainLayout:Abnormal Management'),
                link: subjectRoutes[Subject.ABNORMAL_MANAGEMENT],
                subjects: [Subject.DEVICE],
              },
              // {
              //   nodeId: 'abnormalStaff',
              //   labelText: t('mainLayout:Maintenance Staff'),
              //   link: subjectRoutes[Subject.MAINTENANCE_STAFF],
              //   subjects: [Subject.DEVICE],
              // },
              {
                nodeId: 'abnormalInfo',
                labelText: t('mainLayout:Info'),
                link: subjectRoutes[Subject.INFO],
                subjects: [Subject.DEVICE],
              },
            ],
          },
          {
            nodeId: 'device',
            labelIcon: <DevicesIcon />,
            labelText: tSubject(Subject.DEVICE),
            link: subjectRoutes[Subject.DEVICE],
            subjects: [Subject.DEVICE],
          },
          {
            nodeId: 'recycle-bin',
            labelIcon: <RemoveIcon />,
            labelText: t('common:Recycle Bin'),
            link: subjectRoutes[Subject.RECYCLE_BIN],
            subjects: [Subject.DEVICE],
          },
          {
            nodeId: 'division',
            labelIcon: <DivisionIcon />,
            labelText: tSubject(Subject.GROUP),
            link: subjectRoutes[Subject.GROUP],
            subjects: [Subject.GROUP],
          },
          {
            nodeId: 'user',
            labelIcon: <UsersIcon />,
            labelText: tSubject(Subject.USER),
            link: subjectRoutes[Subject.USER],
            subjects: [Subject.USER],
          },
        ],
        viewableSubjects,
      ),
    [t, tSubject, viewableSubjects],
  );

  const tertiaryMenuItems = useMemo(() => {
    const features: MenuItemWithSubject[] = [
      {
        nodeId: 'role',
        labelIcon: <RoleIcon />,
        labelText: tSubject(Subject.ROLE_TEMPLATE),
        link: subjectRoutes[Subject.ROLE_TEMPLATE],
        subjects: [Subject.ROLE_TEMPLATE],
      },
      {
        nodeId: 'elasticSearch',
        labelIcon: <ElasticSearchIcon />,
        labelText: tSubject(Subject.ELASTIC_SEARCH),
        link: subjectRoutes[Subject.ELASTIC_SEARCH],
        subjects: [Subject.ELASTIC_SEARCH],
      },
    ];
    if (process.env.NODE_ENV === 'development') {
      features.push({
        nodeId: 'sample',
        labelIcon: <PageviewIcon style={{ marginBottom: '-6px', paddingRight: '2px' }} />,
        labelText: tSubject(Subject.SAMPLE),
        subItems: [
          // // 因為目前的網址判斷方式會致此為啟動狀態，所以暫時不顯示
          // {
          //   nodeId: 'sample-overview',
          //   labelText: t('mainLayout:Overview'),
          //   link: `${subjectRoutes[Subject.SAMPLE]}`,
          // },
          {
            nodeId: 'sample-theme',
            labelText: t('mainLayout:Theme'),
            link: `${subjectRoutes[Subject.SAMPLE]}/theme`,
          },
          {
            nodeId: 'sample-components',
            labelText: t('mainLayout:Component'),
            link: `${subjectRoutes[Subject.SAMPLE]}/components`,
          },
        ],
      });
    }
    return getViewableMenuItems(features, viewableSubjects);
  }, [t, tSubject, viewableSubjects]);

  const scrollHandler = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
      console.log({ scrollHeight, scrollTop, clientHeight });
      // if (scrollHeight - scrollTop === clientHeight) {
      //   // do something at end of scroll
      //   if (onBottom) {
      //     onBottom();
      //   }
      // }
      const percent = Math.round(((clientHeight + scrollTop) / scrollHeight) * 100);
      if (scrollPercent) {
        scrollPercent(percent);
      }
      if (percent === 100 && onBottom) {
        onBottom();
      }
    },
    [onBottom, scrollPercent],
  );

  return (
    <Auth>
      <div className={classes.root}>
        <AppBar position="fixed" color="inherit" className={classes.appBar} elevation={8}>
          <Toolbar disableGutters className={classes.toolbar}>
            <IconButton
              disableRipple
              className={classes.menuButton}
              classes={{
                colorPrimary: classes.menuButtonActive,
              }}
              color={isExpanded ? 'primary' : 'inherit'}
              aria-label={t('common:Menu')}
              onClick={handleMenuClick}
            >
              <MenuIcon />
            </IconButton>
            <Logo className={classes.brand} />
            <PermissionSelector />
            <div className={classes.rightMenu}>
              {Object.keys(download).length !== 0 && <DownloadStatusButton />}
              <Button
                variant="text"
                size="small"
                className={classes.profile}
                onClick={handleProfileClick}
              >
                <Typography variant="body2" className={classes.username}>
                  {profile?.name || t('mainLayout:User')}
                </Typography>
              </Button>
            </div>
            <ProfileMenu anchorEl={anchorEl} onClose={handleProfileClose} />
          </Toolbar>
        </AppBar>

        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          PaperProps={{
            elevation: 24,
          }}
        >
          <Toolbar />
          <NestedList
            isExpanded={isExpanded}
            onToggle={handleMenuToggle}
            classes={{ root: classes.nestedList }}
          >
            {primaryMenuItems}
            <div className={classes.space} />
            <Toolbar />
            {secondaryMenuItems.length > 0 && (
              <>
                <Divider variant="middle" />
                {secondaryMenuItems}
                <Divider variant="middle" />
              </>
            )}
            {tertiaryMenuItems.length > 0 && (
              <>
                {tertiaryMenuItems}
                <Divider variant="middle" />
              </>
            )}
          </NestedList>
        </Drawer>
        <div className={classes.content}>
          <Toolbar />
          <div ref={containerRef} className={classes.container} onScroll={scrollHandler}>
            {children}
          </div>
          <ScrollToTop containerRef={containerRef.current} />
        </div>
      </div>
    </Auth>
  );
};

export default MainLayout;
