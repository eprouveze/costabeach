import type { Meta, StoryObj } from '@storybook/react';
import { Permission } from '@/lib/types';

// This is a documentation-only story for the permission system
const PermissionSystemDocs = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Permission System Documentation</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          The Costa Beach HOA Portal uses a role-based permission system to control access to various features and content.
          This system is built on two main concepts:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Roles</strong>: Predefined sets of permissions (user, admin, contentEditor)</li>
          <li><strong>Permissions</strong>: Granular access controls for specific actions</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Roles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Role</th>
                <th className="py-2 px-4 border-b text-left">Description</th>
                <th className="py-2 px-4 border-b text-left">Default Permissions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b font-medium">user</td>
                <td className="py-2 px-4 border-b">Regular portal user (property owner)</td>
                <td className="py-2 px-4 border-b">None (read-only access to documents)</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">contentEditor</td>
                <td className="py-2 px-4 border-b">User who can manage documents</td>
                <td className="py-2 px-4 border-b">
                  <ul className="list-disc pl-6">
                    <li>manageDocuments</li>
                    <li>manageComiteDocuments</li>
                    <li>manageSocieteDocuments</li>
                    <li>manageLegalDocuments</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">admin</td>
                <td className="py-2 px-4 border-b">Full administrator with all permissions</td>
                <td className="py-2 px-4 border-b">All permissions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Available Permissions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Permission</th>
                <th className="py-2 px-4 border-b text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b font-medium">manageUsers</td>
                <td className="py-2 px-4 border-b">Create, update, and delete users; assign roles and permissions</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">manageDocuments</td>
                <td className="py-2 px-4 border-b">Create, update, and delete all documents</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">manageComiteDocuments</td>
                <td className="py-2 px-4 border-b">Create, update, and delete documents in the Comité de Suivi category</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">manageSocieteDocuments</td>
                <td className="py-2 px-4 border-b">Create, update, and delete documents in the Société de Gestion category</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">manageLegalDocuments</td>
                <td className="py-2 px-4 border-b">Create, update, and delete documents in the Legal category</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">approveRegistrations</td>
                <td className="py-2 px-4 border-b">Review and approve/reject owner registration requests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Implementation Details</h2>
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h3 className="text-lg font-medium mb-2">Database Schema</h3>
          <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
{`// User model in Prisma schema
model User {
  // Other fields...
  role           UserRole  @default(user)
  permissions    Permission[]
}

enum UserRole {
  user
  admin
  contentEditor
}

enum Permission {
  manageUsers
  manageDocuments
  manageComiteDocuments
  manageSocieteDocuments
  manageLegalDocuments
  approveRegistrations
}`}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h3 className="text-lg font-medium mb-2">Permission Checking</h3>
          <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
{`// Check if a user has a specific permission
const canManageDocuments = hasPermission(user.permissions, Permission.MANAGE_DOCUMENTS);

// Check if a user is an admin
const isUserAdmin = isAdmin(user.role);

// Check if a user is a content editor (includes admins)
const isUserContentEditor = isContentEditor(user.role);`}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h3 className="text-lg font-medium mb-2">Managing Permissions</h3>
          <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
{`// Grant a permission to a user
await grantPermission(userId, Permission.MANAGE_DOCUMENTS);

// Revoke a permission from a user
await revokePermission(userId, Permission.MANAGE_DOCUMENTS);

// Set a user's role
await setUserRole(userId, 'contentEditor');`}
          </pre>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Always check permissions before performing restricted actions</li>
          <li>Use the most specific permission possible (e.g., manageComiteDocuments instead of manageDocuments)</li>
          <li>Combine role and permission checks for complex access control</li>
          <li>Log permission changes for audit purposes</li>
          <li>Consider using server-side permission checks for sensitive operations</li>
        </ul>
      </section>
    </div>
  );
};

const meta: Meta<typeof PermissionSystemDocs> = {
  title: 'Documentation/Permission System',
  component: PermissionSystemDocs,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Documentation for the Costa Beach HOA Portal permission system',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PermissionSystemDocs>;

export const Documentation: Story = {}; 