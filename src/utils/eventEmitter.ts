let hdxEventEmitter: any;

// TODO check types
class HdxEventEmitter {
  _events: { [key: string]: any };

  constructor() {
    this._events = {};
  }

  on(name: string, listener: any) {
    if (!this._events[name]) {
      this._events[name] = [];
    }

    this._events[name].push(listener);
  }

  removeListener(name: string, listenerToRemove: any) {
    if (!this._events[name]) {
      // throw new Error(
      //   `Can't remove a listener. Event "${name}" doesn't exits.`
      // );
      return;
    }

    const filterListeners = (listener: any) => listener !== listenerToRemove;

    this._events[name] = this._events[name].filter(filterListeners);
  }

  emit(name: string, data: any) {
    if (!this._events[name]) {
      // throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
      return;
    }

    const fireCallbacks = (callback: any) => {
      callback(data);
    };

    this._events[name].forEach(fireCallbacks);
  }
}

export const initHdxEventEmitter = () => {
  hdxEventEmitter = new HdxEventEmitter();
  return hdxEventEmitter;
};

export const getHdxEventEmitter = () => hdxEventEmitter;
