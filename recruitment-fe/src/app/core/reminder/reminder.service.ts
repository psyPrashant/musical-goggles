import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReminderSendLogDto } from './reminder.model';

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly http = inject(HttpClient);

  sendReminder(invitationId: string): Observable<ReminderSendLogDto> {
    return this.http.post<ReminderSendLogDto>(`/api/invitations/${invitationId}/reminders`, {});
  }

  getReminderHistory(invitationId: string): Observable<ReminderSendLogDto[]> {
    return this.http.get<ReminderSendLogDto[]>(`/api/invitations/${invitationId}/reminders`);
  }
}
