document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  // --- 1.  Helper to (re)compute a single‑card width  ---
  const getCardWidth = () => {
    const card = track.querySelector('.recommendation-card');
    if (!card) return 0;
    const style = window.getComputedStyle(card);
    /* use getBoundingClientRect so we get the live width,
       then add BOTH margins */
    return (
      card.getBoundingClientRect().width +
      parseFloat(style.marginLeft) +
      parseFloat(style.marginRight)
    );
  };

  // --- 2.  Keep cardWidth up‑to‑date when the layout changes  ---
  let cardWidth = getCardWidth();          // initial
  new ResizeObserver(() => {               // runs on rotation or viewport resize
    cardWidth = getCardWidth();
  }).observe(track);

  // --- 3.  Scroll, but clamp to [0 … maxScroll]  ---
  window.moveCarousel = function (direction) {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const target    = Math.max(
      0,
      Math.min(maxScroll, track.scrollLeft + direction * cardWidth)
    );

    track.scrollTo({ left: target, behavior: 'smooth' });
  };
});

const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const track = document.getElementById('carousel-track');
function updateButtons() {
  prevBtn.disabled = track.scrollLeft === 0;
  nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
}

track.addEventListener('scroll', updateButtons);
updateButtons();