const express= require('express')
const router=express.Router()
const adminController=require('../controller/adminController')
const multer=require("../config/multer")
const upload=multer.createMulter()
const auth=require("../middleware/auth")

router.post('/login',adminController.adminLogin)
router.get('/userlist',auth.verifyAdminToken,adminController.userList)
router.get('/blockUser',auth.verifyAdminToken,adminController.userBlock)
router.get('/turflist',auth.verifyAdminToken,adminController.turfList)
router.get('/blockTurf',auth.verifyAdminToken,adminController.turfBlock)
router.post('/bannerAdd',upload.single('file'),auth.verifyAdminToken,adminController.BannerAdd)
router.get('/getBanner',auth.verifyAdminToken,adminController.getBanner)
router.post('/removeBanner',auth.verifyAdminToken,adminController.removeBanner)
router.get('/allDetails',auth.verifyAdminToken,adminController.allDetails)




module.exports=router