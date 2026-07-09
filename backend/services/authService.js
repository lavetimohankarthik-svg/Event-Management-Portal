const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// ================= Register =================

const registerUser = async (userData) => {
    const {
        firstName,
        lastName,
        email,
        password,
        participantType,
        collegeName,
        phoneNumber,
    } = userData;

    if (
        participantType === process.env.INSTITUTE_NAME && !email.endsWith(process.env.INSTITUTE_EMAIL_DOMAIN)) {
        throw new Error(
            "Please use your NIT Durgapur email address."
        );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        participantType,
        collegeName,
        phoneNumber,
    });

    const token = generateToken(user._id, user.role);

    return {
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            participantType: user.participantType,
            followedOrganizers: user.followedOrganizers || [],
        },
    };
};

// ================= Login =================

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid Email or Password");
    }
    
    // The admin has disabled this account.
    if (!user.isActive) {

        throw new Error(
            "Your account has been disabled. Please contact the administrator."
        );

    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid Email or Password");
    }

    const token = generateToken(user._id, user.role);

    return {
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            participantType: user.participantType,
            followedOrganizers: user.followedOrganizers || [],
        },
    };
};
// Get Current User 
const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

// Change Password (self-service, section 9.6 Security Settings)
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return true;
};

// Update own profile (Participant Profile page, section 9.6)
const updateProfile = async (userId, data) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const editable = [
        "firstName",
        "lastName",
        "phoneNumber",
        "collegeName",
        "interests",
        "followedOrganizers",
    ];

    editable.forEach((field) => {
        if (data[field] !== undefined) {
            user[field] = data[field];
        }
    });

    await user.save();

    const { password, ...safeUser } = user.toObject();

    return safeUser;
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    changePassword,
    updateProfile,
};