// console.log('Hello, World!');
const express = require('express')
const app = express()

const userRoute = require('./routes/user.route')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const URI = process.env.MONGODB_URI

const cors = require('cors')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose.connect(URI) 
.then(() => {
    console.log('Connected to mongoose');
})
.catch((err) => {
    console.log('Error connecting to MongoDB', err);
})
// const users = []
// let customerSchema = mongoose.Schema({
//     firstName: {type: String, required: true},
//     lastName: {type: String, required: true},
//     email: {type: String, required: true, unique: [true, "Email has been taken, please choose another one"]},
//     password: {type: String, required: true}
// })



const PORT = process.env.PORT
app.set('view engine', 'ejs')
// console.log(PORT)


// app.get('/', (req, res) => {
//     res.render('sign-up.ejs')
// })

// app.get('/')

// app.get('/sign-in', (req, res) => {
//     res.render('sign-in.ejs')
// })

// app.post('/register')

// app.post('/register', (req, res) => {
//     const user = req.body
//     // users.push(user)
//     // console.log(users)
//     // res.send('You have registered successfully')

//     const newCustomer = new Customer(user)

//     newCustomer.save(user)
//     .then((user) => {
//         console.log('Customer saved successfully', user);
//         res.send('You have registered successfully')
//     })
//     .catch((err) => {
//         console.log('Error saving to DB', err);
//         res.status(500).send("Error: " + err.message)
//     })    
// })
app.use('/user', userRoute)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
