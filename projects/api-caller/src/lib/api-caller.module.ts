import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { apiReducer } from './store/api.reducer';
import { ApiEffects } from './store/api.effects';
import { ApiCallerService } from './service/api-caller.service';
import { apiStateId } from './model/api-state-id';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(apiStateId, apiReducer),
    EffectsModule.forFeature([ApiEffects]),
  ],
  providers: [ApiCallerService],
})
export class ApiCallerModule {}
