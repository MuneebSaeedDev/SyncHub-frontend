# SyncHub — Shared Tasks Feature: Backend Implementation & Frontend Development Prompt

This document provides a complete overview of the **Shared Task** backend implementation and a ready-to-use prompt specification to build the frontend.

---

## 1. Backend Implementation Overview

The Shared Task module allows users to collaborate on tasks in SyncHub with their accepted friends. It is securely integrated with authentication, friend verification, and task ownership rules.

### 1.1 Architecture & Flow
```
User A (Task Owner) ──[POST /api/shared-tasks]──> Checks:
                                                   1. User authenticated (JWT)
                                                   2. Task belongs to User A
                                                   3. Collaborator exists & != User A
                                                   4. User A & Collaborator are accepted friends
                                                   5. Task is not already shared with Collaborator
                                                   ↓
                                              SharedTask created (status: "pending")
                                                   ↓
User B (Collaborator) ──[GET /api/shared-tasks]──> Views shared tasks with task details
User B / User A ──[PATCH /api/shared-tasks/:id/status]──> Updates status (pending | in-progress | completed)
User A / User B ──[DELETE /api/shared-tasks/:id]──> Unshares / removes shared task
```

---

## 2. Database Schema (`SharedTask`)

**File:** `src/models/shared.task.model.js`

```javascript
const SharedTaskSchema = new mongoose.Schema(
    {
        task_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },
        collaborator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        shared_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending"
        }
    },
    { timestamps: true }
);

// Indexes
SharedTaskSchema.index({ task_id: 1, collaborator: 1 }, { unique: true }); // Prevents duplicate shares
SharedTaskSchema.index({ collaborator: 1 });
SharedTaskSchema.index({ shared_by: 1 });
```

---

## 3. API Endpoints Reference

All endpoints are mounted at `/api/shared-tasks` and require authentication (`verifyToken`).
Provide the token via `Authorization: Bearer <token>` or HTTP-only cookie.

---

### 3.1 Share a Task
- **Endpoint:** `POST /api/shared-tasks`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "task_id": "67320b9247f1542f28123456",
  "collaborator": "67320b5247f1542f28654321",
  "status": "pending" // Optional (default: "pending")
}
```

- **Validation & Rules:**
  - `task_id` and `collaborator` are required and must be valid MongoDB ObjectIds.
  - The task must exist and its `owner_id` must match `req.user._id`.
  - Collaborator cannot be the logged-in user.
  - The collaborator and logged-in user **must be accepted friends** in `friendRequest` collection.
  - Duplicate shares return a `409 Conflict`.

- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Task shared successfully.",
  "data": {
    "_id": "67320f2847f1542f28999999",
    "task_id": {
      "_id": "67320b9247f1542f28123456",
      "title": "Design Database Schema",
      "description": "Design schema for tasks and friends",
      "priority": "high",
      "dueDate": "2026-11-20T00:00:00.000Z"
    },
    "collaborator": {
      "_id": "67320b5247f1542f28654321",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "shared_by": {
      "_id": "67320b1047f1542f28000000",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "pending",
    "createdAt": "2026-11-11T12:00:00.000Z",
    "updatedAt": "2026-11-11T12:00:00.000Z"
  }
}
```

- **Error Responses:**
  - `400 Bad Request`: Missing IDs, invalid ObjectId, self-share, or invalid status.
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Not friends with collaborator.
  - `404 Not Found`: Task not found or not owned by user, or collaborator not found.
  - `409 Conflict`: Task is already shared with this collaborator.

---

### 3.2 Get Shared Tasks
- **Endpoint:** `GET /api/shared-tasks`
- **Auth Required:** Yes
- **Query Parameters:**
  - Default (no query): Returns tasks shared **with** the logged-in user (`collaborator: req.user._id`).
  - `?type=sent`: Returns tasks shared **by** the logged-in user (`shared_by: req.user._id`).
  - `?type=all`: Returns all tasks (both sent and received).

- **Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "67320f2847f1542f28999999",
      "task_id": {
        "_id": "67320b9247f1542f28123456",
        "title": "Build Authentication Flow",
        "description": "Implement Google and Local login with JWT",
        "priority": "medium",
        "dueDate": "2026-11-25T00:00:00.000Z"
      },
      "collaborator": {
        "_id": "67320b5247f1542f28654321",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "shared_by": {
        "_id": "67320b1047f1542f28000000",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "in-progress",
      "createdAt": "2026-11-11T12:00:00.000Z",
      "updatedAt": "2026-11-11T13:30:00.000Z"
    }
  ]
}
```

---

### 3.3 Update Shared Task Status
- **Endpoint:** `PATCH /api/shared-tasks/:id/status`
- **Auth Required:** Yes
- **URL Param:** `id` (SharedTask ID)
- **Request Body:**
```json
{
  "status": "in-progress" // Allowed: "pending" | "in-progress" | "completed"
}
```

- **Permission:** Both the assigned collaborator and the original task sharer can update the status.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Shared task status updated successfully.",
  "data": {
    "_id": "67320f2847f1542f28999999",
    "status": "in-progress",
    "task_id": { ... },
    "collaborator": { ... },
    "shared_by": { ... }
  }
}
```

---

### 3.4 Remove / Unshare Shared Task
- **Endpoint:** `DELETE /api/shared-tasks/:id`
- **Auth Required:** Yes
- **URL Param:** `id` (SharedTask ID)
- **Permission:** Both the original sharer (`shared_by`) and the collaborator (`collaborator`) can remove the shared task.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Shared task removed successfully."
}
```

---

## 4. Frontend Development Prompt (Copy-Paste Ready)

Use the prompt below to generate or build your frontend application components.

```markdown
# Frontend Specification for SyncHub "Shared Tasks" Feature

I need you to build the complete frontend interface for the "Shared Tasks" feature in my React/Next.js MERN application (SyncHub).

### Backend Context & Existing APIs:
- Base URL: `http://localhost:5000/api`
- Credentials: Include `withCredentials: true` or `Authorization: Bearer <token>` in Axios/fetch.
- Friends API: `GET /api/friends` returns the user's accepted friends `[{ _id, name, email }]`.
- Tasks API: `GET /api/tasks` returns user's personal tasks `[{ _id, title, description, priority, dueDate }]`.
- Shared Tasks Endpoints:
  1. `POST /api/shared-tasks` — Body: `{ task_id, collaborator, status }`
  2. `GET /api/shared-tasks` — Tasks shared with me
  3. `GET /api/shared-tasks?type=sent` — Tasks I shared with others
  4. `PATCH /api/shared-tasks/:id/status` — Body: `{ status: "pending" | "in-progress" | "completed" }`
  5. `DELETE /api/shared-tasks/:id` — Unshare / delete shared task

---

### Requirements:

1. **Shared Tasks Page / Dashboard View:**
   - Tabs navigation:
     - **"Shared with Me"** (tasks where I am the collaborator)
     - **"Shared by Me"** (tasks I shared with my friends)
   - Filter / search bar to search by task title or friend's name/email.
   - Status filter: All, Pending, In Progress, Completed.

2. **Shared Task Card Component:**
   - Display task title, description, due date, and priority tag (Low, Medium, High).
   - Display Collaborator or Sharer info with an avatar chip (Name & Email).
   - Interactive Status Dropdown/Selector:
     - Options: `pending` (Yellow/Orange), `in-progress` (Blue), `completed` (Green).
     - Allows instant status update with loading indicator & optimistic update.
   - Unshare / Remove Button:
     - Confirmation dialog before removing.
     - Calls `DELETE /api/shared-tasks/:id` and updates the UI list.

3. **"Share Task" Modal / Dialog:**
   - Triggered from any task card on the main task list (e.g., a "Share" icon button).
   - Task summary preview (Title, Due date).
   - Dropdown to select a Friend:
     - Fetches friends from `GET /api/friends`.
     - Displays friend's name and email.
     - Search input inside dropdown for easy friend search.
   - Initial status selector (defaults to "pending").
   - "Share Task" submit button with loading state.
   - Error handling: Display clear toast or inline errors if:
     - Task already shared with that friend (409 Conflict).
     - User has no accepted friends yet (prompt to add friends first).

4. **User Experience & State Management:**
   - Toast notifications for success ("Task shared successfully", "Status updated").
   - Proper skeleton or spinner loading states.
   - Clean empty states:
     - "No tasks shared with you yet."
     - "You haven't shared any tasks with friends."
   - Responsive design (Mobile + Desktop friendly) with Tailwind CSS or standard CSS.

Please generate clean, modular, and type-safe (or clean modern JavaScript) components, including the API service layer, state management, and UI components.
```
