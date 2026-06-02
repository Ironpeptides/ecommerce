// permissions.ts

export type Permission = {
  create: string;
  read: string;
  update: string;
  delete: string;
};

/* export type ModulePermissions = {
  display: string;
  name: string;
  permissions: Permission;
}; */

/* export const permissions: ModulePermissions[] = [
  {
    display: "Dashboard",
    name: "dashboard",
    permissions: {
      create: "dashboard.create",
      read: "dashboard.read",
      update: "dashboard.update",
      delete: "dashboard.delete",
    },
  },
  {
    display: "Users",
    name: "users",
    permissions: {
      create: "users.create",
      read: "users.read",
      update: "users.update",
      delete: "users.delete",
    },
  },
  {
    display: "Roles",
    name: "roles",
    permissions: {
      create: "roles.create",
      read: "roles.read",
      update: "roles.update",
      delete: "roles.delete",
    },
  },
  {
    display: "Sales",
    name: "sales",
    permissions: {
      create: "sales.create",
      read: "sales.read",
      update: "sales.update",
      delete: "sales.delete",
    },
  },
  {
    display: "Customers",
    name: "customers",
    permissions: {
      create: "customers.create",
      read: "customers.read",
      update: "customers.update",
      delete: "customers.delete",
    },
  },
  {
    display: "Orders",
    name: "orders",
    permissions: {
      create: "orders.create",
      read: "orders.read",
      update: "orders.update",
      delete: "orders.delete",
    },
  },
  {
    display: "Reports",
    name: "reports",
    permissions: {
      create: "reports.create",
      read: "reports.read",
      update: "reports.update",
      delete: "reports.delete",
    },
  },
  {
    display: "Settings",
    name: "settings",
    permissions: {
      create: "settings.create",
      read: "settings.read",
      update: "settings.update",
      delete: "settings.delete",
    },
  },
  {
    display: "Categories",
    name: "categories",
    permissions: {
      create: "categories.create",
      read: "categories.read",
      update: "categories.update",
      delete: "categories.delete",
    },
  },
  {
    display: "Products",
    name: "products",
    permissions: {
      create: "products.create",
      read: "products.read",
      update: "products.update",
      delete: "products.delete",
    },
  },
  {
    display: "Blogs",
    name: "blogs",
    permissions: {
      create: "blogs.create",
      read: "blogs.read",
      update: "blogs.update",
      delete: "blogs.delete",
    },
  },
]; */


// config/permissions.ts
export interface ModulePermissions {
  display: string;
  name: string;
  permissions: {
    create: string;
    read: string;
    update: string;
    delete: string;
  };
}

export const permissions: ModulePermissions[] = [
  {
    display: "Dashboard",
    name: "dashboard",
    permissions: {
      create: "dashboard.create",
      read: "dashboard.read",
      update: "dashboard.update",
      delete: "dashboard.delete",
    },
  },
  {
    display: "Users",
    name: "users",
    permissions: {
      create: "users.create",
      read: "users.read",
      update: "users.update",
      delete: "users.delete",
    },
  },
  {
    display: "Roles",
    name: "roles",
    permissions: {
      create: "roles.create",
      read: "roles.read",
      update: "roles.update",
      delete: "roles.delete",
    },
  },
  {
    display: "Sales",
    name: "sales",
    permissions: {
      create: "sales.create",
      read: "sales.read",
      update: "sales.update",
      delete: "sales.delete",
    },
  },
  {
    display: "Customers",
    name: "customers",
    permissions: {
      create: "customers.create",
      read: "customers.read",
      update: "customers.update",
      delete: "customers.delete",
    },
  },
  {
    display: "Orders",
    name: "orders",
    permissions: {
      create: "orders.create",
      read: "orders.read",
      update: "orders.update",
      delete: "orders.delete",
    },
  },
  {
    display: "Reports",
    name: "reports",
    permissions: {
      create: "reports.create",
      read: "reports.read",
      update: "reports.update",
      delete: "reports.delete",
    },
  },
  {
    display: "Settings",
    name: "settings",
    permissions: {
      create: "settings.create",
      read: "settings.read",
      update: "settings.update",
      delete: "settings.delete",
    },
  },
  {
    display: "Categories",
    name: "categories",
    permissions: {
      create: "categories.create",
      read: "categories.read",
      update: "categories.update",
      delete: "categories.delete",
    },
  },
  {
    display: "Products",
    name: "products",
    permissions: {
      create: "products.create",
      read: "products.read",
      update: "products.update",
      delete: "products.delete",
    },
  },
  {
    display: "Blogs",
    name: "blogs",
    permissions: {
      create: "blogs.create",
      read: "blogs.read",
      update: "blogs.update",
      delete: "blogs.delete",
    },
  },
  {
    display: "Wishlist",
    name: "wishlist",
    permissions: {
      create: "wishlist.create",
      read: "wishlist.read",
      update: "wishlist.update",
      delete: "wishlist.delete",
    },
  },
  {
    display: "Reviews",
    name: "reviews",
    permissions: {
      create: "reviews.create",
      read: "reviews.read",
      update: "reviews.update",
      delete: "reviews.delete",
    },
  },
  {
    display: "Support",
    name: "support",
    permissions: {
      create: "support.create",
      read: "support.read",
      update: "support.update",
      delete: "support.delete",
    },
  },
  {
    display: "Cart",
    name: "cart",
    permissions: {
      create: "cart.create",
      read: "cart.read",
      update: "cart.update",
      delete: "cart.delete",
    },
  },
  {
    display: "Checkout",
    name: "checkout",
    permissions: {
      create: "checkout.create",
      read: "checkout.read",
      update: "checkout.update",
      delete: "checkout.delete",
    },
  },
  {
    display: "Profile",
    name: "profile",
    permissions: {
      create: "profile.create",
      read: "profile.read",
      update: "profile.update",
      delete: "profile.delete",
    },
  },
];

// Predefined role permission sets
export const buyerPermissions = [
  "dashboard.read",
  "products.read",
  "categories.read",
  "blogs.read",
  "orders.create",  // "orders.read",
  "profile.read",
  "profile.update",
  "cart.create",
  "cart.read",
  "cart.update",
  "cart.delete",
  "checkout.create",
  "checkout.read",
  "reviews.create",
  "reviews.read",
  "reviews.update",
  "reviews.delete",
  "wishlist.create",
  "wishlist.read",
  "wishlist.update",
  "wishlist.delete",
  "support.create",
  "support.read",
];

export const staffPermissions = [
  ...buyerPermissions,
  "products.create",
  "products.update",
  "categories.create",
  "categories.update",
  "orders.update",
  "sales.read",
];

export const managerPermissions = [
  ...staffPermissions,
  "products.delete",
  "categories.delete",
  "customers.read",
  "customers.update",
  "reports.read",
  "sales.update",
  "users.read",
];

export const adminPermissions = [
  ...managerPermissions,
  "dashboard.create",
  "dashboard.update",
  "dashboard.delete",
  "users.create",
  "users.update",
  "users.delete",
  "roles.create",
  "roles.read",
  "roles.update",
  "roles.delete",
  "sales.create",
  "sales.delete",
  "customers.create",
  "customers.delete",
  "orders.delete",
  "reports.create",
  "reports.update",
  "reports.delete",
  "settings.create",
  "settings.read",
  "settings.update",
  "settings.delete",
  "blogs.create",
  "blogs.update",
  "blogs.delete",
];

/* export const buyerPermissions = [
  // Can browse but not manage
  "products.read",
  "categories.read",
  "blogs.read",

  // Full control over their own orders
  "orders.create",
  "orders.read",

  // Their own profile/account
  "profile.read",
  "profile.update",

  // Shopping experience
  "cart.create",
  "cart.read",
  "cart.update",
  "cart.delete",

  "checkout.create",
  "checkout.read",

  "reviews.create",
  "reviews.read",
  "reviews.update",
  "reviews.delete",

  "wishlist.create",
  "wishlist.read",
  "wishlist.update",
  "wishlist.delete",

  // Support
  "support.create",
  "support.read",
];

export const adminPermissions = [
  "dashboard.create",
  "dashboard.read",
  "dashboard.update",
  "dashboard.delete",

  "users.create",
  "users.read",
  "users.update",
  "users.delete",

  "roles.create",
  "roles.read",
  "roles.update",
  "roles.delete",

  "sales.create",
  "sales.read",
  "sales.update",
  "sales.delete",

  "customers.create",
  "customers.read",
  "customers.update",
  "customers.delete",

  "orders.create",
  "orders.read",
  "orders.update",
  "orders.delete",

  "reports.create",
  "reports.read",
  "reports.update",
  "reports.delete",

  "settings.create",
  "settings.read",
  "settings.update",
  "settings.delete",

  "categories.create",
  "categories.read",
  "categories.update",
  "categories.delete",

  "products.create",
  "products.read",
  "products.update",
  "products.delete",

  "blogs.create",
  "blogs.read",
  "blogs.update",
  "blogs.delete",
];
 */

// Helper function to get all permission strings
export function getAllPermissions(): string[] {
  return permissions.flatMap((module) => Object.values(module.permissions));
}

// Helper function to check if a permission exists
export function isValidPermission(permission: string): boolean {
  return getAllPermissions().includes(permission);
}

// Helper to get module permissions by name
export function getModulePermissions(
  moduleName: string
): Permission | undefined {
  const module = permissions.find((m) => m.name === moduleName);
  return module?.permissions;
}

// Type for the permissions object
export type PermissionsType = {
  [K in (typeof permissions)[number]["name"]]: Permission;
};
