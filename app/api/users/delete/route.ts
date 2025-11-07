import { getServerUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    const session = await getServerUser();
    if(!session){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    try {
        const body = await req.json();
        const { id } = body as {id: string}
        await db.user.delete({
            where: { id }
        });
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log("Error deleting user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}