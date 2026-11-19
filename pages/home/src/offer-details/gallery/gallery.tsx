import React from 'react';

import { Button, Image, Typography } from '@sellgar/kit';
import { ArrowLeftSLineIcon, ArrowRightSLineIcon } from '@sellgar/kit/icons';

import type { StoreOfferEntity } from '@library/domain';

import { getInitials } from '../../formatter/offer.formatter.ts';
import s from './default.module.css';

interface IProps {
  images: StoreOfferEntity['variant']['images'];
  name: string;
}

export const Gallery: React.FC<IProps> = (props) => {
  const [index, setIndex] = React.useState(0);
  const images = props.images.filter((image) => image.imageUrl).toSorted((left, right) => left.order - right.order);
  const image = images[index];

  return (
    <section className={s.wrapper} aria-label="Галерея товара">
      <div className={s.preview} role="img" aria-label={props.name}>
        {image ? (
          <Image src={image.imageUrl} height={384} fit="contain" aria-hidden={true} />
        ) : (
          <Typography size="h4" weight="medium">
            <span className={s.placeholder}>{getInitials(props.name)}</span>
          </Typography>
        )}
      </div>
      {images.length > 1 ? (
        <div className={s.navigation}>
          <Button.Icon
            style="secondary"
            size="sm"
            aria-label="Предыдущее изображение"
            leadIcon={<ArrowLeftSLineIcon />}
            onClick={() => setIndex((value) => (value - 1 + images.length) % images.length)}
          />
          <Typography size="caption-m" weight="regular">
            <span className={s.position} aria-live="polite">
              {index + 1} / {images.length}
            </span>
          </Typography>
          <Button.Icon
            style="secondary"
            size="sm"
            aria-label="Следующее изображение"
            leadIcon={<ArrowRightSLineIcon />}
            onClick={() => setIndex((value) => (value + 1) % images.length)}
          />
        </div>
      ) : null}
    </section>
  );
};
