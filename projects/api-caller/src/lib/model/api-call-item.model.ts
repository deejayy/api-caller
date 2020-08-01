export interface ApiCallItem {
  path: string;
  api?: string;
  payload?: any;
  needsAuth?: boolean;
  useCache?: boolean;
}

export interface ApiInterface {
  request: ApiCallItem;
  response: any;
}
