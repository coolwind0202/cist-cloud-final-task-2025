import express from "express";
import { MemoryUserManager } from "./users.ts";
import { MemorySessionManager } from "./sessions.ts";

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
  if (sessionManager.validateSession(req.body["sessionId"])) {
    res.send("Already logged in");
    return;
  }

  if (userManager.authenticate(req.body["username"], req.body["password"])) {
    res.cookie("sessionId", sessionManager.createSession(req.body["username"]));

    // TODO: Redirect to a protected page
    res.send("Login successful, session created");
    return;
  }

  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  if (sessionManager.validateSession(req.body["sessionId"])) {
    sessionManager.destroySession(req.body["sessionId"]);

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

app.post("/session", (req, res) => {
  const username = sessionManager.getSessionUsername(req.body["sessionId"]);

  res.send({ valid: username !== undefined, username });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
