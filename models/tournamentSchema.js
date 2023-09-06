  const mongoose = require("mongoose");

  const tournamentSchema = new mongoose.Schema({
    tournamentName: {
      type: String,
      required: true,
    },
    sportsType: {
      type: String,
      required: true,
    },
    startingDate: {
      type: Date,
      required: true,
    },
    startingTime: {
      type: String,
      required: true,
    },
    endingDate: {
      type: Date,
      required: true,
    },
    endingTime: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    detailedDocument: {
      type: String,
      required: true,
    },
    maximumTeams: {
      type: Number,
      required: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    joinedClubs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
      },
    ],
    isCancelled: {
      type: Boolean,
      default: false,
    },
    matches: [
      {
        matchName: {
          type: String,
          required: true,
        },
        teamOne: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Club",
        },
        teamTwo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Club",
        },
        winner: {
          type:String,  
        },
        date: {
          type: Date,
          required: true,
        },
        time: {
          type: String,
          required: true,
        },
        scoreOne: {
          type: String,
        },
        scoreTwo: {
          type: String,
        },
      },
    ],
    winners:[
      {
        first: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Club",
        },
        second: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Club",
        },
      }
    ]
      
    
  });

  const tournamentModel = mongoose.model("Tournament", tournamentSchema);
  module.exports = tournamentModel;
