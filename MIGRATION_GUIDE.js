/**
 * MIGRATION GUIDE: Converting API Routes to Use ABAC Service Layer
 * 
 * This guide shows how to update your existing API routes to use
 * the centralized ABAC service layer (todo-service.js)
 * 
 * Benefits of migration:
 * - Centralized authorization logic
 * - Consistent error handling
 * - Reduced code duplication
 * - Easier to maintain and test
 * - Clear separation of concerns
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * BEFORE: Direct authorization checks in route handlers
 * ═══════════════════════════════════════════════════════════════════════
 */

import { canAccess, ACTIONS, TODO_STATUS } from "@/lib/abac";
import { getSession} from "@/lib/auth";
import { logAuditAction } from "@/lib/audit";
import { NextResponse } from "next/server";

// OLD WAY - src/app/api/todos/route.js (Before)
async function POST_BEFORE(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;

    // Check ABAC permission
    if (!canAccess({ role: user.role, action: ACTIONS.CREATE, userId: user.id })) {
      await logAuditAction({
        userId: user.id,
        action: ACTIONS.CREATE,
        resource: "todo",
        status: "forbidden",
      });
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to create todos" },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Create todo manually (no database yet)
    const todo = {
      id: `todo_${Date.now()}`,
      title: body.title.trim(),
      description: body.description?.trim() || "",
      status: TODO_STATUS.DRAFT,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log success
    await logAuditAction({
      userId: user.id,
      action: ACTIONS.CREATE,
      resource: "todo",
      resourceId: todo.id,
      status: "success",
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * AFTER: Using centralized ABAC service layer
 * ═══════════════════════════════════════════════════════════════════════
 */

import { createTodo, getAllTodos, getTodoById, updateTodo, deleteTodo } from "@/lib/todo-service";
import { NextResponse } from "next/server";

// NEW WAY - src/app/api/todos/route.js (After)
async function POST_AFTER(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Service layer handles:
    // - ABAC authorization
    // - Input validation
    // - Database operation
    // - Audit logging
    // - Error handling
    const result = await createTodo({
      userId: session.user.id,
      userRole: session.user.role,
      title: body.title,
      description: body.description,
    });

    if (result.success) {
      return NextResponse.json(result.data, { status: result.statusCode });
    } else {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * MIGRATION EXAMPLES FOR ALL OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────
// GET /api/todos - Fetch all todos
// ─────────────────────────────────────────────────────────────────────

// BEFORE
async function GET_before() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = session;

  let filteredTodos;
  if (user.role === "USER") {
    // Users can only see their own todos
    filteredTodos = todos.filter((todo) => todo.ownerId === user.id);
  } else {
    // Managers and Admins see all
    filteredTodos = todos;
  }

  return NextResponse.json(filteredTodos);
}

// AFTER
async function GET_after() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getAllTodos({
    userId: session.user.id,
    userRole: session.user.role,
  });

  if (result.success) {
    return NextResponse.json(result.data, { status: result.statusCode });
  } else {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }
}

// ─────────────────────────────────────────────────────────────────────
// GET /api/todos/[id] - Fetch specific todo
// ─────────────────────────────────────────────────────────────────────

// BEFORE
async function GET_id_before(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = session;
  const todo = todos.find((t) => t.id === params.id);

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  if (!canAccess({ role: user.role, action: ACTIONS.VIEW, todo, userId: user.id })) {
    await logAuditAction({
      userId: user.id,
      action: ACTIONS.VIEW,
      resource: "todo",
      status: "forbidden",
    });
    return NextResponse.json(
      { error: "Forbidden: You don't have permission to view this todo" },
      { status: 403 }
    );
  }

  return NextResponse.json(todo);
}

// AFTER
async function GET_id_after(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getTodoById({
    todoId: params.id,
    userId: session.user.id,
    userRole: session.user.role,
  });

  if (result.success) {
    return NextResponse.json(result.data, { status: result.statusCode });
  } else {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }
}

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/todos/[id] - Update todo
// ─────────────────────────────────────────────────────────────────────

// BEFORE
async function PATCH_before(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = session;
  const todoIndex = todos.findIndex((t) => t.id === params.id);

  if (todoIndex === -1) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  const todo = todos[todoIndex];

  if (!canAccess({ role: user.role, action: ACTIONS.UPDATE, todo, userId: user.id })) {
    await logAuditAction({
      userId: user.id,
      action: ACTIONS.UPDATE,
      resource: "todo",
      status: "forbidden",
    });
    return NextResponse.json(
      { error: "Forbidden: You don't have permission to update this todo" },
      { status: 403 }
    );
  }

  const body = await request.json();

  // Manual update logic
  const updatedTodo = {
    ...todo,
    title: body.title?.trim() || todo.title,
    description: body.description?.trim() || todo.description,
    status: body.status || todo.status,
    updatedAt: new Date().toISOString(),
  };

  todos[todoIndex] = updatedTodo;

  await logAuditAction({
    userId: user.id,
    action: ACTIONS.UPDATE,
    resource: "todo",
    resourceId: params.id,
    status: "success",
  });

  return NextResponse.json(updatedTodo);
}

// AFTER
async function PATCH_after(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const result = await updateTodo({
    todoId: params.id,
    userId: session.user.id,
    userRole: session.user.role,
    title: body.title,
    description: body.description,
    status: body.status,
  });

  if (result.success) {
    return NextResponse.json(result.data, { status: result.statusCode });
  } else {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }
}

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/todos/[id] - Delete todo
// ─────────────────────────────────────────────────────────────────────

// BEFORE
async function DELETE_before(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = session;
  const todoIndex = todos.findIndex((t) => t.id === params.id);

  if (todoIndex === -1) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  const todo = todos[todoIndex];

  if (!canAccess({ role: user.role, action: ACTIONS.DELETE, todo, userId: user.id })) {
    await logAuditAction({
      userId: user.id,
      action: ACTIONS.DELETE,
      resource: "todo",
      status: "forbidden",
    });
    return NextResponse.json(
      { error: "Forbidden: You don't have permission to delete this todo" },
      { status: 403 }
    );
  }

  todos.splice(todoIndex, 1);

  await logAuditAction({
    userId: user.id,
    action: ACTIONS.DELETE,
    resource: "todo",
    resourceId: params.id,
    status: "success",
  });

  return NextResponse.json({ message: "Todo deleted successfully" });
}

// AFTER
async function DELETE_after(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteTodo({
    todoId: params.id,
    userId: session.user.id,
    userRole: session.user.role,
  });

  if (result.success) {
    return NextResponse.json(result.data, { status: result.statusCode });
  } else {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * KEY IMPROVEMENTS FROM MIGRATION
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * 1. REDUCED CODE DUPLICATION
 *    Before: Each route handler had its own ABAC checks
 *    After:  All authorization logic centralized in service layer
 * 
 * 2. CONSISTENT ERROR HANDLING
 *    Before: Different error messages in different routes
 *    After:  Uniform error responses with proper HTTP codes
 * 
 * 3. DATABASE INTEGRATION
 *    Before: Used in-memory todos array
 *    After:  Uses MySQL with prepared statements
 * 
 * 4. EASIER MAINTENANCE
 *    Before: Change authorization rule = update multiple files
 *    After:  Change authorization rule = update one function
 * 
 * 5. BETTER TESTABILITY
 *    Before: Had to mock entire route handler
 *    After:  Can test service layer functions independently
 * 
 * 6. CLEARER SEPARATION OF CONCERNS
 *    Before: Route handlers mixed auth, validation, DB, logging
 *    After:  Route handlers only: authenticate + call service + format response
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * MIGRATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * [ ] Update src/app/api/todos/route.js
 *     - Replace GET() with new implementation
 *     - Replace POST() with new implementation
 * 
 * [ ] Update src/app/api/todos/[id]/route.js
 *     - Replace GET() with new implementation
 *     - Replace PATCH() with new implementation
 *     - Replace DELETE() with new implementation
 * 
 * [ ] Test all endpoints
 *     - Create todo as USER
 *     - View todos as each role
 *     - Update todo as USER
 *     - Delete todo as each role
 * 
 * [ ] Verify error handling
 *     - 401 Unauthorized
 *     - 403 Forbidden (role-based)
 *     - 404 Not Found
 *     - 400 Bad Request (invalid transitions)
 * 
 * [ ] Verify audit logging
 *     - All actions logged
 *     - Forbidden actions logged
 *     - Success/failure captured
 * 
 * [ ] Remove old authorization logic
 *     - Delete duplicate checks from route files
 *     - Keep only authentication and service calls
 * 
 * [ ] Update documentation
 *     - Update API docs to reference new response format
 *     - Document status codes
 *     - Document error messages
 */

export {
  POST_BEFORE,
  POST_AFTER,
  GET_before,
  GET_after,
  GET_id_before,
  GET_id_after,
  PATCH_before,
  PATCH_after,
  DELETE_before,
  DELETE_after,
};
