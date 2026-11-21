import React from 'react';

import { Link } from '@sellgar/app/next';
import { ToolTip, Typography } from '@sellgar/kit';

import { Image } from '@library/design';
import type { StoreOfferEntity } from '@library/domain';

import s from './default.module.css';

interface IProps {
  offer: StoreOfferEntity;
  active: boolean;
}

export const Variant: React.FC<IProps> = (props) => {
  const image = props.offer.variant.images[0];

  return (
    <ToolTip placement="top" size="sm">
      <ToolTip.Trigger>
        <span>
          <Link
            className={s.wrapper}
            href={`/offers/${props.offer.uuid}`}
            aria-label={props.offer.variant.name}
            aria-current={props.active ? 'page' : undefined}
          >
            {image ? (
              <span className={s.image}>
                <Image src={image.imageUrl} sizes="72px" alt="" aria-hidden={true} />
              </span>
            ) : (
              <Typography size="caption-m" weight="medium">
                <span className={s.name}>{props.offer.variant.name}</span>
              </Typography>
            )}
          </Link>
        </span>
      </ToolTip.Trigger>
      <ToolTip.Content>
        <ToolTip.Content.Label>{props.offer.variant.name}</ToolTip.Content.Label>
      </ToolTip.Content>
    </ToolTip>
  );
};
