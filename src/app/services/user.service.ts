import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/User/user.model';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface UserResponse {
  content: User[];
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
export class UserService {
  private baseUrl = 'http://localhost:8080/api/pbiEmployees';
  private apiUrl = 'http://localhost:8080/api/pbiEmployees/all';

  constructor(private httpClient: HttpClient) {}

  getUserList(
    page: number = 0,
    size: number = 10,
    searchText: string = '',
    state?: string,
    lga?: string,
    facility?: string,
    status?: string,
    sortBy?: string,
    suspectedDuplicate?: boolean
  ): Observable<UserResponse> {
    let url = `${
      this.baseUrl
    }?page=${page}&size=${size}&searchText=${encodeURIComponent(searchText)}`;

    if (state) url += `&state=${encodeURIComponent(state)}`;
    if (lga) url += `&lga=${encodeURIComponent(lga)}`;
    if (facility) url += `&facility=${encodeURIComponent(facility)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;

    return this.httpClient.get<UserResponse>(url).pipe(
      tap((response) => console.log('Fetched users:', response)),
      catchError((error) => {
        console.error('Error fetching user list:', error);
        return throwError(() => error);
      })
    );
  }

  getAllUserList(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.apiUrl}`);
  }

  createUser(user: User, forceSave: boolean = false): Observable<any> {
    return this.httpClient
      .post(`${this.baseUrl}?forceSave=${forceSave}`, user)
      .pipe(
        catchError((error) => {
          if (error.status === 400) {
            return throwError(() => new Error(`Error 400: ${error.error}`));
          }
          return throwError(
            () => new Error(`An unexpected error occurred: ${error.message}`)
          );
        })
      );
  }

  getUserById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: string, user: User): Observable<Object> {
    return this.httpClient.put(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<Object> {
    return this.httpClient.delete(`${this.baseUrl}/${id}`);
  }
}
