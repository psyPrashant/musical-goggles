export type StaffRole = 'ADMIN' | 'RECRUITER';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  createdAt: string;
}

export interface StaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: StaffRole;
}
