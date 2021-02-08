const mongoose = require("mongoose");
const Message = mongoose.model("Message");

exports.getAllMessage = async (req, res) => {
  const message = Message.find({ chatroom });

  res.json({
    message: "Succesfully message"
  })
    
};