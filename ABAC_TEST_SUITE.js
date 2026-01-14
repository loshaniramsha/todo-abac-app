/**
 * ABAC Test Suite
 * 
 * Comprehensive test cases for authorization logic
 * Can be used with Jest, Vitest, or any testing framework
 */

import {
  canAccess,
  canViewTodo,
  canCreateTodo,
  canUpdateTodo,
  canDeleteTodo,
  isValidStatusTransition,
  ROLES,
  ACTIONS,
  TODO_STATUS,
} from "@/lib/abac";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * CREATE OPERATION TESTS
 * ═══════════════════════════════════════════════════════════════════════
 */

describe("CREATE - Todo Creation Authorization", () => {
  describe("USER Role", () => {
    it("should allow USER to create todos", () => {
      const result = canCreateTodo(ROLES.USER, "user123");
      expect(result.allowed).toBe(true);
    });

    it("should return no error reason for allowed action", () => {
      const result = canCreateTodo(ROLES.USER, "user123");
      expect(result.reason).toBeUndefined();
    });
  });

  describe("MANAGER Role", () => {
    it("should deny MANAGER from creating todos", () => {
      const result = canCreateTodo(ROLES.MANAGER, "manager456");
      expect(result.allowed).toBe(false);
    });

    it("should return clear error reason", () => {
      const result = canCreateTodo(ROLES.MANAGER, "manager456");
      expect(result.reason).toContain("Managers cannot");
    });
  });

  describe("ADMIN Role", () => {
    it("should deny ADMIN from creating todos", () => {
      const result = canCreateTodo(ROLES.ADMIN, "admin789");
      expect(result.allowed).toBe(false);
    });

    it("should return clear error reason", () => {
      const result = canCreateTodo(ROLES.ADMIN, "admin789");
      expect(result.reason).toContain("Admins cannot");
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * VIEW OPERATION TESTS
 * ═══════════════════════════════════════════════════════════════════════
 */

describe("VIEW - Todo Viewing Authorization", () => {
  describe("USER Role", () => {
    it("should allow USER to view their own todo", () => {
      const todo = { id: 1, user_id: "user123", status: "draft" };
      const result = canViewTodo(ROLES.USER, todo, "user123");
      expect(result.allowed).toBe(true);
    });

    it("should deny USER from viewing other's todo", () => {
      const todo = { id: 1, user_id: "user456", status: "draft" };
      const result = canViewTodo(ROLES.USER, todo, "user123");
      expect(result.allowed).toBe(false);
    });

    it("should return clear error for unauthorized view", () => {
      const todo = { id: 1, user_id: "user456", status: "draft" };
      const result = canViewTodo(ROLES.USER, todo, "user123");
      expect(result.reason).toContain("Users can only view their own todos");
    });

    it("should require todo object for view check", () => {
      const result = canAccess({
        role: ROLES.USER,
        action: ACTIONS.VIEW,
        userId: "user123",
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("required");
    });
  });

  describe("MANAGER Role", () => {
    it("should allow MANAGER to view any todo", () => {
      const todo = { id: 1, user_id: "user456", status: "draft" };
      const result = canViewTodo(ROLES.MANAGER, todo, "manager456");
      expect(result.allowed).toBe(true);
    });

    it("should allow MANAGER to view own todo", () => {
      const todo = { id: 1, user_id: "manager456", status: "completed" };
      const result = canViewTodo(ROLES.MANAGER, todo, "manager456");
      expect(result.allowed).toBe(true);
    });

    it("should allow viewing todos in any status", () => {
      const statuses = [
        TODO_STATUS.DRAFT,
        TODO_STATUS.IN_PROGRESS,
        TODO_STATUS.COMPLETED,
      ];
      statuses.forEach((status) => {
        const todo = { id: 1, user_id: "user123", status };
        const result = canViewTodo(ROLES.MANAGER, todo, "manager456");
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe("ADMIN Role", () => {
    it("should allow ADMIN to view any todo", () => {
      const todo = { id: 1, user_id: "user456", status: "draft" };
      const result = canViewTodo(ROLES.ADMIN, todo, "admin789");
      expect(result.allowed).toBe(true);
    });

    it("should allow viewing todos in any status", () => {
      const statuses = [
        TODO_STATUS.DRAFT,
        TODO_STATUS.IN_PROGRESS,
        TODO_STATUS.COMPLETED,
      ];
      statuses.forEach((status) => {
        const todo = { id: 1, user_id: "user123", status };
        const result = canViewTodo(ROLES.ADMIN, todo, "admin789");
        expect(result.allowed).toBe(true);
      });
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * UPDATE OPERATION TESTS
 * ═══════════════════════════════════════════════════════════════════════
 */

describe("UPDATE - Todo Update Authorization", () => {
  describe("USER Role", () => {
    it("should allow USER to update their own todo", () => {
      const todo = { id: 1, user_id: "user123", status: "draft" };
      const result = canUpdateTodo(ROLES.USER, todo, "user123");
      expect(result.allowed).toBe(true);
    });

    it("should deny USER from updating other's todo", () => {
      const todo = { id: 1, user_id: "user456", status: "draft" };
      const result = canUpdateTodo(ROLES.USER, todo, "user123");
      expect(result.allowed).toBe(false);
    });

    it("should return clear error for unauthorized update", () => {
      const todo = { id: 1, user_id: "user456", status: "draft" };
      const result = canUpdateTodo(ROLES.USER, todo, "user123");
      expect(result.reason).toContain("Users can only update their own todos");
    });

    it("should allow updating todos in any status", () => {
      const statuses = [
        TODO_STATUS.DRAFT,
        TODO_STATUS.IN_PROGRESS,
        TODO_STATUS.COMPLETED,
      ];
      statuses.forEach((status) => {
        const todo = { id: 1, user_id: "user123", status };
        const result = canUpdateTodo(ROLES.USER, todo, "user123");
        expect(result.allowed).toBe(true);
      });
    });

    it("should require todo object for update check", () => {
      const result = canAccess({
        role: ROLES.USER,
        action: ACTIONS.UPDATE,
        userId: "user123",
      });
      expect(result.allowed).toBe(false);
    });
  });

  describe("MANAGER Role", () => {
    it("should deny MANAGER from updating any todo", () => {
      const todo = { id: 1, user_id: "user123", status: "draft" };
      const result = canUpdateTodo(ROLES.MANAGER, todo, "manager456");
      expect(result.allowed).toBe(false);
    });

    it("should deny even if todo is owned by manager", () => {
      const todo = { id: 1, user_id: "manager456", status: "draft" };
      const result = canUpdateTodo(ROLES.MANAGER, todo, "manager456");
      expect(result.allowed).toBe(false);
    });
  });

  describe("ADMIN Role", () => {
    it("should deny ADMIN from updating todos", () => {
      const todo = { id: 1, user_id: "user123", status: "draft" };
      const result = canUpdateTodo(ROLES.ADMIN, todo, "admin789");
      expect(result.allowed).toBe(false);
    });

    it("should deny even if todo is owned by admin", () => {
      const todo = { id: 1, user_id: "admin789", status: "draft" };
      const result = canUpdateTodo(ROLES.ADMIN, todo, "admin789");
      expect(result.allowed).toBe(false);
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DELETE OPERATION TESTS
 * ═══════════════════════════════════════════════════════════════════════
 */

describe("DELETE - Todo Deletion Authorization", () => {
  describe("USER Role", () => {
    it("should allow USER to delete their own DRAFT todo", () => {
      const todo = { id: 1, user_id: "user123", status: TODO_STATUS.DRAFT };
      const result = canDeleteTodo(ROLES.USER, todo, "user123");
      expect(result.allowed).toBe(true);
    });

    it("should deny USER from deleting their OWN IN_PROGRESS todo", () => {
      const todo = { id: 1, user_id: "user123", status: TODO_STATUS.IN_PROGRESS };
      const result = canDeleteTodo(ROLES.USER, todo, "user123");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("draft status");
    });

    it("should deny USER from deleting their OWN COMPLETED todo", () => {
      const todo = { id: 1, user_id: "user123", status: TODO_STATUS.COMPLETED };
      const result = canDeleteTodo(ROLES.USER, todo, "user123");
      expect(result.allowed).toBe(false);
    });

    it("should deny USER from deleting OTHER's DRAFT todo", () => {
      const todo = { id: 1, user_id: "user456", status: TODO_STATUS.DRAFT };
      const result = canDeleteTodo(ROLES.USER, todo, "user123");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("only delete their own todos");
    });

    it("should deny USER from deleting OTHER's IN_PROGRESS todo", () => {
      const todo = { id: 1, user_id: "user456", status: TODO_STATUS.IN_PROGRESS };
      const result = canDeleteTodo(ROLES.USER, todo, "user123");
      expect(result.allowed).toBe(false);
    });

    it("should require todo object for delete check", () => {
      const result = canAccess({
        role: ROLES.USER,
        action: ACTIONS.DELETE,
        userId: "user123",
      });
      expect(result.allowed).toBe(false);
    });
  });

  describe("MANAGER Role", () => {
    it("should deny MANAGER from deleting any todo", () => {
      const todo = { id: 1, user_id: "user123", status: TODO_STATUS.DRAFT };
      const result = canDeleteTodo(ROLES.MANAGER, todo, "manager456");
      expect(result.allowed).toBe(false);
    });

    it("should deny even if todo is draft", () => {
      const todo = { id: 1, user_id: "manager456", status: TODO_STATUS.DRAFT };
      const result = canDeleteTodo(ROLES.MANAGER, todo, "manager456");
      expect(result.allowed).toBe(false);
    });

    it("should deny for all status types", () => {
      const statuses = [
        TODO_STATUS.DRAFT,
        TODO_STATUS.IN_PROGRESS,
        TODO_STATUS.COMPLETED,
      ];
      statuses.forEach((status) => {
        const todo = { id: 1, user_id: "user123", status };
        const result = canDeleteTodo(ROLES.MANAGER, todo, "manager456");
        expect(result.allowed).toBe(false);
      });
    });
  });

  describe("ADMIN Role", () => {
    it("should allow ADMIN to delete DRAFT todo", () => {
      const todo = { id: 1, user_id: "user123", status: TODO_STATUS.DRAFT };
      const result = canDeleteTodo(ROLES.ADMIN, todo, "admin789");
      expect(result.allowed).toBe(true);
    });

    it("should allow ADMIN to delete IN_PROGRESS todo", () => {
      const todo = { id: 1, user_id: "user123", status: TODO_STATUS.IN_PROGRESS };
      const result = canDeleteTodo(ROLES.ADMIN, todo, "admin789");
      expect(result.allowed).toBe(true);
    });

    it("should allow ADMIN to delete COMPLETED todo", () => {
      const todo = { id: 1, user_id: "user123", status: TODO_STATUS.COMPLETED };
      const result = canDeleteTodo(ROLES.ADMIN, todo, "admin789");
      expect(result.allowed).toBe(true);
    });

    it("should allow ADMIN to delete OTHER's todo", () => {
      const todo = { id: 1, user_id: "user456", status: TODO_STATUS.DRAFT };
      const result = canDeleteTodo(ROLES.ADMIN, todo, "admin789");
      expect(result.allowed).toBe(true);
    });

    it("should allow ADMIN to delete for all status types", () => {
      const statuses = [
        TODO_STATUS.DRAFT,
        TODO_STATUS.IN_PROGRESS,
        TODO_STATUS.COMPLETED,
      ];
      statuses.forEach((status) => {
        const todo = { id: 1, user_id: "user123", status };
        const result = canDeleteTodo(ROLES.ADMIN, todo, "admin789");
        expect(result.allowed).toBe(true);
      });
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * STATUS TRANSITION TESTS
 * ═══════════════════════════════════════════════════════════════════════
 */

describe("Status Transitions", () => {
  describe("From DRAFT", () => {
    it("should allow transition from draft to in_progress", () => {
      const result = isValidStatusTransition(
        TODO_STATUS.DRAFT,
        TODO_STATUS.IN_PROGRESS
      );
      expect(result).toBe(true);
    });

    it("should allow transition from draft to completed", () => {
      const result = isValidStatusTransition(
        TODO_STATUS.DRAFT,
        TODO_STATUS.COMPLETED
      );
      expect(result).toBe(true);
    });

    it("should allow no change (draft to draft)", () => {
      const result = isValidStatusTransition(
        TODO_STATUS.DRAFT,
        TODO_STATUS.DRAFT
      );
      expect(result).toBe(true);
    });
  });

  describe("From IN_PROGRESS", () => {
    it("should allow transition from in_progress to completed", () => {
      const result = isValidStatusTransition(
        TODO_STATUS.IN_PROGRESS,
        TODO_STATUS.COMPLETED
      );
      expect(result).toBe(true);
    });

    it("should allow transition from in_progress to draft", () => {
      const result = isValidStatusTransition(
        TODO_STATUS.IN_PROGRESS,
        TODO_STATUS.DRAFT
      );
      expect(result).toBe(true);
    });

    it("should allow no change (in_progress to in_progress)", () => {
      const result = isValidStatusTransition(
        TODO_STATUS.IN_PROGRESS,
        TODO_STATUS.IN_PROGRESS
      );
      expect(result).toBe(true);
    });
  });

  describe("From COMPLETED", () => {
    it("should allow transition from completed to in_progress", () => {
      const result = isValidStatusTransition(
        TODO_STATUS.COMPLETED,
        TODO_STATUS.IN_PROGRESS
      );
      expect(result).toBe(true);
    });

    it("should deny transition from completed to draft", () => {
      const result = isValidStatusTransition(
        TODO_STATUS.COMPLETED,
        TODO_STATUS.DRAFT
      );
      expect(result).toBe(false);
    });

    it("should allow no change (completed to completed)", () => {
      const result = isValidStatusTransition(
        TODO_STATUS.COMPLETED,
        TODO_STATUS.COMPLETED
      );
      expect(result).toBe(true);
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * ERROR HANDLING TESTS
 * ═══════════════════════════════════════════════════════════════════════
 */

describe("Error Handling", () => {
  it("should return error for missing role", () => {
    const result = canAccess({
      role: undefined,
      action: ACTIONS.VIEW,
      userId: "user123",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("should return error for missing action", () => {
    const result = canAccess({
      role: ROLES.USER,
      action: undefined,
      userId: "user123",
    });
    expect(result.allowed).toBe(false);
  });

  it("should return error for missing userId", () => {
    const result = canAccess({
      role: ROLES.USER,
      action: ACTIONS.VIEW,
      userId: undefined,
    });
    expect(result.allowed).toBe(false);
  });

  it("should return error for unknown role", () => {
    const result = canAccess({
      role: "UNKNOWN_ROLE",
      action: ACTIONS.VIEW,
      userId: "user123",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Unknown role");
  });

  it("should return error for unknown action", () => {
    const result = canAccess({
      role: ROLES.USER,
      action: "UNKNOWN_ACTION",
      userId: "user123",
    });
    expect(result.allowed).toBe(false);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * INTEGRATION TESTS
 * ═══════════════════════════════════════════════════════════════════════
 */

describe("Integration Scenarios", () => {
  describe("Complete User Workflow", () => {
    it("should allow user to create, view, update, and delete their draft todo", () => {
      const todo = {
        id: 1,
        user_id: "user123",
        status: TODO_STATUS.DRAFT,
      };

      // Create
      expect(canCreateTodo(ROLES.USER, "user123").allowed).toBe(true);

      // View
      expect(canViewTodo(ROLES.USER, todo, "user123").allowed).toBe(true);

      // Update
      expect(canUpdateTodo(ROLES.USER, todo, "user123").allowed).toBe(true);

      // Delete (only draft)
      expect(canDeleteTodo(ROLES.USER, todo, "user123").allowed).toBe(true);
    });

    it("should prevent user from deleting non-draft todo", () => {
      const todo = {
        id: 1,
        user_id: "user123",
        status: TODO_STATUS.COMPLETED,
      };

      expect(canDeleteTodo(ROLES.USER, todo, "user123").allowed).toBe(false);
    });
  });

  describe("Complete Manager Workflow", () => {
    it("should allow manager to view all todos but nothing else", () => {
      const todo = {
        id: 1,
        user_id: "user123",
        status: TODO_STATUS.DRAFT,
      };

      expect(canCreateTodo(ROLES.MANAGER, "manager456").allowed).toBe(false);
      expect(canViewTodo(ROLES.MANAGER, todo, "manager456").allowed).toBe(true);
      expect(canUpdateTodo(ROLES.MANAGER, todo, "manager456").allowed).toBe(false);
      expect(canDeleteTodo(ROLES.MANAGER, todo, "manager456").allowed).toBe(false);
    });
  });

  describe("Complete Admin Workflow", () => {
    it("should allow admin to view and delete any todo", () => {
      const todo = {
        id: 1,
        user_id: "user123",
        status: TODO_STATUS.COMPLETED,
      };

      expect(canCreateTodo(ROLES.ADMIN, "admin789").allowed).toBe(false);
      expect(canViewTodo(ROLES.ADMIN, todo, "admin789").allowed).toBe(true);
      expect(canUpdateTodo(ROLES.ADMIN, todo, "admin789").allowed).toBe(false);
      expect(canDeleteTodo(ROLES.ADMIN, todo, "admin789").allowed).toBe(true);
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * RUNNING TESTS
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Jest:
 *   npm test
 *   npm test -- --coverage
 *   npm test -- --watch
 * 
 * Vitest:
 *   npx vitest
 *   npx vitest --coverage
 *   npx vitest --watch
 * 
 * Expected: All tests should pass ✓
 */
