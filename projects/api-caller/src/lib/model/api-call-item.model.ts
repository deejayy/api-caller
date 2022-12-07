/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpHeaders, HttpParams, HttpResponseBase } from '@angular/common/http';

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
  localErrorHandling?: boolean;
}

export interface ApiInterface {
  request: ApiCallItem;
  response: HttpResponseBase;
  headers: Record<string, string>;
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
