import { useState } from "react";
import galleryData from "./gallery-data.json";
import "./App.css";

function App() {
  const [viewer, setViewer] = useState(null);
  const [touchStart, setTouchStart] = useState(null);

  function openItem(item) {
    setViewer({
      title: item.title,
      images: item.type === "file" ? [item] : item.images,
      index: 0
    });
  }

  function closeViewer() {
    setViewer(null);
  }

  function previousImage() {
    setViewer((current) => ({
      ...current,
      index: current.index === 0 ? current.images.length - 1 : current.index - 1
    }));
  }

  function nextImage() {
    setViewer((current) => ({
      ...current,
      index: current.index === current.images.length - 1 ? 0 : current.index + 1
    }));
  }

  function handleTouchStart(e) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (distance > 50) nextImage();
    if (distance < -50) previousImage();

    setTouchStart(null);
  }

  const currentImage = viewer?.images[viewer.index];

  return (
    <div className="gallery">
      <header className="hero">
        <div className="eyebrow">MOLECULAR DOMINOES</div>
        <h1>Image Review Gallery</h1>
        <p>Browse stories, open figures, swipe through slides.</p>
      </header>

      <div className="grid">
        {galleryData.map((item) => (
          <button className="card" key={item.name} onClick={() => openItem(item)}>
            <img
              src={item.type === "file" ? item.path : item.cover}
              alt={item.title}
              className="thumb"
            />

            <div className="title">{item.title}</div>

            {item.type === "folder" && (
              <div className="meta">{item.images.length} slides</div>
            )}
          </button>
        ))}
      </div>

      {viewer && (
        <div className="viewer">
          <button className="close" onClick={closeViewer}>×</button>

          <div className="viewerTop">
            <h2>{viewer.title}</h2>
            <p>{viewer.index + 1} / {viewer.images.length}</p>
          </div>

          <div
            className="imageStage"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentImage.path}
              alt={currentImage.title}
              className="viewerImage"
            />
          </div>

          <div className="dots">
            {viewer.images.map((_, i) => (
              <span
                key={i}
                className={i === viewer.index ? "dot active" : "dot"}
              />
            ))}
          </div>

          <div className="mobileNav">
            <button onClick={previousImage}>← Previous</button>
            <button onClick={nextImage}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;