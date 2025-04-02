/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * An object interface that defines a set of callback functions a user can use to get
 * notified of any set of {@link Observable}
 * {@link guide/glossary-and-semantics#notification notification} events.
 *
 * For more info, please refer to {@link guide/observer this guide}.
 */
export declare interface Observer<T> {
    /**
     * A callback function that gets called by the producer during the subscription when
     * the producer "has" the `value`. It won't be called if `error` or `complete` callback
     * functions have been called, nor after the consumer has unsubscribed.
     *
     * For more info, please refer to {@link guide/glossary-and-semantics#next this guide}.
     */
    next: (value: T) => void;
    /**
     * A callback function that gets called by the producer if and when it encountered a
     * problem of any kind. The errored value will be provided through the `err` parameter.
     * This callback can't be called more than one time, it can't be called if the
     * `complete` callback function have been called previously, nor it can't be called if
     * the consumer has unsubscribed.
     *
     * For more info, please refer to {@link guide/glossary-and-semantics#error this guide}.
     */
    error: (err: any) => void;
    /**
     * A callback function that gets called by the producer if and when it has no more
     * values to provide (by calling `next` callback function). This means that no error
     * has happened. This callback can't be called more than one time, it can't be called
     * if the `error` callback function have been called previously, nor it can't be called
     * if the consumer has unsubscribed.
     *
     * For more info, please refer to {@link guide/glossary-and-semantics#complete this guide}.
     */
    complete: () => void;
}

export declare interface Subscribable<T> {
    subscribe(observer: Partial<Observer<T>>): Unsubscribable;
}

export declare interface Unsubscribable {
    unsubscribe(): void;
}



export declare interface SubscriptionLike extends Unsubscribable {
    unsubscribe(): void;
    readonly closed: boolean;
}

/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 *
 * @class Subscription
 */
export declare class Subscription implements SubscriptionLike {
    /** @nocollapse */
    static EMPTY: Subscription;
    /**
     * A flag to indicate whether this Subscription has already been unsubscribed.
     */
    closed: boolean;

    /**
     * @param initialTeardown A function executed first as part of the finalization
     * process that is kicked off when {@link #unsubscribe} is called.
     */
    constructor(initialTeardown?: () => void);

    /**
     * Disposes the resources held by the subscription. May, for instance, cancel
     * an ongoing Observable execution or cancel any other type of work that
     * started when the Subscription was created.
     * @return {void}
     */
    unsubscribe(): void;

}

export declare class SafeSubscriber<T> extends Subscriber<T> {
    constructor(
        observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
        error?: ((e?: any) => void) | null,
        complete?: (() => void) | null
    );
}


/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 *
 * @class Subscriber<T>
 */
export declare class Subscriber<T> extends Subscription implements Observer<T> {
    /**
     * A static factory for a Subscriber, given a (potentially partial) definition
     * of an Observer.
     * @param next The `next` callback of an Observer.
     * @param error The `error` callback of an
     * Observer.
     * @param complete The `complete` callback of an
     * Observer.
     * @return A Subscriber wrapping the (partially defined)
     * Observer represented by the given arguments.
     * @nocollapse
     * @deprecated Do not use. Will be removed in v8. There is no replacement for this
     * method, and there is no reason to be creating instances of `Subscriber` directly.
     * If you have a specific use case, please file an issue.
     */
    static create<T>(next?: (x?: T) => void, error?: (e?: any) => void, complete?: () => void): Subscriber<T>;

    /**
     * The {@link Observer} callback to receive notifications of type `next` from
     * the Observable, with a value. The Observable may call this method 0 or more
     * times.
     * @param {T} [value] The `next` value.
     * @return {void}
     */
    next(value?: T): void;

    /**
     * The {@link Observer} callback to receive notifications of type `error` from
     * the Observable, with an attached `Error`. Notifies the Observer that
     * the Observable has experienced an error condition.
     * @param {any} [err] The `error` exception.
     * @return {void}
     */
    error(err?: any): void;

    /**
     * The {@link Observer} callback to receive a valueless notification of type
     * `complete` from the Observable. Notifies the Observer that the Observable
     * has finished sending push-based notifications.
     * @return {void}
     */
    complete(): void;

    unsubscribe(): void;
}

export declare type TeardownLogic = Subscription | Unsubscribable | (() => void) | void;


/* OPERATOR INTERFACES */

/**
 * A function type interface that describes a function that accepts one parameter `T`
 * and returns another parameter `R`.
 *
 * Usually used to describe {@link OperatorFunction} - it always takes a single
 * parameter (the source Observable) and returns another Observable.
 */
export declare interface UnaryFunction<T, R> {
    (source: T): R;
}

export declare type OperatorFunction<T, R> = UnaryFunction<Observable<T>, Observable<R>>;

/**
 * A representation of any set of values over any amount of time. This is the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export declare class Observable<T> implements Subscribable<T> {
    /**
     * @constructor
     * @param {Function} subscribe the function that is called when the Observable is
     * initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or
     * `complete` can be called to notify of a successful completion.
     */
    constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic);

    subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void)): Subscription;
    /**
     * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.
     *
     * <span class="informal">Use it when you have all these Observables, but still nothing is happening.</span>
     *
     * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
     * might be for example a function that you passed to Observable's constructor, but most of the time it is
     * a library implementation, which defines what will be emitted by an Observable, and when it be will emitted. This means
     * that calling `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
     * the thought.
     *
     * Apart from starting the execution of an Observable, this method allows you to listen for values
     * that an Observable emits, as well as for when it completes or errors. You can achieve this in two
     * of the following ways.
     *
     * The first way is creating an object that implements {@link Observer} interface. It should have methods
     * defined by that interface, but note that it should be just a regular JavaScript object, which you can create
     * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular, do
     * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
     * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
     * do anything, you can simply omit it. Note however, if the `error` method is not provided and an error happens,
     * it will be thrown asynchronously. Errors thrown asynchronously cannot be caught using `try`/`catch`. Instead,
     * use the {@link onUnhandledError} configuration option or use a runtime handler (like `window.onerror` or
     * `process.on('error)`) to be notified of unhandled errors. Because of this, it's recommended that you provide
     * an `error` method to avoid missing thrown errors.
     *
     * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
     * This means you can provide three functions as arguments to `subscribe`, where the first function is equivalent
     * of a `next` method, the second of an `error` method and the third of a `complete` method. Just as in case of an Observer,
     * if you do not need to listen for something, you can omit a function by passing `undefined` or `null`,
     * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
     * to the `error` function, as with an Observer, if not provided, errors emitted by an Observable will be thrown asynchronously.
     *
     * You can, however, subscribe with no parameters at all. This may be the case where you're not interested in terminal events
     * and you also handled emissions internally by using operators (e.g. using `tap`).
     *
     * Whichever style of calling `subscribe` you use, in both cases it returns a Subscription object.
     * This object allows you to call `unsubscribe` on it, which in turn will stop the work that an Observable does and will clean
     * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
     * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.
     *
     * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
     * It is an Observable itself that decides when these functions will be called. For example {@link of}
     * by default emits all its values synchronously. Always check documentation for how given Observable
     * will behave when subscribed and if its default behavior can be modified with a `scheduler`.
     *
     * #### Examples
     *
     * Subscribe with an {@link guide/observer Observer}
     *
     * ```ts
     * import { of } from 'rxjs';
     *
     * const sumObserver = {
     *   sum: 0,
     *   next(value) {
     *     console.log('Adding: ' + value);
     *     this.sum = this.sum + value;
     *   },
     *   error() {
     *     // We actually could just remove this method,
     *     // since we do not really care about errors right now.
     *   },
     *   complete() {
     *     console.log('Sum equals: ' + this.sum);
     *   }
     * };
     *
     * of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.
     *   .subscribe(sumObserver);
     *
     * // Logs:
     * // 'Adding: 1'
     * // 'Adding: 2'
     * // 'Adding: 3'
     * // 'Sum equals: 6'
     * ```
     *
     * Subscribe with functions ({@link deprecations/subscribe-arguments deprecated})
     *
     * ```ts
     * import { of } from 'rxjs'
     *
     * let sum = 0;
     *
     * of(1, 2, 3).subscribe(
     *   value => {
     *     console.log('Adding: ' + value);
     *     sum = sum + value;
     *   },
     *   undefined,
     *   () => console.log('Sum equals: ' + sum)
     * );
     *
     * // Logs:
     * // 'Adding: 1'
     * // 'Adding: 2'
     * // 'Adding: 3'
     * // 'Sum equals: 6'
     * ```
     *
     * Cancel a subscription
     *
     * ```ts
     * import { interval } from 'rxjs';
     *
     * const subscription = interval(1000).subscribe({
     *   next(num) {
     *     console.log(num)
     *   },
     *   complete() {
     *     // Will not be called, even when cancelling subscription.
     *     console.log('completed!');
     *   }
     * });
     *
     * setTimeout(() => {
     *   subscription.unsubscribe();
     *   console.log('unsubscribed!');
     * }, 2500);
     *
     * // Logs:
     * // 0 after 1s
     * // 1 after 2s
     * // 'unsubscribed!' after 2.5s
     * ```
     *
     * @param {Observer|Function} observerOrNext (optional) Either an observer with methods to be called,
     * or the first of three possible handlers, which is the handler for each value emitted from the subscribed
     * Observable.
     * @param {Function} error (optional) A handler for a terminal event resulting from an error. If no error handler is provided,
     * the error will be thrown asynchronously as unhandled.
     * @param {Function} complete (optional) A handler for a terminal event resulting from successful completion.
     * @return {Subscription} a subscription reference to the registered handlers
     * @method subscribe
     */
    subscribe(
        observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
        error?: ((error: any) => void) | null,
        complete?: (() => void) | null
    ): Subscription;

    /**
     * Used as a NON-CANCELLABLE means of subscribing to an observable, for use with
     * APIs that expect promises, like `async/await`. You cannot unsubscribe from this.
     *
     * **WARNING**: Only use this with observables you *know* will complete. If the source
     * observable does not complete, you will end up with a promise that is hung up, and
     * potentially all of the state of an async function hanging out in memory. To avoid
     * this situation, look into adding something like {@link timeout}, {@link take},
     * {@link takeWhile}, or {@link takeUntil} amongst others.
     *
     * #### Example
     *
     * ```ts
     * import { interval, take } from 'rxjs';
     *
     * const source$ = interval(1000).pipe(take(4));
     *
     * async function getTotal() {
     *   let total = 0;
     *
     *   await source$.forEach(value => {
     *     total += value;
     *     console.log('observable -> ' + value);
     *   });
     *
     *   return total;
     * }
     *
     * getTotal().then(
     *   total => console.log('Total: ' + total)
     * );
     *
     * // Expected:
     * // 'observable -> 0'
     * // 'observable -> 1'
     * // 'observable -> 2'
     * // 'observable -> 3'
     * // 'Total: 6'
     * ```
     *
     * @param next a handler for each value emitted by the observable
     * @return a promise that either resolves on observable completion or
     *  rejects with the handled error
     */
    forEach(next: (value: T) => void): Promise<void>;

    /**
     * @param next a handler for each value emitted by the observable
     * @param promiseCtor a constructor function used to instantiate the Promise
     * @return a promise that either resolves on observable completion or
     *  rejects with the handled error
     * @deprecated Passing a Promise constructor will no longer be available
     * in upcoming versions of RxJS. This is because it adds weight to the library, for very
     * little benefit. If you need this functionality, it is recommended that you either
     * polyfill Promise, or you create an adapter to convert the returned native promise
     * to whatever promise implementation you wanted. Will be removed in v8.
     */
    forEach(next: (value: T) => void, promiseCtor: PromiseConstructorLike): Promise<void>;

    forEach(next: (value: T) => void, promiseCtor?: PromiseConstructorLike): Promise<void>;


    /**
  * Used to stitch together functional operators into a chain.
  * @method pipe
  * @return {Observable} the Observable result of all of the operators having
  * been called in the order they were passed in.
  *
  * ## Example
  *
  * ```ts
  * import { interval, filter, map, scan } from 'rxjs';
  *
  * interval(1000)
  *   .pipe(
  *     filter(x => x % 2 === 0),
  *     map(x => x + x),
  *     scan((acc, x) => acc + x)
  *   )
  *   .subscribe(x => console.log(x));
  * ```
  */
    pipe(): Observable<T>;
    pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
    pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
    pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
    pipe<A, B, C, D>(
        op1: OperatorFunction<T, A>,
        op2: OperatorFunction<A, B>,
        op3: OperatorFunction<B, C>,
        op4: OperatorFunction<C, D>
    ): Observable<D>;
    pipe<A, B, C, D, E>(
        op1: OperatorFunction<T, A>,
        op2: OperatorFunction<A, B>,
        op3: OperatorFunction<B, C>,
        op4: OperatorFunction<C, D>,
        op5: OperatorFunction<D, E>
    ): Observable<E>;
    pipe<A, B, C, D, E, F>(
        op1: OperatorFunction<T, A>,
        op2: OperatorFunction<A, B>,
        op3: OperatorFunction<B, C>,
        op4: OperatorFunction<C, D>,
        op5: OperatorFunction<D, E>,
        op6: OperatorFunction<E, F>
    ): Observable<F>;
    pipe<A, B, C, D, E, F, G>(
        op1: OperatorFunction<T, A>,
        op2: OperatorFunction<A, B>,
        op3: OperatorFunction<B, C>,
        op4: OperatorFunction<C, D>,
        op5: OperatorFunction<D, E>,
        op6: OperatorFunction<E, F>,
        op7: OperatorFunction<F, G>
    ): Observable<G>;
    pipe<A, B, C, D, E, F, G, H>(
        op1: OperatorFunction<T, A>,
        op2: OperatorFunction<A, B>,
        op3: OperatorFunction<B, C>,
        op4: OperatorFunction<C, D>,
        op5: OperatorFunction<D, E>,
        op6: OperatorFunction<E, F>,
        op7: OperatorFunction<F, G>,
        op8: OperatorFunction<G, H>
    ): Observable<H>;
    pipe<A, B, C, D, E, F, G, H, I>(
        op1: OperatorFunction<T, A>,
        op2: OperatorFunction<A, B>,
        op3: OperatorFunction<B, C>,
        op4: OperatorFunction<C, D>,
        op5: OperatorFunction<D, E>,
        op6: OperatorFunction<E, F>,
        op7: OperatorFunction<F, G>,
        op8: OperatorFunction<G, H>,
        op9: OperatorFunction<H, I>
    ): Observable<I>;
    pipe<A, B, C, D, E, F, G, H, I>(
        op1: OperatorFunction<T, A>,
        op2: OperatorFunction<A, B>,
        op3: OperatorFunction<B, C>,
        op4: OperatorFunction<C, D>,
        op5: OperatorFunction<D, E>,
        op6: OperatorFunction<E, F>,
        op7: OperatorFunction<F, G>,
        op8: OperatorFunction<G, H>,
        op9: OperatorFunction<H, I>,
        ...operations: OperatorFunction<any, any>[]
    ): Observable<unknown>;
    pipe(...operations: OperatorFunction<any, any>[]): Observable<any>;
}


/**
 * Tests to see if the object is an RxJS {@link Observable}
 * @param obj the object to test
 */
export declare function isObservable(obj: any): obj is Observable<unknown>;

/**
 * An extension to the {@link Observer} interface used only by the {@link tap} operator.
 *
 * It provides a useful set of callbacks a user can register to do side-effects in
 * cases other than what the usual {@link Observer} callbacks are
 * ({@link guide/glossary-and-semantics#next next},
 * {@link guide/glossary-and-semantics#error error} and/or
 * {@link guide/glossary-and-semantics#complete complete}).
 *
 * ## Example
 *
 * ```ts
 * import { fromEvent, switchMap, tap, interval, take } from 'rxjs';
 *
 * const source$ = fromEvent(document, 'click');
 * const result$ = source$.pipe(
 *   switchMap((_, i) => i % 2 === 0
 *     ? fromEvent(document, 'mousemove').pipe(
 *         tap({
 *           subscribe: () => console.log('Subscribed to the mouse move events after click #' + i),
 *           unsubscribe: () => console.log('Mouse move events #' + i + ' unsubscribed'),
 *           finalize: () => console.log('Mouse move events #' + i + ' finalized')
 *         })
 *       )
 *     : interval(1_000).pipe(
 *         take(5),
 *         tap({
 *           subscribe: () => console.log('Subscribed to the 1-second interval events after click #' + i),
 *           unsubscribe: () => console.log('1-second interval events #' + i + ' unsubscribed'),
 *           finalize: () => console.log('1-second interval events #' + i + ' finalized')
 *         })
 *       )
 *   )
 * );
 *
 * const subscription = result$.subscribe({
 *   next: console.log
 * });
 *
 * setTimeout(() => {
 *   console.log('Unsubscribe after 60 seconds');
 *   subscription.unsubscribe();
 * }, 60_000);
 * ```
 */
export interface TapObserver<T> extends Observer<T> {
    /**
     * The callback that `tap` operator invokes at the moment when the source Observable
     * gets subscribed to.
     */
    subscribe: () => void;
    /**
     * The callback that `tap` operator invokes when an explicit
     * {@link guide/glossary-and-semantics#unsubscription unsubscribe} happens. It won't get invoked on
     * `error` or `complete` events.
     */
    unsubscribe: () => void;
    /**
     * The callback that `tap` operator invokes when any kind of
     * {@link guide/glossary-and-semantics#finalization finalization} happens - either when
     * the source Observable `error`s or `complete`s or when it gets explicitly unsubscribed
     * by the user. There is no difference in using this callback or the {@link finalize}
     * operator, but if you're already using `tap` operator, you can use this callback
     * instead. You'd get the same result in either case.
     */
    finalize: () => void;
}

/**
 * A function type interface that describes a function that accepts and returns a parameter of the same type.
 *
 * Used to describe {@link OperatorFunction} with the only one type: `OperatorFunction<T, T>`.
 *
 */
export declare type MonoTypeOperatorFunction<T> = OperatorFunction<T, T>;

/**
 * Delays the emission of items from the source Observable by a given timeout or
 * until a given Date.
 *
 * <span class="informal">Time shifts each item by some specified amount of
 * milliseconds.</span>
 *
 * ![](delay.svg)
 *
 * If the delay argument is a Number, this operator time shifts the source
 * Observable by that amount of time expressed in milliseconds. The relative
 * time intervals between the values are preserved.
 *
 * If the delay argument is a Date, this operator time shifts the start of the
 * Observable execution until the given date occurs.
 *
 * ## Examples
 *
 * Delay each click by one second
 *
 * ```ts
 * import { fromEvent, delay } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const delayedClicks = clicks.pipe(delay(1000)); // each click emitted after 1 second
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * Delay all clicks until a future date happens
 *
 * ```ts
 * import { fromEvent, delay } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const date = new Date('March 15, 2050 12:00:00'); // in the future
 * const delayedClicks = clicks.pipe(delay(date)); // click emitted only after that date
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link delayWhen}
 * @see {@link throttle}
 * @see {@link throttleTime}
 * @see {@link debounce}
 * @see {@link debounceTime}
 * @see {@link sample}
 * @see {@link sampleTime}
 * @see {@link audit}
 * @see {@link auditTime}
 *
 * @param due The delay duration in milliseconds (a `number`) or a `Date` until
 * which the emission of the source items is delayed.
 * @param scheduler The {@link SchedulerLike} to use for managing the timers
 * that handle the time-shift for each item.
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified timeout or Date.
 */
export declare function delay<T>(due: number | Date, scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;

/**
 * Used to perform side-effects for notifications from the source observable
 *
 * <span class="informal">Used when you want to affect outside state with a notification without altering the notification</span>
 *
 * ![](tap.png)
 *
 * Tap is designed to allow the developer a designated place to perform side effects. While you _could_ perform side-effects
 * inside of a `map` or a `mergeMap`, that would make their mapping functions impure, which isn't always a big deal, but will
 * make it so you can't do things like memoize those functions. The `tap` operator is designed solely for such side-effects to
 * help you remove side-effects from other operations.
 *
 * For any notification, next, error, or complete, `tap` will call the appropriate callback you have provided to it, via a function
 * reference, or a partial observer, then pass that notification down the stream.
 *
 * The observable returned by `tap` is an exact mirror of the source, with one exception: Any error that occurs -- synchronously -- in a handler
 * provided to `tap` will be emitted as an error from the returned observable.
 *
 * > Be careful! You can mutate objects as they pass through the `tap` operator's handlers.
 *
 * The most common use of `tap` is actually for debugging. You can place a `tap(console.log)` anywhere
 * in your observable `pipe`, log out the notifications as they are emitted by the source returned by the previous
 * operation.
 *
 * ## Examples
 *
 * Check a random number before it is handled. Below is an observable that will use a random number between 0 and 1,
 * and emit `'big'` or `'small'` depending on the size of that number. But we wanted to log what the original number
 * was, so we have added a `tap(console.log)`.
 *
 * ```ts
 * import { of, tap, map } from 'rxjs';
 *
 * of(Math.random()).pipe(
 *   tap(console.log),
 *   map(n => n > 0.5 ? 'big' : 'small')
 * ).subscribe(console.log);
 * ```
 *
 * Using `tap` to analyze a value and force an error. Below is an observable where in our system we only
 * want to emit numbers 3 or less we get from another source. We can force our observable to error
 * using `tap`.
 *
 * ```ts
 * import { of, tap } from 'rxjs';
 *
 * const source = of(1, 2, 3, 4, 5);
 *
 * source.pipe(
 *   tap(n => {
 *     if (n > 3) {
 *       throw new TypeError(`Value ${ n } is greater than 3`);
 *     }
 *   })
 * )
 * .subscribe({ next: console.log, error: err => console.log(err.message) });
 * ```
 *
 * We want to know when an observable completes before moving on to the next observable. The system
 * below will emit a random series of `'X'` characters from 3 different observables in sequence. The
 * only way we know when one observable completes and moves to the next one, in this case, is because
 * we have added a `tap` with the side effect of logging to console.
 *
 * ```ts
 * import { of, concatMap, interval, take, map, tap } from 'rxjs';
 *
 * of(1, 2, 3).pipe(
 *   concatMap(n => interval(1000).pipe(
 *     take(Math.round(Math.random() * 10)),
 *     map(() => 'X'),
 *     tap({ complete: () => console.log(`Done with ${ n }`) })
 *   ))
 * )
 * .subscribe(console.log);
 * ```
 *
 * @see {@link finalize}
 * @see {@link TapObserver}
 *
 * @param observerOrNext A next handler or partial observer
 * @param error An error handler
 * @param complete A completion handler
 * @return A function that returns an Observable identical to the source, but
 * runs the specified Observer or callback(s) for each item.
 */
export declare function tap<T>(observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void) | null, error?: ((e: any) => void) | null, complete?: (() => void) | null): MonoTypeOperatorFunction<T>;
export declare function tap<T>(observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void)): MonoTypeOperatorFunction<T>;


export declare interface SchedulerLike extends TimestampProvider {
    schedule<T>(work: (this: SchedulerAction<T>, state: T) => void, delay: number, state: T): Subscription;
    schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay: number, state?: T): Subscription;
    schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}

export interface SchedulerAction<T> extends Subscription {
    schedule(state?: T, delay?: number): Subscription;
}

/**
 * This is a type that provides a method to allow RxJS to create a numeric timestamp
 */
export declare interface TimestampProvider {
    /**
     * Returns a timestamp as a number.
     *
     * This is used by types like `ReplaySubject` or operators like `timestamp` to calculate
     * the amount of time passed between events.
     */
    now(): number;
}

export declare function switchMap<T, O extends ObservableInput<any>>(
    project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>>;
/**
 * Projects each source value to an Observable which is merged in the output
 * Observable, emitting values only from the most recently projected Observable.
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link switchAll}.</span>
 *
 * ![](switchMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an (so-called "inner") Observable. Each time it observes one of these
 * inner Observables, the output Observable begins emitting the items emitted by
 * that inner Observable. When a new inner Observable is emitted, `switchMap`
 * stops emitting items from the earlier-emitted inner Observable and begins
 * emitting items from the new one. It continues to behave like this for
 * subsequent inner Observables.
 *
 * ## Example
 *
 * Generate new Observable according to source Observable values
 *
 * ```ts
 * import { of, switchMap } from 'rxjs';
 *
 * const switched = of(1, 2, 3).pipe(switchMap(x => of(x, x ** 2, x ** 3)));
 * switched.subscribe(x => console.log(x));
 * // outputs
 * // 1
 * // 1
 * // 1
 * // 2
 * // 4
 * // 8
 * // 3
 * // 9
 * // 27
 * ```
 *
 * Restart an interval Observable on every click event
 *
 * ```ts
 * import { fromEvent, switchMap, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(switchMap(() => interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link mergeMap}
 * @see {@link switchAll}
 * @see {@link switchMapTo}
 *
 * @param project A function that, when applied to an item emitted by the source
 * Observable, returns an Observable.
 * @return A function that returns an Observable that emits the result of
 * applying the projection function (and the optional deprecated
 * `resultSelector`) to each item emitted by the source Observable and taking
 * only the values from the most recently projected inner Observable.
 */
export declare function switchMap<T, R, O extends ObservableInput<any>>(
    project: (value: T, index: number) => O,
    resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, ObservedValueOf<O> | R>;

export declare type ObservableInput<T> =
    | Observable<T>
    | InteropObservable<T>
    | AsyncIterable<T>
    | PromiseLike<T>
    | ArrayLike<T>
    | Iterable<T>
    | ReadableStreamLike<T>;

export interface ReadableStreamLike<T> {
    getReader(): ReadableStreamDefaultReaderLike<T>;
}

/**
 * An object that implements the `Symbol.observable` interface.
 */
export interface InteropObservable<T> {
    [Symbol.observable]: () => Subscribable<T>;
}

interface ReadableStreamDefaultReaderLike<T> {
    // HACK: As of TS 4.2.2, The provided types for the iterator results of a `ReadableStreamDefaultReader`
    // are significantly different enough from `IteratorResult` as to cause compilation errors.
    // The type at the time is `ReadableStreamDefaultReadResult`.
    read(): PromiseLike<
        | {
            done: false;
            value: T;
        }
        | { done: true; value?: undefined }
    >;
    releaseLock(): void;
}

/**
 * Extracts the type from an `ObservableInput<any>`. If you have
 * `O extends ObservableInput<any>` and you pass in `Observable<number>`, or
 * `Promise<number>`, etc, it will type as `number`.
 */
export type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;

/**
 * Applies a given `project` function to each value emitted by the source
 * Observable, and emits the resulting values as an Observable.
 *
 * <span class="informal">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),
 * it passes each source value through a transformation function to get
 * corresponding output values.</span>
 *
 * ![](map.png)
 *
 * Similar to the well known `Array.prototype.map` function, this operator
 * applies a projection to each value and emits that projection in the output
 * Observable.
 *
 * ## Example
 *
 * Map every click to the `clientX` position of that click
 *
 * ```ts
 * import { fromEvent, map } from 'rxjs';
 *
 * const clicks = fromEvent<PointerEvent>(document, 'click');
 * const positions = clicks.pipe(map(ev => ev.clientX));
 *
 * positions.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link mapTo}
 * @see {@link pluck}
 *
 * @param project The function to apply to each `value` emitted by the source
 * Observable. The `index` parameter is the number `i` for the i-th emission
 * that has happened since the subscription, starting from the number `0`.
 * @param thisArg An optional argument to define what `this` is in the
 * `project` function.
 * @return A function that returns an Observable that emits the values from the
 * source Observable transformed by the given `project` function.
 */
export declare function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T, R>;
export declare function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>;

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export declare class Subject<T> extends Observable<T> implements SubscriptionLike {
    closed: boolean;

    next(value: T): void;

    error(err: any): void;
    complete(): void;

    unsubscribe(): void;
    readonly observed: boolean;

    /**
     * Creates a new Observable with this Subject as the source. You can do this
     * to create custom Observer-side logic of the Subject and conceal it from
     * code that uses the Observable.
     * @return Observable that this Subject casts to.
     */
    asObservable(): Observable<T>;
}


/**
 * Use in components with the `@Output` directive to emit custom events
 * synchronously or asynchronously, and register handlers for those events
 * by subscribing to an instance.
 *
 * @usageNotes
 *
 * Extends
 * [RxJS `Subject`](https://rxjs.dev/api/index/class/Subject)
 * for Angular by adding the `emit()` method.
 *
 * In the following example, a component defines two output properties
 * that create event emitters. When the title is clicked, the emitter
 * emits an open or close event to toggle the current visibility state.
 *
 * ```angular-ts
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * Access the event object with the `$event` argument passed to the output event
 * handler:
 *
 * ```html
 * <zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>
 * ```
 *
 * @publicApi
 */
export declare class EventEmitter<T> extends Subject<T> {
    /**
     * Creates an instance of this class that can
     * deliver events synchronously or asynchronously.
     *
     * @param [isAsync=false] When true, deliver events asynchronously.
     *
     */
    constructor(isAsync?: boolean);
    /**
     * Emits an event containing a given value.
     * @param value The value to emit.
     */
    emit(value?: T): void;
    /**
     * Registers handlers for events emitted by this instance.
     * @param next When supplied, a custom handler for emitted events.
     * @param error When supplied, a custom handler for an error notification from this emitter.
     * @param complete When supplied, a custom handler for a completion notification from this
     *     emitter.
     */
    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    /**
     * Registers handlers for events emitted by this instance.
     * @param observerOrNext When supplied, a custom handler for emitted events, or an observer
     *     object.
     * @param error When supplied, a custom handler for an error notification from this emitter.
     * @param complete When supplied, a custom handler for a completion notification from this
     *     emitter.
     */
    subscribe(observerOrNext?: any, error?: any, complete?: any): Subscription;
}

/**
 * A variant of Subject that requires an initial value and emits its current
 * value whenever it is subscribed to.
 */
export declare class BehaviorSubject<T> extends Subject<T> {
    constructor(_value: T);

    get value(): T;
    getValue(): T;
}
