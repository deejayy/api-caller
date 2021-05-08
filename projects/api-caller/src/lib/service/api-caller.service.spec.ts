import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ApiEffects } from '../store/api.effects';
import { apiReducer } from '../store/api.reducer';
import { ApiCallerService } from './api-caller.service';

describe('ApiCallerService', () => {
  let service: ApiCallerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot([apiReducer]),
        EffectsModule.forRoot([ApiEffects]),
      ],
      providers: [ApiCallerService],
    });

    service = TestBed.inject(ApiCallerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
