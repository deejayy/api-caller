import { Draft, produce, enableMapSet } from 'immer';
import { ActionCreator, ActionType, on } from '@ngrx/store';

enableMapSet();

export const produceOn = <C1 extends ActionCreator, S>(
  actionType: C1,
  callback: (draft: Draft<S>, action: ActionType<C1>) => void,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  return on(
    actionType,
    (state: S, action: ActionType<C1>): S => produce(state, (draft: Draft<S>) => callback(draft, action)),
  );
};
