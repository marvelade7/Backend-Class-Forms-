const Customer = require("../models/user.model");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const getSignUp = (req, res) => {
    res.render("sign-up");
};

const getSignIn = (req, res) => {
    res.render("sign-in");
};

const getDashboard = (req, res) => {
    res.render("dashboard");
};

const postSignUp = (req, res) => {
    let salt = bcrypt.genSaltSync(10);
    let hashedPassword = bcrypt.hashSync(req.body.password, salt);

    req.body.password = hashedPassword;

    const user = req.body;
    const newCustomer = new Customer(user);

    newCustomer
        .save()
        .then((user) => {
            console.log("Customer saved:", user);
            // Transpoter means the information about the service you are using to send the email
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "",
                    // a special password generated for google settings not your own password
                    // Step One: Enable 2 step verification
                    // Step Two: Generate app password
                    pass: "",
                },
            });

            let mailOptions = {
                from: "marveladeadewuyi@gmail.com",
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
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });

            res.redirect("/user/signin");
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

module.exports = { postSignUp, getSignUp, postSignIn, getSignIn, getDashboard };
