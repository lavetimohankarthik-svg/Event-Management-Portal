const User = require("../models/User");

const updateProfile = async(userId,data)=>{

    const organizer =
    await User.findById(userId);

    if(!organizer)
        throw new Error("Organizer not found");

    organizer.organizationName =
        data.organizationName || organizer.organizationName;

    organizer.organizationDescription =
        data.organizationDescription || organizer.organizationDescription;

    organizer.organizationLogo =
        data.organizationLogo || organizer.organizationLogo;

    organizer.website =
        data.website || organizer.website;

    organizer.instagram =
        data.instagram || organizer.instagram;

    organizer.linkedin =
        data.linkedin || organizer.linkedin;

    organizer.contactEmail =
        data.contactEmail || organizer.contactEmail;

    organizer.contactPhone =
        data.contactPhone || organizer.contactPhone;

    organizer.discordWebhook =
        data.discordWebhook !== undefined
            ? data.discordWebhook
            : organizer.discordWebhook;

    await organizer.save();

    return organizer;

};

const getProfile = async(userId)=>{

    return await User.findById(userId)
    .select("-password");

};

const getAllOrganizers = async () => {

    return await User.find({

        role: "organizer",

        isActive: true

    })

    .select(

        "firstName lastName category description profileImage email"

    )

    .sort({

        firstName: 1

    });

};

const Event = require("../models/Event");
const Merchandise = require("../models/Merchandise");

const getOrganizerDetails = async (organizerId) => {

    const organizer = await User.findById(organizerId)
        .select("firstName lastName category description email profileImage");

    if (!organizer)
        throw new Error("Organizer not found");

    const today = new Date();

    const upcomingEvents = await Event.find({

        organizer: organizerId,

        startDate: { $gte: today }

    }).sort({ startDate: 1 });

    const pastEvents = await Event.find({

        organizer: organizerId,

        startDate: { $lt: today }

    }).sort({ startDate: -1 });

    const merchandise = await Merchandise.find({

        organizer: organizerId

    }).sort({ createdAt: -1 });

    return {

        organizer,

        upcomingEvents,

        pastEvents,

        merchandise

    };

};

const followOrganizer = async (userId, organizerId) => {

    const user = await User.findById(userId);

    if (!user)
        throw new Error("User not found");

    if (!user.followedOrganizers.includes(organizerId)) {

        user.followedOrganizers.push(organizerId);

        await user.save();

    }

    return user;

};

const unfollowOrganizer = async (userId, organizerId) => {

    const user = await User.findById(userId);

    if (!user)
        throw new Error("User not found");

    user.followedOrganizers =
    user.followedOrganizers.filter(

        id => id.toString() !== organizerId

    );

    await user.save();

    return user;

};

module.exports={

    updateProfile,
    getProfile,
    getAllOrganizers,
    getOrganizerDetails,
    followOrganizer,
    unfollowOrganizer

};