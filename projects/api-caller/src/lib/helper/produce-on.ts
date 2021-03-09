import { Draft, produce, enableMapSet } from 'immer';
import { ActionCreator, ActionType, on, On } from '@ngrx/store';

enableMapSet();

export const produceOn = <C1 extends ActionCreator, S>(
  actionType: C1,
  callback: (draft: Draft<S>, action: ActionType<C1>) => void,
): On<S> => {
  return on(
    actionType,
    (state: S, action: ActionType<C1>): S => produce(state, (draft: Draft<S>) => callback(draft, action)),
  );
};
