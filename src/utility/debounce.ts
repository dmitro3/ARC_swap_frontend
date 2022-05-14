/* eslint-disable */

const __debounce_storage = {} as { [key: string]: any };

/**
 * Debounces a function to avoid over execution.
 * 
 * This method waits a period of time before executing a method/function call. If a new request is made for the same request
 * it will cancel the last execution and start a new one.
 * 
 * ```ts
 * import {__debounce} from '@/util/debounce';
 * 
 * const fetch = async () => {
 *      const result = await axios.get('example.com')
 *      setResult(result.data);
 * }
 * 
 * // Start debouncing
 * const somethingChanged = () => {
 *  // If something changes between 250ms, the `fetch` function will be
 *  // replaced by a new call.
 * 
 *  // For named functions
 *  __debounce(fetch, 250);
 * 
 *  // For unnamed functions
 *  __debounce(() => {
 *      // code
 *  }, 250, 'my-debouncing-id');
 * }
 * 
 * ```
 * 
 * @param fn A named function
 * @param ttl time to dispatch. Default 250ms
 * @param id Optional function id. It is needed if `fn` is not declared.
 * @author [Pollum](pollum.io)
 * @since v0.1.0
 */
export function __debounce(fn: Function, ttl = 250 as number, id?: string): void {
    const fnName = fn.name.length ? fn.name : id;
    if (fnName) {
        if (__debounce_storage[fnName]) {
            clearTimeout(__debounce_storage[fnName])
        }
        __debounce_storage[fnName] = setTimeout(() => {
            try {
                // console.log('Debouncing: ', fnName)
                fn();
            } catch (error) {
                throw error;
            }
            delete __debounce_storage[fnName];
        }, ttl);
    } else {
        throw new TypeError('Please provide a named function or an ID');
    }
}

/**
 * Clear a running debounce and cancel its execution.
 * @param id function name or debounce id
 */
export function __clearDebounce(id: string) {
    if (__debounce_storage[id])
        clearTimeout(__debounce_storage[id]);
}
