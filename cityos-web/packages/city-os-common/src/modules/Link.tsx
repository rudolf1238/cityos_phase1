import MuiLink, { LinkProps as MuiLinkProps } from '@material-ui/core/Link';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import React, { ForwardRefRenderFunction, PropsWithChildren, Ref, forwardRef } from 'react';

type LinkProps = Omit<MuiLinkProps, 'href' | 'classes'> &
  Pick<NextLinkProps, 'href' | 'as' | 'prefetch'>;

const Link: ForwardRefRenderFunction<HTMLAnchorElement, LinkProps> = (
  { href, as, prefetch, ...props }: PropsWithChildren<LinkProps>,
  ref: Ref<HTMLAnchorElement>,
) => (
  <NextLink href={href} as={as} prefetch={prefetch} passHref>
    <MuiLink ref={ref} {...props} />
  </NextLink>
);

export default forwardRef<HTMLAnchorElement, LinkProps>(Link);
