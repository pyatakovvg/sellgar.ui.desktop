import React from 'react';

export interface IProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export const Link: React.FC<React.PropsWithChildren<IProps>> = (props) => {
  return <a {...props} role={'button'} />;
};
