var express = require('express')
var app = express()
var cookieParser = require('cookie-parser')
BodyParser = require('body-parser')
var bodyParser = BodyParser.json({ limit: '50mb' })
var bodyParser2 = BodyParser.urlencoded({ extended: true })
const mongoose = require('mongoose')
const cors = require('cors')

const socket = require('./socket/sockets')
app.set('view engine', 'ejs');
// app.set('view engine', 'pug');
// mongoose.connect('mongodb://localhost/ohealth', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })




mongoose.Promise = global.Promise

// //Step 1
// const Core = require('@alicloud/pop-core');

// //Step 2
// var client = new Core({
//     accessKeyId: 'LTAI4G3RfjtQDoRpyYjsZxrg',
//     accessKeySecret: 'EzzUWPDeGGnagHb5HcB3RIC6CTXSlK',
//     endpoint: 'https://sms-intl.ap-southeast-1.aliyuncs.com',
//     apiVersion: '2018-05-01'
// });

// //Step 3
// var params = {
//     "RegionId": "ap-southeast-1",
//     "To": "+2349038996420",
//     "TemplateCode": "983741",
//     "From": "OHEAlTH",
//     "TemplateParam": "the name", //Optional
// }

// var requestOption = {
//     method: 'POST'
// };

// //Step 4
// client.request('SendMessageWithTemplate', params, requestOption).then((result) => {
//     console.log(result);
// }, (ex) => {
//     console.log(ex);
// })


app.use(bodyParser)
app.use( BodyParser.json({limit: '50mb'}) );
app.use(BodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit:50000
}));
app.use(bodyParser2)

app.use(cookieParser('Lekxel4real@$%', {
    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: true // Indicates if the cookie should be signed
}))

const session = require('express-session');

var redis = require("redis");
var redisStore = require('connect-redis')(session);

// var redisClient = redis.createClient();
app.use(session({
    secret: 'Lekxel4real@$%',
    cookie: { maxAge: 999*9999*9999*9999*99998*9999  },
    // store: new redisStore({ host: 'localhost', port: 7000, client: redisClient }),
}));

app.use(cors())
app.use(express.static(__dirname)) //make public folder accessible publicly

/////////////// oDoctor /////////////////
app.use('/odoctor/register', require('./controllers/odoctor/auth/register'))
app.use('/odoctor/login', require('./controllers/odoctor/auth/login'))
app.use('/odoctor/recover', require('./controllers/odoctor/auth/recover'))
app.use('/odoctor/editProfile', require('./controllers/odoctor/doctors/setProfile'))
app.use('/odoctor/uploadPhoto', require('./controllers/odoctor/doctors/uploadPhoto'))
app.use('/odoctor/setSocket', require('./controllers/odoctor/doctors/setSocket'))
app.use('/odoctor/fetchAppointments', require('./controllers/odoctor/doctors/fetchAppointments'))
app.use('/odoctor/acceptChat', require('./controllers/odoctor/doctors/acceptChat'))
app.use('/odoctor/fetchChats', require('./controllers/odoctor/doctors/fetchChats'))
app.use('/odoctor/sendMessage', require('./controllers/odoctor/doctors/sendMessage'))
app.use('/odoctor/cancelAppointment', require('./controllers/odoctor/doctors/cancelAppointment'))
app.use('/odoctor/endAppointment', require('./controllers/odoctor/doctors/endAppointment'))
app.use('/odoctor/getAppointment', require('./controllers/odoctor/doctors/getAppointment'))
app.use('/odoctor/fetchTransactions', require('./controllers/odoctor/doctors/fetchTransactions'))
app.use('/odoctor/addTransaction', require('./controllers/odoctor/doctors/addTransaction'))
app.use('/odoctor/makeTransfer', require('./controllers/odoctor/doctors/makeTransfer'))
app.use('/odoctor/getEMR', require('./controllers/odoctor/doctors/getEMR'))
app.use('/odoctor/addEMR', require('./controllers/odoctor/doctors/addEMR'))
app.use('/odoctor/getNotification', require('./controllers/odoctor/doctors/getNotification'))
app.use('/odoctor/getNotifications', require('./controllers/odoctor/doctors/getNotifications'))
app.use('/odoctor/deleteNotification', require('./controllers/odoctor/doctors/deleteNotification'))
app.use('/odoctor/setAvailability', require('./controllers/odoctor/doctors/setAvailability'))
app.use('/odoctor/deleteAppointment', require('./controllers/odoctor/doctors/deleteAppointment'))
app.use('/odoctor/clearAppointments', require('./controllers/odoctor/doctors/clearAppointments'))
    // app.use('/odoctor/re', require('./controllers/odoctor/doctors/removeSocket'))


///////////////// oHealth /////////////////////////////
// app.use('/', require('./controllers/ohealth/home/front'))
app.use('/ohealth/register', require('./controllers/ohealth/auth/register'))
app.use('/ohealth/login', require('./controllers/ohealth/auth/login'))
app.use('/ohealth/recover', require('./controllers/ohealth/auth/recover'))
app.use('/ohealth/editProfile', require('./controllers/ohealth/users/setProfile'))
app.use('/ohealth/uploadPhoto', require('./controllers/ohealth/users/uploadPhoto'))
app.use('/ohealth/setSocket', require('./controllers/ohealth/users/setSocket'))
app.use('/ohealth/fetchOnlineDoctors', require('./controllers/ohealth/users/fetchOnlineDoctors'))
app.use('/ohealth/addAppointment', require('./controllers/ohealth/users/addAppointment'))
app.use('/ohealth/fetchAppointments', require('./controllers/ohealth/users/fetchAppointments'))
app.use('/ohealth/fetchChats', require('./controllers/ohealth/users/fetchChats'))
app.use('/ohealth/sendMessage', require('./controllers/ohealth/users/sendMessage'))
app.use('/ohealth/addBeneficiary', require('./controllers/ohealth/users/addBeneficiary'))
app.use('/ohealth/endAppointment', require('./controllers/ohealth/users/endAppointment'))
app.use('/ohealth/getAppointment', require('./controllers/ohealth/users/getAppointment'))
app.use('/ohealth/getSettings', require('./controllers/ohealth/users/getSettings'))
app.use('/ohealth/fundUser', require('./controllers/ohealth/users/fundUser'))
app.use('/ohealth/deleteAppointment', require('./controllers/ohealth/users/deleteAppointment'))
app.use('/ohealth/clearAppointments', require('./controllers/ohealth/users/clearAppointments'))
app.use('/ohealth/bookAppointment', require('./controllers/ohealth/users/bookAppointment'))
app.use('/ohealth/textAppointmentCheck', require('./controllers/ohealth/users/textAppointmentCheck'))
app.use('/ohealth/getNotification', require('./controllers/ohealth/users/getNotification'))
app.use('/ohealth/getNotifications', require('./controllers/ohealth/users/getNotifications'))
app.use('/ohealth/deleteNotification', require('./controllers/ohealth/users/deleteNotification'))
app.use('/ohealth/confirmBankTransfer', require('./controllers/ohealth/users/confirmBankTransfer'))

// app.use('/ohealth/getUser', require('./controllers/ohealth/users/getUser'))

//////////////////////////// Admin Panel ////////////////////////////////////////////////

app.use('/admin/register', require('./controllers/admin/register'))
app.use('/admin/login', require('./controllers/admin/login'))
app.use('/admin/dashboard', require('./controllers/admin/dashboard'))
app.use('/admin/manageDoctors', require('./controllers/admin/doctors'))
app.use('/admin/manageUsers', require('./controllers/admin/users'))
app.use('/admin/managePrices', require('./controllers/admin/prices'))
app.use('/admin/doctor', require('./controllers/admin/doctor'))
app.use('/admin/user', require('./controllers/admin/user'))
app.use('/admin/manageAdmins', require('./controllers/admin/admins'))
app.use('/admin/admin', require('./controllers/admin/admin'))
app.use('/admin/fundUser', require('./controllers/admin/fundUser'))
app.use('/admin/messageUser', require('./controllers/admin/messageUser'))
app.use('/admin/messageDoctor', require('./controllers/admin/messageDoctor'))
app.use('/admin/confirmBankTransfers', require('./controllers/admin/confirmBankTransfers'))
app.use('/admin/laboratories', require('./controllers/admin/laboratories'))
app.use('/admin/laboratory', require('./controllers/admin/laboratory'))


app.use('/ohealth/fetchDuplicates', require('./controllers/ohealth/fetchDuplicates'))
app.use('/ohealth/editDuplicates', require('./controllers/ohealth/editDuplicates'))


////////////////////////////////////////////////////////////
// all services display
app.use('/', require('./controllers/allservices/frontpage'))


//  lab services
app.use('/laboratory/login', require('./controllers/laboratory/auth/login'))
app.use('/laboratory/register', require('./controllers/laboratory/auth/register'))
app.use('/laboratory/recover', require('./controllers/laboratory/auth/recover'))
app.use('/laboratory/dashboard', require('./controllers/laboratory/dashboard'))
app.use('/laboratory/profile', require('./controllers/laboratory/profile'))
app.use('/laboratory/editprofile', require('./controllers/laboratory/editprofile'))
app.use('/laboratory/fetchlab', require('./controllers/laboratory/user/fetchlab'))
app.use('/laboratory/booklab', require('./controllers/laboratory/user/booklab'))
app.use('/laboratory/testStatus', require('./controllers/laboratory/user/testStatus'))
app.use('/laboratory/addTransaction', require('./controllers/laboratory/owner/addTransaction'))

app.use('*', express.Router().all('/', function(request, response, next) {
    return response.render('index', { pagetitle: '404 Error' })
}))


var server = app.listen(process.env.PORT || 7000, function() {
        console.log('Server is Online')
    })
    // Call the Socket
socket.openSocket(server)
