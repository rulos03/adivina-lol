'use strict';

class LazyImageLoader {
  constructor() {
    this._observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          img.src = img.dataset.src;
          img.onload  = () => img.classList.add('loaded');
          img.onerror = () => img.classList.add('error');
          this._observer.unobserve(img);
        });
      },
      { rootMargin: '80px' }
    );
  }

  observe(img) {
    this._observer.observe(img);
  }
}

const lazyLoader = new LazyImageLoader();
