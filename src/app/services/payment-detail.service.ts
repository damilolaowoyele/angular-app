import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentDetail } from '../models/payment-detail.model';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { of } from 'rxjs';

interface PaymentResponse {
  content: PaymentDetail[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentDetailService {
  // private baseUrl = 'http://localhost:8080/api/pbiPayments/generate';
  private apiUrl = 'http://localhost:8080/api/pbiPayments/generate';
  private exportUrl = 'http://localhost:8080/api/pbiPayments/export';

  // constructor(private httpClient: HttpClient) {}
  constructor(private http: HttpClient) {}

  getPaymentDetails(
    fromDate: string,
    toDate: string,
    page: number,
    size: number,
    // sort: string[],
    searchTerm?: string,
    state?: string,
    lga?: string,
    facility?: string,
    teamType?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('page', page.toString())
      .set('size', size.toString());
    // .set('sort', sort.join(','));

    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (state) params = params.set('state', state);
    if (lga) params = params.set('lga', lga);
    if (facility) params = params.set('facility', facility);
    if (teamType) params = params.set('teamType', teamType);

    return this.http.get<PaymentResponse>(this.apiUrl, { params }).pipe(
      tap((response) => console.log('Fetched payment details:', response)),
      catchError((error) => {
        console.error('Error fetching payment details:', error);
        return throwError(error);
      })
    );
  }

  exportPaymentDetailsCSV(
    fromDate: string,
    toDate: string,
    searchTerm?: string,
    state?: string,
    lga?: string,
    facility?: string,
    teamType?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (state) params = params.set('state', state);
    if (lga) params = params.set('lga', lga);
    if (facility) params = params.set('facility', facility);
    if (teamType) params = params.set('teamType', teamType);

    return this.http
      .get(this.exportUrl, {
        params,
        responseType: 'blob' as 'json',
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Unexpected response type:', error);
          return of(null);
        })
      );
  }
}
