import { inject, Injectable } from "@angular/core";
import { appendToFormData, objectForEach } from "@codinus/js-extensions";
import { CODINUS_HTTP_SERVICE, HttpReqOptions } from "@ngx-codinus/cdk/http";
import { ICSFileInfo } from "@ngx-codinus/core/shared";
import { map, Observable, of, switchMap, throwError } from "rxjs";
import { DbAPIKeys } from "./constants";
import { CODINUS_DATA_RESPONSE_PARSER, DataHttpHandleOptions, ICSDataRequest, ICSDataService, ICSSaveRequest } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IGenericObservable = Observable<any>;
type IAnyDataRequest = ICSDataRequest | (ICSDataRequest & ICSSaveRequest) | undefined;

@Injectable({ providedIn: 'root' })
export class CSDataService implements ICSDataService {

    private _parser = inject(CODINUS_DATA_RESPONSE_PARSER, { optional: true });
    private _http = inject(CODINUS_HTTP_SERVICE);

    get(request: ICSDataRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): IGenericObservable {
        return this.postRequest(request, false, options, reqOptions);
    }

    save(request: ICSDataRequest & ICSSaveRequest, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): IGenericObservable {
        return this.postRequest(request, true, options, reqOptions);
    }

    private postRequest(request: ICSDataRequest, checkFiles: boolean, options?: DataHttpHandleOptions, reqOptions?: HttpReqOptions): IGenericObservable {
        const type = !request.responseType ? 'table' : request.responseType === 'bytes' ? 'value' : request.responseType;
        const url = [DbAPIKeys.key, DbAPIKeys.endpoints[type]];

        return this._verifyDataSource(request, checkFiles).pipe(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            switchMap(args => this._http.post(url, args, options, reqOptions as any)),
            map(d => this._parser ? this._parser.parse(d, type) : d)
        );
    }

    private _verifyDataSource(dataRequest: IAnyDataRequest, checkFiles: boolean): IGenericObservable {

        if (!dataRequest)
            return throwError(() => 'DbError.UndefindDatasource');
        else if (!dataRequest?.queryName || !dataRequest.dbContext)
            return throwError(() => 'DbError.InvalidQuery');

        return this._convertToFormData(dataRequest, checkFiles);
    }

    private _convertToFormData(request: ICSDataRequest & ICSSaveRequest, checkFiles: boolean) {
        if (!checkFiles || !Array.isArray(request.files) || request.files.length === 0)
            return of(request);

        const formData = new FormData();
        const reqFiles: ICSFileInfo[] = [];
        request.files.forEach(f => {
            if (f?.uniqueKey && f.content) {
                formData.append(f.uniqueKey, f.content);
                const reqFile = { ...f };
                delete reqFile.content;
                reqFiles.push(reqFile);
            }
        });

        appendToFormData(formData, 'files', reqFiles);
        objectForEach(request,
            (key, value) => appendToFormData(formData, key, value),
            key => key !== 'files');

        return of(formData);
    }
}