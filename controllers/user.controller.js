const Customer = require("../models/user.model");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
jwtSecret = process.env.JWT_SECRET;

// const cloudinary = require('cloudinary').v2;
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

// const mutler = require("multer")
// const upload = mutler({ dest: "uploads/" });

const getSignUp = (req, res) => {
    res.render("sign-up");
};

// const getDashboard = (req, res) => {
//     res.render("dashboard");
// };

const getSignIn = (req, res) => {
    const { signup, mail } = req.query;

    let alert = "";
    if (signup === "success" && mail === "sent") {
        alert = "Signup successful. Welcome email sent.";
    } else if (signup === "success" && mail === "failed") {
        alert = "Signup successful, but welcome email failed to send.";
    } else if (signup === "success" && mail === "config-missing") {
        alert = "Signup successful, but email configuration is missing.";
    }

    res.render("sign-in", { alert });
};

const postSignUp = async (req, res) => {
    let salt = bcrypt.genSaltSync(10);
    let hashedPassword = bcrypt.hashSync(req.body.password, salt);

    req.body.password = hashedPassword;

    const existingUser = await Customer.findOne({ email: req.body.email });

    if (existingUser) {
        return res.status(400).send("User with this email already exists.");
    }

    const user = req.body;
    const newCustomer = new Customer(user);

    newCustomer
        .save()
        .then(async (user) => {
            console.log("Customer saved:", user);
            const mailUser = process.env.MAIL_USER;
            const mailPass = process.env.MAIL_PASS;

            if (!mailUser || !mailPass) {
                console.error(
                    "MAIL_USER/MAIL_PASS is missing in environment variables.",
                );
                return res.redirect(
                    "/user/signin?signup=success&mail=config-missing",
                );
            }

            // Transpoter means the information about the service you are using to send the email
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: mailUser,
                    // a special password generated for google settings not your own password
                    // Step One: Enable 2 step verification
                    // Step Two: Generate app password
                    pass: mailPass,
                },
            });

            let mailOptions = {
                from: mailUser,
                to: [user.email, "marvellousadewuyi72@gmail.com"],
                subject: "Welcome to our Application",
                html: `
                        <div style="background-color: #f4f4f4; padding: 0 0 10px; border-radius: 30px 30px 0 0  ;">
                            <div style="padding-top: 20px; height: 100px; border-radius: 30px 30px 0 0 ; background: linear-gradient(-45deg, #f89b29 0%, #ff0f7b 100% );">
                                <h1 style="color:white; text-align: center;">Welcome to our Application</h1>
                            </div>
                            <div style="padding: 30px 0; text-align: center;">
                                <p style="font-size: 18px;"><span style="font-weight: 600;">Congratulations!</span> Your sign-up was successful!</p>
                                <p>Thank you for registering. We are excited to have you on board.</p>
                                <div style="padding: 20px 0;">
                                    <hr style="width: 50%;">
                                    <p style="margin-bottom: 10px;">Best Regards</p>
                                    <p style="color: #f89b29; margin-top: 0;">Dan Star</p>
                                </div>
                            </div>
                        </div>
                `,
            };
            // This is what will actually send the email
            try {
                const info = await transporter.sendMail(mailOptions);
                console.log("Email sent: " + info.response);
                console.log("Accepted recipients:", info.accepted);
            } catch (error) {
                console.error("Failed to send email:", error.message);
                return res.redirect("/user/signin?signup=success&mail=failed");
            }

            res.redirect("/user/signin?signup=success&mail=sent");
        })
        .catch((err) => {
            console.error("Error saving to DB:", err);
            res.status(500).send("Error: " + err.message);
        });
};

const postSignIn = (req, res) => {
    const { email, password } = req.body;

    Customer.findOne({ email })
        .then((foundCustomers) => {
            if (!foundCustomers) {
                console.log("Invalid email");
                return res
                    .status(400)
                    .json({ message: "Invalid email or password" });
            }

            const isMatch = bcrypt.compareSync(
                password,
                foundCustomers.password,
            );

            if (!isMatch) {
                console.log("Invalid Password");
                return res
                    .status(400)
                    .json({ message: "Invalid email or password" });
            }
            const token = jwt.sign({ email: req.body.email }, jwtSecret, {
                expiresIn: "1h",
            });
            console.log("Generated Token:", token);
            console.log("Login successful for", foundCustomers.email);
            // res.redirect("/user/dashboard");
            res.json({
                message: "Login successful",
                user: {
                    id: foundCustomers._id,
                    firstName: foundCustomers.firstName,
                    lastName: foundCustomers.lastName,
                    email: foundCustomers.email,
                    token,
                },
                
            });
        })
        .catch((err) => {
            console.error("Error during signin:", err);
            res.status(500).send("Internal server error");
        });
};

const getDashboard = (req, res) => {
    let token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res
                .status(401)
                .json({ message: "Invalid or expired token" });
        } else {
            console.log("Decoded token data:", decoded);
            let userEmail = decoded.email;

            Customer.findOne({ email: userEmail })
                .then((user) => {
                    if (!user) {
                        return res
                            .status(404)
                            .json({ message: "User not found" });
                    }
                    console.log("User found:", user);
                    res.json({
                        message: "Dashboard accessed successfully",
                        user: { email: user.email, firstName: user.firstName },
                    });
                })
                .catch((err) => {
                    console.error("Error fetching user:", err);
                    res.status(500).json({ message: "Internal server error" });
                });
        }
    });
};

const getAllUsers = (req, res) => {
    Customer.find()
        .then((allUsers) => {
            console.log("All users:", allUsers);
            res.status(200).json({
                message: "Registered Users",
                users: allUsers,
            });
        })
        .catch((err) => {
            console.error("Error fetching users:", err);
            res.status(500).send("Internal server error");
        });
};

const deleteUser = (req, res) => {
    Customer.findByIdAndDelete(req.params.id)
        .then((deletedUser) => {
            if (!deletedUser) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            res.status(200).json({
                message: "User deleted successfully",
                deletedUser,
            });
        })
        .catch((error) => {
            res.status(500).json({
                error: error.message,
            });
        });
};

const updateUser = (req, res) => {
    Customer.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            res.status(200).json({
                message: "User updated",
                updatedUser,
            });
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
};

const upload = (req, res) => {};

module.exports = {
    postSignUp,
    getSignUp,
    postSignIn,
    getSignIn,
    // getDashboard,
    getAllUsers,
    deleteUser,
    updateUser,
    getDashboard,
};
