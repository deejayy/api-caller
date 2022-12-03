/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiState {
  loading: boolean;
  success: boolean;
  error: boolean;
  data: any;
  headers: HttpHeaders;
  errorData: HttpErrorResponse;
  fired: Date | undefined;
  returned: Date | undefined;
}

export interface GlobalApiState {
  [key: string]: ApiState;
}

export interface ApiResultState<T = any> {
  loading$: Observable<boolean>;
  success$: Observable<boolean>;
  error$: Observable<boolean>;
  finished$: Observable<boolean>;
  data$: Observable<T>;
  headers$: Observable<HttpHeaders>;
  errorData$: Observable<HttpErrorResponse>;
}

export const initialApiCallerGlobalState: GlobalApiState = {};

export const initialApiCallerState: ApiState = {
  loading: false,
  success: false,
  error: false,
  data: null,
  headers: new HttpHeaders(),
  errorData: new HttpErrorResponse({}),
  fired: undefined,
  returned: undefined,
};
