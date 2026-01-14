/**
 * QUICK REFERENCE: ABAC Authorization Checklist
 * 
 * Use this as a quick lookup for permission rules
 */

/**
 * PERMISSION MATRIX
 * 
 * ┌─────────────┬──────────────────┬──────────────────┬──────────────────┐
 * │ OPERATION   │ USER ROLE        │ MANAGER ROLE     │ ADMIN ROLE       │
 * ├─────────────┼──────────────────┼──────────────────┼──────────────────┤
 * │ CREATE      │ ✅ YES           │ ❌ NO            │ ❌ NO            │
 * │ (Create)    │ (Self only)      │ (Forbidden)      │ (Forbidden)      │
 * │             │ Returns: 201     │ Returns: 403     │ Returns: 403     │
 * ├─────────────┼──────────────────┼──────────────────┼──────────────────┤
 * │ VIEW        │ ✅ YES           │ ✅ YES           │ ✅ YES           │
 * │ (Fetch)     │ (Own todos)      │ (All todos)      │ (All todos)      │
 * │             │ Returns: 200     │ Returns: 200     │ Returns: 200     │
 * ├─────────────┼──────────────────┼──────────────────┼──────────────────┤
 * │ UPDATE      │ ✅ YES           │ ❌ NO            │ ❌ NO            │
 * │ (Modify)    │ (Own todos)      │ (Forbidden)      │ (Forbidden)      │
 * │             │ Returns: 200     │ Returns: 403     │ Returns: 403     │
 * ├─────────────┼──────────────────┼──────────────────┼──────────────────┤
 * │ DELETE      │ ✅ YES           │ ❌ NO            │ ✅ YES           │
 * │ (Remove)    │ (Own draft only) │ (Forbidden)      │ (Any todo)       │
 * │             │ Returns: 200     │ Returns: 403     │ Returns: 200     │
 * └─────────────┴──────────────────┴──────────────────┴──────────────────┘
 */

/**
 * ROLE DESCRIPTIONS
 * 
 * USER (Regular User)
 * - Can create, view, and update their own todos
 * - Can only delete their own todos if status is "draft"
 * - Cannot see other users' todos
 * - Cannot modify or delete other users' todos
 * 
 * MANAGER (Team Lead/Supervisor)
 * - Can view all todos from all users (read-only)
 * - Cannot create, update, or delete any todos
 * - Read-only access for monitoring/reporting
 * 
 * ADMIN (System Administrator)
 * - Can view all todos from all users
 * - Can delete any todo regardless of owner or status
 * - Cannot create or update todos (restricted)
 * - Full deletion power for cleanup/maintenance
 */

/**
 * HTTP STATUS CODES
 * 
 * 201 Created       - Todo successfully created (CREATE)
 * 200 OK            - Operation successful (VIEW, UPDATE, DELETE)
 * 400 Bad Request   - Invalid input or bad state transition
 * 401 Unauthorized  - No valid session/authentication
 * 403 Forbidden     - Permission denied by ABAC policy
 * 404 Not Found     - Todo doesn't exist
 * 500 Server Error  - Database or unexpected error
 */

/**
 * ABAC CHECK FLOW
 * 
 * 1. Is user authenticated? (401)
 *    └─ If NO → Return 401 Unauthorized
 * 
 * 2. Does todo exist? (404)
 *    └─ If NO → Return 404 Not Found
 * 
 * 3. Is operation allowed by ABAC? (403)
 *    └─ If NO → Return 403 Forbidden
 * 
 * 4. Is input valid? (400)
 *    └─ If NO → Return 400 Bad Request
 * 
 * 5. Execute operation
 *    └─ Success → Return 200/201
 *    └─ Error → Return 500 Server Error
 */

/**
 * AUTHORIZATION RULES BY OPERATION
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * CREATE TODO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * USER:    ✅ ALLOWED
 *          - User can create todos for themselves
 *          - New todo always has status = "draft"
 *          - user_id is set to current user's ID
 *          - Returns: 201 Created + todo object
 * 
 * MANAGER: ❌ FORBIDDEN
 *          - Managers have read-only access
 *          - Cannot create todos
 *          - Returns: 403 Forbidden
 *          - Message: "Managers cannot create, update, or delete todos"
 * 
 * ADMIN:   ❌ FORBIDDEN
 *          - Admins cannot create todos (restricted to delete only)
 *          - Returns: 403 Forbidden
 *          - Message: "Admins cannot create or update todos"
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * VIEW TODO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * USER:    ✅ ALLOWED (Ownership Check)
 *          - User can view only their own todos
 *          - Filter: WHERE user_id = currentUser.id
 *          - Cannot access others' todos
 *          - Returns: 200 OK + todo object or list
 *          - If accessing other's todo: 403 Forbidden
 *          - If todo not found: 404 Not Found
 * 
 * MANAGER: ✅ ALLOWED (All Todos)
 *          - Manager can view all todos from all users
 *          - No ownership check
 *          - Returns: 200 OK + all todos
 * 
 * ADMIN:   ✅ ALLOWED (All Todos)
 *          - Admin can view all todos from all users
 *          - No ownership check
 *          - Returns: 200 OK + all todos
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * UPDATE TODO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * USER:    ✅ ALLOWED (Own Todos Only)
 *          - User can update only their own todos
 *          - Can modify: title, description, status
 *          - Status must follow valid transitions
 *          - Returns: 200 OK + updated todo
 *          - If not owner: 403 Forbidden
 *          - If todo not found: 404 Not Found
 *          - If invalid status: 400 Bad Request
 * 
 * MANAGER: ❌ FORBIDDEN
 *          - Managers have read-only access
 *          - Cannot update any todos
 *          - Returns: 403 Forbidden
 * 
 * ADMIN:   ❌ FORBIDDEN
 *          - Admins cannot update todos
 *          - Returns: 403 Forbidden
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * DELETE TODO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * USER:    ✅ ALLOWED (Ownership + Status Check)
 *          - User can delete only their own todos
 *          - AND only if status = "draft"
 *          - Condition: user_id = ? AND status = 'draft'
 *          - Returns: 200 OK
 *          - If not owner: 403 Forbidden
 *          - If not draft: 403 Forbidden ("Users can only delete draft todos")
 *          - If todo not found: 404 Not Found
 * 
 * MANAGER: ❌ FORBIDDEN
 *          - Managers have read-only access
 *          - Cannot delete any todos
 *          - Returns: 403 Forbidden
 * 
 * ADMIN:   ✅ ALLOWED (Unrestricted)
 *          - Admin can delete any todo
 *          - No ownership check
 *          - No status check
 *          - Can delete "draft", "in_progress", or "completed" todos
 *          - Returns: 200 OK
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * VALID STATUS TRANSITIONS
 * 
 * draft ──────────────────→ in_progress ──→ completed
 *   ↑                                           ↓
 *   └───────────────────────────────────────────┘
 * 
 * Allowed:
 * - draft → in_progress ✅
 * - draft → completed ✅
 * - draft → draft ✅
 * - in_progress → completed ✅
 * - in_progress → draft ✅
 * - in_progress → in_progress ✅
 * - completed → in_progress ✅
 * - completed → completed ✅
 * 
 * Forbidden:
 * - completed → draft ❌ (invalid transition)
 * 
 * Invalid transitions return: 400 Bad Request
 */

/**
 * DEBUGGING AUTHORIZATION ISSUES
 * 
 * Issue: "403 Forbidden: Users can only view their own todos"
 * Cause: USER role trying to view a todo they don't own
 * Solution: Check that todo.user_id === currentUser.id
 * 
 * Issue: "403 Forbidden: Users can only delete todos in draft status"
 * Cause: USER role trying to delete a non-draft todo
 * Solution: Only delete todos with status = "draft"
 * 
 * Issue: "403 Forbidden: Managers cannot create, update, or delete todos"
 * Cause: MANAGER role trying to create/update/delete
 * Solution: Use USER role to create/update, or ADMIN to delete
 * 
 * Issue: "404 Not Found: Todo not found"
 * Cause: Todo ID doesn't exist in database
 * Solution: Verify todo ID is correct
 * 
 * Issue: "400 Bad Request: Invalid status transition from 'X' to 'Y'"
 * Cause: Requested status transition not allowed
 * Solution: Check valid transitions diagram above
 */

/**
 * TESTING CHECKLIST
 * 
 * [ ] USER can create their own todos
 * [ ] MANAGER cannot create todos
 * [ ] ADMIN cannot create todos
 * 
 * [ ] USER can view only their own todos
 * [ ] MANAGER can view all todos
 * [ ] ADMIN can view all todos
 * 
 * [ ] USER can update only their own todos
 * [ ] MANAGER cannot update any todos
 * [ ] ADMIN cannot update any todos
 * 
 * [ ] USER can delete only their own draft todos
 * [ ] USER cannot delete non-draft todos
 * [ ] MANAGER cannot delete any todos
 * [ ] ADMIN can delete any todo (draft or completed)
 * 
 * [ ] Invalid status transitions return 400
 * [ ] Non-existent todos return 404
 * [ ] Unauthorized actions return 403
 * [ ] Unauthenticated requests return 401
 */

/**
 * CODE USAGE EXAMPLES
 * 
 * ─── Create Todo ───
 * const result = await createTodo({
 *   userId: session.user.id,
 *   userRole: session.user.role,
 *   title: "Buy milk",
 *   description: "2% milk"
 * });
 * 
 * ─── Get All Todos ───
 * const result = await getAllTodos({
 *   userId: session.user.id,
 *   userRole: session.user.role
 * });
 * 
 * ─── Get Specific Todo ───
 * const result = await getTodoById({
 *   todoId: 5,
 *   userId: session.user.id,
 *   userRole: session.user.role
 * });
 * 
 * ─── Update Todo ───
 * const result = await updateTodo({
 *   todoId: 5,
 *   userId: session.user.id,
 *   userRole: session.user.role,
 *   status: "in_progress"
 * });
 * 
 * ─── Delete Todo ───
 * const result = await deleteTodo({
 *   todoId: 5,
 *   userId: session.user.id,
 *   userRole: session.user.role
 * });
 * 
 * All functions return:
 * {
 *   success: boolean,
 *   data?: Object,
 *   error?: string,
 *   statusCode: number  // 200, 201, 400, 403, 404, 500
 * }
 */

/**
 * KEY FILES
 * 
 * src/lib/abac.js
 *   - Central ABAC policy engine
 *   - All authorization logic
 *   - Functions: canAccess(), canViewTodo(), etc.
 * 
 * src/lib/todo-service.js
 *   - Service layer with ABAC integration
 *   - Database operations
 *   - Functions: createTodo(), getTodoById(), etc.
 * 
 * src/lib/db.js
 *   - MySQL connection pool
 *   - Database configuration
 * 
 * src/lib/audit.js
 *   - Audit logging
 *   - Function: logAuditAction()
 * 
 * ABAC_IMPLEMENTATION_GUIDE.md
 *   - Detailed documentation
 *   - Architecture diagrams
 *   - Integration examples
 * 
 * ABAC_EXAMPLES.js
 *   - Example usage for all operations
 *   - Different role scenarios
 *   - Error cases
 */

export const QUICK_REFERENCE = {
  operations: {
    CREATE: {
      USER: "✅ ALLOWED",
      MANAGER: "❌ FORBIDDEN",
      ADMIN: "❌ FORBIDDEN"
    },
    VIEW: {
      USER: "✅ ALLOWED (own only)",
      MANAGER: "✅ ALLOWED (all)",
      ADMIN: "✅ ALLOWED (all)"
    },
    UPDATE: {
      USER: "✅ ALLOWED (own only)",
      MANAGER: "❌ FORBIDDEN",
      ADMIN: "❌ FORBIDDEN"
    },
    DELETE: {
      USER: "✅ ALLOWED (own draft only)",
      MANAGER: "❌ FORBIDDEN",
      ADMIN: "✅ ALLOWED (any)"
    }
  },
  
  statusCodes: {
    201: "Created",
    200: "OK",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Server Error"
  },

  statusTransitions: {
    draft: ["in_progress", "completed", "draft"],
    in_progress: ["completed", "draft", "in_progress"],
    completed: ["in_progress", "completed"]
  }
};
