import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// Use a different approach for the route handler
export async function PUT(request: NextRequest) {
  try {
    // Extract the ID from the URL
    const id = request.nextUrl.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession();
    
    // Check if user is authenticated and is an admin
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email ?? undefined },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action, notes } = await request.json();

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Get the registration
    const registration = await prisma.ownerRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration.status !== "pending") {
      return NextResponse.json(
        { error: "Registration is not pending" },
        { status: 400 }
      );
    }

    // Update registration status
    const updatedRegistration = await prisma.ownerRegistration.update({
      where: { id },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        notes: notes,
      },
    });

    // If approved, create a user account
    if (action === "approve") {
      await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: registration.name,
          email: registration.email,
          buildingNumber: registration.buildingNumber,
          apartmentNumber: registration.apartmentNumber,
          phoneNumber: registration.phoneNumber,
          isVerifiedOwner: true,
          role: "user",
        },
      });
    }

    // Send email notification
    const emailSubject = action === "approve" 
      ? "Your Costa Beach Owner Registration has been approved!"
      : "Update on your Costa Beach Owner Registration";

    const emailHtml = action === "approve"
      ? `
        <h1>Welcome to Costa Beach!</h1>
        <p>Dear ${registration.name},</p>
        <p>Your registration has been approved. You can now log in to the owner portal using your email address.</p>
        ${notes ? `<p>Admin note: ${notes}</p>` : ""}
        <p>Best regards,<br>Costa Beach Team</p>
      `
      : `
        <h1>Costa Beach Registration Update</h1>
        <p>Dear ${registration.name},</p>
        <p>We regret to inform you that your registration request has been declined.</p>
        ${notes ? `<p>Reason: ${notes}</p>` : ""}
        <p>If you believe this is an error, please contact our support team.</p>
        <p>Best regards,<br>Costa Beach Team</p>
      `;

    await resend.emails.send({
      from: "Costa Beach <noreply@costabeach.com>",
      to: registration.email,
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error("Failed to process registration:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
} 