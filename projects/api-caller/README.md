# Simple API caller library for Angular

This library helps you simplify and reduce the code required for making API calls from an Angular frontend application.

Based on NGRX state manager, provides a simple interface to set up an API call and retrieve the results (and other useful states as well).

## How to use?

```
npm install @ngrx/store @ngrx/effects immer
npm install @deejayy/api-caller
```

**Add these to your app.module.ts:**

```ts
imports: [
  ...
  StoreModule.forRoot({}),
  EffectsModule.forRoot(),
  ApiCallerModule,
],
```

**Start using:**

```ts
const apiCall = { api: 'https://endpoint-url/api/v1/', path: 'path/to/call' };
const result = this.apiCallerService.createApiResults(apiCall);
this.apiCallerService.callApi(apiCall);
result.data$.subscribe(console.log);
```

## Interface

### Input

Both ```createApiResults``` and ```callApi``` method needs the same parameter to be supplied: an ```ApiCallItem``` type of object.

**ApiCallItem** has the following properties

- ```api```: (optional) the base url of the endpoints you want to use, eg. ```https://endpoint-url/api/v1/```. Defaults to ```/```.
- ```path```: remaining part of the endpoint you want to call. It will be appended to the ```api``` property. Eg. ```path/to/call```
- ```payload```: (optional) a JSON object which should be sent to the endpoint. Note: the request method will be ```GET``` without (or with an empty) ```payload``` value and will be ```POST``` if supplied a valid one.
- ```needsAuth```: (optional) determines whether the call needs authorization. If this is set to true, you must supply a token ```Observable``` to the module at import (see [Advanced examples](#advanced-examples))

### Output

Outputs are essentially provided as streams which are returned in an ```ApiResultState``` object. You can count on the following:

- ```data$```: most important observable, which will holds the response from the backend endpoint on a successful call
- ```errorData$```: if there were an error making the request, the ```HttpErrorResponse``` type of object will be in this observable
- ```loading$```: this state is set to ```true``` right before initiating an ```HttpClient``` request, and set to ```false``` when the call is finished (regardless of success or failure)
- ```success$```: boolean state set to true on successful call
- ```error$```: boolean state set to true when the call is failed

## Advanced examples

The ```ApiCallerService``` has an optional dependency, an ```ApiConnector``` service with which you can control a the service's behaviour.

### ApiConnector properties and methods

- ```tokenData$```: this should be an observable of a token (type: string) necessary for making authorized requests (check ```needsAuth``` property in ```ApiCallItem``` object). Currently the library only supports "Bearer" token in the "Authorization" HTTP header field.
- ```defaultApiUrl```: if you use a single API in most of the cases, you may want to set it as a service-scope variable, so you don't have to provide it for every single call you make. With this you have the opportinity to control the prod/test/dev API endpoints in a single place.
- ```errorHandler```: this should be function which will be called whenever the API call is failing with an HTTP error. Useful for handling unathorized request (HTTP 4xx) in a single place.
