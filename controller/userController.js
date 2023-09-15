const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authToken = require("../middleware/auth");
const userModel = require("../models/userSchema");
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth");
const dotenv = require("dotenv").config();

// user email sending

const sendVerifyMail = async (name, email, user_id, check) => {
  try {
    console.log("1")
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "sportopia2000@gmail.com",
        pass: process.env.EMAIL_PASSKEY,
      },
    });
    if (check === true) {
      const mailOption = {
        from: "sportopia2000@gmail.com",
        to: email,
        subject: "To verify your mail",
        html: `<p>Hii ${name}, Please click here to <a href="https://spotopia.site/verify/${user_id}">Verify</a> your mail</p>`,
      };
      transporter.sendMail(mailOption, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email has been sent:-", info.response);
        }
      });
    } else {
      console.log("2")
      const mailOption = {
        from: "sportopia2000@gmail.com",
        to: email,
        subject: "To verify your mail",
        html: `<p>Hii ${name}, Please click here to <a href="https://spotopia.site/turf/verifyTurf/${user_id}">Verify</a> your mail</p>`,
      };
      transporter.sendMail(mailOption, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email has been sent:-", info.response);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// forgotpassword mail

const sendForgotPasswordMail = async (email, name, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "sportopia2000@gmail.com",
        pass: process.env.EMAIL_PASSKEY,
      },
    });

    const mailOption = {
      from: "sportopia2000@gmail.com",
      to: email,
      subject: "Forgott password",
      html: `<p>Hii ${name} please click <a href="https://spotopia.site/resetPassword/${userId}">here</a> if you wan't to reset password your email.</p>`,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log("Email could not be sent", error.message);
      } else {
        console.log("Email has been sent:", info.response);
      }
    });
  } catch (error) {
    console.log(error);
    console.log("Error occurred while sending email");
  }
};

// verifying user email

const verifyMail = async (req, res) => {
  try {
    let id = req.body.user_id;
    const updateInfo = await userModel.updateOne(
      { _id: id },
      { $set: { isVerified: 1 } }
    );
    res.json({ status: true });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// user registration

const signUp = async (req, res, next) => {
  try {
    let userdetails = req.body;
    const user = await userModel.find({ email: userdetails.email });
    if (user.length === 0) {
      userdetails.password = await bcrypt.hash(userdetails.password, 10);
      let userdata = userModel
        .create({
          name: userdetails.name,
          email: userdetails.email,
          password: userdetails.password,
          contactNumber: userdetails.phone,
        })
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
      let userdetail = await userModel.findOne({ email: userdetails.email });
      if (userdetail) {
        sendVerifyMail(
          userdetails.name,
          userdetails.email,
          userdetail._id,
          true
        );
      }
      res.json({
        status: true,
        result: userdetails,
        message: "You are successfully registered please verify your email",
      });
    } else {
      return res.json({ error: "User already exists" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// user login

const login = async (req, res, next) => {
  let userSignUp = {
    Status: false,
    message: null,
    token: null,
    name: null,
  };

  try {
    const userdetails = req.body;
    const findUser = await userModel.findOne({ email: userdetails.email });
    if (findUser) {
      if (findUser.isVerified === 1) {
        if (findUser.isBlocked === false) {
          const isMatch = await bcrypt.compare(
            userdetails.password,
            findUser.password
          );
          if (isMatch === true) {
            const token = authToken.generateAuthToken(findUser);
            const name = findUser.name;
            userSignUp.message = "You are logged";
            userSignUp.Status = true;
            userSignUp.token = token;
            userSignUp.name = findUser.name;

            res.json({ userSignUp, userData: findUser });
          } else {
            userSignUp.message = "Wrong Password";
            userSignUp.Status = false;
            res.json({ userSignUp });
          }
        } else {
          userSignUp.message = "You are blocked by admin";
          userSignUp.Status = false;
          res.json({ userSignUp });
        }
      } else {
        userSignUp.message = "Verify your email first";
        userSignUp.Status = false;
        res.json({ userSignUp });
      }
    } else {
      userSignUp.message = " Wrong Email";
      userSignUp.Status = false;
      res.json({ userSignUp });
    }
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

// forgot password

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (user) {
      sendForgotPasswordMail(email, user.name, user._id);
      res.status(200).json({ message: true });
    } else {
      res.status(400).json({ errMsg: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" });
  }
};

// reset password

const resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    let newPassword = await bcrypt.hash(password, 10);
    await userModel.updateOne(
      { _id: userId },
      { $set: { password: newPassword } }
    );
    res.status(200).json({ message: "Password changed" });
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" });
  }
};

// user otp login

const otpLogin = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await userModel.findOne({ contactNumber: phone });
    if (user) {
      const token = auth.generateAuthToken(user);
      const data = {
        token,
      };
      res.status(200).json({ data });
    } else {
      res.status(404).json({ errMsg: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" });
  }
};

// user google login

const googlelogin = async (req, res, next) => {
  try {
    const payload = req.body;
    const user = await userModel.findOne({ email: payload.email });
    let userSignUp = {
      Status: false,
      message: null,
      token: null,
      name: null,
    };
    if (user) {
      if (user.isVerified === 1) {
        if (user.isBlocked === false) {
          const token = authToken.generateAuthToken(user);
          userSignUp.message = "You are logged";
          userSignUp.Status = true;
          userSignUp.token = token;
          userSignUp.name = user.name;
          res.json({ userSignUp });
        } else {
          userSignUp.message = "You are blocked by admin";
          userSignUp.Status = false;
          res.json({ userSignUp });
        }
      } else {
        userSignUp.message = "Verify your email";
        userSignUp.Status = false;
        res.json({ userSignUp });
      }
    } else {
      userSignUp.message = "You need to register first";
      userSignUp.Status = false;
      res.json({ userSignUp });
    }
  } catch (err) {
    res.status(500).json({ error: error.message });
  }
};

// showing profile user side

const userProfile = async (req, res, next) => {
  try {
    const id = req.user;
    let userDetails = await userModel.findOne({ _id: id._id });
    if (userDetails) {
      res.status(200).json({ data: userDetails });
    } else {
      res.status(500).send({ error: "no user" });
    }
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

// getting user details

const getUserDetail = async (req, res) => {
  try {
    const user = req.user;
    const userdata = await userModel.findOne({ _id: user._id });
    if (userdata) {
      res.status(200).json({ data: userdata });
    } else {
      res.status(500).send({ error: "no user" });
    }
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

// profile editing in user side

const editProfile = async (req, res, next) => {
  const data = req.body;
  const id = req.user._id;
  try {
    await userModel.updateOne(
      { _id: id },
      {
        $set: {
          name: data.name,
          contactNumber: data.contactNumber,
          image: data.image,
          city: data.city,
          state: data.state,
          pin: data.pin,
          street: data.street,
          age: data.age,
        },
      }
    );
    res.json({ status: "success" });
  } catch (error) {
    console.log(error.message);
    res.json({ status: "failed", message: error.message });
  }
};

// add review of a turf

module.exports = {
  signUp,
  login,
  googlelogin,
  sendVerifyMail,
  verifyMail,
  userProfile,
  getUserDetail,
  editProfile,
  otpLogin,
  forgotPassword,
  resetPassword,
};
