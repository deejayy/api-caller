export interface ApiCallItem {
  path: string;
  api?: string;
  payload?: any;
  needsAuth?: boolean;
  useCache?: boolean;
  binaryUpload?: string;
}

export interface ApiInterface {
  request: ApiCallItem;
  response: any;
}
