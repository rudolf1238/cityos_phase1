import { memo } from 'react';

import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const ThemeLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: theme.spacing(1.125),
      borderRadius: theme.spacing(0.5625),
    },
    colorPrimary: {
      backgroundColor:
        theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    bar: {
      borderRadius: 5,
      backgroundColor: theme.palette.primary.main,
    },
  }),
)(LinearProgress);

export default memo(ThemeLinearProgress);
