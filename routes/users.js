import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { genPassword, createUser, getUserByName } from "../helper.js";

const router = express.Router();

//signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  //validation
  const isUserExist = await getUserByName(username);
  console.log(isUserExist);
  if (isUserExist) {
    res.status(400).send({ message: "Username already Taken" });
    return;
  }
  if (
    !/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[#!@%&_]).{8,}$/g.test(
      password
    )
  ) {
    res.status(400).send({ message: "Password Pattern doesnt match" });
    return;
  }
  const hashedPassword = await genPassword(password);
  const result = await createUser(username, hashedPassword);
  res.send(result);
});

//login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  //validation
  const userFromDb = await getUserByName(username);
  console.log(userFromDb);
  if (!userFromDb) {
    res.status(400).send({ message: "Invalid Credentials" });
    return;
  }
  const storedDbPassword = userFromDb.password;
  const isPasswordMatch = await bcrypt.compare(password, storedDbPassword);
  if (!isPasswordMatch) {
    res.status(400).send({ message: "Invalid Credentials" });
    return;
  }

  const token = jwt.sign({ id: userFromDb._id }, process.env.SECRET_KEY);

  res.send({ message: "Successfully logged In", token: token });
});

export const usersRouter = router;

//Validate if username already present
//Validate if password matches
