import { role } from "better-auth/plugins";

export async function getSession(){
    return{
        user:{
            id:1,
            role:"admin"
        },
    };
}