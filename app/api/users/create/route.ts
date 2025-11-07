import { getServerUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { NextRequest, NextResponse } from "next/server";
import { hash } from 'bcrypt'
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
type Body = {
    email: string;
    password: string;
    name: string;
    role: Role;
}

export async function POST(req: NextRequest) {
    const session = await getServerUser();
    const body: Body = await req.json();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {

        const { email, password, name,role } = body;
        const hashPassword = await hash(password, 10);
        const user = await db.user.create({
            data: {
                email,
                password: hashPassword,
                name,
                role
            }
        })
        revalidatePath('/admin/users')
        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}