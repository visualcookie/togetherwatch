import express, { Express } from 'express'
import { Server as HTTPServer } from 'http'
import { Server as SocketServer, Socket } from 'socket.io'
import events from '../constants/events'

const app: Express = express()
const server: HTTPServer = new HTTPServer(app)
const io: SocketServer = new SocketServer(server)
const PORT: number = parseInt(process.env.PORT || '5000', 10)
const ISDEV: boolean = process.env.NODE_ENV !== 'production'

let currentRoom: any
io.on('connection', (socket: Socket) => {
  socket.on(events.JOIN_ROOM, (room: string) => {
    socket.join(room)
    currentRoom = room
  })

  socket.on(events.ADD_NEW_VIDEO, (video: string) => {
    io.to(currentRoom).emit(events.ADD_NEW_VIDEO, video)
  })

  socket.on(events.PLAY_VIDEO, () => {
    socket.to(currentRoom).emit(events.PLAY_VIDEO)
  })

  socket.on(events.PAUSE_VIDEO, () => {
    socket.to(currentRoom).emit(events.PAUSE_VIDEO)
  })

  socket.on(events.RECEIVE_VIDEO_INFORMATION, () => {
    socket.to(currentRoom).emit(events.RECEIVE_VIDEO_INFORMATION)
  })

  socket.on(events.SYNC_VIDEO, (data: any) => {
    io.to(currentRoom).emit(events.SYNC_VIDEO, data)
  })
})

server.listen(PORT, () => {
  console.log(`> Server listening at http://localhost:${PORT} as ${ISDEV ? 'development' : process.env.NODE_ENV}`)
})
