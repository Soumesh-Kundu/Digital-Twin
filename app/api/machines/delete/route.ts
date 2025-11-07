import { getServerUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    const session= await getServerUser();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await req.json();
    try {
        if (!id) {
            return NextResponse.json({ error: "Missing machine ID" }, { status: 400 });
        }
        await db.machines.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Machine deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete machine" }, { status: 500 });

    }
}