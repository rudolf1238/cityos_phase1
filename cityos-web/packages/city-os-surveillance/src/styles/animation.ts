import { makeStyles } from '@material-ui/core/styles';

import { highlightDuration } from '../libs/constants';

const useAnimationStyles = makeStyles((theme) => ({
  highlight: {
    animation: `$borderFadeOut ${highlightDuration}s ${theme.transitions.easing.easeInOut}`,
  },

  '@keyframes borderFadeOut': {
    from: {
      borderColor: theme.palette.secondary.main,
    },

    to: {
      borderColor: 'transparent',
    },
  },
}));

export default useAnimationStyles;
