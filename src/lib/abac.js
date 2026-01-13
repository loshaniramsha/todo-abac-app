export function canAccess({role,action,todo,userId}){
    if(role==="USER"){
        if(action==="View") 
            return todo.ownerId===userId;
        if(action==="Create")
            return true;
        if(action=="Update")
            return todo.ownerId===userId;
        if(action==="Delete")
            return todo.ownerId===userId && todo.status!=="draft";
    }
    if(role==="MANAGER"){
        return action==="View";
    }
    if(role==="ADMIN"){
        return action === "View" || action==="Delete";
    }
    return false;
}