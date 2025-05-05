import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private apiUrl = 'http://localhost:3000/gridData';  // Your JSON server API

  constructor(private http: HttpClient) {}

  // Fetch records
  getRecords(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  addRecord(record: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, record);
  }

  // Update a record
  updateRecord(record: any): Observable<any> {
    if (!record.id) {
      console.error('Record ID is missing. Cannot update.');
      throw new Error('Record ID is required for updating.');
    }

    console.log('Updating record with ID:', record.id); // Debugging log
    console.log('Payload:', record); // Debugging log

    return this.http.put<any>(`${this.apiUrl}/${record.id}`, record).pipe(
      catchError((error) => {
        console.error('Error updating record:', error);
        return throwError(() => new Error('Failed to update record.')); // Improved error handling
      })
    );
  }

  // Delete a record
  deleteRecord(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string): any {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

}                                                                                                                                                                                                                                                                                                                                                    
