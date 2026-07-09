const adminService = require("../services/adminService");

const createOrganizer = async (req, res) => {
    try {
        const result = await adminService.createOrganizer(req.body);

        res.status(201).json({
            success: true,
            message: "Organizer Created Successfully",
            organizer: result.organizer,

            temporaryPassword:
                result.temporaryPassword,
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllOrganizers = async (req, res) => {
    try {
        const organizers = await adminService.getAllOrganizers();

        res.status(200).json({
            success: true,
            organizers,
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteOrganizer = async (req, res) => {
    try {
        await adminService.deleteOrganizer(req.params.id);

        res.status(200).json({
            success: true,
            message: "Organizer Disabled Successfully",
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const enableOrganizer = async (req, res) => {
    try {
        await adminService.enableOrganizer(req.params.id);

        res.status(200).json({
            success: true,
            message: "Organizer Enabled Successfully",
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createOrganizer,
    getAllOrganizers,
    deleteOrganizer,
    enableOrganizer,
};