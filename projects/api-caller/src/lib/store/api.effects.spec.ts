import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ApiCallerService } from '../service/api-caller.service';
import { ApiEffects } from './api.effects';
import { apiReducer } from './api.reducer';

describe('ApiEffects', () => {
  let service: ApiEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot([apiReducer]),
        EffectsModule.forRoot([ApiEffects]),
      ],
      providers: [ApiEffects, ApiCallerService],
    });

    service = TestBed.inject(ApiEffects);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
