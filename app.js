const express = require("express");
const validator = require("validator");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const UserSchema = require("./UserSchema");
const { cleanUpAndValidate } = require("./utils/AuthUtils");
const jwt = require("jsonwebtoken");

const app = express();

app.set("view engine", "ejs");

// const mongoURI = `mongodb+srv://himadri12@cluster0.3ije6wh.mongodb.net/node_modules`;
const mongoURI = `mongodb+srv://HimadriDas:himadri12@cluster0.hkllkvq.mongodb.net/node_modules`;

mongoose.set("strictQuery", false);
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connect to DB successfully");
  })
  .catch((err) => {
    console.log("Failed to connect", err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  return res.render("login");
});
app.get("/profile", async (req, res) => {
  res.render("profile");
});

const jwtSign = (email) => {
    const JWT_TOKEN = jwt.sign({ email: email }, "backendnodejs", {
      expiresIn: "15d",
    });
    return JWT_TOKEN;
  };

app.post("/", async (req, res) => {
  console.log(req.body);
  const { name, email, username, password } = req.body;
  try {
    // await cleanUpAndValidate({ name, email, username, password });
    console.log(name);
  } catch (err) {
    return res.send({
      status: 400,
      message: err,
    });
  }
  const hashedPassword = await bcrypt.hash(password, 7);
  const verificationToken = jwtSign(email);
  console.log(hashedPassword);
  let userDetails = new UserSchema({
    name: name,
    email,
    email,
    username: username,
    password: hashedPassword,
    emailAuthenticated: false,
  });
  console.log(userDetails);
  try {
    const userDB = await userDetails.save();
    console.log(userDB);
    return res.send({
      status: 200,
      mussage: "User registerd",
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal Error",
    });
  }
  let userExits;
  try {
    userExits = await UserSchema.findOne({ email });
  } catch (err) {
    return res.send({
      status: 400,
      message: err,
    });
  }

  if (userExits) {
    return res.send({
      status: 200,
      message: "User Already Exists",
    });
  }
});

app.post("/login", async (req, res) => {
  // console.log(req.session);
  const { loginId, password } = req.body;

  if (
    typeof loginId !== "string" ||
    typeof password !== "string" ||
    !loginId ||
    !password
  ) {
    return res.send({
      status: 400,
      message: "Invalid Data",
    });
  }
  let userDB;

  try {
    if (validator.isEmail(loginId)) {
      userDB = await UserSchema.findOne({ email: loginId });
    } else {
      userDB = await UserSchema.findOne({ username: loginId });
    }

    console.log(userDB);

    if (!userDB) {
      return res.send({
        status: 400,
        message: "User not found, Please register first",
        error: err,
      });
    }

    const isMatch = await bcrypt.compare(password, userDB.password);

    if (!isMatch) {
      return res.send({
        status: 400,
        message: "Invalid Password",
        data: req.body,
      });
    }
    res.redirect("profile");
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal Server Error, Please loggin again!",
      error: err,
    });
  }
});

app.post("/logout", (req, res) => {
    res.redirect("/login");
  });

app.listen(8000, () => {
  console.log("Port 8000");
});
