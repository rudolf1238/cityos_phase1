import { makeStyles } from '@material-ui/core/styles';

const useHiddenStyles = makeStyles((theme) => ({
  hidden: {
    display: 'none !important',
  },

  lgUpHidden: {
    [theme.breakpoints.up('lg')]: {
      display: 'none !important',
    },
  },

  mdUpHidden: {
    [theme.breakpoints.up('md')]: {
      display: 'none !important',
    },
  },

  mdDownHidden: {
    [theme.breakpoints.down('md')]: {
      display: 'none !important',
    },
  },

  smUpHidden: {
    [theme.breakpoints.up('sm')]: {
      display: 'none !important',
    },
  },

  smDownHidden: {
    [theme.breakpoints.down('sm')]: {
      display: 'none !important',
    },
  },

  xsUpHidden: {
    [theme.breakpoints.up('xs')]: {
      display: 'none !important',
    },
  },

  xsDownHidden: {
    [theme.breakpoints.down('xs')]: {
      display: 'none !important',
    },
  },
}));

export default useHiddenStyles;
