import { getServerUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    const session= await getServerUser();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }   
    const { id, name, model_name, type, temperature_max, vibration_max, power_max, thresholds } = await req.json();
    try {
        if (!id) {
            return NextResponse.json({ error: "Missing machine ID" }, { status: 400 });
        }
        await db.machines.update({
            where: { id },
            data: {
                name,
                model_name,
                type,
                temperature_max,
                vibration_max,
                power_max,
                thresholds
            }
        });
        return NextResponse.json({ message: "Machine updated successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update machine" }, { status: 500 });
    }
}
