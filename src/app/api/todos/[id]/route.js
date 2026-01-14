import { canAccess } from "@/lib/abac";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// GET single todo
export async function GET(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { user } = session;

    const [rows] = await db.execute("SELECT * FROM todos WHERE id = ?", [id]);

    if (rows.length === 0) {
      return new Response("Todo not found", { status: 404 });
    }

    const todo = rows[0];

    // Check view permission
    if (
      !canAccess({
        role: user.role,
        action: "View",
        todo,
        userId: user.id,
      })
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    return Response.json(todo);
  } catch (error) {
    console.error("Error fetching todo:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// UPDATE todo
export async function PATCH(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { user } = session;

    // Get the todo first
    const [rows] = await db.execute("SELECT * FROM todos WHERE id = ?", [id]);

    if (rows.length === 0) {
      return new Response("Todo not found", { status: 404 });
    }

    const todo = rows[0];

    // Check update permission
    if (
      !canAccess({
        role: user.role,
        action: "Update",
        todo,
        userId: user.id,
      })
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (body.title !== undefined) {
      updates.push("title = ?");
      values.push(body.title);
    }
    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(body.description);
    }
    if (body.status !== undefined) {
      updates.push("status = ?");
      values.push(body.status);
    }

    if (updates.length === 0) {
      return new Response("No fields to update", { status: 400 });
    }

    values.push(id);

    await db.execute(
      `UPDATE todos SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [updatedRows] = await db.execute("SELECT * FROM todos WHERE id = ?", [
      id,
    ]);

    return Response.json(updatedRows[0]);
  } catch (error) {
    console.error("Error updating todo:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// DELETE todo
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { user } = session;

    // Get the todo first
    const [rows] = await db.execute("SELECT * FROM todos WHERE id = ?", [id]);

    if (rows.length === 0) {
      return new Response("Todo not found", { status: 404 });
    }

    const todo = rows[0];

    // Check delete permission
    if (
      !canAccess({
        role: user.role,
        action: "Delete",
        todo,
        userId: user.id,
      })
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    await db.execute("DELETE FROM todos WHERE id = ?", [id]);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
