const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const messageController = require("../controllers/messageController");

router.get("/getAllMessage", catchErrors(messageController.getAllMessage));

module.exports = router;
