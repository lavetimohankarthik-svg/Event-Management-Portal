const authService = require("../services/authService");

// Register
const register = async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      ...data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      ...data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(
      req.user._id,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Own Profile
const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  updateProfile,
};