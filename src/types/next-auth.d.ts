import type { Role, UserStatus } from "@/generated/prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      displayName: string;
      image?: string | null;
      role: Role;
      status: UserStatus;
    };
  }

  interface User {
    username: string;
    displayName: string;
    role: Role;
    status: UserStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    displayName: string;
    role: Role;
    status: UserStatus;
  }
}
