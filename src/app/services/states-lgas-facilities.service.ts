import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface LgaFacilitiesSet {
  lga: string;
  facilities: string[];
}

interface LgasFacilities {
  lgas: LgaFacilitiesSet[];
}

export interface State {
  id: string;
  state: string;
  lgasFacilities: LgasFacilities;
}

interface StatesResponse extends Array<State> {}

@Injectable({
  providedIn: 'root',
})
export class StatesLgasFacilitiesService {
  private url = 'http://localhost:8080/api/states';

  constructor(private httpClient: HttpClient) {}

  getStatesLgasFacilities(): Observable<StatesResponse> {
    return this.httpClient.get<StatesResponse>(this.url).pipe(
      tap((response) =>
        console.log('Fetched states, lgas, and facilities: ', response)
      ),
      catchError((error) => {
        console.log('Error loading states, lgas and facilities: ', error);
        return throwError(() => error);
      })
    );
  }
}
