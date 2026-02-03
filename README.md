# Appointment & Resource Management Platform

**Appointment & Resource Management Platform** is a comprehensive, multi-tenant scheduling platform designed to handle complex resource management and appointment bookings. While currently tailored for barber shops as a primary use case, the underlying architecture is a **general-purpose booking engine** suitable for any service-based business (salons, consultants, medical clinics).

It solves the core challenges of service businesses: **availability concurrency**, **staff scheduling**, and **multi-tenant isolation**.

## ✨ Key Features

*   **Multi-Tenancy Architecture**: True data isolation where each organization has its own branded portal, services, customers, and staff settings, all running on a single deployment.
*   **Advanced Service Management**:
    *   **Flexible Service Definitions**: Configure services with custom durations, pricing (in cents for precision), and descriptions.
    *   **Staff Assignment**: Link specific services to qualified staff members (e.g., only Senior Barbers can perform "Premium Shave").
    *   **Active/Inactive States**: Toggle service visibility instantly without deleting historical data.
*   **Public Booking Engine**:
    *   **Conflict-Free Scheduling**: Uses a sophisticated "sieve" algorithm to calculate real-time availability by intersecting Base Schedules, Overrides (Time-off/Extra-work), and Existing Bookings.
    *   **Race Condition Handling**: Prevents double-bookings even under high concurrency.
    *   **Auto-Assignment**: Smart logic to automatically assign the "Best Available" staff member if the customer selects "Any Professional".
*   **Granular Staff Scheduling**:
    *   **Weekly Rotation**: Set recurring operating hours per staff member (e.g., Mon-Wed 9-5, Thu 12-8).
    *   **Overrides & Exceptions**: Handle one-off events like "Sick Day", "Vacation", or "Overtime" that override standard hours.
*   **Role-Based Access Control (RBAC)**:
    *   **Owner**: Full organization control, billing, and staff management.
    *   **Admin**: No specific permissions yet.
    *   **Member**: View-only access to their own calendar.
*   **Secure Authentication**:
    *   Custom authentication implementation using **Better-Auth**.
    *   **Argon2id** password hashing for industry-standard security.
    *   Secure invitation system for onboarding new team members.
*   **Type-Safe Database**: Fully typed SQL queries using **Kysely**, ensuring compile-time safety for all database interactions.
*   **Modern UI/UX**: Built with **Tailwind CSS** and **Shadcn/UI** for a premium, accessible, and responsive user experience.

## 🛠️ Tech Stack

This project is built with a bleeding-edge stack focused on type safety and performance:

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
*   **Database**:
    *   [PostgreSQL](https://www.postgresql.org/) (Relational Data)
    *   [Kysely](https://kysely.dev/) (Type-safe SQL Query Builder)
    *   [Kysely Codegen](https://www.npmjs.com/package/kysely-codegen) (Auto-generated types from DB schema)
*   **Authentication**:
    *   [Better-Auth](https://www.npmjs.com/package/better-auth)
    *   **Argon2** for password hashing
*   **Validation**: [Zod](https://zod.dev/) (Schema validation for API inputs and env vars)
*   **Styling**:
    *   [Tailwind CSS](https://tailwindcss.com/) v4
    *   [Shadcn/UI](https://ui.shadcn.com/) (Component Library)
*   **File Uploads**: [UploadThing](https://uploadthing.com/)

## 🚀 Getting Started

### Prerequisites

*   Node.js 18+ (LTS recommended)
*   pnpm (Package Manager)
*   PostgreSQL Database (Local or Hosted)
*   Docker (Optional)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yunusemrebilik/SaaS-Appointment.git
    cd SaaS-Appointment
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables**
    Copy the example env file and update it with your credentials:
    ```bash
    cp .env.example .env
    ```
    *Update `.env` with your `BETTER_AUTH_SECRET`, `UPLOADTHING_TOKEN`, etc.*

4.  **Database Setup**
    Run migrations and generate types:
    ```bash
    docker compose up -d # if you choose to use docker for database
    ```
    ```bash
    pnpm db:migrate
    pnpm db:codegen
    ```

5.  **Run the development server**
    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Architecture Highlights

*   **Server Actions**: Leveraging Next.js Server Actions for direct backend logic execution without separate API endpoints.
*   **Colocated Code**: Related concerns (logic, validation, types) are kept close to the components that use them for better maintainability.
*   **Strict Validation**: All external inputs (forms, URL parameters) are validated using Zod schemas before processing.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
