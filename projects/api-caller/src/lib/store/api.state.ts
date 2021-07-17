/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiState {
  loading: boolean;
  success: boolean;
  error: boolean;
  data: any;
  errorData: HttpErrorResponse;
  fired: Date;
  returned: Date;
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
  errorData$: Observable<HttpErrorResponse>;
}

export const initialApiCallerGlobalState: GlobalApiState = {};

export const initialApiCallerState: ApiState = {
  loading: false,
  success: false,
  error: false,
  data: null,
  errorData: null,
  fired: null,
  returned: null,
};
