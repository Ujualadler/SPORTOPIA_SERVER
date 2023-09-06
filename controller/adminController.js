const jwt = require("jsonwebtoken");
const authToken = require("../middleware/auth");
const adminModel = require("../models/adminSchema");
const userModel = require("../models/userSchema");
const turfModel = require("../models/turfSchema");
const clubModel = require("../models/clubSchema");
const tournamentModel=require("../models/tournamentSchema");
const bannerModel = require("../models/bannerSchema");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// admin login details

const adminLogin = async (req, res, next) => {
  try {
    let result = {
      Status: false,
      message: null,
      token: null,
    };
    let adminDetails = req.body;
    const admin = await adminModel.findOne({ email: adminDetails.email });
    if (admin) {
      if (admin.password === adminDetails.password) {
        const token = authToken.adminToken(admin);
        result.Status = true;
        result.token = token;
        res.json({ result });
      } else {
        result.message = "Your Password not matched";
        res.json({ result });
      }
    } else {
      result.message = "Your email is wrong";
      res.json({ result });
    }
  } catch (error) {
    console.log(error);
  }
};

// listing user on admin side

const userList = async (req, res) => {
  try {
    const user = await userModel.find({});
    res.json({ status: "success", result: user });
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

// blocking user

const userBlock = async (req, res) => {
  try {
    const id = req.query.id;
    let data = await userModel.findOne({ _id: id });
    if (data.isBlocked === true) {
      await userModel.updateOne({ _id: id }, { $set: { isBlocked: false } });
    } else {
      await userModel.updateOne({ _id: id }, { $set: { isBlocked: true } });
    }
    let resend = await userModel.find({});
    res.json({ result: resend, message: "success" });
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

// listing turfs in admin side

const turfList = async (req, res) => {
  try {
    const turf = await turfModel.find({});
    res.json({ status: "success", result: turf });
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

// blocking turfs

const turfBlock = async (req, res) => {
  try {
    const id = req.query.id;
    let data = await turfModel.find({ _id: id });
    if (data[0].isTurfBlocked === true) {
      await turfModel.updateOne(
        { _id: id },
        { $set: { isTurfBlocked: false } }
      );
    } else {
      await turfModel.updateOne({ _id: id }, { $set: { isTurfBlocked: true } });
    }
    let resend = await turfModel.find({});
    res.status(200).json({ result: resend, message: "success" });
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const BannerAdd = async (req, res) => {
  const data = req.body;
  const title = req.body.title;
  const subTitle = req.body.subTitle;
  const file = req.file;
  let img;
  try {
    if (file) {
      const upload = await cloudinary.cloudinary.uploader.upload(file?.path);
      img = upload.secure_url;
      fs.unlinkSync(file.path);

      const newBanner = new bannerModel({
        title,
        subTitle,
        image:img,
      });
      const savedBanner = await newBanner.save();
      res.status(200).json({ status: true, banner: savedBanner });
    }
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const getBanner = async (req, res) => {
  try {
    const data = await bannerModel.find().sort({ _id: -1 });
    res.status(200).json({ banner: data});
  } catch (error) {
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const removeBanner = async (req, res) => {
  const {id } = req.body;

  try {
    const banner = await bannerModel.deleteOne({_id:id});
    if (!banner) {
      return res.status(404).json({ status: false, message: "Club not found" });
    }
    const resend = await bannerModel.find();
    res.status(200).json({
      status: true,
      banner: resend,
      message: "Banner removed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occurred while removing the banner",
    });
  }
};

const allDetails=async(req,res)=>{
  try {
    const users=await userModel.find()
    const turves=await turfModel.find()
    const clubs=await clubModel.find()
    const tournaments=await tournamentModel.find()

    res.status(200).json({
      userCount: users.length,
      turfCount: turves.length,
      clubCount: clubs.length,
      tournamentCount: tournaments.length,
    });
    
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred while getting all details",
    });
  }
}

module.exports = {
  adminLogin,
  userList,
  userBlock,
  turfList,
  turfBlock,
  BannerAdd,
  getBanner,
  removeBanner,
  allDetails
};
