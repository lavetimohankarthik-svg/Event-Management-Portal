const Notification =
require("../models/Notification");

const createNotification = async(userId,data)=>{

    const notification =
    await Notification.create({

        title:data.title,

        message:data.message,

        event:data.event || null,

        sender:userId,

        targetAudience:
            data.targetAudience || "ALL"

    });

    return notification;

};

const getNotifications = async()=>{

    return await Notification.find()

    .populate("sender","firstName lastName")

    .populate("event","eventName");

};

module.exports={

    createNotification,

    getNotifications

};