export type ReminderSendType = 'AUTOMATED' | 'MANUAL';

export interface ReminderSendLogDto {
  id: string;
  sentAt: string;
  sendType: ReminderSendType;
  sentBy: string | null;
}
