import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { Settings } from '../config/settings';
import { PostCacheService } from './cache/post-cache.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private requestQueue: (() => Promise<any>)[] = [];
  private activeRequests = 0;

  constructor(
    private http: HttpClient,
    private postCache: PostCacheService,
  ) { }

  async postData<T>(url: string, data: any): Promise<T> {
    const dataStr = JSON.stringify(data);
    const requestKey = `${url}|||${dataStr}`;
    const requestIsCached = requestKey in this.postCache.cache;

    if (requestIsCached) {
      return this.postCache.cache[requestKey];
    }

    return new Promise<T>((resolve, reject) => {
      const request = async () => {
        try {
          // Debug request payload
          // eslint-disable-next-line no-console
          // console.debug('[ApiService] POST', url, data);
          const response = await lastValueFrom(
            this.http.post<T>(url, data).pipe(
              catchError((error) => {
                // Enhanced error logging to surface ES error details
                // eslint-disable-next-line no-console
                console.error('[ApiService] Request failed', {
                  url,
                  payload: data,
                  status: error?.status,
                  statusText: error?.statusText,
                  message: error?.message,
                  errorBody: error?.error,
                });
                reject(error);
                return throwError(() => error);
              }),
            ),
          );
          this.postCache.cache[requestKey] = response;
          resolve(response);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this._processQueue();
        }
      };

      this.requestQueue.push(request);
      this._processQueue();
    });
  }

  async postSparqlQuery<T>(url: string, query: string): Promise<T> {
    const requestKey = `${url}|||SPARQL|||${query}`;
    const requestIsCached = requestKey in this.postCache.cache;

    if (requestIsCached) {
      return this.postCache.cache[requestKey];
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/sparql-query',
      Accept: 'application/sparql-results+json',
    });

    return new Promise<T>((resolve, reject) => {
      const request = async () => {
        try {
          const response = await lastValueFrom(
            this.http.post<T>(url, query, { headers }).pipe(
              catchError((error) => {
                // Enhanced error logging to surface ES error details
                // eslint-disable-next-line no-console
                console.error('[ApiService] SPARQL request failed', {
                  url,
                  query,
                  status: error?.status,
                  statusText: error?.statusText,
                  message: error?.message,
                  errorBody: error?.error,
                });
                reject(error);
                return throwError(() => error);
              }),
            ),
          );
          // Temporary debugging aid while validating the Qlever response shape.
          // eslint-disable-next-line no-console
          console.log('[ApiService] SPARQL raw response', { url, query, response });

          const normalizedResponse =
            this._normalizeSparqlResponse(response);
          // eslint-disable-next-line no-console
          console.log('[ApiService] SPARQL normalized response', normalizedResponse);

          this.postCache.cache[requestKey] = normalizedResponse;
          resolve(normalizedResponse);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this._processQueue();
        }
      };

      this.requestQueue.push(request);
      this._processQueue();
    });
  }

  private _normalizeSparqlResponse<T>(response: T): T {
    if (Array.isArray(response)) {
      return response;
    }

    const maybeSparqlJson = response as {
      results?: { bindings?: Array<Record<string, any>> };
      boolean?: boolean;
    };

    if (Array.isArray(maybeSparqlJson?.results?.bindings)) {
      const normalizedBindings = maybeSparqlJson.results.bindings.map(
        (binding) => {
          const normalizedBinding: Record<string, any> = {};
          for (const [key, value] of Object.entries(binding)) {
            if (
              value &&
              typeof value === 'object' &&
              'value' in value &&
              typeof (value as { value?: unknown }).value !== 'undefined'
            ) {
              normalizedBinding[key] = (value as { value: unknown }).value;
            } else {
              normalizedBinding[key] = value;
            }
          }
          return normalizedBinding;
        },
      );

      return normalizedBindings as T;
    }

    if (typeof maybeSparqlJson?.boolean === 'boolean') {
      return maybeSparqlJson.boolean as T;
    }

    return response;
  }

  private _processQueue() {
    while (
      this.activeRequests < Settings.endpoints.maxNumParallelRequests &&
      this.requestQueue.length > 0
    ) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        this.activeRequests++;
        void nextRequest();
      }
    }
  }
}
