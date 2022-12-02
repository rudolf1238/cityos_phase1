import { Theme, makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent, PropsWithChildren } from 'react';

interface StyledTextProps {
  color?: string;
  contained?: boolean;
  border?: boolean;
}

const useStyles = makeStyles<Theme, StyledTextProps>((theme) => ({
  styledText: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
    border: ({ border, color }) => `1px solid ${(border ? color : '') || 'transparent'}`,
    borderRadius: 30,
    backgroundColor: ({ contained, color }) => (contained ? color : '') || 'transparent',
    padding: theme.spacing(1.75, 2.75),
    width: '100%',
    maxWidth: theme.spacing(200),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: ({ contained, color }) =>
      contained && color ? theme.palette.primary.contrastText : color,
  },
}));

const StyledText: FunctionComponent<StyledTextProps> = ({
  children,
  ...props
}: PropsWithChildren<StyledTextProps>) => {
  const classes = useStyles(props);
  return <span className={classes.styledText}>{children}</span>;
};

export default StyledText;
