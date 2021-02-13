var socket = require('socket.io')
var removeSocketUser = require('../controllers/ohealth/users/removeSocket')
var removeSocketDoctor = require('../controllers/odoctor/doctors/removeSocket')
var onlineDoctors = require('../controllers/ohealth/users/onlineDoctors')
var getWalletUser = require('../controllers/ohealth/users/getWallet')
var getWalletDoctor = require('../controllers/odoctor/doctors/getWallet')
openSocket = async (server) => {

	let io = socket(server)
	io.on('connection', socket => {
		socket.on('disconnect', async () => {
			removeSocketUser(socket.id)
			var doctorRemove = await removeSocketDoctor(socket.id)
			// console.log(doctorRemove)
			if (doctorRemove) {
				// console.log('doctor refresh')
				io.sockets.emit('refresh_online_doctors')
			}
			console.log(socket.id + ' is disconnected')
		})

		socket.on('refresh_online_doctors', () => {
			socket.broadcast.emit('refresh_online_doctors')
		})


		socket.on('joinChat', appointmentID => {
			console.log('joined room: ', appointmentID)
			socket.join(appointmentID);
		})

		socket.on('leaveChat', appointmentID => {
			socket.leave(appointmentID);
		})

		socket.on('refreshChat', appointmentID => {
			socket.to(appointmentID).broadcast.emit('refreshChat')
		})

		socket.on('onJoin', appointmentID => {
			socket.to(appointmentID).broadcast.emit('joinedChat')
		})

		socket.on('startVideo', (appointment) => {
			// console.log(appointment)
			// socket.broadcast.emit('incomingVideo', appointment)
			// socket.to(appointmentID).broadcast.emit('incomingVideo', (doctorID, appointmentID))
		})

		socket.on('startAudio', (appointment) => {
			// console.log(appointment)
			// socket.broadcast.emit('incomingAudio', appointment)
			// socket.to(appointmentID).broadcast.emit('incomingVideo', (doctorID, appointmentID))
		})

		socket.on('updateWallet', async () => {
			try {
				let wallet
				wallet = await getWalletUser(socket.id)
				if (wallet) {
					return socket.emit('updateWallet', wallet)
				}
				else {
					wallet = await getWalletDoctor(socket.id)
					if (wallet) {
						return socket.emit('updateWallet', wallet)
					}
				}

				return false
			}
			catch (e) {
				console.log(e)
				return false
			}

		})




		/********************************** Video call Start **********************/
		// console.log("A connection has been established", socket.id)

		// socket.on('addIce', data => {

		// 	socket.broadcast.emit('sendIce', data)
		// 	console.log('sendIce')
		// })


		// socket.on('localDescription', data => {

		// 	socket.broadcast.emit('localDescription', data)
		// 	console.log('localDes')
		// })

		/////////////////////////////// Video call End ////////////////////////////////////////


	})

}

module.exports = { openSocket }