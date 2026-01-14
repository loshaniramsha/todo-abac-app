import { canAccess } from "@/lib/abac";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { user } = session;

    let query;
    let params = [];

    // USER can only see their own todos
    // MANAGER and ADMIN can see all todos
    if (user.role === "USER") {
      query = "SELECT * FROM todos WHERE user_id = ? ORDER BY createdAt DESC";
      params = [user.id];
    } else {
      query = "SELECT * FROM todos ORDER BY createdAt DESC";
    }

    const [rows] = await db.execute(query, params);
    return Response.json(rows);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { user } = session;

    // Check if user can create todos
    if (
      !canAccess({
        role: user.role,
        action: "Create",
        userId: user.id,
      })
    ) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();

    if (!body.title?.trim()) {
      return new Response("Title is required", { status: 400 });
    }

    const status = body.status || "draft";

    const [result] = await db.execute(
      "INSERT INTO todos (title, description, status, user_id) VALUES (?, ?, ?, ?)",
      [body.title, body.description || null, status, user.id]
    );

    const [newTodo] = await db.execute("SELECT * FROM todos WHERE id = ?", [
      result.insertId,
    ]);

    return Response.json(newTodo[0], { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
