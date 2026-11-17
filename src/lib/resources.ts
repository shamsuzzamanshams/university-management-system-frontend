import type { ResourceConfig } from "@/components/resource-manager";

export const departmentResources: ResourceConfig = {
  title: "Departments", description: "Create and maintain university departments.", endpoint: "department",
  columns: [{ key: "code", label: "Code" }, { key: "name", label: "Department" }, { key: "createdAt", label: "Created" }],
  fields: [{ name: "name", label: "Department name", required: true }, { name: "code", label: "Department code", required: true }],
};
export const programResources: ResourceConfig = {
  title: "Programs", description: "Manage degree programs and their department associations.", endpoint: "program",
  columns: [{ key: "name", label: "Program" }, { key: "code", label: "Code" }, { key: "department.name", label: "Department" }],
  fields: [{ name: "name", label: "Program name", required: true }, { name: "code", label: "Program code", required: true }, { name: "durationYrs", label: "Duration (years)", type: "number", required: true }, { name: "totalCredits", label: "Total credits", type: "number", required: true }, { name: "departmentId", label: "Department", type: "select", required: true, source: "department" }],
};
export const courseResources: ResourceConfig = {
  title: "Courses", description: "Browse the course catalog and manage course details.", endpoint: "course",
  columns: [{ key: "code", label: "Code" }, { key: "title", label: "Course title" }, { key: "credits", label: "Credits" }, { key: "department.name", label: "Department" }],
  fields: [{ name: "code", label: "Course code", required: true }, { name: "title", label: "Title", required: true }, { name: "credits", label: "Credits", type: "number", required: true }, { name: "departmentId", label: "Department", type: "select", required: true, source: "department" }, { name: "description", label: "Description", type: "textarea" }],
};
export const semesterResources: ResourceConfig = {
  title: "Semesters", description: "Set semester dates and registration availability.", endpoint: "semester", createEndpoint: "semester/create-semester", idField: "id",
  columns: [{ key: "name", label: "Semester" }, { key: "code", label: "Code" }, { key: "startDate", label: "Starts" }, { key: "endDate", label: "Ends" }, { key: "registrationOpen", label: "Registration open" }],
  fields: [{ name: "name", label: "Semester name", required: true }, { name: "code", label: "Semester code", required: true }, { name: "startDate", label: "Start date", type: "date", required: true }, { name: "endDate", label: "End date", type: "date", required: true }, { name: "registrationOpen", label: "Registration open", type: "checkbox" }],
};
export const sectionResources: ResourceConfig = {
  title: "Sections", description: "Schedule course sections and assign instructors.", endpoint: "section",
  columns: [{ key: "name", label: "Section" }, { key: "schedule", label: "Schedule" }, { key: "roomNumber", label: "Room" }, { key: "capacity", label: "Capacity" }, { key: "semesterId", label: "Semester ID" }],
  fields: [{ name: "name", label: "Section name", required: true }, { name: "capacity", label: "Capacity", type: "number", required: true }, { name: "roomNumber", label: "Room number" }, { name: "schedule", label: "Schedule", required: true }, { name: "semesterId", label: "Semester", type: "select", required: true, source: "semester" }, { name: "instructorId", label: "Instructor ID", required: true }],
};
export const attendanceResources: ResourceConfig = {
  title: "Attendance", description: "Record and update attendance for enrolled students.", endpoint: "attendance",
  columns: [{ key: "date", label: "Date" }, { key: "studentId", label: "Student ID" }, { key: "sectionId", label: "Section ID" }, { key: "status", label: "Status" }, { key: "remarks", label: "Remarks" }],
  fields: [{ name: "date", label: "Date", type: "date", required: true }, { name: "studentId", label: "Student ID", required: true }, { name: "sectionId", label: "Section ID", required: true }, { name: "status", label: "Attendance status", type: "select", required: true, options: ["PRESENT", "ABSENT", "LATE", "EXCUSED"].map((value) => ({ label: value, value })) }, { name: "remarks", label: "Remarks", type: "textarea" }],
};
export const examResources: ResourceConfig = {
  title: "Exams & results", description: "Schedule exams, enter marks, and manage published results.", endpoint: "exam",
  columns: [{ key: "title", label: "Exam" }, { key: "examDate", label: "Date" }, { key: "maxMarks", label: "Maximum marks" }, { key: "weightage", label: "Weightage" }, { key: "sectionId", label: "Section ID" }],
  fields: [{ name: "title", label: "Exam title", required: true }, { name: "examDate", label: "Exam date", type: "date", required: true }, { name: "maxMarks", label: "Maximum marks", type: "number", required: true }, { name: "weightage", label: "Weightage (%)", type: "number", required: true }, { name: "sectionId", label: "Section ID", required: true }],
};
export const notificationResources: ResourceConfig = {
  title: "Notifications", description: "Review your updates and mark them as read.", endpoint: "notification", canCreate: false, canEdit: false, canDelete: true,
  columns: [{ key: "title", label: "Notification" }, { key: "message", label: "Message" }, { key: "isRead", label: "Read" }, { key: "createdAt", label: "Received" }],
  fields: [],
};
