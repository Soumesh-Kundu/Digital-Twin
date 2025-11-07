import { getServerUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session= await getServerUser();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name, model_name, type, temperature_max, vibration_max, power_max, thresholds } = await req.json();
    try {
        // Validate input
        if (!name || !model_name || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        await db.machines.create({
            data:{
                name,
                model_name,
                type,
                temperature_max,
                vibration_max,
                power_max,
                thresholds
            }
        })
        return NextResponse.json({ message: "Machine created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create machine" }, { status: 500 });
    }
}