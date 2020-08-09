import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiCallItem, ApiInterface, SimplifiedHttpOptions } from '../model/api-call-item.model';
import { Store, select } from '@ngrx/store';
import { ApiState, ApiResultState } from '../store/api.state';
import { ApiGet, ApiClearState } from '../store/api.actions';
import { Observable, of } from 'rxjs';
import {
  isLoading,
  getStateId,
  getResponse,
  getErrorData,
  isFailed,
  isSucceeded,
} from '../store/api.selectors';
import { mergeMap, take } from 'rxjs/operators';
import { apiStateId } from '../model/api-state-id';
import { ApiConnector } from './api-connector';

@Injectable()
export class ApiCallerService {
  private tokenData$: Observable<string> = of(`[${apiStateId}] Can't send requests with authorization, token provider not found`);
  private defaultApiUrl: string = '/';
  private errorHandler: Function = (payload: ApiInterface) => {
    console.warn(`[${apiStateId}] Unhandled API error occurred, code: ${payload.response.status}`);
  };

  constructor(
    private http: HttpClient,
    private store: Store<ApiState>,
    @Optional() private apiConnector: ApiConnector,
  ) {
    if (!this.apiConnector) {
      console.warn(`[${apiStateId}] apiConnector not provided, check README.md`);
    } else {
      this.tokenData$ = apiConnector.tokenData$ || this.tokenData$;
      this.defaultApiUrl = apiConnector.defaultApiUrl || this.defaultApiUrl;
      this.errorHandler = apiConnector.errorHandler || this.errorHandler;
    }
  }

  public callApi(apiCallItem: ApiCallItem) {
    // Workaround to avoid "TypeError: Cannot freeze" error, native primitives (like FileList) cannot be passed to the state manager
    // See: https://stackoverflow.com/a/53092520
    if (apiCallItem.binaryUpload) {
      apiCallItem.payload = apiCallItem.payload && apiCallItem.payload.length > 0 ? { ...apiCallItem.payload } : undefined;
    }
    this.store.dispatch(new ApiGet(apiCallItem));
  }

  public resetApi(apiCallItem: ApiCallItem) {
    this.store.dispatch(new ApiClearState(apiCallItem));
  }

  public createApiResults(apiCallItem: ApiCallItem): ApiResultState {
    const stateId = getStateId(apiCallItem);
    return {
      loading$: this.store.pipe(select(isLoading(stateId))),
      data$: this.store.pipe(select(getResponse(stateId))),
      errorData$: this.store.pipe(select(getErrorData(stateId))),
      error$: this.store.pipe(select(isFailed(stateId))),
      success$: this.store.pipe(select(isSucceeded(stateId))),
    };
  }

  public makeRequest(call: ApiCallItem): Observable<any> {
    const method = call.payload ? 'POST' : 'GET';
    const api = call.api || this.defaultApiUrl;
    const url = api + call.path;
    const options: SimplifiedHttpOptions = { body: call.payload };
    const headers = new HttpHeaders();

    if (call.binaryUpload) {
      if (call.payload) {
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        const formData: FormData = new FormData();
        formData.append(call.binaryUpload, call.payload[0]);
        options.body = formData;
      } else {
        console.warn(`[${apiStateId}] No file selected for upload but binaryUpload field name is set`);
      }
    }

    if (call.binaryResponse) {
      options.responseType = 'blob';
      options.observe = 'response';
    }

    if (call.needsAuth) {
      return this.tokenData$.pipe(
        take(1),
        mergeMap((token) => {
          options.headers = headers.set('Authorization', `Bearer ${token}`);
          return this.http.request(method, url, options);
        })
      );
    } else {
      return this.http.request(method, url, options);
    }
  }

  public handleError(payload: ApiInterface) {
    return this.errorHandler(payload);
  }
}
