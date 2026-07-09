const Registration = require("../models/Registration");

const getAttendance = async (eventId) => {

    const registrations = await Registration.find({

        event: eventId

    }).populate(
        "participant",
        "firstName lastName email"
    );

    const present = registrations.filter(
        r => r.checkedIn
    ).length;

    const absent = registrations.length - present;

    return {

        totalRegistrations: registrations.length,

        present,

        absent,

        registrations

    };

};

const manualCheckIn = async (registrationId) => {

    const registration =
        await Registration.findById(registrationId);

    if (!registration)
        throw new Error("Registration not found");

    registration.checkedIn = true;

    await registration.save();

    return registration;

};

module.exports = {
    getAttendance,
    manualCheckIn
};