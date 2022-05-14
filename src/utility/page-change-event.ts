/* eslint-disable no-underscore-dangle */
interface IPageChangeEvent {
  _event: CustomEvent;
  /**
   * Prepares the event to be dispatched
   * @param path the target path
   * @returns an instance of PageChangeEvent
   */
  prepare: (path: string) => IPageChangeEvent;

  /**
   * Dispatches the event. If the event is not prepared, this will throw
   * and error.
   */
  dispatch: () => void;
  /**
   * Prepares and dispatches the event.
   *
   * @param path the target path
   */
  prepareAndDispatch: (path: string) => void;
}

/**
 * This objects provides methods to handle the page change event.
 *
 * @method prepare
 * @method dispatch
 * @method prepareAndDispatch
 */
const PageChangeEvent: IPageChangeEvent = {
  _event: CustomEvent.prototype,

  prepare(path: string): IPageChangeEvent {
    this._event = new CustomEvent('page-change', { detail: path });
    return this;
  },

  dispatch(): void {
    if (this._event) window.dispatchEvent(this._event);
    else throw new Error('No event defined to dispatch.');
  },

  prepareAndDispatch(path: string): void {
    this.prepare(path).dispatch();
  },
};

export default PageChangeEvent;
