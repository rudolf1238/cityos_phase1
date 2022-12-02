import React, {
  ComponentProps,
  FunctionComponent,
  PropsWithChildren,
  cloneElement,
  memo,
  useCallback,
  useRef,
  useState,
} from 'react';

import Tooltip from '@material-ui/core/Tooltip';

type OverflowTooltipProps = ComponentProps<typeof Tooltip>;

const OverflowTooltip: FunctionComponent<OverflowTooltipProps> = ({
  children,
  ...props
}: PropsWithChildren<OverflowTooltipProps>) => {
  const contentRef = useRef<HTMLElement | null>(null);

  const [openTooltip, setOpenTooltip] = useState(false);

  const childrenProps = { ...(children.props as Record<string, unknown>), ref: contentRef };

  const onOpen = useCallback(() => {
    const contentNode = contentRef.current;
    if (!contentNode) return;

    const { width } = contentNode.getBoundingClientRect();

    const range = document.createRange();
    range.setStart(contentNode, 0);
    range.setEnd(contentNode, contentNode.childNodes.length);
    const { width: contentWidth } = range.getBoundingClientRect();

    if (contentWidth > width) {
      setOpenTooltip(true);
    }
  }, []);

  const onClose = useCallback(() => {
    setOpenTooltip(false);
  }, []);

  return (
    <Tooltip
      open={openTooltip}
      onOpen={onOpen}
      onClose={onClose}
      interactive
      enterDelay={500}
      classes={{
        ...props.classes,
        tooltip: props.classes?.tooltip,
      }}
      {...props}
    >
      {cloneElement(children, childrenProps)}
    </Tooltip>
  );
};

export default memo(OverflowTooltip);
