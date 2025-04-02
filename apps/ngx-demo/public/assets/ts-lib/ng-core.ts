/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @param token A token that represents a dependency that should be injected.
 * @returns the injected value if operation is successful, `null` otherwise.
 * @throws if called outside of a supported context.
 *
 * @publicApi
 */
export declare function inject<T>(token: ProviderToken<T>): T;
/**
 * @param token A token that represents a dependency that should be injected.
 * @param options Control how injection is executed. Options correspond to injection strategies
 *     that can be specified with parameter decorators `@Host`, `@Self`, `@SkipSelf`, and
 *     `@Optional`.
 * @returns the injected value if operation is successful.
 * @throws if called outside of a supported context, or if the token is not found.
 *
 * @publicApi
 */
export declare function inject<T>(token: ProviderToken<T>, options: InjectOptions & { optional?: false; }): T;
/**
 * @param token A token that represents a dependency that should be injected.
 * @param options Control how injection is executed. Options correspond to injection strategies
 *     that can be specified with parameter decorators `@Host`, `@Self`, `@SkipSelf`, and
 *     `@Optional`.
 * @returns the injected value if operation is successful,  `null` if the token is not
 *     found and optional injection has been requested.
 * @throws if called outside of a supported context, or if the token is not found and optional
 *     injection was not requested.
 *
 * @publicApi
 */
export declare function inject<T>(token: ProviderToken<T>, options: InjectOptions): T | null;

/**
 * @param token A token that represents a static attribute on the host node that should be injected.
 * @returns Value of the attribute if it exists.
 * @throws If called outside of a supported context or the attribute does not exist.
 *
 * @publicApi
 */
export declare function inject(token: HostAttributeToken): string;

/**
 * @param token A token that represents a static attribute on the host node that should be injected.
 * @returns Value of the attribute if it exists, otherwise `null`.
 * @throws If called outside of a supported context.
 *
 * @publicApi
 */
export declare function inject(token: HostAttributeToken, options: {
    optional: true;
}): string | null;

/**
 * @param token A token that represents a static attribute on the host node that should be injected.
 * @returns Value of the attribute if it exists.
 * @throws If called outside of a supported context or the attribute does not exist.
 *
 * @publicApi
 */
export declare function inject(token: HostAttributeToken, options: {
    optional: false;
}): string;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface InjectionToken<T> { toString(): string; }
export declare class HostAttributeToken {
    constructor(attributeName: string);
    toString(): string;
}

export declare interface InjectOptions {
    /**
     * Use optional injection, and return `null` if the requested token is not found.
     */
    optional?: boolean;
    /**
     * Start injection at the parent of the current injector.
     */
    skipSelf?: boolean;
    /**
     * Only query the current injector for the token, and don't fall back to the parent injector if
     * it's not found.
     */
    self?: boolean;
    /**
     * Stop injection at the host component's injector. Only relevant when injecting from an element
     * injector, and a no-op for environment injectors.
     */
    host?: boolean;
}

/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export declare interface Type<T> extends Function { new(...args: any[]): T; }
export declare interface AbstractType<T> extends Function { prototype: T; }

export declare type ProviderToken<T> = Type<T> | AbstractType<T> | InjectionToken<T>;


/**
 * Concrete injectors implement this interface. Injectors are configured
 * with [providers](guide/di/dependency-injection-providers) that associate
 * dependencies of various types with [injection tokens](guide/di/dependency-injection-providers).
 *
 * @see [DI Providers](guide/di/dependency-injection-providers).
 * @see {@link StaticProvider}
 *
 * @usageNotes
 *
 *  The following example creates a service injector instance.
 *
 * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
 *
 * ### Usage example
 *
 * {@example core/di/ts/injector_spec.ts region='Injector'}
 *
 * `Injector` returns itself when given `Injector` as a token:
 *
 * {@example core/di/ts/injector_spec.ts region='injectInjector'}
 *
 * @publicApi
 */
export declare abstract class Injector {
    static NULL: Injector;
    /**
     * Internal note on the `options?: InjectOptions|InjectFlags` override of the `get`
     * method: consider dropping the `InjectFlags` part in one of the major versions.
     * It can **not** be done in minor/patch, since it's breaking for custom injectors
     * that only implement the old `InjectorFlags` interface.
     */
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue: undefined, options: InjectOptions & {
        optional?: false;
    }): T;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue: null | undefined, options: InjectOptions): T | null;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions): T;

    /**
     * @deprecated from v4.0.0 use ProviderToken<T>
     * @suppress {duplicate}
     */
    abstract get(token: any, notFoundValue?: any): any;
    /**
     * @deprecated from v5 use the new signature Injector.create(options)
     */
    static create(providers: StaticProvider[], parent?: Injector): Injector;
    /**
     * Creates a new injector instance that provides one or more dependencies,
     * according to a given type or types of `StaticProvider`.
     *
     * @param options An object with the following properties:
     * * `providers`: An array of providers of the [StaticProvider type](api/core/StaticProvider).
     * * `parent`: (optional) A parent injector.
     * * `name`: (optional) A developer-defined identifying name for the new injector.
     *
     * @returns The new injector instance.
     *
     */
    static create(options: {
        providers: Array<Provider | StaticProvider>;
        parent?: Injector;
        name?: string;
    }): Injector;
}

/**
 * Configures the `Injector` to return an instance of `Type` when `Type' is used as the token.
 *
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * This form is a short form of `TypeProvider`;
 *
 * For more details, see the ["Dependency Injection Guide"](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='TypeProvider'}
 *
 * @publicApi
 */
export declare type TypeProvider = Type<any>;

/**
 * Configures the `Injector` to return a value for a token.
 * Base for `ValueProvider` decorator.
 *
 * @publicApi
 */
export declare interface ValueSansProvider {
    /**
     * The value to inject.
     */
    useValue: any;
}


/**
 * Configures the `Injector` to return a value for a token.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example core/di/ts/provider_spec.ts region='ValueProvider'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export declare interface ValueProvider extends ValueSansProvider {
    /**
     * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}

/**
 * Configures the `Injector` to return a value by invoking a `useClass` function.
 * Base for `ClassProvider` decorator.
 *
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @publicApi
 */
export declare interface ClassSansProvider {
    /**
     * Class to instantiate for the `token`.
     */
    useClass: Type<any>;
}


/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='ClassProvider'}
 *
 * Note that following two providers are not equal:
 *
 * {@example core/di/ts/provider_spec.ts region='ClassProviderDifference'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export declare interface ClassProvider extends ClassSansProvider {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}


/**
 * Configures the `Injector` to return an instance of a token.
 *
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export declare interface ConstructorProvider extends ConstructorSansProvider {
    /**
     * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
     */
    provide: Type<any>;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}

/**
 * Configures the `Injector` to return an instance of a token.
 *
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * ```ts
 * @Injectable(SomeModule, {deps: []})
 * class MyService {}
 * ```
 *
 * @publicApi
 */
export declare interface ConstructorSansProvider {
    /**
     * A list of `token`s to be resolved by the injector.
     */
    deps?: any[];
}


/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='ExistingProvider'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export declare interface ExistingProvider extends ExistingSansProvider {
    /**
     * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}

/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * @see {@link ExistingProvider}
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @publicApi
 */
export declare interface ExistingSansProvider {
    /**
     * Existing `token` to return. (Equivalent to `injector.get(useExisting)`)
     */
    useExisting: any;
}


/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='FactoryProvider'}
 *
 * Dependencies can also be marked as optional:
 *
 * {@example core/di/ts/provider_spec.ts region='FactoryProviderOptionalDeps'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export declare interface FactoryProvider extends FactorySansProvider {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}


/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 *
 * @see {@link FactoryProvider}
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @publicApi
 */
export declare interface FactorySansProvider {
    /**
     * A function to invoke to create a value for this `token`. The function is invoked with
     * resolved values of `token`s in the `deps` field.
     */
    useFactory: Function;
    /**
     * A list of `token`s to be resolved by the injector. The list of values is then
     * used as arguments to the `useFactory` function.
     */
    deps?: any[];
}


/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='StaticClassProvider'}
 *
 * Note that following two providers are not equal:
 *
 * {@example core/di/ts/provider_spec.ts region='StaticClassProviderDifference'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
export declare interface StaticClassProvider extends StaticClassSansProvider {
    /**
     * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}

/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * Base for `StaticClassProvider` decorator.
 *
 * @publicApi
 */
export declare interface StaticClassSansProvider {
    /**
     * An optional class to instantiate for the `token`. By default, the `provide`
     * class is instantiated.
     */
    useClass: Type<any>;
    /**
     * A list of `token`s to be resolved by the injector. The list of values is then
     * used as arguments to the `useClass` constructor.
     */
    deps: any[];
}
/**
 * Describes how the `Injector` should be configured.
 * @see [Dependency Injection Guide](guide/di/dependency-injection.
 *
 * @see {@link StaticProvider}
 *
 * @publicApi
 */
export declare type Provider = TypeProvider | ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider | any[];
/**
 * Describes how an `Injector` should be configured as static (that is, without reflection).
 * A static provider provides tokens to an injector for various types of dependencies.
 *
 * @see {@link Injector.create()}
 * @see [Dependency Injection Guide](guide/di/dependency-injection-providers).
 *
 * @publicApi
 */
export declare type StaticProvider = ValueProvider | ExistingProvider | StaticClassProvider | ConstructorProvider | FactoryProvider | any[];

export declare type Signal<T> = () => T;