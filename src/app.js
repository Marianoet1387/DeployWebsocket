const express = require('express')
const handlebars = require('express-handlebars')
const {Server} = require("socket.io") 
const viewsRouter = require('./routes/views.router')

const app = express()

// configurar handlebars
app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

// permitir envío de información mediante formularios y JSON
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// setear carpeta public como estática
app.use(express.static(`${__dirname}/../public`))

app.use('/', viewsRouter)


const httpServer = app.listen(8080, () => {
    console.log('Servidor listo!')
})

// Creas un servidor para el protocolo wbSocket: INSTANCIAMOS LA CLASE Y SE LE PASA EL SERVIDOR HTTP
const io = new Server(httpServer)

const messageHistorY = []
// es un evento que permite escuchar las peticiones del cliente:

io.on("connection", (clientSocket) => { 
    console.log(`cliente conectado, ID: ${clientSocket.id}`)

    //Se envian todos los mensajes hasta ese momento 
    for (const data of messageHistorY){
        clientSocket.emit("message", data)
    }
    
    clientSocket.on("message",(data)=>{
        messageHistorY.push(data)
        io.emit("message", data)
    })
    
    clientSocket.on("user-connected",(username) =>{
        // Notificar a los otros usuarios que se conecto un usuario 
        clientSocket.broadcast.emit("user-joined-chat",username)
    })
}) 
