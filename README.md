# CampusFlow frontend

Next.js frontend for the University Management System API. Backend source and API contract were supplied separately in the University-Management-System archive.

## Start

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_URL` to the backend origin, such as `http://localhost:5000`. The frontend adds `/api/v1` when needed.
3. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` if Google sign-in is enabled.
4. Set `NEXT_PUBLIC_SEMESTER_REGISTRATION_AMOUNT` to your institution's fee in BDT.
5. Run `npm install` and `npm run dev`.

The browser sends authenticated requests to the same-origin `/api/backend/*` proxy. The proxy forwards the HTTP-only `campusflow_session` token to the API.

## Available workflows

- Student registration, email verification, sign in, Google sign in, and password reset.
- Instructor application and email verification.
- Role-aware course registration, with the backend's eight-course requirement.
- Course catalog, departments, programs, semesters, and sections.
- Attendance records, exams, and exam results.
- Semester fee checkout and payment history.
- Notifications, profile details, and instructor approval.

The backend currently exposes a student's own profile rather than a student directory, and instructor approval by ID rather than an application listing. The frontend exposes the workflows supported by those routes.
