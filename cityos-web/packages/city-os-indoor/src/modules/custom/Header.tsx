import React, { FunctionComponent, PropsWithChildren } from 'react';

import { useRouter } from 'next/router';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  backLink: {
    marginLeft: theme.spacing(-2.5),
    fontSize: theme.typography.body1.fontSize,
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
}

const Header: FunctionComponent<HeaderProps> = ({
  title,
  description,
  backLinkText,
  backLinkHref,
}: PropsWithChildren<HeaderProps>) => {
  const classes = useStyles();
  const router = useRouter();

  return (
    <Grid>
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
      <Typography variant="h3" component="div" gutterBottom noWrap>
        {title || ''}
      </Typography>
      {description && (
        <Typography variant="body2" color="textSecondary" className={classes.description}>
          {description}
        </Typography>
      )}
    </Grid>
  );
};

export default Header;
