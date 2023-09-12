const jwt = require("jsonwebtoken");
const authToken = require("../middleware/auth");
const turfModel = require("../models/turfSchema");
const bookingModel = require("../models/bookingSchema");

// turf registration

const turfRegistration = async (req, res) => {
	try {
		const {
			turfName,
			opening,
			closing,
			advance,
			total,
			phone,
			city,
			state,
			pin,
			street,
			turfType,
			preview,
			photos,
			longitude,
			latitude
		} = req.body;
		console.log(longitude+''+latitude)
		const turf = await turfModel.find({ turfName: turfName });
		const admin = req.user._id;
		if (turf.length === 0) {
			turfModel
				.create({
					turfName,
					opening,
					closing,
					advance,
					total,
					phone,
					city,
					state,
					turfType,
					street,
					pin,
					photos,
					admin:admin,
					logo: preview,
					latitude,
					longitude
				})
				.then((res) => {
					console.log(res);
				})
				.catch((err) => console.log(err));
			res.json({ status: true, message: "Turf successfully registered" });
		} else {
			res.json({ error: "Turf name already taken" });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// getting turf details n user side

const getTurfs = async (req, res) => {
	try {
		const turfs = await turfModel.find({ isTurfBlocked: false });
		res.json({ status: "success", result: turfs });
	} catch (error) {
		res.json({ status: "failed", message: error.message });
	}
};

// getting turfs details in turfadmin side

const getTurfsAdmin = async (req, res) => {
	try {
		const admin = req.user._id;
		const turfs = await turfModel.find({ admin: admin });
		res.json({ status: "success", result: turfs });
	} catch (error) {
		res.json({ status: "failed", message: error.message });
	}
};

// finding individual turfs

const getTurfDetail = async (req, res) => {
	const date = new Date();
	date.setHours(date.getHours() + 5);
	date.setMinutes(date.getMinutes() + 30);
	const dateString = date.toISOString();
	const currentDate = dateString.split("T")[0] + "T00:00:00.000Z";

	try {
		const id = req.query.id;
		const turfData = await turfModel.findOne({ _id: id }).lean();
		const turfBookings = await bookingModel
			.find({
				turf: id,
				bookedDate: { $gte: currentDate },
			})
			.select("bookedSlots bookedDate")
			.lean();
		// append booked dates and slots to turfData
		turfData.turfBookings = turfBookings;

		if (turfData) {
			res.status(200).json({ data: turfData });
		} else {
			res.status(500).send({ error: "no turf" });
		}
	} catch (error) {
		console.log(error)
		res.json({ status: "failed", message: error.message });
	}
};

// editing turf details

const editTurf = async (req, res, next) => {
	const data = req.body;
	const id = req.query.id;
	try {
		await turfModel.updateOne(
			{ _id: id },
			{
				$set: {
					turfName: data.turfName,
					phone: data.phone,
					logo: data.logo,
					city: data.city,
					state: data.state,
					pin: data.pin,
					street: data.street,
					turfType: data.turfType,
					opening: data.opening,
					closing: data.closing,
					advance: data.advance,
					total: data.total,
					photos: data.photos,
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
	turfRegistration,
	getTurfs,
	getTurfsAdmin,
	getTurfDetail,
	editTurf,
};
