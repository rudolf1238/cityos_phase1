import { makeStyles } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useCallback, useEffect, useState } from 'react';

import useCommonTranslation from '../hooks/useCommonTranslation';

import GoUpIcon from '../assets/icon/go-up.svg';
import ThemeIconButton from './ThemeIconButton';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    right: theme.spacing(3),
    bottom: theme.spacing(14),
  },
}));

interface ScrollToTopProps {
  containerRef?: HTMLElement | null;
}

const ScrollToTop: VoidFunctionComponent<ScrollToTopProps> = ({
  containerRef,
}: ScrollToTopProps) => {
  const classes = useStyles();
  const { t } = useCommonTranslation('common');
  const [showScroll, setShowScroll] = useState<boolean>(false);

  const shouldShowScroll = useCallback(() => {
    if (!containerRef) return;
    if (containerRef.scrollTop > 100) {
      setShowScroll(true);
    } else {
      setShowScroll(false);
    }
  }, [containerRef]);

  const scrollUpward = useCallback(() => {
    if (!containerRef) return;
    containerRef.scrollTo({ top: 0, behavior: 'smooth' });
  }, [containerRef]);

  useEffect(() => {
    if (!containerRef) return () => {};
    containerRef.addEventListener('scroll', shouldShowScroll);

    return () => {
      containerRef.removeEventListener('scroll', shouldShowScroll);
    };
  }, [containerRef, shouldShowScroll]);

  return showScroll ? (
    <ThemeIconButton
      aria-label={t('Scroll to top')}
      disableRipple
      color="primary"
      className={classes.root}
      onClick={scrollUpward}
    >
      <GoUpIcon />
    </ThemeIconButton>
  ) : null;
};

export default ScrollToTop;
