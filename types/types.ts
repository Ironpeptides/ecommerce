import { Role, User } from "@prisma/client";

export type CategoryProps = {
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
};
export type SavingProps = {
  amount: number;
  month: string;
  name: string;
  userId: string;
  paymentDate: any;
};
export type UserProps = {
  name: string;
  firstName: string;
  lastName: string;
  orgName: string;
  phone: string;
  image: string;
  email: string;
  password: string;
  role?: string;
};

export type InvitedUserProps = {
  name: string;
  firstName: string;
  lastName: string;
  roleId:string;
  orgName: string;
  orgId: string;
  phone: string;
  image: string;
  email: string;
  password: string;
  role?: string;
};

export type LoginProps = {
  email: string;
  password: string;
};
export type ForgotPasswordProps = {
  email: string;
};

// types/types.ts

export interface RoleFormData {
  displayName: string;
  description?: string;
  permissions: string[];
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface RoleOption {
  label: string;
  value: string;
}

export interface UpdateUserRoleResponse {
  error: string | null;
  status: number;
  data: UserWithRoles | null;
}

export interface RoleResponse {
  id: string;
  displayName: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}


export type Review = {
  id: string;
  name: string;
  handle?: string;          // @username for Twitter
  platform: "google" | "twitter" | "facebook";
  text: string;
  rating?: number;          // mainly for Google
  date?: string;            // "2 days ago", "Mar 15", etc.
  avatarUrl?: string;
  // platform‑specific metrics
  likes?: number;
  retweets?: number;
  replies?: number;
  comments?: number;
  shares?: number;
  // optional screenshot override
  imageUrl?: string;
  imageAlt?: string;
};