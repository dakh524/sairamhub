export interface Material {
  year?: string; // 1st Year, 2nd Year, 3rd Year, 4th Year
  dept: string; // CSE, IT, ECE, EEE, AIML, AIDS, CSBS, Mechanical, Civil, Chemical, Biomedical
  sem: string; // 1, 2, 3, 4, 5, 6, 7, 8
  subject: string; // e.g. Digital Electronics
  level: string; // Semester, Subject, Unit
  material_type: string; // Notes, Study Materials, Question Papers, Important Questions, Lab Materials, Record Notes, Viva Questions, Video Resources
  title: string; // e.g. Unit 1 - Basic Concepts
  drive_link: string; // Google Drive link
  contributor_name: string; // Uploaded By
  contributor_phone?: string;
  approved: string; // YES or NO
  date: string; // Upload Date
}

export interface Announcement {
  id: string;
  title: string;
  message?: string;
  desc: string;
  type: string;
  venue: string;
  details: string;
  link: string;
  date: string;
}
