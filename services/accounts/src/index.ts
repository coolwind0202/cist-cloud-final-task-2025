import express from "express";
import { MemoryUserManager } from "./users.ts";
import { MemorySessionManager } from "./sessions.ts";
import { SessionId } from "./types.ts";

const app = express();
const port = 3000;

const userManager = new MemoryUserManager();
const sessionManager = new MemorySessionManager();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/login", (req, res) => {
  res.send(
    "<form method='post' action='/login'><input name='username'/><input name='password' type='password'/><button type='submit'>Login</button></form>",
  );
});

app.get("/register", (req, res) => {
  res.send(
    "<form method='post' action='/register'><input name='username'/><input name='password' type='password'/><button type='submit'>Register</button></form>",
  );
});

app.post("/login", (req, res) => {
  if (sessionManager.validateSession(req.body["session_id"])) {
    res.send("Already logged in");
    return;
  }

  if (userManager.authenticate(req.body["username"], req.body["password"])) {
    res.cookie(
      "session_id",
      sessionManager.createSession(req.body["username"]),
    );

    // TODO: Redirect to a protected page
    res.send("Login successful, session created");
    return;
  }

  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  if (sessionManager.validateSession(req.body["session_id"])) {
    sessionManager.destroySession(req.body["session_id"]);

    // TODO: Redirect to login page
    res.redirect("/login");
    return;
  }

  res.send("You are not logged in");
});

app.post("/register", (req, res) => {
  try {
    userManager.add(req.body["username"], req.body["password"]);
    res.send("User registered successfully");
  } catch (e) {
    res.send("User registration failed: " + (e as Error).message);
  }
});

app.get("/sessions/{:session_id}/username", (req, res) => {
  const username = sessionManager.getSessionUsername(
    (req.params?.session_id ?? "") as SessionId,
  );
  if (username === undefined) {
    res.status(404).send({ error: "Session not found" });
    return;
  }
  res.send({ username });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
