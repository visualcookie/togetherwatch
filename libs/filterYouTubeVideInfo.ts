export interface IYouTubeVideoInfoReturn {
  title: string
  publishedAt: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
}

const filterYoutubeVideoInfo = (data: any): IYouTubeVideoInfoReturn => {
  console.log(data)
  const { items } = data
  const { snippet } = items[0]

  return {
    title: snippet.title,
    publishedAt: snippet.publishedAt,
    thumbnail: snippet.thumbnails.medium,
  }
}

export default filterYoutubeVideoInfo
