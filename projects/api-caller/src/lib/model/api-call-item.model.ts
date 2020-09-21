import { HttpHeaders, HttpParams } from '@angular/common/http';

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
  binaryResponse?: boolean;
  method?: string;
}

export interface ApiInterface {
  request: ApiCallItem;
  response: any;
}

export type SimplifiedHttpOptions = {
  body?: any;
  headers?: HttpHeaders;
  observe?: 'body' | 'events' | 'response';
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
};
