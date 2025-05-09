// 1. Import necessary core and HTTP modules
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 2. Import your GridSettings interface (from interface2.ts)
import { GridSettings } from './interface2';

// 3. Optional: Helper to avoid circular JSON errors if needed
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (_key: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return;
      seen.add(value);
    }
    return value;
  };
};

// 4. Injectable decorator for root-level service usage
@Injectable({
  providedIn: 'root',
})
export class ServiceService {

  private apiUrl = 'http://localhost:3000/data';
  constructor(private http: HttpClient) {}
  
  saveToLocal(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  fetchGridSettings(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/gridSettings');
  }

  public saveGridSettingsToServer(settings: GridSettings): Observable<GridSettings> {
    return this.http.post<GridSettings>(this.apiUrl, settings);
  }

  fetchGridData(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getFromLocal<T>(key: string): T | null{
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  update(recordId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${recordId}`, data);
  }

  updateData(dataItem: any): Observable<any> {
    const url = `http://localhost:3000/data/${dataItem.id}`; // Assuming `id` is the unique identifier
    return this.http.put(url, dataItem);
  }
}
