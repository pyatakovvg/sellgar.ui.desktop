import React from 'react';

import cn from 'classnames';
import s from './default.module.scss';

interface IProps {
  variant?: 'compact';
  className?: string;
}

export const Link: React.FC<React.PropsWithChildren<IProps>> = ({ variant, ...props }) => {
  return React.Children.map(props.children, (child) => {
    const childElement = child as React.ReactHTMLElement<any>;
    const className = cn(s.wrapper, props.className, childElement.props?.className);

    if (React.isValidElement(child)) {
      return React.cloneElement(childElement, {
        className,
      });
    }
    return <span className={s.wrapper}>{child}</span>;
  });
};
