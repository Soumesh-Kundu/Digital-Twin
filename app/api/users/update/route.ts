import { getServerUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { hash } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
type Body = {
    id: string;
    email: string;
    name: string;
    role: 'ENGINEER' | 'MAINTENANCE';
    password?: string;
}

export async function PUT(request: NextRequest) {
    const session = await getServerUser();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { id, email, name, role, password } = body as Body;
    let hashPassword:string|undefined = undefined;
    try {
        if(password){
            hashPassword=await hash(password,10);
        }
        const user = await db.user.update({
            where: { id },
            data: {
                email,
                name,
                role,
                password: hashPassword
            }
        });
        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}