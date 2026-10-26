'use client';
import React from 'react';
import { Radio } from '@sellgar/kit';
import type { StoreAccountingRecordEntity } from '@library/domain';
import { getClarifications } from '../../formatter/offer.formatter.ts';
import s from './default.module.scss';
interface IProps {
  records: StoreAccountingRecordEntity[];
}
export const Records: React.FC<IProps> = (props) => {
  const records = props.records;
  const [choice, setChoice] = React.useState<string | null>(null);
  const groupId = React.useId();
  const selectedUuid = records.find((record) => record.uuid === choice)?.uuid ?? records[0]?.uuid;
  if (records.length === 1) return null;
  return (
    <section className={s.wrapper}>
      {records.length > 0 ? (
        <fieldset className={s.options}>
          <legend className={s.legend}>Выберите исполнение</legend>
          {records.map((record) => (
            <div key={record.uuid} className={s.option}>
              <Radio
                name={groupId}
                value={record.uuid}
                checked={selectedUuid === record.uuid}
                onChange={() => setChoice(record.uuid)}
                label={record.clarifications.length > 0 ? getClarifications(record).join(' · ') : 'Без уточнений'}
                caption={record.article}
              />
              <span className={s.stock}>В наличии: {record.inventory.available}</span>
            </div>
          ))}
        </fieldset>
      ) : (
        <p className={s.hint}>Нет в наличии</p>
      )}
    </section>
  );
};
