const userModel = require("../models/userSchema");
const clubModel = require("../models/clubSchema");
const { ObjectId } = require("mongoose").Types;
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const clubModal = require("../models/clubSchema");

const createClub = async (req, res) => {
  try {
    const data = req.body;
    const admin = req.user._id;
    const name = await clubModel.findOne({ clubName: data.clubName });
    if (!name) {
      const club = clubModel.create({
        clubName: data.clubName,
        clubType: data.clubType,
        description: data.description,
        logo: data.logo,
        backgroundImage: data.backgroundImage,
        admin: admin,
      });
      res.status(200).json({ status: "success" });
    } else {
      res
        .status(200)
        .json({ status: "Try another club name this one already taken" });
    }
  } catch (error) {
    res.status(500).json("club creation failed");
  }
};

const getClubs = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await clubModel
      .find({
        $and: [{ "users.user": { $ne: userId } }, { admin: { $ne: userId } }],
      })
      .populate("admin")
      .populate("users.user");

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: "Cannot get club list" });
  }
};

const yourClubs = async (req, res) => {
  try {
    const userId = req.user._id;

    const clubs = await clubModel
      .find({ "users.user": userId })
      .populate("admin")
      .populate("users.user");

    const userStatuses = [];

    for (const club of clubs) {
      for (const user of club.users) {
        const userInClub = club.users.find(
          (user) => user.user._id.toString() === userId
        );
        if (userInClub) {
          userStatuses.push({ clubId: club._id, status: user.status });
        }
      }
    }
    res.status(200).json({ clubs, userStatuses });
  } catch (error) {
    res.status(500).json({ error: "Cannot get club list" });
  }
};

const createdClubs = async (req, res) => {
  try {
    const adminId = req.user._id;
    const result = await clubModel
      .find({ admin: { $eq: adminId } })
      .populate("admin")
      .populate("users.user");
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: "Cannot get club list" });
  }
};

const joinClub = async (req, res) => {
  try {
    const clubId = req.body.id;
    const userId = req.user._id;

    const club = await clubModel.findOne({
      _id: clubId,
      users: { $elemMatch: { user: userId } },
    });
    if (!club) {
      await clubModel.updateOne(
        { _id: clubId },
        { $push: { users: { user: userId, status: "pending" } } }
      );
      res.status(200).json({ message: "Join request sent", status: "pending" });
    } else {
      res.status(200).json({
        message: "Join request sent",
        status: "You already requested",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMsg: "Server Error" });
  }
};

const getMembers = async (req, res) => {
  try {
    const clubId = req.query.id;
    const data = await clubModel
      .findById({ _id: clubId })
      .populate("users.user");
    const pendingUsers = data.users.filter((user) => user.status === "pending");
    if (pendingUsers) {
      res.status(200).json({ user: pendingUsers });
    }
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" });
  }
};

const acceptMember = async (req, res) => {
  try {
    const clubId = req.body.id;
    const userId = req.body.userId;
    const status = req.body.status;

    const club = await clubModel.findOne({
      _id: clubId,
      "users.user": userId,
      "users.status": "pending",
    });

    if (club) {
      if (status === true) {
        await clubModel.updateOne(
          { _id: clubId, "users.user": userId },
          { $set: { "users.$.status": "accepted" } }
        );
        res
          .status(200)
          .json({ message: "Join request accepted", status: "accepted" });
      } else {
        await clubModel.updateOne(
          { _id: clubId },
          { $pull: { users: { user: userId } } }
        );
        res.status(200).json({ status: "Join request rejected" });
      }
    } else {
      res.status(200).json({ message: "Invalid request or user not found" });
    }
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" });
  }
};

const clubMembers = async (req, res) => {
  try {
    const clubId = req.query.id;
    const data = await clubModel
      .findById({ _id: clubId })
      .populate("users.user");
    const acceptedUsers = data.users.filter(
      (user) => user.status === "accepted"
    );
    if (acceptedUsers) {
      res.status(200).json({ user: acceptedUsers });
    }
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" });
  }
};

const removeMember = async (req, res) => {
  try {
    const clubId = req.body.id;
    const userId = req.body.userId;

    const data = await clubModel.updateOne(
      { _id: clubId },
      { $pull: { users: { user: userId } } }
    );
    res.status(200).json({ status: "removed" });
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" });
  }
};

const clubDetails = async (req, res) => {
  try {
    const clubId = req.body.id;
    const result = await clubModel
      .findOne({ _id: clubId })
      .populate("users.user");
    if (result) {
      res.json({ data: result });
    }
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" });
  }
};

const clubGalleryAdd = async (req, res) => {
  const data = req.body;
  const content = req.body.content;
  const clubId = req.body.clubId;
  const file = req.file;
  let img;
  try {
    if (file) {
      const upload = await cloudinary.cloudinary.uploader.upload(file?.path);
      img = upload.secure_url;
      fs.unlinkSync(file.path);

      const galleryItem = {
        image: img,
        content: content,
      };

      const updateClub = await clubModel.findByIdAndUpdate(
        clubId,
        { $push: { gallery: galleryItem } },
        { new: true }
      );
      res.status(200).json({ status: true, gallery: updateClub.gallery });
    }

    console.log(img, file);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMsg: "Server Error" });

  }
};

const getGallery = async (req, res) => {
  try {
    const clubId = req.body.clubId;
    const data = await clubModel.findOne({ _id: clubId }).sort({ _id: -1 });
    res.status(200).json({ gallery: data.gallery});
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" });
  }
};

const removeGallery = async (req, res) => {
  const { clubId, id } = req.body;

  try {
    const club = await clubModal.findByIdAndUpdate(
      clubId,
      { $pull: { gallery: { _id: id } } },
      { new: true }
    );
    if (!club) {
      return res.status(404).json({ status: false, message: "Club not found" });
    }
    const resend = await clubModal.findById({ _id: clubId });
    res.status(200).json({
      status: true,
      gallery: resend.gallery,
      message: "Gallery item removed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occurred while removing the gallery item",
    });
  }
};

const userClubDetails = async (req, res) => {
  try {
    const clubId = req.body.clubId;
    const data = await clubModel.findOne({ _id: clubId }).sort({ _id: -1 });
    res.status(200).json({ gallery: data.gallery });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "An error occurred while getting gallery",
    });
  }
};

module.exports = {
  createClub,
  getClubs,
  joinClub,
  yourClubs,
  createdClubs,
  getMembers,
  acceptMember,
  clubMembers,
  removeMember,
  clubDetails,
  clubGalleryAdd,
  getGallery,
  removeGallery,
  userClubDetails,
};
