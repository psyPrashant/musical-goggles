import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StaffMember, StaffRequest } from './staff.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient);

  listStaff(): Observable<StaffMember[]> {
    return this.http.get<StaffMember[]>('/api/staff');
  }

  createStaff(req: StaffRequest): Observable<StaffMember> {
    return this.http.post<StaffMember>('/api/staff', req);
  }

  updateStaff(id: string, req: StaffRequest): Observable<StaffMember> {
    return this.http.put<StaffMember>(`/api/staff/${id}`, req);
  }
}
