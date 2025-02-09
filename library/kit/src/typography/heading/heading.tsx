import React from 'react';

import cn from 'classnames';
import s from './default.module.scss';

interface IProps {
  variant?: 'h2' | 'h3' | 'h4' | 'h5';
  className?: string;
}

export const Heading: React.FC<React.PropsWithChildren<IProps>> = ({ variant, ...props }) => {
  return React.Children.map(props.children, (child) => {
    const childElement = child as React.ReactHTMLElement<any>;
    const className = cn(s.wrapper, props.className, childElement.props?.className, {
      [s['variant--h2']]: variant === 'h2',
      [s['variant--h3']]: variant === 'h3',
      [s['variant--h4']]: variant === 'h4',
      [s['variant--h5']]: variant === 'h5',
    });

    if (React.isValidElement(child)) {
      return React.cloneElement(childElement, {
        className,
      });
    }
    return <h1 className={s.wrapper}>{child}</h1>;
  });
};
