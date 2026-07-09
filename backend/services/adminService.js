const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const emailService = require("./emailService");

const createOrganizer = async (data) => {
    const {
        firstName,
        lastName,
        email,
        phoneNumber,
    } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Organizer already exists");
    }
//Generation of Temp password for the organizer email registration
    const temporaryPassword = crypto
        .randomBytes(6)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 10);

    const hashedPassword = await bcrypt.hash( temporaryPassword, 10);

    const organizer = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "organizer",
        phoneNumber,
        participantType: "External",
        isVerified: true,
    });

    await emailService.sendOrganizerCreatedEmail(
        organizer.email,
        `${organizer.firstName} ${organizer.lastName}`,
        temporaryPassword
    );

    return {organizer , temporaryPassword};
};

const getAllOrganizers = async () => {
    return await User.find({ role: "organizer" }).select("-password");
};

const deleteOrganizer = async (id) => {

    const organizer = await User.findById(id);

    if (!organizer) {
        throw new Error("Organizer not found");
    }

    organizer.isActive = false;

    await organizer.save();

    return organizer;

};

const enableOrganizer = async (id) => {

    const organizer = await User.findById(id);

    if (!organizer) {
        throw new Error("Organizer not found");
    }

    organizer.isActive = true;

    await organizer.save();

    return organizer;

};

module.exports = {
    createOrganizer,
    getAllOrganizers,
    deleteOrganizer,
    enableOrganizer,
};