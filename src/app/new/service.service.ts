// import { Injectable } from '@angular/core';
// import { GridSettings } from './interface2';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';



// const getCircularReplacer = () => {
//   const seen = new WeakSet();
//   return (_key: any, value: any) => {
//     if (typeof value === "object" && value !== null) {
//       if (seen.has(value)) {
//         return;
//       }
//       seen.add(value);
//     }
//     return value;
//   };
// };
// @Injectable({
//   providedIn: 'root'
// })
// export class ServiceService {
//   private apiUrl = 'http://localhost:3000/gridSettings'; // adjust based on db.json

//   constructor(private http: HttpClient) {}

//   public getFromLocal<T>(token: string): T | null {
//     const settings = localStorage.getItem(token);
//     return settings ? JSON.parse(settings) : null;
//   }

//   public saveToLocal<T>(token: string, value: T): void {
//     localStorage.setItem(token, JSON.stringify(value));
//   }

//   public fetchGridSettings(): Observable<GridSettings> {
//     return this.http.get<GridSettings>(this.apiUrl);
//   }
// }
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
  // 5. Replace hardcoded URL with API base path from db.json
  private apiUrl = 'http://localhost:3000/gridSettings';

  // 6. Inject HttpClient
  constructor(private http: HttpClient) {}

  // 7. Generic method to get data from localStorage
  public getFromLocal<T>(token: string): T | null {
    const settings = localStorage.getItem(token);
    return settings ? JSON.parse(settings) : null;
  }

  // 8. Generic method to save data to localStorage
  public saveToLocal<T>(token: string, value: T): void {
    localStorage.setItem(token, JSON.stringify(value, getCircularReplacer()));
  }

  // 9. Call the API to fetch grid settings from db.json
  public fetchGridSettings(): Observable<GridSettings> {
    return this.http.get<GridSettings>(this.apiUrl);
  }

  // 10. (Optional) Save grid settings to mock API
  public saveGridSettingsToServer(settings: GridSettings): Observable<GridSettings> {
    return this.http.post<GridSettings>(this.apiUrl, settings);
  }
}
