import axios from 'axios'
import classNames from 'classnames'
import Error from 'next/error'
import React, { useState } from 'react'
import { Socket } from 'socket.io-client'
import events from '../constants/events'
import filterYoutubeVideoInfo, { IYouTubeVideoInfoReturn } from '../libs/filterYouTubeVideInfo'
import getYoutubeIdByUrl from '../libs/getYouTubeIdByUrl'
import hasGoogleApiKey from '../libs/hasGoogleApiKey'

type Props = {
  socketClient: Socket | null
}

const Navbar = (props: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [videoInfo, setVideoInfo] = useState<IYouTubeVideoInfoReturn>()
  const [videoId, setVideoId] = useState<string>()

  const getYoutubeVideoInfo = async (event: any) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const isYouTube = regExp.test(event.target.value)

    if (isYouTube && hasGoogleApiKey()) {
      const youtubeId = getYoutubeIdByUrl(event.target.value)
      setVideoId(youtubeId)

      await axios
        .get(
          `https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=${youtubeId}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
        )
        .then((res) => {
          setVideoInfo(filterYoutubeVideoInfo(res.data))
          setIsDropdownOpen(true)
        })
        .catch((err) => {
          throw new Error(err)
        })
    }
  }

  const onAddVideo = (id: string) => {
    setIsDropdownOpen(false)
    props.socketClient?.emit(events.ADD_NEW_VIDEO, id)
  }

  console.log(isDropdownOpen)

  return (
    <div className="navbar bg-base-300">
      <div className="navbar-start">
        <a className="btn btn-ghost normal-case text-xl">togetherwatch</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <div className="form-control relative">
          <input
            type="url"
            placeholder="Enter YouTube URL ..."
            className="input input-bordered w-96"
            onChange={getYoutubeVideoInfo}
            onBlur={() => setIsDropdownOpen(false)}
          />
          <div className={classNames('dropdown absolute bottom-0 -left-[20%]', isDropdownOpen && 'dropdown-open')}>
            <div
              tabIndex={0}
              className="dropdown-content hover:cursor-pointer grid grid-cols-2 gap-4 w-[32rem] mt-3 bg-base-300 shadow rounded-box overflow-hidden"
              onClick={() => videoId && onAddVideo(videoId)}
            >
              <figure>
                <img src={videoInfo?.thumbnail.url} alt={videoInfo?.title} />
              </figure>
              <div className="px-4 py-4">
                <p className="line-clamp-3">{videoInfo?.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="navbar-end" />
    </div>
  )
}

export default Navbar
