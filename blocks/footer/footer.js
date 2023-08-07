import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
function createDropdown(placeholder) {
  const dropdown = document.createElement('select');
  const option = document.createElement('option');
  option.text = placeholder;
  option.disabled = true;
  option.selected = true;
  dropdown.appendChild(option);
  return dropdown;
}

let currentAccordion = null;

function toggleAccordion(event) {
  const header = event.target.closest('.accordion-header');
  const content = header.querySelector('.accordion-content');

  // Check if the clicked accordion is the same as the currently open accordion
  const isSameAccordion = currentAccordion === header;

  // If another accordion is open, close it
  if (currentAccordion && !isSameAccordion) {
    const openContent = currentAccordion.querySelector('.accordion-content');
    openContent.classList.remove('show');

    // Update the aria-expanded attribute of the previously open accordion
    currentAccordion.setAttribute('aria-expanded', 'false');
  }

  // If the clicked accordion is the same as the currently open accordion, close it
  if (isSameAccordion) {
    content.classList.remove('show');
    header.setAttribute('aria-expanded', 'false');
    currentAccordion = null; // Update the reference to null
  } else {
    // Open the clicked accordion
    content.classList.add('show');
    header.setAttribute('aria-expanded', 'true');
    currentAccordion = header; // Update the currentAccordion reference
  }
}

function toggleAccordionForMobile() {
  const accordionHeaders = document.querySelectorAll('.news, .media-center, .quick-links');
  for (let i = 0; i < accordionHeaders.length; i += 1) {
    const header = accordionHeaders[i];

    if (!header.classList.contains('accordion-header')) {
      header.classList.add('accordion-header');
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('accordion-content');

      const childElements = Array.from(header.children);
      childElements.forEach((element) => {
        if (element !== header.querySelector('h1')) {
          contentDiv.appendChild(element);
        }
      });

      header.appendChild(contentDiv);
      header.addEventListener('click', toggleAccordion);
    }
  }
}

function removeAccordionForDesktop() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  for (let i = 0; i < accordionHeaders.length; i += 1) {
    const header = accordionHeaders[i];
    header.classList.remove('accordion-header');

    const contentDiv = header.querySelector('.accordion-content');
    if (contentDiv) {
      const childElements = Array.from(contentDiv.children);
      childElements.forEach((element) => {
        header.appendChild(element);
      });
      header.removeChild(contentDiv);
    }
    header.removeEventListener('click', toggleAccordion);
  }
}

function checkWindowSize() {
  const isMobileScreen = window.matchMedia('(max-width: 767px)').matches;
  if (isMobileScreen) { toggleAccordionForMobile(); }
  else { removeAccordionForDesktop(); }

  currentAccordion = null;
}

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;

    decorateIcons(footer);
    block.append(footer);
    const divs = document.querySelectorAll('.footer div > div');

    divs[0].classList.add('news');
    divs[1].classList.add('media-center');
    divs[2].classList.add('quick-links');
    divs[3].classList.add('contact');
    divs[4].classList.add('copyright');

    // Create a new container div for the first four divs
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('container');

    // Append the first four divs to the new container div
    for (let i = 0; i < 4; i++) {
      containerDiv.appendChild(divs[i]);
    }

    footer.appendChild(containerDiv);
    footer.appendChild(divs[4]);

    createDropdown();
  
    const h4Elements = document.querySelectorAll('.contact h4');

    if (h4Elements.length >= 1) {
      const dropdown1 = createDropdown('Germany');
      h4Elements[0].insertAdjacentElement('afterend', dropdown1);
    }

    if (h4Elements.length > 1) {
      const dropdown2 = createDropdown('EN');
      h4Elements[h4Elements.length - 1].insertAdjacentElement('afterend', dropdown2);
    }

    window.addEventListener('load', checkWindowSize);
    window.addEventListener('resize', checkWindowSize);
  }
}
