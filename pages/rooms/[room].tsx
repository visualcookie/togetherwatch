import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import YouTube, { YouTubeProps } from 'react-youtube'
import { io, Socket } from 'socket.io-client'
import events from '../../constants/events'

interface VideoData {
  url: string
  currentTime: string
}

const RoomPage: NextPage = () => {
  const [socketClient, setSocketClient] = useState<Socket | null>(null)
  const [videoPlayer, setVideoPlayer] = useState<any>(null)

  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

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

      socket.on(events.ADD_NEW_VIDEO, ({ videoUrl }) => {
        videoPlayer.loadVideoById({ videoId: getYoutubeIdByUrl(videoUrl) })
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

  const getYoutubeIdByUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    console.log(url)
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : false
  }

  const onPlayerReady = (event: any) => {
    setVideoPlayer(event.target)
    //event.target.pauseVideo()
  }

  const onSubmitVideo = async (data: any) => {
    socketClient?.emit(events.ADD_NEW_VIDEO, data)
  }

  const onPauseVideo = () => socketClient?.emit(events.PAUSE_VIDEO)
  const onPlayVideo = () => socketClient?.emit(events.PLAY_VIDEO)

  return (
    <main className="flex min-h-screen justify-center items-center">
      <div>
        <div className="flex flex-row justify-center mb-4">
          <form onSubmit={handleSubmit(onSubmitVideo)} className="form-control basis-full">
            <div className="input-group">
              <input
                type="url"
                placeholder="Enter YouTube video URL"
                className="input input-bordered input-primary w-full"
                {...register('videoUrl', { required: true })}
              />
              <button type="submit" className="btn btn-primary">
                Add video
              </button>
            </div>
          </form>
        </div>

        <YouTube
          videoId="xcJtL7QggTI"
          opts={playerOptions}
          onReady={onPlayerReady}
          onPlay={onPlayVideo}
          onPause={onPauseVideo}
        />
      </div>
    </main>
  )
}

export default RoomPage
