import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import clsx from 'clsx';

import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },

  content: {
    flexGrow: 1,
    padding: theme.spacing(5, 0),
  },

  footer: {
    zIndex: theme.zIndex.appBar,
    height: 60,
    textAlign: 'center',
  },
}));

interface PageWithFooterProps {
  classes?: Partial<Record<'root' | 'content' | 'footer', string>>;
}

const PageWithFooter: FunctionComponent<PageWithFooterProps> = ({
  classes: customClasses,
  children,
}: PropsWithChildren<PageWithFooterProps>) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, customClasses?.root)}>
      <div className={clsx(classes.content, customClasses?.content)}>{children}</div>
      <div className={clsx(classes.footer, customClasses?.footer)}>
        <Typography variant="body2" color="textSecondary">
          {process.env.NEXT_PUBLIC_FOOTER}
        </Typography>
      </div>
    </div>
  );
};

export default PageWithFooter;
