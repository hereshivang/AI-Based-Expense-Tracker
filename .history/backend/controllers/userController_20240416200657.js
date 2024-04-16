// controllers/userController.js

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Expense = require("../models/expense");

// Controller functions
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    user.userId = Date.now();
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("expenses");
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.send(user._doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const expense = new Expense(req.body);

    expense.userId = id;

    await expense.save();

    console.log(expense);

    await user.updateOne({ $push: { expenses: expense._id } });

    res.status(200).json({ expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.setLimit = async (req, res) => {
  const { id } = req.params;
  const { amount, type } = req.body;

  try {
    const user = await User.findById(id);

    if (type === "spent") {
      await user.updateOne({ $set: { spentLimit: amount } });
    } else if (type === "loaned from") {
      await user.updateOne({ $set: { loanedFromLimit: amount } });
    } else {
      await user.updateOne({ $set: { loanedToLimit: amount } });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
};

exports.addMessage = async (req, res) => {
  const { userId } = req.params;
  const { message, id } = req.body;

  try {
    const user = await User.findById(userId);

    await user.updateOne({ $push: { activeNotifications: { message, id } } });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  const { userId } = req.params;
  const { id } = req.query;

  try {
    const user = await User.findById(userId);

    const notifications = user.activeNotifications.filter(
      (item) => item.id !== id
    );

    await user.updateOne({ $set: { activeNotifications: notifications } });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
