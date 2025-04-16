import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Record } from '../employees';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private apiUrl = 'http://localhost:3000/gridData';

  constructor(private http: HttpClient) {}

  getRecords(): Observable<Record[]> {
    return this.http.get<Record[]>(this.apiUrl);
  }

  addRecord(record: Record): Observable<Record> {
    return this.http.post<Record>(this.apiUrl, record);
  }

  updateRecord(record: Record): Observable<Record> {
    return this.http.put<Record>(`${this.apiUrl}/${record.id}`, record);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
