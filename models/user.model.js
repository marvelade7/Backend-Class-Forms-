const mongoose = require("mongoose");

let customerSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: [true, "Email has been taken, please choose another one"],
    },
    password: { type: String, required: true },
});

const Customer = mongoose.model("user", customerSchema);
module.exports = Customer;
