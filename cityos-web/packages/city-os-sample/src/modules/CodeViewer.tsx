import React, { VoidFunctionComponent, memo, useMemo } from 'react';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import beautify from 'js-beautify';
import darkTheme from 'react-syntax-highlighter/dist/cjs/styles/prism/material-dark';
import lightTheme from 'react-syntax-highlighter/dist/cjs/styles/prism/material-light';

import TextCopyButton from './TextCopyButton';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
  copyBtn: {
    position: 'absolute',
    top: 8,
    right: 0,
    color: theme.palette.primary.main,
  },
}));

interface CodeViewerProps {
  format?: boolean;
  language?: string;
  highlight?: boolean;
  copy?: boolean;
  wrapLines?: boolean;
  showLineNumbers?: boolean;
  code: string;
}

const CodeViewer: VoidFunctionComponent<CodeViewerProps> = (props: CodeViewerProps) => {
  const {
    highlight = false,
    format = false,
    language = 'typescript',
    copy = false,
    wrapLines = true,
    showLineNumbers = false,
    code = '',
  } = props;

  const classes = useStyles();
  const theme = useTheme();

  const style = useMemo(() => (theme.palette.type === 'dark' ? darkTheme : lightTheme), [
    theme.palette.type,
  ]);

  const content = useMemo<string>(
    () => (format ? beautify(code, { indent_size: 2, space_in_empty_paren: true }) : code),
    [code, format],
  );

  return (
    <div className={classes.root}>
      {highlight ? (
        <SyntaxHighlighter
          language={language}
          style={style}
          lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
          wrapLines={wrapLines}
          showLineNumbers={showLineNumbers}
          customStyle={{ borderRadius: '0.25em' }}
        >
          {content}
        </SyntaxHighlighter>
      ) : (
        <code>{content}</code>
      )}
      {copy && <TextCopyButton text={content} classes={{ root: classes.copyBtn }} />}
    </div>
  );
};

export default memo(CodeViewer);
