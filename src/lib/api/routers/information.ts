import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/api/trpc";
import { TRPCError } from "@trpc/server";
import { InformationStatus, Language, Permission } from "@/lib/types";
import { checkPermission } from "@/lib/utils/permissions";

export const informationRouter = createTRPCRouter({
  // Get all published information posts for public viewing
  getPublishedPosts: publicProcedure
    .input(z.object({
      language: z.nativeEnum(Language).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { language, limit, offset } = input;
      
      try {
        const posts = await ctx.db.information_posts.findMany({
          where: {
            isPublished: true,
            status: 'published'
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true
              }
            },
            translations: language ? {
              where: {
                language: language
              }
            } : true
          },
          orderBy: {
            publishedAt: 'desc'
          },
          take: limit,
          skip: offset
        });

        return posts;
      } catch (error) {
        console.error('Error fetching published posts:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch information posts'
        });
      }
    }),

  // Get all posts for admin management
  getAllPosts: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      status: z.nativeEnum(InformationStatus).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Check permissions
      if (!checkPermission(ctx.session.user, Permission.VIEW_INFORMATION)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view information posts'
        });
      }

      const { limit, offset, status } = input;
      
      try {
        const posts = await ctx.db.information_posts.findMany({
          where: status ? { status } : undefined,
          include: {
            creator: {
              select: {
                id: true,
                name: true
              }
            },
            translations: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit,
          skip: offset
        });

        return posts;
      } catch (error) {
        console.error('Error fetching all posts:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch information posts'
        });
      }
    }),

  // Get a single post by ID
  getPost: protectedProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .query(async ({ ctx, input }) => {
      // Check permissions
      if (!checkPermission(ctx.session.user, Permission.VIEW_INFORMATION)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view information posts'
        });
      }

      try {
        const post = await ctx.db.information_posts.findUnique({
          where: { id: input.id },
          include: {
            creator: {
              select: {
                id: true,
                name: true
              }
            },
            translations: true
          }
        });

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Information post not found'
          });
        }

        return post;
      } catch (error) {
        console.error('Error fetching post:', error);
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch information post'
        });
      }
    }),

  // Create a new information post
  createPost: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(500),
      content: z.string().min(1),
      excerpt: z.string().max(1000).optional(),
      status: z.nativeEnum(InformationStatus).default(InformationStatus.DRAFT),
      publishNow: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!checkPermission(ctx.session.user, Permission.MANAGE_INFORMATION)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create information posts'
        });
      }

      const { title, content, excerpt, status, publishNow } = input;
      const userId = ctx.session.user.id;

      try {
        const post = await ctx.db.information_posts.create({
          data: {
            title,
            content,
            excerpt,
            status: publishNow ? 'published' : status,
            isPublished: publishNow,
            publishedAt: publishNow ? new Date() : null,
            createdBy: userId
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true
              }
            },
            translations: true
          }
        });

        return post;
      } catch (error) {
        console.error('Error creating post:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create information post'
        });
      }
    }),

  // Update an information post
  updatePost: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(500).optional(),
      content: z.string().min(1).optional(),
      excerpt: z.string().max(1000).optional(),
      status: z.nativeEnum(InformationStatus).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!checkPermission(ctx.session.user, Permission.MANAGE_INFORMATION)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update information posts'
        });
      }

      const { id, ...updateData } = input;

      try {
        // Check if post exists
        const existingPost = await ctx.db.information_posts.findUnique({
          where: { id }
        });

        if (!existingPost) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Information post not found'
          });
        }

        const post = await ctx.db.information_posts.update({
          where: { id },
          data: {
            ...updateData,
            updatedAt: new Date()
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true
              }
            },
            translations: true
          }
        });

        return post;
      } catch (error) {
        console.error('Error updating post:', error);
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update information post'
        });
      }
    }),

  // Publish a post
  publishPost: protectedProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!checkPermission(ctx.session.user, Permission.MANAGE_INFORMATION)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to publish information posts'
        });
      }

      try {
        const post = await ctx.db.information_posts.update({
          where: { id: input.id },
          data: {
            status: 'published',
            isPublished: true,
            publishedAt: new Date(),
            updatedAt: new Date()
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true
              }
            },
            translations: true
          }
        });

        return post;
      } catch (error) {
        console.error('Error publishing post:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to publish information post'
        });
      }
    }),

  // Delete an information post
  deletePost: protectedProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!checkPermission(ctx.session.user, Permission.MANAGE_INFORMATION)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete information posts'
        });
      }

      try {
        // Check if post exists
        const existingPost = await ctx.db.information_posts.findUnique({
          where: { id: input.id }
        });

        if (!existingPost) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Information post not found'
          });
        }

        await ctx.db.information_posts.delete({
          where: { id: input.id }
        });

        return { success: true };
      } catch (error) {
        console.error('Error deleting post:', error);
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete information post'
        });
      }
    }),

  // Add translation for a post
  addTranslation: protectedProcedure
    .input(z.object({
      informationId: z.string().uuid(),
      language: z.nativeEnum(Language),
      title: z.string().min(1).max(500),
      content: z.string().min(1),
      excerpt: z.string().max(1000).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      if (!checkPermission(ctx.session.user, Permission.MANAGE_INFORMATION)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to add translations'
        });
      }

      try {
        const translation = await ctx.db.information_translations.create({
          data: {
            informationId: input.informationId,
            language: input.language,
            title: input.title,
            content: input.content,
            excerpt: input.excerpt
          }
        });

        return translation;
      } catch (error) {
        console.error('Error adding translation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add translation'
        });
      }
    }),
});