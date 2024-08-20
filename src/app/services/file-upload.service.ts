// file-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private baseUrl = 'http://localhost:8080/api/pbiEmployees/import';

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<any> {
    // Create form data
    const formData = new FormData();

    // Store form name as "file" with file data
    formData.append('file', file, file.name);

    // Make http post request over api
    // with formData as req
    return this.http.post(this.baseUrl, formData);
  }

  // upload(file: File): Observable<HttpEvent<any>> {
  //   const formData: FormData = new FormData();

  //   formData.append('file', file);

  //   const req = new HttpRequest('POST', `${this.baseUrl}/import`, formData, {
  //     reportProgress: true,
  //     responseType: 'json',
  //   });

  //   return this.http.request(req).pipe(
  //     catchError((error) => {
  //       // Handle the error here
  //       console.error('Error  in FileUploadService during file upload:', error);
  //       // Optionally, transform the error before rethrowing it
  //       return throwError(
  //         () => new Error('Error during file upload in FileUploadService')
  //       );
  //     })
  //   );
  // }
}
