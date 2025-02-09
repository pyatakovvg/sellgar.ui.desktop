import React from 'react';

import { Text } from '../../typography';

import { Link as LinkVariant, type IProps as IPropsLink } from './variants/link';
import { Button as ButtonVariant, type IProps as IPropsButton } from './variants/button';

import cn from 'classnames';
import s from './default.module.scss';

interface IProps {
  variant?: 'button' | 'link';
}

type VariantProps = IProps & (IPropsButton | IPropsLink);

export const Button: React.FC<React.PropsWithChildren<VariantProps>> = ({ variant, className, children, ...props }) => {
  const classNameButton = React.useMemo(() => cn(s.wrapper, className), [className]);

  if (variant === 'link') {
    return (
      <LinkVariant className={classNameButton} {...(props as IPropsLink)}>
        <Text className={s.content}>
          <span>{children}</span>
        </Text>
      </LinkVariant>
    );
  }
  return (
    <ButtonVariant className={classNameButton} {...(props as IPropsButton)}>
      <Text className={s.content}>
        <span>{children}</span>
      </Text>
    </ButtonVariant>
  );
};
