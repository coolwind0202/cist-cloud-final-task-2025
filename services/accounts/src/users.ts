import { Password, Username } from "./types.ts";

interface BaseUserManager {
  add(username: Username, password: Password): void;
  authenticate(username: Username, password: Password): boolean;
}

export class MemoryUserManager implements BaseUserManager {
  users: Map<Username, Password>;

  constructor() {
    this.users = new Map();
  }

  add(username: Username, password: Password) {
    if (this.users.has(username)) {
      throw new Error("User already exists");
    }
    this.users.set(username, password);
  }

  authenticate(username: Username, password: Password) {
    const storedPassword = this.users.get(username);
    return storedPassword === password;
  }
}
