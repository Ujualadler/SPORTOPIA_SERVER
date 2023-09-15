const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authToken = require("../middleware/auth");
const turfModel = require("../models/turfAdminSchema");
const usercontroller = require("../controller/userController");
const turfAdminModel = require("../models/turfAdminSchema");

// turf admin registration

const signUp = async (req, res, next) => {
  try {
    let turfdetails = req.body;
    const turfadmin = await turfModel.find({ email: turfdetails.email });
    if (turfadmin.length === 0) {
      turfdetails.password = await bcrypt.hash(turfdetails.password, 10);
      turfModel
        .create({
          name: turfdetails.name,
          email: turfdetails.email,
          password: turfdetails.password,
          contactNumber: turfdetails.phone,
        })
        .then((data) => {
          // console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
      let turfdetail = await turfModel.findOne({ email: turfdetails.email });
    
      res.json({ status: true, result: turfdetails });
      if(turfdetail){
        usercontroller.sendVerifyMail(
          turfdetails.name,
          turfdetails.email,
          turfdetail._id,
          false
        );
        }
  
    
    } else {
      return res.json({ error: "User already exists" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// verifying turfAdmin

const verifyTurf = async (req, res) => {
  try {
    let id = req.body.user_id;
    const updateInfo = await turfAdminModel.updateOne(
      { _id: id },
      { $set: { isVerified: 1 } }
    );
    res.json({ status: true });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// turf admin login details

const login = async (req, res, next) => {
  let turfSignUp = {
    Status: false,
    message: null,
    token: null,
    name: null,
  };
  try {
    const turfdetails = req.body;
    const findTurfAdmin = await turfModel.findOne({ email: turfdetails.email });
    if (findTurfAdmin) {
      if (findTurfAdmin.isVerified === 1) {
        const isMatch = await bcrypt.compare(
          turfdetails.password,
          findTurfAdmin.password
        );
        if (isMatch === true) {
          const token = authToken.turfAdminToken(findTurfAdmin);
          const name = findTurfAdmin.name;
          turfSignUp.message = "You are logged";
          turfSignUp.Status = true;
          turfSignUp.token = token;
          turfSignUp.name = findTurfAdmin.name;

          const obj = {
            token,
            name,
          };

          res
            .cookie("jwt", obj, {
              httpOnly: false,
              maxAge: 6000 * 1000,
            })
            .status(200)
            .send({ turfSignUp });
        } else {
          turfSignUp.message = "Wrong Password";
          turfSignUp.Status = false;
          res.json({ turfSignUp });
        }
      } else {
        turfSignUp.message = "Verify your email first";
        turfSignUp.Status = false;
        res.json({ turfSignUp });
      }
    } else {
      turfSignUp.message = " Wrong Email";
      turfSignUp.Status = false;
      res.json({ turfSignUp });
    }
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

const googlelogin = async (req, res, next) => {
  try {
    const payload = req.body;
    const user = await turfModel.findOne({ email: payload.email });
    let userSignUp = {
      Status: false,
      message: null,
      token: null,
      name: null,
    };
    if (user) {
      if (user.isVerified === 1) {
        if (user.isBlocked === false) {
          const token = authToken.turfAdminToken(user);
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
    res.status(500).json({ error:err.message });
  }
};

const otpLogin = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await turfAdminModel.findOne({ contactNumber: phone });
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

const turfProfile = async (req, res, next) => {
  try {
	  const id = req.user._id;
	  let userDetails = await turfModel.findOne({ _id: id});
	  if (userDetails) {
		res.status(200).json({ data: userDetails });
	  } else {
		res.status(500).send({ error: "no user" });
	  }
	} catch (error) {
	  res.json({ status: "failed", message: error.message });
	}
  };

  const getAdminDetail = async (req, res) => {
    try {
      const user = req.user;
      const userdata = await turfModel.findOne({ _id: user._id });
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
      await turfModel.updateOne(
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


module.exports = {
  signUp,
  login,
  verifyTurf,
  googlelogin,
  turfProfile,
  getAdminDetail,
  editProfile,
  otpLogin
};
