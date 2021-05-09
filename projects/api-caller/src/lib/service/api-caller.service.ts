import { HttpClient, HttpHeaders, HttpResponseBase } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { ApiCallItem, ApiInterface, SimplifiedHttpOptions } from '../model/api-call-item.model';
import { apiStateId } from '../model/api-state-id';
import { ApiActions } from '../store/api.actions';
import { ApiSelectors, getStateId } from '../store/api.selectors';
import { ApiResultState, ApiState } from '../store/api.state';
import { ApiConnector } from './api-connector';

@Injectable()
export class ApiCallerService {
  public tokenData$: Observable<string> = of(`[${apiStateId}] Can't send requests with authorization, token provider not found`);
  public defaultApiUrl: string = '/';
  public errorHandler: (payload: ApiInterface) => void = (payload: ApiInterface) => {
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
      this.tokenData$ = this.getTokenData();
      this.defaultApiUrl = this.getDefaultApiUrl();
      this.errorHandler = this.getErrorHandler();
    }
  }

  public getDefaultApiUrl(): string {
    return this.apiConnector?.defaultApiUrl || this.defaultApiUrl;
  }

  public getTokenData(): Observable<string> {
    return this.apiConnector?.tokenData$ || this.tokenData$;
  }

  public getErrorHandler(): (payload: ApiInterface) => void {
    return this.apiConnector?.errorHandler || this.errorHandler;
  }

  public handleError(payload: ApiInterface) {
    return this.getErrorHandler()(payload);
  }

  public getApiCallPayload(apiCallItem: ApiCallItem) {
    return {
      payload: {
        ...apiCallItem,
        api: apiCallItem.api || this.getDefaultApiUrl(),
      },
    };
  }

  public callApi(apiCallItem: ApiCallItem) {
    // Workaround to avoid "TypeError: Cannot freeze" error, native primitives (like FileList) cannot be passed to the state manager
    // See: https://stackoverflow.com/a/53092520
    if (apiCallItem.binaryUpload) {
      apiCallItem.payload = apiCallItem.payload && apiCallItem.payload.length > 0 ? { ...apiCallItem.payload } : undefined;
    }
    this.store.dispatch(
      ApiActions.ApiGet(this.getApiCallPayload(apiCallItem)),
    );
  }

  public resetApi(apiCallItem: ApiCallItem) {
    this.store.dispatch(ApiActions.ApiClearState(this.getApiCallPayload(apiCallItem)));
  }

  public resetAllApi() {
    this.store.dispatch(ApiActions.ApiClearAllState());
  }

  public createApiResults(apiCallItem: ApiCallItem): ApiResultState {
    const stateId = getStateId(this.getApiCallPayload(apiCallItem).payload);
    return {
      loading$: this.store.pipe(select(ApiSelectors.isLoading(stateId))),
      data$: this.store.pipe(select(ApiSelectors.getResponse(stateId))),
      errorData$: this.store.pipe(select(ApiSelectors.getErrorData(stateId))),
      error$: this.store.pipe(select(ApiSelectors.isFailed(stateId))),
      success$: this.store.pipe(select(ApiSelectors.isSucceeded(stateId))),
    };
  }

  public makeHeaders(call: ApiCallItem, options: SimplifiedHttpOptions) {
    let headers = new HttpHeaders();

    if (call.binaryUpload) {
      if (call.payload) {
        headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
        const formData: FormData = new FormData();
        formData.append(call.binaryUpload, call.payload[0]);
        options.body = formData;
      } else {
        console.warn(`[${apiStateId}] No file selected for upload but binaryUpload field name is set`);
      }
    }

    return headers;
  }

  public makeRequest(call: ApiCallItem): Observable<HttpResponseBase> {
    const method = call.method || (call.payload ? 'POST' : 'GET');
    const api = call.api;
    const url = api + call.path;
    const options: SimplifiedHttpOptions = { body: call.payload };
    const headers = this.makeHeaders(call, options);

    if (call.binaryResponse) {
      options.responseType = 'blob';
      options.observe = 'response';
    }

    if (call.needsAuth) {
      return this.getTokenData().pipe(
        take(1),
        mergeMap((token) => {
          options.headers = headers.set('Authorization', `Bearer ${token}`);
          return this.http.request(method, url, options);
        }),
      );
    } else {
      return this.http.request(method, url, options);
    }
  }
}
