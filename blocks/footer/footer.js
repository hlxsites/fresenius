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
  
    // Find all the h4 elements inside the div with class "contact"
    const h4Elements = document.querySelectorAll('.contact h4');
  
    // Create the dropdown and insert it after the first and last h4 elements
    if (h4Elements.length >= 1) {
      const dropdown1 = createDropdown('Germany');
      h4Elements[0].insertAdjacentElement('afterend', dropdown1);
    }
  
    if (h4Elements.length > 1) {
      const dropdown2 = createDropdown('EN');
      h4Elements[h4Elements.length - 1].insertAdjacentElement('afterend', dropdown2);
    }
  }
}
