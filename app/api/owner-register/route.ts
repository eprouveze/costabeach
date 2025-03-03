import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, buildingNumber, apartmentNumber, phoneNumber } = body;

    // Validate required fields
    if (!name || !email || !buildingNumber || !apartmentNumber || !phoneNumber) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Check if there's already a pending registration
    const existingRegistration = await prisma.ownerRegistration.findUnique({
      where: { email },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "A registration request for this email is already pending" },
        { status: 400 }
      );
    }

    // Create new registration request
    await prisma.ownerRegistration.create({
      data: {
        id: uuidv4(),
        name,
        email,
        buildingNumber,
        apartmentNumber,
        phoneNumber,
      },
    });

    return NextResponse.json(
      { message: "Registration submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
} 