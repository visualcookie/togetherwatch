const hasGoogleApiKey = (): boolean => {
  if (process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
    return true
  }

  console.info('Please add your Google API Key to .env file')
  return false
}

export default hasGoogleApiKey
