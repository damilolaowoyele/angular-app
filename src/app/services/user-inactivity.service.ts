import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserInactivityService {
  private baseUrl = 'http://localhost:8080/api/inactivities';

  constructor(private http: HttpClient) {}

  getInactivitiesByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/employee/${userId}`);
  }

  addInactivity(inactivity: any): Observable<any> {
    return this.http.post(this.baseUrl, inactivity);
  }

  deleteInactivity(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
