import { makeStyles } from '@material-ui/core/styles';
import React, {
  FunctionComponent,
  HTMLAttributes,
  PropsWithChildren,
  RefObject,
  UIEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import useCommonTranslation from '../hooks/useCommonTranslation';

const useStyles = makeStyles(() => ({
  root: {
    overflowY: 'auto',
  },
}));

interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  onBottomHit: () => void;
  isLoading: boolean;
  hasMoreData: boolean;
}

const isBottom = (ref: RefObject<HTMLDivElement>) =>
  ref.current && ref.current.getBoundingClientRect().bottom <= window.innerHeight;

const InfiniteScroll: FunctionComponent<InfiniteScrollProps> = ({
  onBottomHit,
  isLoading,
  hasMoreData,
  children,
  ...props
}: PropsWithChildren<InfiniteScrollProps>) => {
  const { t } = useCommonTranslation('common');
  const classes = useStyles();
  const [initialLoad, setInitialLoad] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const onScroll: UIEventHandler = useCallback(() => {
    if (!isLoading && hasMoreData && isBottom(contentRef)) {
      onBottomHit();
    }
  }, [hasMoreData, isLoading, onBottomHit]);

  useEffect(() => {
    if (initialLoad) {
      onBottomHit();
      setInitialLoad(false);
    }
  }, [hasMoreData, initialLoad, isLoading, onBottomHit]);

  return (
    <div
      aria-label={t('Load More')}
      className={classes.root}
      ref={contentRef}
      onScroll={onScroll}
      style={props.style}
    >
      {children}
    </div>
  );
};

export default InfiniteScroll;
