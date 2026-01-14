/**
 * ABAC Implementation Examples & Documentation
 * 
 * This file demonstrates how to use the ABAC authorization system
 * with the Todo application's MySQL backend.
 * 
 * Key Concepts:
 * - ABAC checks are centralized in src/lib/abac.js
 * - Database operations are wrapped in src/lib/todo-service.js
 * - All operations return {success, data/error, statusCode}
 */

import {
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "@/lib/todo-service";

/**
 * ============================================================================
 * EXAMPLE 1: CREATE TODO
 * ============================================================================
 * 
 * Authorization Rule:
 * - USER (🟢): Can create todos for themselves only
 * - MANAGER (🔴): Cannot create todos
 * - ADMIN (🔴): Cannot create todos
 * 
 * HTTP Response Codes:
 * - 201 Created: Todo created successfully
 * - 403 Forbidden: User role not allowed to create
 * - 400 Bad Request: Invalid input (missing title, etc.)
 * - 500 Internal Server Error: Database error
 */

// ✅ ALLOWED: USER creating their own todo
async function example_createTodo_User() {
  const result = await createTodo({
    userId: "user123",
    userRole: "USER",
    title: "Buy groceries",
    description: "Milk, eggs, bread",
  });

  if (result.success) {
    console.log("✅ Todo created:", result.data);
    // Output:
    // {
    //   id: 1,
    //   title: "Buy groceries",
    //   description: "Milk, eggs, bread",
    //   status: "draft",
    //   user_id: "user123",
    //   createdAt: "2026-01-14T10:30:00Z",
    //   updatedAt: "2026-01-14T10:30:00Z"
    // }
  } else {
    console.error("❌ Error:", result.error, result.statusCode);
  }
}

// ❌ FORBIDDEN: MANAGER trying to create todo
async function example_createTodo_Manager() {
  const result = await createTodo({
    userId: "manager456",
    userRole: "MANAGER",
    title: "Review todos",
    description: "Check team progress",
  });

  if (!result.success) {
    console.error("❌ Forbidden:", result.error);
    // Output: "Forbidden: Managers cannot create, update, or delete todos"
    // HTTP 403
  }
}

// ❌ FORBIDDEN: ADMIN trying to create todo
async function example_createTodo_Admin() {
  const result = await createTodo({
    userId: "admin789",
    userRole: "ADMIN",
    title: "System maintenance",
  });

  if (!result.success) {
    console.error("❌ Forbidden:", result.error);
    // Output: "Forbidden: Admins cannot create or update todos"
    // HTTP 403
  }
}

/**
 * ============================================================================
 * EXAMPLE 2: VIEW (GET) TODOS
 * ============================================================================
 * 
 * Authorization Rules:
 * - USER (🟢): Can view only their own todos
 * - MANAGER (🟢): Can view all todos
 * - ADMIN (🟢): Can view all todos
 * 
 * HTTP Response Codes:
 * - 200 OK: Todos retrieved (filtered by role)
 * - 404 Not Found: (for single todo) Todo does not exist
 * - 403 Forbidden: (for single todo) User cannot view this todo
 * - 500 Internal Server Error: Database error
 */

// ✅ ALLOWED: USER viewing their own todos
async function example_getAllTodos_User() {
  const result = await getAllTodos({
    userId: "user123",
    userRole: "USER",
  });

  if (result.success) {
    console.log("✅ Your todos:", result.data);
    // Output: Only todos where user_id = "user123"
    // [
    //   {
    //     id: 1,
    //     title: "Buy groceries",
    //     status: "draft",
    //     user_id: "user123",
    //     ...
    //   }
    // ]
  }
}

// ✅ ALLOWED: MANAGER viewing all todos
async function example_getAllTodos_Manager() {
  const result = await getAllTodos({
    userId: "manager456",
    userRole: "MANAGER",
  });

  if (result.success) {
    console.log("✅ All todos in system:", result.data);
    // Output: All todos from all users
    // [
    //   { id: 1, title: "Buy groceries", user_id: "user123", ... },
    //   { id: 2, title: "Fix bug", user_id: "user456", ... },
    //   ...
    // ]
  }
}

// ✅ ALLOWED: USER viewing their own specific todo
async function example_getTodoById_User_Own() {
  const result = await getTodoById({
    todoId: 1,
    userId: "user123",
    userRole: "USER",
  });

  if (result.success) {
    console.log("✅ Todo retrieved:", result.data);
    // HTTP 200
  }
}

// ❌ FORBIDDEN: USER trying to view another user's todo
async function example_getTodoById_User_Other() {
  const result = await getTodoById({
    todoId: 5, // belongs to user456
    userId: "user123",
    userRole: "USER",
  });

  if (!result.success) {
    console.error("❌ Forbidden:", result.error);
    // Output: "Forbidden: Users can only view their own todos"
    // HTTP 403
  }
}

// ✅ ALLOWED: MANAGER viewing any todo
async function example_getTodoById_Manager() {
  const result = await getTodoById({
    todoId: 5, // belongs to user456
    userId: "manager456",
    userRole: "MANAGER",
  });

  if (result.success) {
    console.log("✅ Todo retrieved:", result.data);
    // Managers can view any todo
    // HTTP 200
  }
}

// ❌ ERROR: Todo does not exist
async function example_getTodoById_NotFound() {
  const result = await getTodoById({
    todoId: 99999, // doesn't exist
    userId: "user123",
    userRole: "USER",
  });

  if (!result.success) {
    console.error("❌ Not Found:", result.error);
    // Output: "Todo not found"
    // HTTP 404
  }
}

/**
 * ============================================================================
 * EXAMPLE 3: UPDATE TODO
 * ============================================================================
 * 
 * Authorization Rules:
 * - USER (🟢): Can update only their own todos
 * - MANAGER (🔴): Cannot update any todos
 * - ADMIN (🔴): Cannot update any todos
 * 
 * HTTP Response Codes:
 * - 200 OK: Todo updated
 * - 403 Forbidden: User not allowed to update
 * - 404 Not Found: Todo doesn't exist
 * - 400 Bad Request: Invalid input or invalid status transition
 * - 500 Internal Server Error: Database error
 */

// ✅ ALLOWED: USER updating their own todo
async function example_updateTodo_User_Own() {
  const result = await updateTodo({
    todoId: 1,
    userId: "user123",
    userRole: "USER",
    title: "Buy groceries and cook",
    status: "in_progress", // draft → in_progress is valid
  });

  if (result.success) {
    console.log("✅ Todo updated:", result.data);
    // HTTP 200
  }
}

// ❌ FORBIDDEN: USER trying to update another user's todo
async function example_updateTodo_User_Other() {
  const result = await updateTodo({
    todoId: 5, // belongs to user456
    userId: "user123",
    userRole: "USER",
    title: "Hacked title",
  });

  if (!result.success) {
    console.error("❌ Forbidden:", result.error);
    // Output: "Forbidden: Users can only update their own todos"
    // HTTP 403
  }
}

// ❌ FORBIDDEN: MANAGER trying to update
async function example_updateTodo_Manager() {
  const result = await updateTodo({
    todoId: 1,
    userId: "manager456",
    userRole: "MANAGER",
    title: "Updated by manager",
  });

  if (!result.success) {
    console.error("❌ Forbidden:", result.error);
    // Output: "Forbidden: Managers cannot create, update, or delete todos"
    // HTTP 403
  }
}

// ❌ FORBIDDEN: ADMIN trying to update
async function example_updateTodo_Admin() {
  const result = await updateTodo({
    todoId: 1,
    userId: "admin789",
    userRole: "ADMIN",
    title: "Updated by admin",
  });

  if (!result.success) {
    console.error("❌ Forbidden:", result.error);
    // Output: "Forbidden: Admins cannot create or update todos"
    // HTTP 403
  }
}

// ❌ VALIDATION ERROR: Invalid status transition
async function example_updateTodo_InvalidTransition() {
  const result = await updateTodo({
    todoId: 1,
    userId: "user123",
    userRole: "USER",
    status: "draft", // completed → draft is invalid
  });

  if (!result.success) {
    console.error("❌ Invalid transition:", result.error);
    // Output: "Invalid status transition from 'completed' to 'draft'"
    // HTTP 400
  }
}

/**
 * ============================================================================
 * EXAMPLE 4: DELETE TODO
 * ============================================================================
 * 
 * Authorization Rules:
 * - USER (🟢): Can delete only their own todos AND only if status = 'draft'
 * - MANAGER (🔴): Cannot delete any todos
 * - ADMIN (🟢): Can delete any todo regardless of owner or status
 * 
 * HTTP Response Codes:
 * - 200 OK: Todo deleted
 * - 403 Forbidden: User not allowed to delete
 * - 404 Not Found: Todo doesn't exist
 * - 500 Internal Server Error: Database error
 */

// ✅ ALLOWED: USER deleting their own DRAFT todo
async function example_deleteTodo_User_OwnDraft() {
  const result = await deleteTodo({
    todoId: 1, // status: "draft", user_id: "user123"
    userId: "user123",
    userRole: "USER",
  });

  if (result.success) {
    console.log("✅ Todo deleted:", result.data.deletedTodo);
    // HTTP 200
  }
}

// ❌ FORBIDDEN: USER trying to delete their todo that's NOT draft
async function example_deleteTodo_User_OwnNonDraft() {
  const result = await deleteTodo({
    todoId: 2, // status: "in_progress", user_id: "user123"
    userId: "user123",
    userRole: "USER",
  });

  if (!result.success) {
    console.error("❌ Forbidden:", result.error);
    // Output: "Forbidden: Users can only delete todos in draft status"
    // HTTP 403
  }
}

// ❌ FORBIDDEN: USER trying to delete another user's todo
async function example_deleteTodo_User_Other() {
  const result = await deleteTodo({
    todoId: 5, // belongs to user456
    userId: "user123",
    userRole: "USER",
  });

  if (!result.success) {
    console.error("❌ Forbidden:", result.error);
    // Output: "Forbidden: Users can only delete their own todos"
    // HTTP 403
  }
}

// ❌ FORBIDDEN: MANAGER trying to delete
async function example_deleteTodo_Manager() {
  const result = await deleteTodo({
    todoId: 1,
    userId: "manager456",
    userRole: "MANAGER",
  });

  if (!result.success) {
    console.error("❌ Forbidden:", result.error);
    // Output: "Forbidden: Managers cannot create, update, or delete todos"
    // HTTP 403
  }
}

// ✅ ALLOWED: ADMIN deleting any todo (regardless of status or owner)
async function example_deleteTodo_Admin() {
  const result = await deleteTodo({
    todoId: 5, // status: "completed", user_id: "user456"
    userId: "admin789",
    userRole: "ADMIN",
  });

  if (result.success) {
    console.log("✅ Todo deleted by admin:", result.data.deletedTodo);
    // Admins can delete ANY todo, even if completed
    // HTTP 200
  }
}

// ❌ ERROR: Todo not found
async function example_deleteTodo_NotFound() {
  const result = await deleteTodo({
    todoId: 99999,
    userId: "user123",
    userRole: "USER",
  });

  if (!result.success) {
    console.error("❌ Not Found:", result.error);
    // Output: "Todo not found"
    // HTTP 404
  }
}

/**
 * ============================================================================
 * USAGE IN API ROUTES (Next.js Example)
 * ============================================================================
 */

// Example: POST /api/todos (Create todo)
export async function example_POST_createTodo(request) {
  const session = await getSession();
  if (!session) return { status: 401, error: "Unauthorized" };

  const body = await request.json();
  const result = await createTodo({
    userId: session.user.id,
    userRole: session.user.role,
    title: body.title,
    description: body.description,
  });

  return {
    status: result.statusCode,
    data: result.success ? result.data : { error: result.error },
  };
}

// Example: GET /api/todos/:id (Get specific todo)
export async function example_GET_todoById(params) {
  const session = await getSession();
  if (!session) return { status: 401, error: "Unauthorized" };

  const result = await getTodoById({
    todoId: params.id,
    userId: session.user.id,
    userRole: session.user.role,
  });

  return {
    status: result.statusCode,
    data: result.success ? result.data : { error: result.error },
  };
}

// Example: PATCH /api/todos/:id (Update todo)
export async function example_PATCH_updateTodo(params, request) {
  const session = await getSession();
  if (!session) return { status: 401, error: "Unauthorized" };

  const body = await request.json();
  const result = await updateTodo({
    todoId: params.id,
    userId: session.user.id,
    userRole: session.user.role,
    title: body.title,
    description: body.description,
    status: body.status,
  });

  return {
    status: result.statusCode,
    data: result.success ? result.data : { error: result.error },
  };
}

// Example: DELETE /api/todos/:id (Delete todo)
export async function example_DELETE_todoById(params) {
  const session = await getSession();
  if (!session) return { status: 401, error: "Unauthorized" };

  const result = await deleteTodo({
    todoId: params.id,
    userId: session.user.id,
    userRole: session.user.role,
  });

  return {
    status: result.statusCode,
    data: result.success ? result.data : { error: result.error },
  };
}

/**
 * ============================================================================
 * PERMISSION MATRIX REFERENCE
 * ============================================================================
 * 
 * Operation | USER Role         | MANAGER Role      | ADMIN Role
 * ━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━
 * CREATE    | ✅ Self only      | ❌ No             | ❌ No
 * VIEW      | ✅ Own todos      | ✅ All todos      | ✅ All todos
 * UPDATE    | ✅ Own todos      | ❌ No             | ❌ No
 * DELETE    | ✅ Own draft only | ❌ No             | ✅ Any, any status
 * 
 * ============================================================================
 * ERROR CODES REFERENCE
 * ============================================================================
 * 
 * 201 Created  → Todo successfully created
 * 200 OK       → Operation successful (view, update, delete)
 * 400 Bad Request → Invalid input or invalid status transition
 * 401 Unauthorized → Not authenticated (no session)
 * 403 Forbidden → Authenticated but not authorized (ABAC check failed)
 * 404 Not Found → Todo doesn't exist
 * 500 Internal Server Error → Database or server error
 */
