/**
 * Carousel Block
 *
 * This block adds carousel behaviour to a block. The default block markup will be
 * augmented and additional markup will be added to render the final presentation.
 *
 * Features:
 * - smooth scrolling
 * - mouse drag between slides
 * - next and previous button
 * - direct selection via dots
 * - active slide indicator
 * - accessibility
 *
 * @example Carousel markup
 * <div class="carousel">
 *   <div class="slide-container">
 *     <div class="slide-container">
 *       <div>content</div>
 *       <figure>
 *         <figcaption class="caption">content</figcaption>
 *       </figure>
 *     </div>
 *     ...
 *   </div>
 *   <div class="carousel-nav carousel-nav-prev"></div>
 *   <div class="carousel-nav carousel-nav-next"></div>
 *   <ul class="carousel-dots">
 *     <li><button/></li>
 *   </ul>
 * </div>
 */

const SLIDE_ID_PREFIX = 'slide';
const SLIDE_CONTROL_ID_PREFIX = 'carousel-slide-control';

let curSlide = 0;
let maxSlide = 0;
/**
 * Keep active dot in sync with current slide
 * @param carousel The carousel
 * @param activeSlide {number} The active slide
 */
function syncActiveDot(carousel, activeSlide) {
  carousel.querySelectorAll('ul.dots li').forEach((item, index) => {
    const btn = item.querySelector('button');
    if (index === activeSlide) {
      item.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');
    } else {
      item.classList.remove('active');
      btn.removeAttribute('aria-selected');
      btn.setAttribute('tabindex', '-1');
    }
  });
}

/**
 * Scroll a single slide into view.
 *
 * @param carousel The carousel
 * @param slideIndex {number} The slide index
 */
function scrollToSlide(carousel, slideIndex = 0) {
  const carouselSlider = carousel.querySelector('.slide-container');
  carouselSlider.scrollTo({ left: carousel.querySelector('.slide').offsetWidth * slideIndex, behavior: 'smooth' });
  syncActiveDot(carousel, slideIndex);
  // sync slide
  [...carouselSlider.children].forEach((slide, index) => {
    if (index === slideIndex) {
      slide.removeAttribute('tabindex');
      slide.setAttribute('aria-hidden', 'false');
    } else {
      slide.setAttribute('tabindex', '-1');
      slide.setAttribute('aria-hidden', 'true');
    }
  });
  curSlide = slideIndex;
}

/**
 * Based on the direction of a scroll snap the scroll position based on the
 * offset width of the scrollable element. The snap threshold is determined
 * by the direction of the scroll to ensure that snap direction is natural.
 *
 * @param el the scrollable element
 * @param dir the direction of the scroll
 */
function snapScroll(el, dir = 1) {
  if (!el) {
    return;
  }
  let threshold = el.offsetWidth * 0.5;
  if (dir >= 0) {
    threshold -= (threshold * 0.5);
  } else {
    threshold += (threshold * 0.5);
  }
  const block = Math.floor(el.scrollLeft / el.offsetWidth);
  const pos = el.scrollLeft - (el.offsetWidth * block);
  const snapToBlock = pos <= threshold ? block : block + 1;
  const carousel = el.closest('.carousel-slider');
  scrollToSlide(carousel, snapToBlock);
}

/**
 * Build a navigation button for controlling the direction of carousel slides.
 *
 * @param dir A string of either 'prev or 'next'
 * @return {HTMLDivElement} The resulting nav element
 */
function buildNav(dir) {
  const btn = document.createElement('div');
  btn.classList.add(`btn-${dir}`);
  btn.addEventListener('click', (e) => {
    let nextSlide = 0;
    if (dir === 'prev') {
      nextSlide = curSlide === 0 ? maxSlide : curSlide - 1;
    } else {
      nextSlide = curSlide === maxSlide ? 0 : curSlide + 1;
    }
    const carousel = e.target.closest('.carousel-slider');
    scrollToSlide(carousel, nextSlide);
  });
  return btn;
}

/**
 *
 * @param slides An array of slide elements within the carousel
 * @return {HTMLUListElement} The carousel dots element
 */
function buildDots(slides = []) {
  const dots = document.createElement('ul');
  dots.classList.add('dots');
  dots.setAttribute('role', 'tablist');
  slides.forEach((slide, index) => {
    const dot = document.createElement('li');
    dot.setAttribute('role', 'presentation'); // screen readers ignore this
    if (index === 0) {
      dot.classList.add('active');
    }
    const btn = document.createElement('button');
    btn.setAttribute('id', `${SLIDE_CONTROL_ID_PREFIX}${index}`);
    btn.setAttribute('type', 'button');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', `${SLIDE_ID_PREFIX}${index}`);
    if (index === 0) {
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');
    } else {
      btn.setAttribute('tabindex', '-1');
    }
    btn.setAttribute('aria-label', `${index + 1} of ${slides.length}`);
    btn.innerText = `${index + 1}`;
    dot.append(btn);
    dot.addEventListener('click', (e) => {
      curSlide = index;
      const carousel = e.target.closest('.carousel-slider');
      scrollToSlide(carousel, curSlide);
    });
    dots.append(dot);
  });
  return dots;
}

/**
 * Decorate a base slide element.
 *
 * @param slide A base block slide element
 * @param index The slide's position
 * @return {HTMLUListElement} A decorated carousel slide element
 */
function buildSlide(slide, index) {
  slide.setAttribute('id', `${SLIDE_ID_PREFIX}${index}`);
  slide.setAttribute('data-slide-index', index);
  slide.classList.add('slide');
  slide.style.transform = `translateX(${index * 100}%)`;
  // accessibility
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
  slide.setAttribute('aria-describedby', `${SLIDE_CONTROL_ID_PREFIX}${index}`);
  if (index !== 0) {
    slide.setAttribute('tabindex', '-1');
  }
  return slide;
}

/**
 * Decorate and transform a carousel block.
 *
 * @param block HTML block from Franklin
 */
export default function decorate(block) {
  const carousel = document.createElement('div');
  carousel.classList.add('slide-container');
  // if block contains class story, then we need to add a div to format the content
  if (block.classList.contains('stories')) {
    const sortyInfo = block.querySelectorAll(':scope > div > div');
    sortyInfo.forEach((info) => {
      // get image
      const img = info.querySelector(':scope > p img');
      img.removeAttribute('width'); // allow image to maintain aspect when sized by height
      // get h3
      const h3 = info.querySelector('h3');
      // // get p
      const p = info.querySelector(':scope > p:nth-child(3)');
      // create new elements
      const containerDiv = document.createElement('div');
      const newDiv = document.createElement('div');
      // build the new structure
      containerDiv.appendChild(img);
      containerDiv.appendChild(newDiv);
      newDiv.appendChild(h3);
      newDiv.appendChild(p);
      // replace the existing info with the newly formatted info
      info.parentNode.replaceChild(containerDiv, info);
    });
  }

  // make carousel draggable
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let prevScroll = 0;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - carousel.offsetLeft;
    startScroll = carousel.scrollLeft;
    prevScroll = startScroll;
  });

  carousel.addEventListener('mouseup', () => {
    if (isDown) {
      snapScroll(carousel, carousel.scrollLeft > startScroll ? 1 : -1);
    }
    isDown = false;
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) {
      return;
    }
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX);
    carousel.scrollLeft = prevScroll - walk;
  });

  // process each slide
  const slides = [...block.children];
  maxSlide = slides.length - 1;
  slides.forEach((slide, index) => {
    carousel.appendChild(buildSlide(slide, index));
  });

  // add decorated carousel to block
  block.append(carousel);

  // add nav buttons and dots to block
  if (slides.length > 1) {
    const prevBtn = buildNav('prev');
    const nextBtn = buildNav('next');
    const dots = buildDots(slides);
    block.append(prevBtn, nextBtn, dots);
    syncActiveDot(block, 0);
  }
}
