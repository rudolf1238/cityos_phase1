/* eslint-disable no-nested-ternary */
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import StatusChip from './StatusChip';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginBottom: theme.spacing(4),
  },

  titleArea: {
    flexShrink: 0,

    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },

  backLink: {
    marginLeft: theme.spacing(-2.5),
    fontSize: theme.typography.body1.fontSize,
  },

  title: {
    color: theme.palette.pageContainer.title,
  },

  description: {
    paddingTop: theme.spacing(1),
  },
}));

interface HeaderProps {
  title?: string;
  description?: string;
  backLinkText?: string;
  backLinkHref?: string;
  classes?: {
    root?: string;
    titleArea?: string;
  };
  status?: string;
}

const Header: FunctionComponent<HeaderProps> = ({
  title,
  status,
  description,
  backLinkText,
  backLinkHref,
  classes: customClasses,
  children,
}: PropsWithChildren<HeaderProps>) => {
  const classes = useStyles();
  const router = useRouter();

  return (
    <div className={clsx(classes.header, customClasses?.root)}>
      <div className={clsx(classes.titleArea, customClasses?.titleArea)}>
        {backLinkText && backLinkHref && (
          <Button
            disableRipple
            className={classes.backLink}
            onClick={() => {
              void router.push(backLinkHref);
            }}
          >
            {'< '}
            {backLinkText}
          </Button>
        )}
        <Typography variant="h3">
          {title || ''}
          {status ? (
            <StatusChip
              label={status}
              color={
                status === 'PROCESSING'
                  ? 'repair'
                  : status === 'DONE'
                  ? 'done'
                  : status === 'ERROR'
                  ? 'error'
                  : 'none'
              }
            />
          ) : null}
        </Typography>
        {description && (
          <Typography variant="body2" color="textSecondary" className={classes.description}>
            {description}
          </Typography>
        )}
      </div>
      {children}
    </div>
  );
};

export default Header;
