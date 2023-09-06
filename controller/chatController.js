const userModel = require("../models/userSchema");
const messageModel = require("../models/messageSchema");
const chatModel = require("../models/chatSchema");
const ChatModel = require("../models/chatSchema");

const addMessage = async (req, res) => {
  try {
    const { message, clubId } = req.body;
    const userId = req.user._id;

    const ischat = await chatModel.findOne({ club: clubId });
      const newMessage = new messageModel({
        sender: userId,
        message: message,
        chat: ischat._id,
      });
      
      await newMessage.save();
      // Manually populate the 'sender' field before saving
      await newMessage.populate('sender');
      
      await newMessage.save();
      res.status(200).json({ msg: newMessage, chatId: ischat._id });
    // }
    // chat.messages[chat.messages.length-1]
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMsg: "Server error" });
  }
};

const getMessage = async (req, res) => {
  try {
    const clubId = req.body.clubId;
    const page = req.body.page ? req.body.page : 0
    const userId = req.user._id;
    const chat = await ChatModel.findOne({ club: clubId }).populate(
      "latestMessage"
    );
    if(chat){
    const messages = await messageModel.find({chat:chat?._id}).skip(page * 20).limit(20).populate('sender')
    res.status(200).json({ msg: messages, chat: chat, chatId: chat._id });
  }else{
    const newChat = await chatModel.create({
      club: clubId,
    });
    res.status(200).json({ msg: [], chat: newChat, chatId: newChat._id });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMsg: "Server error" });
  }
};

module.exports = {
  addMessage,
  getMessage,
};
