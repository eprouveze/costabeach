import { NextRequest } from "next/server";
import { GET } from "../route";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/utils/documents";
import { getServerSession } from "next-auth";

// Mock the dependencies
jest.mock("@/lib/db", () => ({
  prisma: {
    document: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/utils/documents", () => ({
  getDownloadUrl: jest.fn(),
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

describe("Document Preview API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if document is not found", async () => {
    // Mock document not found
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/documents/123/preview");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: "Document not found" });
    expect(prisma.document.findUnique).toHaveBeenCalledWith({
      where: { id: "123" },
    });
  });

  it("should return 401 if document is not published and user is not authenticated", async () => {
    // Mock document found but not published
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "123",
      isPublished: false,
      fileType: "application/pdf",
    });

    // Mock no session
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/documents/123/preview");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if file type is not previewable", async () => {
    // Mock document found with non-previewable file type
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "123",
      isPublished: true,
      fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const request = new NextRequest("http://localhost:3000/api/documents/123/preview");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Preview not available for this file type" });
  });

  it("should return preview URL for PDF document", async () => {
    // Mock document found with previewable file type
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "123",
      isPublished: true,
      fileType: "application/pdf",
      filePath: "documents/test.pdf",
    });

    // Mock update
    (prisma.document.update as jest.Mock).mockResolvedValueOnce({});

    // Mock preview URL
    (getDownloadUrl as jest.Mock).mockResolvedValueOnce("https://example.com/preview");

    const request = new NextRequest("http://localhost:3000/api/documents/123/preview");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ previewUrl: "https://example.com/preview" });
    expect(prisma.document.update).toHaveBeenCalledWith({
      where: { id: "123" },
      data: { viewCount: { increment: 1 } },
    });
    expect(getDownloadUrl).toHaveBeenCalledWith("documents/test.pdf", 15 * 60, false);
  });

  it("should return preview URL for image document", async () => {
    // Mock document found with previewable file type
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "123",
      isPublished: true,
      fileType: "image/jpeg",
      filePath: "documents/test.jpg",
    });

    // Mock update
    (prisma.document.update as jest.Mock).mockResolvedValueOnce({});

    // Mock preview URL
    (getDownloadUrl as jest.Mock).mockResolvedValueOnce("https://example.com/preview");

    const request = new NextRequest("http://localhost:3000/api/documents/123/preview");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ previewUrl: "https://example.com/preview" });
    expect(getDownloadUrl).toHaveBeenCalledWith("documents/test.jpg", 15 * 60, false);
  });

  it("should handle errors gracefully", async () => {
    // Mock document found
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "123",
      isPublished: true,
      fileType: "application/pdf",
      filePath: "documents/test.pdf",
    });

    // Mock update error
    (prisma.document.update as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/documents/123/preview");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to generate preview URL" });
  });
}); 