import { AuthOptions, NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/prisma/db";
import "dotenv/config";

const ALLOWED_REDIRECT_PATHS = [
  "/dashboard",
  "/dashboard/billing",
  "/dashboard/profile",
  "/dashboard/orders",
];

function isSafeRedirect(url: string | null): boolean {
  if (!url) return false;
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const parsed = new URL(url);
      return parsed.hostname === process.env.NEXTAUTH_URL
        ? ALLOWED_REDIRECT_PATHS.some((p) => parsed.pathname.startsWith(p))
        : false;
    }
    return url.startsWith("/dashboard");
  } catch {
    return false;
  }
}

async function getUserWithRoles(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
  if (!user) return null;
  const permissions = user.roles.flatMap((role) => role.permissions);
  return { ...user, permissions: [...new Set(permissions)] };
}

async function getOrCreateOrgForOAuthUser(email: string) {
  const existingUser = await db.user.findUnique({
    where: { email },
    select: { orgId: true, orgName: true },
  });

  if (existingUser?.orgId) {
    return { orgId: existingUser.orgId, orgName: existingUser.orgName };
  }

  const org = await db.organisation.create({
    data: {
      name: "Haelolabs",
      slug: `haelolabs-${Date.now()}`,
    },
  });

  return { orgId: org.id, orgName: org.name };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      async profile(profile) {
        const { orgId, orgName } = await getOrCreateOrgForOAuthUser(profile.email);
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          firstName: profile.name?.split(" ")[0] || "",
          lastName: profile.name?.split(" ")[1] || "",
          phone: undefined,
          image: profile.avatar_url,
          email: profile.email,
          orgId,
          orgName,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      async profile(profile) {
        const { orgId, orgName } = await getOrCreateOrgForOAuthUser(profile.email);
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          firstName: profile.given_name,
          lastName: profile.family_name,
          phone: undefined,
          image: profile.picture,
          email: profile.email,
          orgId,
          orgName,
        };
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "text"     },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const existingUser = await db.user.findUnique({
            where: { email: credentials.email },
            include: { roles: true },
          });

          if (!existingUser) throw new Error("No user found");

          const passwordMatch =
            existingUser.password &&
            (await compare(credentials.password, existingUser.password));

          if (!passwordMatch) throw new Error("Incorrect password");
          if (!existingUser.isVerified) throw new Error("User not verified");

          const permissions = existingUser.roles.flatMap((r) => r.permissions);

          return {
            id:          existingUser.id,
            name:        existingUser.name        ?? undefined,
            firstName:   existingUser.firstName   ?? undefined,
            lastName:    existingUser.lastName    ?? undefined,
            phone:       existingUser.phone       ?? undefined,
            image:       existingUser.image       ?? undefined,
            email:       existingUser.email,
            roles:       existingUser.roles,
            permissions: [...new Set(permissions)],
            orgId:       existingUser.orgId       ?? undefined,
            orgName:     existingUser.orgName     ?? undefined,
          };
        } catch {
          throw new Error("Authentication failed");
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
  // Just verify and return true — don't try to assign roles here
  // The user record may not exist in DB yet at this point for OAuth
  if (account?.provider === "google" || account?.provider === "github") {
    // Only handle isVerified for existing users
    const existingUser = await db.user.findUnique({
      where: { email: user.email! },
      select: { isVerified: true },
    });

    if (existingUser && !existingUser.isVerified) {
      await db.user.update({
        where: { email: user.email! },
        data: { isVerified: true },
      });
    }
  }
  return true;
},

async jwt({ token, user }) {
  if (user) {
    token.id        = user.id;
    token.name      = user.name;
    token.email     = user.email;
    token.picture   = user.image;
    token.firstName = user.firstName;
    token.lastName  = user.lastName;
    token.orgId     = user.orgId   ?? undefined;
    token.orgName   = user.orgName ?? null;
    token.phone     = user.phone   ?? undefined;
    token.role      = user.role;
    token.roles       = user.roles;
    token.permissions = user.permissions;
  }

  const rolesAreMissing =
    !token.roles ||
    (token.roles as any[]).length === 0 ||
    !token.permissions ||
    (token.permissions as any[]).length === 0;

  if (rolesAreMissing && token.id) {
    // Check if user has roles in DB, if not assign the buyer role now
    const userData = await getUserWithRoles(token.id as string);

    if (userData && userData.roles.length === 0) {
      // User exists but has no roles — assign buyer role now
      const defaultRole = await db.role.findFirst({
        where: { roleName: "buyer" },
      });

      if (defaultRole) {
        await db.user.update({
          where: { id: token.id as string },
          data: {
            roles: { connect: { id: defaultRole.id } },
            role: "buyer",
            isVerified: true,
          },
        });

        // Re-fetch after assigning the role
        const updatedUser = await getUserWithRoles(token.id as string);
        if (updatedUser) {
          token.roles       = updatedUser.roles;
          token.permissions = updatedUser.permissions;
          token.orgId       = updatedUser.orgId ?? undefined;
          token.orgName     = updatedUser.orgName;
        }
      }
    } else if (userData && userData.roles.length > 0) {
      token.roles       = userData.roles;
      token.permissions = userData.permissions;
      token.orgId       = userData.orgId ?? undefined;
      token.orgName     = userData.orgName;
    }
  }

  return token;
},

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id          = token.id;
        session.user.name        = token.name;
        session.user.email       = token.email;
        session.user.image       = token.picture;
        session.user.firstName   = token.firstName   ?? undefined;
        session.user.lastName    = token.lastName    ?? undefined;
        session.user.phone       = token.phone       ?? undefined;
        session.user.roles       = token.roles       ?? undefined;
        session.user.permissions = token.permissions ?? undefined;
        session.user.orgId       = token.orgId       ?? undefined;
        session.user.orgName     = token.orgName;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
};