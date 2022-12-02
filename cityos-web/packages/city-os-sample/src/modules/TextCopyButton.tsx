import React, { VoidFunctionComponent, memo } from 'react';

import DoneIcon from '@material-ui/icons/Done';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import IconButton from '@material-ui/core/IconButton';

interface TextCopyButtonProps {
  text: string;
  classes?: {
    root?: string;
    icon?: string;
  };
}

const TextCopyButton: VoidFunctionComponent<TextCopyButtonProps> = (props: TextCopyButtonProps) => {
  const { text = '', classes } = props;

  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  return (
    <IconButton
      className={classes?.root}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 1000);
        });
      }}
    >
      {isCopied ? (
        <DoneIcon className={classes?.icon} fontSize="small" />
      ) : (
        <FileCopyIcon className={classes?.icon} fontSize="small" />
      )}
    </IconButton>
  );
};

export default memo(TextCopyButton);
