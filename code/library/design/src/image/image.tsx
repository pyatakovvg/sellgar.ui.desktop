'use client';

import cn from 'classnames';
import NextImage from 'next/image';
import React from 'react';

import { Animate } from '@sellgar/kit';
import { ImageLineIcon, Loader4LineIcon } from '@sellgar/kit/icons';

import s from './default.module.css';

interface IProps extends Omit<
  React.ComponentProps<typeof NextImage>,
  'fill' | 'width' | 'height' | 'className' | 'style' | 'ref'
> {
  fit?: 'contain' | 'cover';
  sizes: string;
}

export const Image: React.FC<IProps> = (props) => {
  const { fit = 'contain', onLoad, onError, ...imageProps } = props;
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const imageKey =
    typeof props.src === 'string' ? props.src : 'default' in props.src ? props.src.default.src : props.src.src;
  const imageClassName = cn(s.image, s[`fit--${fit}`], { [s.failed]: status === 'error' });
  const imageRef = React.useCallback((image: HTMLImageElement | null) => {
    if (image === null) return;

    setStatus(image.complete ? (image.naturalWidth > 0 ? 'loaded' : 'error') : 'loading');
  }, []);

  return (
    <span className={s.wrapper} aria-busy={status === 'loading'} aria-hidden={props['aria-hidden']}>
      <NextImage
        {...imageProps}
        key={imageKey}
        ref={imageRef}
        fill={true}
        className={imageClassName}
        onLoad={(event) => {
          setStatus('loaded');
          onLoad?.(event);
        }}
        onError={(event) => {
          setStatus('error');
          onError?.(event);
        }}
      />
      {status === 'loading' && (
        <span className={s.loading} role="status" aria-label="Загрузка изображения">
          <Animate.Spin>
            <Loader4LineIcon />
          </Animate.Spin>
        </span>
      )}
      {status === 'error' && (
        <span className={s.error} role="img" aria-label="Не удалось загрузить изображение">
          <ImageLineIcon />
        </span>
      )}
    </span>
  );
};
