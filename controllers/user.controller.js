const Customer = require("../models/user.model");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const getSignUp = (req, res) => {
    res.render("sign-up");
};

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

const getDashboard = (req, res) => {
    res.render("dashboard");
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
                console.error("MAIL_USER/MAIL_PASS is missing in environment variables.");
                return res.redirect("/user/signin?signup=success&mail=config-missing");
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
            console.log("Login successful for", foundCustomers.email);
            res.redirect("/user/dashboard");
        })
        .catch((err) => {
            console.error("Error during signin:", err);
            res.status(500).send("Internal server error");
        });
};

const getAllUsers = (req, res) => {
    Customer.find()
        .then((allUsers) => {
            console.log("All users:", allUsers);
            res.status(200).json(
                {
                    message: "Registered Users",
                    users: allUsers
                }
            );
        })
        .catch((err) => {
            console.error("Error fetching users:", err);
            res.status(500).send("Internal server error");
        });
};

module.exports = { postSignUp, getSignUp, postSignIn, getSignIn, getDashboard, getAllUsers };
