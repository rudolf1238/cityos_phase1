import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, {
  ChangeEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import AddIcon from '@material-ui/icons/Add';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import { DeviceType } from 'city-os-common/libs/schema';
import useDeviceTranslation from 'city-os-common/hooks/useDeviceTranslation';

import BasicSearchField from 'city-os-common/modules/BasicSearchField';
import InfoIcon from 'city-os-common/assets/icon/info.svg';

import { BasicGadgetInfo, GadgetSize, GadgetType } from '../../libs/type';
import useDashboardTranslation from '../../hooks/useDashboardTranslation';
import useGetGadgetInfoList from '../../hooks/useGetGadgetBasicInfoList';

import GadgetImage from '../GadgetImage';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    gap: theme.spacing(4),
    alignItems: 'stretch',
    height: '100%',
  },

  sidebar: {
    flexShrink: 0,
    width: 240,

    [theme.breakpoints.down('sm')]: {
      width: 170,
    },

    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },

  gadgetList: {
    flex: 1,
    overflow: 'auto',
  },

  gridContainer: {
    margin: 0,
    width: '100%',
  },

  searchField: {
    marginTop: theme.spacing(1),
    width: '100%',
  },

  categories: {
    margin: theme.spacing(2, 0),
  },

  listItem: {
    padding: theme.spacing(1, 0),

    '&::after': {
      display: 'none',
    },

    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  avatar: {
    backgroundColor: theme.palette.gadget.counter,
    width: 28,
    height: 28,
  },

  listItemText: {
    color: theme.palette.info.main,
  },

  selected: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.h1.fontWeight,
  },

  gadgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing(1),
  },

  gadgetCard: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    border: `1px solid ${theme.palette.gadget.frame}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.container,
    width: '100%',
    height: 215,
  },

  imgWrapper: {
    padding: theme.spacing(1, 8),

    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(1, 15),
    },
  },

  info: {
    position: 'absolute',
    right: theme.spacing(1),
    bottom: theme.spacing(1),
  },

  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: theme.zIndex.modal,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.mask,
    padding: theme.spacing(3),
    width: '100%',
    height: '100%',
    overflow: 'auto',
    color: theme.palette.info.contrastText,

    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },

    '& > p': {
      lineHeight: theme.typography.body1.lineHeight,
    },
  },

  buttonText: {
    textTransform: 'none',
  },
}));

interface CategoryRecord {
  type: DeviceType | 'ALL' | 'OTHERS';
  count: number;
}

interface GadgetCatalogProps {
  open: boolean;
  onSelect: (type: GadgetType) => void;
}

const GadgetCatalog: VoidFunctionComponent<GadgetCatalogProps> = ({
  open,
  onSelect,
}: GadgetCatalogProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('xs'));
  const { t } = useDashboardTranslation(['common', 'dashboard', 'mainLayout']);
  const { tDevice } = useDeviceTranslation();

  const [typingWord, setTypingWord] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [infoType, setInfoType] = useState<GadgetType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DeviceType | 'ALL' | 'OTHERS'>('ALL');

  const handleSearch = useCallback((searchWord: string | null) => {
    setSelectedCategory('ALL');
    setKeyword(searchWord);
  }, []);

  const handleChangeSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setTypingWord(e.target.value),
    [],
  );

  const handleClearSearch = useCallback(() => {
    setKeyword(null);
    setTypingWord(null);
  }, []);

  const handleSelectCategory = useCallback(
    (type: DeviceType | 'ALL' | 'OTHERS') => {
      handleClearSearch();
      setSelectedCategory(type);
    },
    [handleClearSearch],
  );

  const handleShowInfo = useCallback((gadgetType: GadgetType) => {
    setInfoType(gadgetType);
  }, []);

  const handleHideInfo = useCallback(
    (type?: GadgetType) => {
      if (type === infoType || !type) {
        setInfoType(null);
      }
    },
    [infoType],
  );

  const handleSelect = useCallback(
    (type: GadgetType) => {
      onSelect(type);
    },
    [onSelect],
  );

  const getListItemText = useCallback(
    (type: DeviceType | 'ALL' | 'OTHERS'): string => {
      if (type === 'ALL') return t('common:All');
      if (type === 'OTHERS') return t('dashboard:Others');
      return tDevice(type);
    },
    [t, tDevice],
  );

  const gadgetInfoList = useGetGadgetInfoList();

  const gadgets = useMemo<BasicGadgetInfo[]>(
    () =>
      gadgetInfoList.filter(({ name, deviceType }) => {
        if (selectedCategory === 'ALL' && !keyword) return true;
        return (
          selectedCategory === deviceType ||
          (!deviceType && selectedCategory === 'OTHERS') ||
          (keyword && name.toLowerCase().includes(keyword.trim().toLowerCase()))
        );
      }),
    [keyword, gadgetInfoList, selectedCategory],
  );

  const categories = useMemo<CategoryRecord[]>(() => {
    const all: CategoryRecord[] = [{ type: 'ALL', count: gadgetInfoList.length }];
    const others: CategoryRecord[] = [
      {
        type: 'OTHERS',
        count: gadgetInfoList.filter(({ deviceType }) => deviceType === undefined).length,
      },
    ];
    const deviceTypes: CategoryRecord[] = (Object.keys(DeviceType) as DeviceType[])
      .map((type) => ({
        type,
        count: gadgetInfoList.filter(({ deviceType }) => deviceType === type).length,
      }))
      .filter(({ count }) => count > 0);
    return all.concat(deviceTypes, others);
  }, [gadgetInfoList]);

  useEffect(() => {
    if (!open) {
      handleHideInfo();
      handleClearSearch();
      setSelectedCategory('ALL');
    }
  }, [handleClearSearch, handleHideInfo, open]);

  return (
    <div className={classes.container}>
      <div className={classes.sidebar}>
        <BasicSearchField
          placeholder={t('common:Type something')}
          label={t('common:Search')}
          value={typingWord ?? ''}
          size="small"
          className={classes.searchField}
          onChange={handleChangeSearch}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          InputProps={{ margin: 'none' }}
          InputLabelProps={{ shrink: true }}
        />
        <div className={classes.categories}>
          <Typography variant="caption">{t('dashboard:CATEGORIES')}</Typography>
          <List aria-label={t('dashboard:CATEGORIES')}>
            {categories.map(({ type, count }) => (
              <ListItem
                key={type}
                dense
                button
                disableGutters
                className={classes.listItem}
                onClick={() => {
                  handleSelectCategory(type);
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant={selectedCategory === type ? 'subtitle2' : 'body2'}>
                      {getListItemText(type)}
                    </Typography>
                  }
                  className={clsx(classes.listItemText, {
                    [classes.selected]: selectedCategory === type,
                  })}
                />
                <Avatar className={classes.avatar}>
                  <Typography variant="subtitle2">{count}</Typography>
                </Avatar>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
      <div className={classes.gadgetList}>
        <Grid container spacing={2} className={classes.gridContainer}>
          {gadgets.map(({ name, type, description, size }) => (
            <Grid item xs={12} sm={12} md={12} lg={6} key={type}>
              <div className={classes.gadgetHeader}>
                <Typography variant={xsDown ? 'subtitle1' : 'h6'}>{name}</Typography>
                <Button
                  startIcon={<AddIcon />}
                  classes={{
                    text: classes.buttonText,
                  }}
                  onClick={() => {
                    handleSelect(type);
                  }}
                >
                  {t('dashboard:Add to dashboard')}
                </Button>
              </div>
              <ClickAwayListener
                onClickAway={() => {
                  handleHideInfo(type);
                }}
              >
                <Button
                  className={classes.gadgetCard}
                  classes={{ text: classes.buttonText }}
                  onClick={() => {
                    handleShowInfo(type);
                  }}
                >
                  <Fade in={infoType === type}>
                    <div className={classes.mask}>
                      <Typography variant="body2" align="left">
                        {description}
                      </Typography>
                    </div>
                  </Fade>
                  {size === GadgetSize.DEFAULT ? (
                    <div className={classes.imgWrapper}>
                      <GadgetImage type={type} size={size} />
                    </div>
                  ) : (
                    <GadgetImage type={type} size={size} />
                  )}
                  <InfoIcon className={classes.info} />
                </Button>
              </ClickAwayListener>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default memo(GadgetCatalog);
