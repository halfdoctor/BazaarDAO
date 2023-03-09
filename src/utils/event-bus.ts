import EventEmitter from 'eventemitter3';

export const eventBus = new EventEmitter();

export type TxEventType = 'hash' | 'success' | 'error';
export function getTxEventName (id: string, type: TxEventType) {
  return `transaction:${id}:${type}`;
}
