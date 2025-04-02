//@ts-expect-error path
import { Observable } from "ng-observable";
//@ts-expect-error path
import { IArray, IGenericRecord, IRecord, IStringRecord } from "codinus-types";

export declare interface HttpHandleOptions {
    auditAction?: string;
    errorHandleType?: ErrorHandleType;
    logError?: boolean;
    argsType?: 'path' | 'query',
    enableCache?: boolean;
}

export declare interface ICSFilePathParts {
    name: string;
    extension?: string;
}

export declare interface ICSFormFile {
    content?: Blob;
    uniqueKey: string;
}

export declare interface ICSFileInfo extends ICSFilePathParts, ICSFormFile {
    size?: number;
    caption?: IStringRecord;
    category?: number;
    deleted?: boolean;
}

/**
 * Represents the header configuration options for an HTTP request.
 * Instances are immutable. Modifying methods return a cloned
 * instance with the change. The original object is never changed.
 *
 * @publicApi
 */
export declare class HttpHeaders {
    /**
     * Internal map of lowercase header names to values.
     */
    private headers;
    /**
     * Internal map of lowercased header names to the normalized
     * form of the name (the form seen first).
     */
    private normalizedNames;
    /**
     * Complete the lazy initialization of this object (needed before reading).
     */
    private lazyInit;
    /**
     * Queued updates to be materialized the next initialization.
     */
    private lazyUpdate;
    /**  Constructs a new HTTP header object with the given values.*/
    constructor(headers?: string | {
        [name: string]: string | number | (string | number)[];
    } | Headers);
    /**
     * Checks for existence of a given header.
     *
     * @param name The header name to check for existence.
     *
     * @returns True if the header exists, false otherwise.
     */
    has(name: string): boolean;
    /**
     * Retrieves the first value of a given header.
     *
     * @param name The header name.
     *
     * @returns The value string if the header exists, null otherwise
     */
    get(name: string): string | null;
    /**
     * Retrieves the names of the headers.
     *
     * @returns A list of header names.
     */
    keys(): string[];
    /**
     * Retrieves a list of values for a given header.
     *
     * @param name The header name from which to retrieve values.
     *
     * @returns A string of values if the header exists, null otherwise.
     */
    getAll(name: string): string[] | null;
    /**
     * Appends a new value to the existing set of values for a header
     * and returns them in a clone of the original instance.
     *
     * @param name The header name for which to append the values.
     * @param value The value to append.
     *
     * @returns A clone of the HTTP headers object with the value appended to the given header.
     */
    append(name: string, value: string | string[]): HttpHeaders;
    /**
     * Sets or modifies a value for a given header in a clone of the original instance.
     * If the header already exists, its value is replaced with the given value
     * in the returned object.
     *
     * @param name The header name.
     * @param value The value or values to set or override for the given header.
     *
     * @returns A clone of the HTTP headers object with the newly set header value.
     */
    set(name: string, value: string | string[]): HttpHeaders;
    /**
     * Deletes values for a given header in a clone of the original instance.
     *
     * @param name The header name.
     * @param value The value or values to delete for the given header.
     *
     * @returns A clone of the HTTP headers object with the given value deleted.
     */
    delete(name: string, value?: string | string[]): HttpHeaders;
}


/**
 * Http context stores arbitrary user defined values and ensures type safety without
 * actually knowing the types. It is backed by a `Map` and guarantees that keys do not clash.
 *
 * This context is mutable and is shared between cloned requests unless explicitly specified.
 *
 * @usageNotes
 *
 * ### Usage Example
 *
 * ```ts
 * // inside cache.interceptors.ts
 * export const IS_CACHE_ENABLED = new HttpContextToken<boolean>(() => false);
 *
 * export class CacheInterceptor implements HttpInterceptor {
 *
 *   intercept(req: HttpRequest<any>, delegate: HttpHandler): Observable<HttpEvent<any>> {
 *     if (req.context.get(IS_CACHE_ENABLED) === true) {
 *       return ...;
 *     }
 *     return delegate.handle(req);
 *   }
 * }
 *
 * // inside a service
 *
 * this.httpClient.get('/api/weather', {
 *   context: new HttpContext().set(IS_CACHE_ENABLED, true)
 * }).subscribe(...);
 * ```
 *
 * @publicApi
 */
export declare class HttpContext {
    private readonly map;
    /**
     * Store a value in the context. If a value is already present it will be overwritten.
     *
     * @param token The reference to an instance of `HttpContextToken`.
     * @param value The value to store.
     *
     * @returns A reference to itself for easy chaining.
     */
    set<T>(token: HttpContextToken<T>, value: T): HttpContext;
    /**
     * Retrieve the value associated with the given token.
     *
     * @param token The reference to an instance of `HttpContextToken`.
     *
     * @returns The stored value or default if one is defined.
     */
    get<T>(token: HttpContextToken<T>): T;
    /**
     * Delete the value associated with the given token.
     *
     * @param token The reference to an instance of `HttpContextToken`.
     *
     * @returns A reference to itself for easy chaining.
     */
    delete(token: HttpContextToken<unknown>): HttpContext;
    /**
     * Checks for existence of a given token.
     *
     * @param token The reference to an instance of `HttpContextToken`.
     *
     * @returns True if the token exists, false otherwise.
     */
    has(token: HttpContextToken<unknown>): boolean;
    /**
     * @returns a list of tokens currently stored in the context.
     */
    keys(): IterableIterator<HttpContextToken<unknown>>;
}


/**
 * A token used to manipulate and access values stored in `HttpContext`.
 *
 * @publicApi
 */
export declare class HttpContextToken<T> {
    readonly defaultValue: () => T;
    constructor(defaultValue: () => T);
}

/**
 * A codec for encoding and decoding parameters in URLs.
 *
 * Used by `HttpParams`.
 *
 * @publicApi
 **/
export declare interface HttpParameterCodec {
    encodeKey(key: string): string;
    encodeValue(value: string): string;
    decodeKey(key: string): string;
    decodeValue(value: string): string;
}

/**
 * Options used to construct an `HttpParams` instance.
 *
 * @publicApi
 */
export declare interface HttpParamsOptions {
    /**
     * String representation of the HTTP parameters in URL-query-string format.
     * Mutually exclusive with `fromObject`.
     */
    fromString?: string;
    /** Object map of the HTTP parameters. Mutually exclusive with `fromString`. */
    fromObject?: {
        [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
    };
    /** Encoding codec used to parse and serialize the parameters. */
    encoder?: HttpParameterCodec;
}


/**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immutable; all mutation operations return a new instance.
 *
 * @publicApi
 */
export declare class HttpParams {
    private map;
    private encoder;
    private updates;
    private cloneFrom;
    constructor(options?: HttpParamsOptions);
    /**
     * Reports whether the body includes one or more values for a given parameter.
     * @param param The parameter name.
     * @returns True if the parameter has one or more values,
     * false if it has no value or is not present.
     */
    has(param: string): boolean;
    /**
     * Retrieves the first value for a parameter.
     * @param param The parameter name.
     * @returns The first value of the given parameter,
     * or `null` if the parameter is not present.
     */
    get(param: string): string | null;
    /**
     * Retrieves all values for a  parameter.
     * @param param The parameter name.
     * @returns All values in a string array,
     * or `null` if the parameter not present.
     */
    getAll(param: string): string[] | null;
    /**
     * Retrieves all the parameters for this body.
     * @returns The parameter names in a string array.
     */
    keys(): string[];
    /**
     * Appends a new value to existing values for a parameter.
     * @param param The parameter name.
     * @param value The new value to add.
     * @return A new body with the appended value.
     */
    append(param: string, value: string | number | boolean): HttpParams;
    /**
     * Constructs a new body with appended values for the given parameter name.
     * @param params parameters and values
     * @return A new body with the new value.
     */
    appendAll(params: {
        [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
    }): HttpParams;
    /**
     * Replaces the value for a parameter.
     * @param param The parameter name.
     * @param value The new value.
     * @return A new body with the new value.
     */
    set(param: string, value: string | number | boolean): HttpParams;
    /**
     * Removes a given value or all values from a parameter.
     * @param param The parameter name.
     * @param value The value to remove, if provided.
     * @return A new body with the given value removed, or with all values
     * removed if no value is specified.
     */
    delete(param: string, value?: string | number | boolean): HttpParams;
    /**
     * Serializes the body to an encoded string, where key-value pairs (separated by `=`) are
     * separated by `&`s.
     */
    toString(): string;
}

export declare interface HttpReqOptionsBase {
    headers?: HttpHeaders | { [header: string]: string | string[] },
    context?: HttpContext,
    params?: HttpParams |
    { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    reportProgress?: boolean,
    withCredentials?: boolean,
    transferCache?: { includeHeaders?: string[]; } | boolean;
}
declare type HttpResponseType = 'arraybuffer' | 'blob' | 'text' | 'json';
declare type HttpReqOptionsBodyBase<T extends HttpResponseType> = HttpReqOptionsBase & { observe?: 'body', responseType?: T };
declare type HttpReqOptionsEventsBase<T extends HttpResponseType> = HttpReqOptionsBase & { observe: 'events', responseType?: T };
declare type HttpReqOptionsResponseBase<T extends HttpResponseType> = HttpReqOptionsBase & { observe: 'response', responseType?: T };

declare type HttpReqOptionsBody = HttpReqOptionsBodyBuffer | HttpReqOptionsBodyBlob | HttpReqOptionsBodyText | HttpReqOptionsBodyJson;
declare type HttpReqOptionsEvents = HttpReqOptionsEventsBuffer | HttpReqOptionsEventsBlob | HttpReqOptionsEventsText | HttpReqOptionsEventsJson;
declare type HttpReqOptionsResponse = HttpReqOptionsResponseBuffer | HttpReqOptionsResponseBlob | HttpReqOptionsResponseText | HttpReqOptionsResponseJson;

export declare type HttpReqOptionsBodyBuffer = HttpReqOptionsBodyBase<'arraybuffer'>;
export declare type HttpReqOptionsBodyBlob = HttpReqOptionsBodyBase<'blob'>;
export declare type HttpReqOptionsBodyText = HttpReqOptionsBodyBase<'text'>;
export declare type HttpReqOptionsBodyJson = HttpReqOptionsBodyBase<'json'>;

export declare type HttpReqOptionsEventsBuffer = HttpReqOptionsEventsBase<'arraybuffer'>;
export declare type HttpReqOptionsEventsBlob = HttpReqOptionsEventsBase<'blob'>;
export declare type HttpReqOptionsEventsText = HttpReqOptionsEventsBase<'text'>;
export declare type HttpReqOptionsEventsJson = HttpReqOptionsEventsBase<'json'>;

export declare type HttpReqOptionsResponseBuffer = HttpReqOptionsResponseBase<'arraybuffer'>;
export declare type HttpReqOptionsResponseBlob = HttpReqOptionsResponseBase<'blob'>;
export declare type HttpReqOptionsResponseText = HttpReqOptionsResponseBase<'text'>;
export declare type HttpReqOptionsResponseJson = HttpReqOptionsResponseBase<'json'>;


export declare type HttpReqOptions = HttpReqOptionsBody | HttpReqOptionsEvents | HttpReqOptionsResponse;

export declare interface HttpHandleOptions {
    auditAction?: string;
    errorHandleType?: ErrorHandleType;
    logError?: boolean;
    argsType?: 'path' | 'query',
    enableCache?: boolean;
}

/**
 * Type enumeration for the different kinds of `HttpEvent`.
 *
 * @publicApi
 */
export declare enum HttpEventType {
    /**
     * The request was sent out over the wire.
     */
    Sent = 0,
    /**
     * An upload progress event was received.
     *
     * Note: The `FetchBackend` doesn't support progress report on uploads.
     */
    UploadProgress = 1,
    /**
     * The response status code and headers were received.
     */
    ResponseHeader = 2,
    /**
     * A download progress event was received.
     */
    DownloadProgress = 3,
    /**
     * The full response including the body was received.
     */
    Response = 4,
    /**
     * A custom event from an interceptor or a backend.
     */
    User = 5
}

/**
 * An event indicating that the request was sent to the server. Useful
 * when a request may be retried multiple times, to distinguish between
 * retries on the final event stream.
 *
 * @publicApi
 */
export declare interface HttpSentEvent {
    type: HttpEventType.Sent;
}


/**
 * A full HTTP response, including a typed response body (which may be `null`
 * if one was not returned).
 *
 * `HttpResponse` is a `HttpEvent` available on the response event
 * stream.
 *
 * @publicApi
 */
export declare class HttpResponse<T> extends HttpResponseBase {
    /**
     * The response body, or `null` if one was not returned.
     */
    readonly body: T | null;
    /**
     * Construct a new `HttpResponse`.
     */
    constructor(init?: {
        body?: T | null;
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    });
    readonly type: HttpEventType.Response;
    clone(): HttpResponse<T>;
    clone(update: {
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    }): HttpResponse<T>;
    clone<V>(update: {
        body?: V | null;
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    }): HttpResponse<V>;
}

/**
 * Base interface for progress events.
 *
 * @publicApi
 */
export declare interface HttpProgressEvent {
    /**
     * Progress event type is either upload or download.
     */
    type: HttpEventType.DownloadProgress | HttpEventType.UploadProgress;
    /**
     * Number of bytes uploaded or downloaded.
     */
    loaded: number;
    /**
     * Total number of bytes to upload or download. Depending on the request or
     * response, this may not be computable and thus may not be present.
     */
    total?: number;
}

/**
 * A user-defined event.
 *
 * Grouping all custom events under this type ensures they will be handled
 * and forwarded by all implementations of interceptors.
 *
 * @publicApi
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export declare interface HttpUserEvent<T> {
    type: HttpEventType.User;
}

/**
 * Union type for all possible events on the response stream.
 *
 * Typed according to the expected type of the response.
 *
 * @publicApi
 */
export declare type HttpEvent<T> = HttpSentEvent | HttpHeaderResponse | HttpResponse<T> | HttpProgressEvent | HttpUserEvent<T>;


/**
 * Base class for both `HttpResponse` and `HttpHeaderResponse`.
 *
 * @publicApi
 */
export declare abstract class HttpResponseBase {
    /**
     * All response headers.
     */
    readonly headers: HttpHeaders;
    /**
     * Response status code.
     */
    readonly status: number;
    /**
     * Textual description of response status code, defaults to OK.
     *
     * Do not depend on this.
     */
    readonly statusText: string;
    /**
     * URL of the resource retrieved, or null if not available.
     */
    readonly url: string | null;
    /**
     * Whether the status code falls in the 2xx range.
     */
    readonly ok: boolean;
    /**
     * Type of the response, narrowed to either the full response or the header.
     */
    readonly type: HttpEventType.Response | HttpEventType.ResponseHeader;
    /**
     * Super-constructor for all responses.
     *
     * The single parameter accepted is an initialization hash. Any properties
     * of the response passed there will override the default values.
     */
    constructor(init: {
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    }, defaultStatus?: number, defaultStatusText?: string);
}

/**
 * A partial HTTP response which only includes the status and header data,
 * but no response body.
 *
 * `HttpHeaderResponse` is a `HttpEvent` available on the response
 * event stream, only when progress events are requested.
 *
 * @publicApi
 */
export declare class HttpHeaderResponse extends HttpResponseBase {
    /**
     * Create a new `HttpHeaderResponse` with the given parameters.
     */
    constructor(init?: {
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    });
    readonly type: HttpEventType.ResponseHeader;
    /**
     * Copy this `HttpHeaderResponse`, overriding its contents with the
     * given parameter hash.
     */
    clone(update?: {
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    }): HttpHeaderResponse;
}



export declare class ICSHttpService {

    get<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    get<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    get<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    get(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;

    delete<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    delete<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    delete<T = unknown>(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    delete(url: string | string[], args?: IGenericRecord | IArray,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;

    post<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    post<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    post<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    post(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;

    put<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    put<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    put<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    put(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;

    patch<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyJson): Observable<T | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBuffer): Observable<ArrayBuffer | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyBlob): Observable<Blob | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsBodyText): Observable<string | null>;

    patch<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsJson): Observable<HttpEvent<T> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBuffer): Observable<HttpEvent<ArrayBuffer> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsBlob): Observable<HttpEvent<Blob> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsEventsText): Observable<HttpEvent<string> | null>;

    patch<T = unknown>(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseJson): Observable<HttpResponse<T> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBuffer): Observable<HttpResponse<ArrayBuffer> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseBlob): Observable<HttpResponse<Blob> | null>;
    patch(url: string | string[], body: unknown,
        handleOptions?: HttpHandleOptions, reqOptions?: HttpReqOptionsResponseText): Observable<HttpResponse<string> | null>;
}

export declare type ErrorHandleType = 'string' | 'string-translate' | 'original' | 'ignore' | '';
export declare type DataResponseType = 'set' | 'table' | 'row' | 'value' | 'json' | 'bytes' | 'execute';
export declare type DataHttpHandleOptions = Omit<HttpHandleOptions, "argsType">;

export declare type DataTableCompactResponseType = { columns: string[], rows: Array<unknown>[] };
export declare type DataTableResponseType = IGenericRecord[];
export declare type DataSetResponseType = IRecord<DataTableResponseType>;

export declare interface ICSDataRequestBase<T extends DataResponseType> {
    dbContext?: string;
    queryName?: string;
    additional?: string;
    responseType?: T;
    args?: IGenericRecord;
    auditInfo?: ICSRequestAuditInfo;
}

export declare interface ICSRequestAuditInfo {
    auditLogKey?: string;
    action?: string;
}

export declare interface ICSSaveRequest {
    oldArgs?: IGenericRecord;
    files?: ICSFileInfo[];
}

declare type IDataRequestReturnSet = ICSDataRequestBase<'set'>;
declare type IDataRequestReturnTable = ICSDataRequestBase<'table'>;
declare type IDataRequestReturnRow = ICSDataRequestBase<'row'>;
declare type IDataRequestReturnValue = ICSDataRequestBase<'value'>;
declare type IDataRequestReturnJson = ICSDataRequestBase<'json'>;
declare type IDataRequestReturnBytes = ICSDataRequestBase<'bytes'>;
declare type IDataRequestReturnNone = ICSDataRequestBase<'execute'>;

export declare type ICSDataRequest =
    IDataRequestReturnSet | IDataRequestReturnTable |
    IDataRequestReturnRow | IDataRequestReturnValue |
    IDataRequestReturnJson | IDataRequestReturnBytes | IDataRequestReturnNone;

export declare interface ICSLookupData {
    key?: number,
    data: IGenericRecord;
}

export declare interface ICSLookupDefinition extends ICSLookupData {
    name: string;
    protected?: boolean;
}


export declare class ICSDataService {
    get(request: IDataRequestReturnTable, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<DataTableResponseType | null>;
    get<T>(request: IDataRequestReturnTable, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T[] | null>;
    get(request: IDataRequestReturnSet, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<DataSetResponseType | null>;
    get<T extends IGenericRecord = IGenericRecord>(request: IDataRequestReturnRow, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    get<T = unknown>(request: IDataRequestReturnValue, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    get<T extends IGenericRecord = IGenericRecord>(request: IDataRequestReturnJson, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    get(request: IDataRequestReturnBytes, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<Blob | null>;

    save(request: IDataRequestReturnSet & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<DataSetResponseType | null>;
    save(request: IDataRequestReturnTable & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<DataTableResponseType | null>;
    save<T extends IGenericRecord = IGenericRecord>(request: IDataRequestReturnRow & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    save<T = unknown>(request: IDataRequestReturnValue & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    save<T extends IGenericRecord = IGenericRecord>(request: IDataRequestReturnJson & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T | null>;
    save(request: IDataRequestReturnBytes & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<Blob | null>;
    save(request: IDataRequestReturnNone & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<number | null>;
}

export declare class ICSLookupService {
    get<T = IGenericRecord>(lookupKey: number, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T>;
    save(lookupKey: number, data: ICSLookupData, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<ICSLookupData>;
    delete(lookupKey: number, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<boolean>;
    getDefinition<T = IGenericRecord>(lookupKey?: number, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<T>;
    getDefinitionKeys(options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<ICSLookupDefinition>;
    saveDefinition(lookupKey: number, data: ICSLookupDefinition, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<ICSLookupData>;
    deleteDefinition(lookupKey: number, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): Observable<boolean>;
}
