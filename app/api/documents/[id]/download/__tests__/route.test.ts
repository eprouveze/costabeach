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

describe("Document Download API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if document is not found", async () => {
    // Mock document not found
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/documents/123/download");
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
    });

    // Mock no session
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/documents/123/download");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return download URL for published document", async () => {
    // Mock document found and published
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "123",
      isPublished: true,
      filePath: "documents/test.pdf",
    });

    // Mock update
    (prisma.document.update as jest.Mock).mockResolvedValueOnce({});

    // Mock download URL
    (getDownloadUrl as jest.Mock).mockResolvedValueOnce("https://example.com/download");

    const request = new NextRequest("http://localhost:3000/api/documents/123/download");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ downloadUrl: "https://example.com/download" });
    expect(prisma.document.update).toHaveBeenCalledWith({
      where: { id: "123" },
      data: { downloadCount: { increment: 1 } },
    });
    expect(getDownloadUrl).toHaveBeenCalledWith("documents/test.pdf");
  });

  it("should return download URL for authenticated user with unpublished document", async () => {
    // Mock document found but not published
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "123",
      isPublished: false,
      filePath: "documents/test.pdf",
    });

    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { id: "user123" },
    });

    // Mock update
    (prisma.document.update as jest.Mock).mockResolvedValueOnce({});

    // Mock download URL
    (getDownloadUrl as jest.Mock).mockResolvedValueOnce("https://example.com/download");

    const request = new NextRequest("http://localhost:3000/api/documents/123/download");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ downloadUrl: "https://example.com/download" });
    expect(prisma.document.update).toHaveBeenCalledWith({
      where: { id: "123" },
      data: { downloadCount: { increment: 1 } },
    });
    expect(getDownloadUrl).toHaveBeenCalledWith("documents/test.pdf");
  });

  it("should handle errors gracefully", async () => {
    // Mock document found
    (prisma.document.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "123",
      isPublished: true,
      filePath: "documents/test.pdf",
    });

    // Mock update error
    (prisma.document.update as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/documents/123/download");
    const context = { params: Promise.resolve({ id: "123" }) };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to generate download URL" });
  });
}); 