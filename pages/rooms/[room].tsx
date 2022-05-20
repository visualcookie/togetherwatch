import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import YouTube, { YouTubeProps } from 'react-youtube'
import { io, Socket } from 'socket.io-client'
import Navbar from '../../components/Navbar'
import events from '../../constants/events'
import getYoutubeIdByUrl from '../../libs/getYouTubeIdByUrl'

interface VideoData {
  url: string
  currentTime: string
}

const RoomPage: NextPage = () => {
  const [socketClient, setSocketClient] = useState<Socket | null>(null)
  const [videoPlayer, setVideoPlayer] = useState<any>(null)

  const router = useRouter()

  const playerOptions: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  }

  useEffect(() => {
    if (router.isReady && videoPlayer) {
      const socket = io('http://localhost:5000')
      setSocketClient(socket)

      socket.on('connect', () => {
        socket.emit(events.JOIN_ROOM, router.query.room as string)
        socket.emit(events.RECEIVE_VIDEO_INFORMATION)
      })

      socket.on(events.ADD_NEW_VIDEO, (videoId: string) => {
        videoPlayer.loadVideoById({ videoId })
      })

      socket.on(events.PLAY_VIDEO, () => videoPlayer.playVideo())

      socket.on(events.PAUSE_VIDEO, () => videoPlayer.pauseVideo())

      socket.on(events.RECEIVE_VIDEO_INFORMATION, () => {
        const videoData: VideoData = {
          url: videoPlayer.getVideoUrl(),
          currentTime: videoPlayer.getCurrentTime(),
        }

        socket.emit(events.SYNC_VIDEO, videoData)
      })

      socket.on(events.SYNC_VIDEO, (data: VideoData) => {
        videoPlayer.loadVideoById({ videoId: getYoutubeIdByUrl(data.url), startSeconds: data.currentTime })
      })
    }
  }, [router.isReady, videoPlayer])

  const onPlayerReady = (event: any) => {
    setVideoPlayer(event.target)
    event.target.pauseVideo()
  }

  const onPauseVideo = () => socketClient?.emit(events.PAUSE_VIDEO)
  const onPlayVideo = () => socketClient?.emit(events.PLAY_VIDEO)

  return (
    <>
      <Navbar socketClient={socketClient} />

      <main className="flex justify-center my-20">
        <YouTube
          className="w-8/12"
          iframeClassName="w-full h-full aspect-[16/9]"
          videoId="xcJtL7QggTI"
          opts={playerOptions}
          onReady={onPlayerReady}
          onPlay={onPlayVideo}
          onPause={onPauseVideo}
        />
      </main>
    </>
  )
}

export default RoomPage
