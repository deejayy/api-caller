import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiState {
  loading: boolean;
  success: boolean;
  error: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  errorData: HttpErrorResponse;
  fired: Date;
  returned: Date;
}

export interface ApiSubState {
  [key: string]: ApiState;
}

export interface ApiResultState {
  loading$: Observable<boolean>;
  success$: Observable<boolean>;
  error$: Observable<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data$: Observable<any>;
  errorData$: Observable<HttpErrorResponse>;
}

export const initialApiCallerState: ApiState = {
  loading: false,
  success: false,
  error: false,
  data: null,
  errorData: null,
  fired: null,
  returned: null,
};
