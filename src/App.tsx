import ThumbnailForm from './components/ThumbnailForm'

export const App = () => {
  return (
    <div className="container">
      <h1 style={{ margin: 0 }}>Thumbnail Generator</h1>
      <p className="small" style={{ marginTop: 4 }}>
        Generate brand‑consistent thumbnails fast.
      </p>
      <ThumbnailForm />
    </div>
  )
}
