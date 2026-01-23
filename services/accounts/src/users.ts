import { prisma } from "../lib/prisma.js";

import type { Password, Username } from "./types.js";

interface BaseUserManager {
  add(username: Username, password: Password): Promise<void>;
  authenticate(username: Username, password: Password): Promise<boolean>;
}

export class MemoryUserManager implements BaseUserManager {
  users: Map<Username, Password>;

  constructor() {
    this.users = new Map();
  }

  async add(username: Username, password: Password) {
    if (this.users.has(username)) {
      throw new Error("User already exists");
    }
    this.users.set(username, password);
  }

  async authenticate(username: Username, password: Password) {
    const storedPassword = this.users.get(username);
    return storedPassword === password;
  }
}

export class PrismaUserManager implements BaseUserManager {
  async add(username: Username, password: Password) {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new Error("User already exists");
    }
    await prisma.user.create({
      data: { username, password },
    });
  }

  async authenticate(username: Username, password: Password) {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    return user?.password === password;
  }
}
