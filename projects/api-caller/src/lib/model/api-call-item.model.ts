export type MilliSeconds = number;
export type FieldName = string;

export interface ApiCallItem {
  path: string;
  api?: string;
  payload?: any;
  needsAuth?: boolean;
  useCache?: boolean;
  cacheTimeout?: MilliSeconds;
  binaryUpload?: FieldName;
}

export interface ApiInterface {
  request: ApiCallItem;
  response: any;
}
