export interface Record {
  id?: number; // json-server will auto-create this
  recordId: string;
  lastName: string;
  firstName: string;
  email: string;
  phoneType: string | null;
  leadId: string | null;
  appointmentType: string;
  bookingAgency: string | null;
  assignedDate: string | null;
  salesRep: string;
  coordinator: string | null;
  syncToMobile: boolean | null;
  createdSource: string;
  mobileSyncStatus: string | null;
  effectiveDate: string | null;
  validThrough: string | null;
}
