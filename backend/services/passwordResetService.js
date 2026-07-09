const PasswordResetRequest =
require("../models/PasswordResetRequest");

const User = require("../models/User");
const emailService = require("./emailService");

const createRequest = async(userId, reason, newPassword)=>{

    const user = await User.findById(userId);

    if(!user)
        throw new Error("Organizer not found");

    if(!newPassword || newPassword.length < 6)
        throw new Error("Password must be at least 6 characters.");

    const existing =
    await PasswordResetRequest.findOne({

        organizer:userId,

        status:"Pending"

    });

    if(existing)
        throw new Error(
            "A pending request already exists."
        );

    return await PasswordResetRequest.create({

        organizer:userId,

        reason,
        requestedPassword: newPassword

    });

};

const getRequests = async()=>{

    return await PasswordResetRequest.find()

    .populate(
        "organizer",
        "firstName lastName email"
    );

};

const bcrypt = require("bcrypt");

const approveRequest = async(id)=>{

    const request =
    await PasswordResetRequest.findById(id);

    if(!request)
        throw new Error("Request not found");

    const organizer =
    await User.findById(request.organizer);

    if(!organizer)
        throw new Error("Organizer not found");

    organizer.password =
        await bcrypt.hash(request.requestedPassword, 10);

    await organizer.save();

    request.status = "Approved";

    await request.save();

    await emailService.sendPasswordResetApprovedEmail(
        organizer.email,
        `${organizer.firstName} ${organizer.lastName}`,
        request.requestedPassword
    );

    return { request, newPassword: request.requestedPassword };

};

const rejectRequest = async(id)=>{

    const request =
    await PasswordResetRequest.findById(id);

    if(!request)
        throw new Error("Request not found");

    request.status = "Rejected";

    await request.save();

    return request;

};

module.exports={

    createRequest,

    getRequests,

    approveRequest,

    rejectRequest

};