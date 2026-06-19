import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import galleryData from "./gallery-data.json";
import "./App.css";

const BASE = import.meta.env.BASE_URL;

function imageUrl(path) {
  if (!path) return "";
  return `${BASE}${path.replace(/^\//, "")}`;
}

function safeId(text) {
  return text.replace(/[^a-zA-Z0-9]/g, "_");
}

function App() {
  const [viewer, setViewer] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState([]);

  function openItem(item) {
    setViewer({
      id: safeId(item.name),
      title: item.title,
      images: item.type === "file" ? [item] : item.images,
      index: 0
    });

    setRating(0);
    setComment("");
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

  async function submitFeedback() {
    if (!viewer) return;
    if (!rating && !comment.trim()) return;

    await addDoc(collection(db, "feedback", viewer.id, "items"), {
      rating,
      comment: comment.trim(),
      slideIndex: viewer.index,
      slideTitle: viewer.images[viewer.index]?.title || "",
      createdAt: serverTimestamp()
    });

    setRating(0);
    setComment("");
  }

  async function deleteFeedback(id) {
    if (!viewer) return;
    await deleteDoc(doc(db, "feedback", viewer.id, "items", id));
  }

  useEffect(() => {
    if (!viewer) return;

    const q = query(
      collection(db, "feedback", viewer.id, "items"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      setFeedback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [viewer]);

  const currentImage = viewer?.images[viewer.index];

  const ratingsOnly = feedback.filter((item) => item.rating > 0);
  const averageRating =
    ratingsOnly.length === 0
      ? 0
      : ratingsOnly.reduce((sum, item) => sum + item.rating, 0) / ratingsOnly.length;

  return (
    <div className="gallery">
      <header className="hero">
        <div className="eyebrow">MOLECULAR DOMINOES</div>
        <h1>Figure Feedback Gallery</h1>

        <div className="introBox">
          <p>
            Thank you for helping me improve these figures. Some stories are single
            images, while others are multi-page slide stories.
          </p>
          <p>
            Please rate the figure and leave specific comments. I especially want to
            know whether the science is clear, whether the text is readable on a
            phone, and whether the number of pages feels right.
          </p>
          <p>
            Brutally honest feedback is much more useful than polite praise. 100% anonymous!
          </p>
        </div>
      </header>

      <div className="grid">
        {galleryData.map((item) => (
          <button className="card" key={item.name} onClick={() => openItem(item)}>
            <img
              src={imageUrl(item.type === "file" ? item.path : item.cover)}
              alt={item.title}
              className="thumb"
            />

            <div className="title">{item.title}</div>

            {item.type === "folder" ? (
              <div className="meta">{item.images.length} pages</div>
            ) : (
              <div className="meta">1 page</div>
            )}
          </button>
        ))}
      </div>

      {viewer && (
        <div className="viewer">
          <button className="close" onClick={closeViewer}>
            ×
          </button>

          <div className="viewerTop">
            <h2>{viewer.title}</h2>
            <p>
              Page {viewer.index + 1} / {viewer.images.length}
            </p>
          </div>

          <div
            className="imageStage"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={imageUrl(currentImage.path)}
              alt={currentImage.title}
              className="viewerImage"
            />
          </div>

          <div className="dotsWrapper">
            {viewer.images.length > 1 && (
              <button className="arrowButton" onClick={previousImage}>
                ←
              </button>
            )}

            <div className="dots">
              {viewer.images.map((_, i) => (
                <span
                  key={i}
                  className={i === viewer.index ? "dot active" : "dot"}
                />
              ))}
            </div>

            {viewer.images.length > 1 && (
              <button className="arrowButton" onClick={nextImage}>
                →
              </button>
            )}
          </div>

          <section className="feedbackPanel">
            <div className="feedbackTitle">Review this figure</div>

            <ul className="reviewGuidance">
              <li>Is the science clear and intuitive?</li>
              <li>Is the text readable on a phone?</li>
              <li>Is anything confusing, cluttered, or unnecessary?</li>
              <li>If this is multi-page: does the number of pages feel right?</li>
            </ul>

            <div className="ratingSummary">
              Average: {averageRating ? averageRating.toFixed(1) : "No ratings yet"} ⭐
              {ratingsOnly.length > 0 && <span> ({ratingsOnly.length})</span>}
            </div>

            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={star <= rating ? "star selected" : "star"}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What would you change? Please mention the page number if relevant."
            />

            <button className="submitButton" onClick={submitFeedback}>
              Submit feedback
            </button>

            <div className="comments">
              {feedback.map((item) => (
                <div className="comment" key={item.id}>
                  <div className="commentTop">
                    {item.rating > 0 && (
                      <div className="commentRating">{"★".repeat(item.rating)}</div>
                    )}

                    {typeof item.slideIndex === "number" && (
                      <div className="commentPage">Page {item.slideIndex + 1}</div>
                    )}
                  </div>

                  {item.comment && <p>{item.comment}</p>}

                  <button
                    className="deleteButton"
                    onClick={() => deleteFeedback(item.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;