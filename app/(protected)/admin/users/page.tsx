import AdminUserList from "@/components/Admin/UserList";
import { db } from "@/lib/server/db"

async function getUsers(){
    const users=db.user.findMany({
        where:{
            role: { not:"ADMIN"}
        },
        select:{
            id:true,
            name:true,
            email:true,
            role:true,
        },
        orderBy:{
            createdAt:"desc"
        }
    })
    return users;
}

export default async function page() {
    const usersPromise= getUsers();
  return (
    <AdminUserList users={usersPromise} />
  )
}
