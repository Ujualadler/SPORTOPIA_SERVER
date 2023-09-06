const reviewModel = require("../models/reviewSchema");
const turfModel = require("../models/turfSchema");
const userModel = require("../models/userSchema");


// add review of a turf

const addReview=async(req,res)=>{
    try {
        const userId=req.user._id
        const data=req.body
        const sameTurf=await reviewModel.findOne({turf:data.turf}).populate('turf')
        if(!sameTurf){
        const saveReview=reviewModel.create({turf:data.turf,user:userId,description:data.reviewText,rating:data.rating})
        res.status(200).json({message:'Review submitted successfully'})
        }else{
            res.json({message:`You already reviewed ${sameTurf.turf.turfName} `})
        }

    } catch (error) {
        res.status(500).json('server error')
    }
}

const getReview=async(req,res)=>{
try {

    const turfId=req.query.id

    const reviews=await reviewModel.find({turf:turfId}).populate('turf').populate('user')

    const rating=reviews.map((doc)=>{
        return(doc.rating)
    }).reduce((a,b)=>{
        return(a+b)
    })
    const totalRating=rating/reviews.length
    res.status(200).json({reviews,totalRating})

} catch (error) {
    res.status(500).json('server error')
}
}
module.exports={
    addReview,
    getReview
}