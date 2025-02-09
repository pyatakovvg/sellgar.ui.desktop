import React from 'react';

export interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: React.FC<React.PropsWithChildren<IProps>> = (props) => {
  return <button {...props} role={'button'} />;
};
