export interface StorefrontFieldInput {
  propertyCode: string;
  sortOrder: number;
  property: {
    name: string;
    kind: 'TEXT' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'DATE' | 'OPTIONS';
    unitCode: string | null;
    options: Array<{
      code: string;
      name: string;
      sortOrder: number;
      extras: Array<{
        type: 'TEXT' | 'COLOR' | 'IMAGE';
        sortOrder: number;
        textDisplay: 'TEXT' | 'ICON' | null;
        valueText: string | null;
        valueColor: string | null;
        imageUuid: string | null;
        imageUrl?: string;
      }>;
    }>;
  };
  values: Array<{
    valueText: string | null;
    valueInteger: string | null;
    valueDecimal: string | null;
    valueBoolean: boolean | null;
    valueDate: string | null;
    valueOptionCode: string | null;
  }>;
}
