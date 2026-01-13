import { canAccess } from "@/lib/abac";
import { getSession } from "@/lib/auth";

let todos = [];
export async function GET(){
    const session = await getSession();

    const result=session.user.role==="USER" ? todos.filter(t=>t.ownerId===session.user.id) : todos;
    return Response.json(result);
}

export async function POST(request){
    const session=await getSession();
    const body =await request.json();

    if(!canAccess({
        role:session.user.role,
        action:"Create",
        userId:session.user.id
    })){
        return new Response("Forbidden", {status:403});
    }
    const todo={
        id:Date.now().toString(),
        title:body.title,
        description:body.description,
        status:"draft",
        ownerId:session.user.id,
    };
    todos.push(todo);
    return Response.json(todo);
}
