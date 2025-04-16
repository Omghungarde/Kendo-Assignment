import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  // Update a record
  updateRecord(record: any): Observable<any> {
    console.log('Updating record with ID:', record.id); // Debugging log
    console.log('Payload:', record); // Debugging log
    return this.http.put<any>(`${this.apiUrl}/${record.id}`, record);
  }

  // Delete a record
  deleteRecord(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
