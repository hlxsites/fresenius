import { getMetadata, decorateIcons, wrapSpanLink } from '../../scripts/lib-franklin.js';
import { createDropdown } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 68px)'); // this is a hack

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */

// force expanded = true means you can't close it
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');

  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  navDrops.forEach((drop) => {
    drop.removeAttribute('role');
    drop.removeAttribute('tabindex');
    drop.removeEventListener('focus', focusNavSection);
  });
  // enable menu collapse on escape keypress
  if (!expanded) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = html;

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navSections = nav.querySelector('.nav-sections');

    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li')
        .forEach((navSection) => {
          if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          navSection.addEventListener('click', () => {
            toggleAllNavSections(navSections);
            // set second one to false to prevent subnav expansion in desktop
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          });
        });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <p></p><span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize - I don't think this is needed
    // toggleMenu(nav, navSections, isDesktop.matches);
    //  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

    decorateIcons(nav);
    wrapSpanLink(nav);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.append(navWrapper);

    // add language and country dropdowns same way Footer does
    createDropdown();

    const selectElements = document.querySelectorAll('.nav-sections > p');

    if (selectElements.length > 1) {
      const dropdown1 = createDropdown('Germany');
      dropdown1.setAttribute('aria-label', 'Country');
      selectElements[0].insertAdjacentElement('afterend', dropdown1);
    }

    if (selectElements.length >= 1) {
      const dropdown2 = createDropdown('EN');
      dropdown2.setAttribute('aria-label', 'Language');
      selectElements[selectElements.length - 1].insertAdjacentElement('afterend', dropdown2);
    }
  }
}
