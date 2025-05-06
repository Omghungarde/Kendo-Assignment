import { DataResult } from "@progress/kendo-data-query";

export interface Column {
    field: string;
    title: string;
    width?: number;
    editable?: boolean;
  }
  // grid-preference.model.ts
export interface GridPreference {
  id?: number; // for JSON Server
  name: string;
  sort: any[];
  columns: { field: string, orderIndex: number }[];
  state: any;
}
export interface GridSettings {
  name: string;
  state: {
    skip: number;
    take: number;
    sort?: any;
    filter?: any;
    group?: any;
  };
  columnsConfig: ColumnSetting[];
}

export interface ColumnSetting {
  field?: string;
  title?: string;
  hidden?: boolean;
  width?: number;
  orderIndex: number;
}
export interface GridSettingsWithData extends GridSettings {
  gridData: DataResult;
}