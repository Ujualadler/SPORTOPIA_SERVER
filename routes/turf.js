const express= require('express')
const router=express.Router()
const turfAdminController=require('../controller/turfAdminController')
const bookingController=require('../controller/bookingController')
const turfController=require('../controller/turfController')
const auth=require("../middleware/auth")

router.post('/signup',turfAdminController.signUp)
router.post('/verifyTurf',turfAdminController.verifyTurf)
router.get('/profile',auth.verifyToken,turfAdminController.turfProfile)
router.post('/login',turfAdminController.login)
router.post('/otpLogin',turfAdminController.otpLogin)
router.post('/googlelogin',turfAdminController.googlelogin)
router.post('/registration',auth.verifyToken,turfController.turfRegistration)
router.get('/getTurfsAdmin',auth.verifyToken,turfController.getTurfsAdmin)
router.get('/getTurfDetail',auth.verifyToken,turfController.getTurfDetail)
router.post('/turfEdit',auth.verifyToken,turfController.editTurf)
router.get('/turfBookingHistory',auth.verifyToken,bookingController.turfBookingHistory)
router.get('/getAdminDetail',auth.verifyToken,turfAdminController.getAdminDetail)
router.post('/turfEditProfile',auth.verifyToken,turfAdminController.editProfile)




module.exports=router