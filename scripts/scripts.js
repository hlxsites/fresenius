import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  wrapSpanLink,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  decorateBlock,
  getMetadata,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * create an element.
 * @param {string} tagName the tag for the element
 * @param {string|Array<string>} classes classes to apply
 * @param {object} props properties to apply
 * @param {string|Element} html content to add
 * @returns the element
 */
export function createElement(tagName, classes, props, html) {
  const elem = document.createElement(tagName);
  if (classes) {
    const classesArr = (typeof classes === 'string') ? [classes] : classes;
    elem.classList.add(...classesArr);
  }
  if (props) {
    Object.keys(props).forEach((propName) => {
      elem.setAttribute(propName, props[propName]);
    });
  }

  if (html) {
    const appendEl = (el) => {
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        elem.append(el);
      } else {
        elem.insertAdjacentHTML('beforeend', el);
      }
    };

    if (Array.isArray(html)) {
      html.forEach(appendEl);
    } else {
      appendEl(html);
    }
  }

  return elem;
}

/*  If an image has a soft return with link under it and a short caption.
 */
function figureImageLink(block) {
  [...block.querySelectorAll('picture + br + a')]
    .filter((a) => a.href === a.textContent)
    .forEach((a) => {
      const picture = a.previousElementSibling.previousElementSibling;
      picture.remove();
      a.previousElementSibling.remove();
      const imageLink = a.parentElement.nextElementSibling;
      if (imageLink.childElementCount === 1 && imageLink.firstElementChild.nodeName === 'A') {
        const figure = document.createElement('figure');
        figure.append(picture);
        const caption = document.createElement('figcaption');
        caption.innerHTML = imageLink.firstElementChild.innerHTML;
        figure.append(caption);
        a.innerHTML = figure.outerHTML;
        imageLink.remove();
      } else {
        a.innerHTML = picture.outerHTML;
      }
    });
}

/**
 * Builds breadcrumb block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildBreadcrumbBlock(main) {
  if (window.location.pathname !== '/' && window.isErrorPage !== true && !getMetadata('hideBreadcrumb')) {
    const section = createElement('div');
    section.append(buildBlock('breadcrumb', { elems: [] }));
    main.prepend(section);
  }
}

export function loadScript(url, callback, type, async) {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (async) {
    script.async = true;
  }
  if (type) {
    script.setAttribute('type', type);
  }
  script.onload = callback;
  head.append(script);
  return script;
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds accordion blocks from default content
 * @param {Element} main The container element
 */
function buildAccordions(main) {
  const accordionSectionContainers = main.querySelectorAll('.section.accordion > .section-container');
  accordionSectionContainers.forEach((accordion) => {
    const contentWrappers = accordion.querySelectorAll(':scope > div');
    const blockTable = [];
    let row;
    const newWrapper = createElement('div');
    contentWrappers.forEach((wrapper) => {
      let removeWrapper = true;
      [...wrapper.children].forEach((child) => {
        if (child.nodeName === 'H2') {
          if (row) {
            blockTable.push([{ elems: row }]);
          }
          row = [];
        }
        if (row) {
          row.push(child);
        } else {
          // if there is content in the section before the first h2
          // then that content is preserved
          // otherwise, we remove the wrapper
          removeWrapper = false;
        }
      });

      if (removeWrapper) wrapper.remove();
    });
    // add last row
    if (row) {
      blockTable.push([{ elems: row }]);
    }

    const block = buildBlock('accordion', blockTable);
    newWrapper.append(block);
    accordion.append(newWrapper);
    decorateBlock(block);
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
/** We are not using the Hero block
 but I'm keeping this code here as an example for future autoblocks
 */

function buildAutoBlocks(main) {
  try {
    buildBreadcrumbBlock(main);
    figureImageLink(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  wrapSpanLink(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  buildAccordions(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

// May move this to lib-franklin.js for LH scoring
export function createDropdown(placeholder) {
  const dropdown = document.createElement('select');
  const option = document.createElement('option');
  option.text = placeholder;
  option.disabled = true;
  option.selected = true;
  dropdown.appendChild(option);
  return dropdown;
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  loadHeader(doc.querySelector('header')); // moving up here to help with LCP?
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
