export interface AccountingRecordInput {
  uuid: string;
  article: string;
  clarifications: Array<{ position: number; value: string }>;
  inventory: { recordUuid: string; available: number };
}
