const iconPlus = 'icon-check';
const iconMinus = 'icon-back-button';
const classActive = 'active';
const verticalMediaQuery = '(min-width: 1024px)';

function getEmptyHeight(tabPane) {
  const tabPaneInside = tabPane.querySelector('.tabs-vertical-pane-items');
  const tabPaneInsideCS = window.getComputedStyle(tabPaneInside);
  const tabBtn = tabPane.querySelector('.tabs-vertical-btn');
  // needs to be some values that won't change
  const emptyHeight = (parseInt(tabPaneInsideCS.paddingTop, 10) * 3) + tabBtn.offsetHeight;
  console.log(tabPaneInsideCS.paddingTop);
  return emptyHeight;
}

// needed so all the slides are the same size
// not currently using this verticalMediaQuery though

function setHeights(block) {
  const tabPanes = block.querySelectorAll('.tabs-vertical-pane');
  [...tabPanes].forEach((tabPane) => {

    if (window.matchMedia(verticalMediaQuery).matches) {
      const emptyHeight = getEmptyHeight(tabPane);
      if (tabPane.classList.contains('active')) {
        // this is the height at which bottom of pics will be cut off
        const height = `${(tabPane.querySelector('.tabs-vertical-pane-items').offsetHeight + emptyHeight)}px`;
        tabPane.style.height = height;
      } else {
        tabPane.style.height = `${emptyHeight}px`;
      }
    } else {
      tabPane.style.removeProperty('height');
    }
  });
}

//bug -- clicking icon button removes active pang and then toggleItem can't find "closest".
function toggleItem(item, on) {
  if (item) {
    const icon = item.querySelector('i');
    if (on) {
      item.classList.add(classActive);
      if (icon) icon.classList.replace(iconPlus, iconMinus);
    } else {
      item.classList.remove(classActive);
      if (icon) icon.classList.replace(iconMinus, iconPlus);
    }
  }
  setHeights(item.closest('.tabs-vertical.block'));
}


function toggleNav(block, target, i) {
  if (!(target.closest('.tabs-vertical-list') && target.closest('.active'))) {
    const actives = block.querySelectorAll(`.${classActive}`);
    if (actives.length) {
      [...actives].forEach((active) => {
        const newActive = active.parentElement.children[i];
        toggleItem(active, false);
        if (active !== newActive) {
          toggleItem(newActive, true);
        }
      });
    } else {
      toggleItem(target.closest('.tabs-vertical-pane'), true);
    }
  }
}

function buildNav(block) {
  const ul = document.createElement('ul');
  const titles = block.querySelectorAll('div:not(:first-child) > div:first-child');
  // not first one because that's reserved for the background image on the tabs
  [...titles].forEach((title, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    // we want to set the H3 text as the aria label
    a.textContent = title.textContent;
    // but we want to gather all the HTML in here
    a.innerHTML = title.innerHTML;
    a.setAttribute('aria-label', title.textContent);
    a.addEventListener('click', (e) => {
      toggleNav(block, e.target, i);
    });
    li.appendChild(a);
    ul.appendChild(li);
  });

  ul.querySelector('li')
    .classList
    .add(classActive);
  return (ul);
}

export default function decorate(block) {
  const ul = buildNav(block);
  ul.classList.add('nav-tabs');

  const tabList = block.querySelector('div');
  tabList.classList.add('tabs-vertical-list');
  tabList.querySelector('div')
    .appendChild(ul);

  const tabMainContent = document.createElement('div');
  tabMainContent.classList.add('tabs-vertical-main-content');

  [...block.children].forEach((row, i) => {
    // first row is for navigation, start from second row
    if (i) {
      const tabPane = document.createElement('div');
      tabPane.classList.add('tabs-vertical-pane');

      const tabPaneAll = document.createElement('div');
      tabPaneAll.classList.add('tabs-vertical-pane-inside');


      const picture = row.querySelector('picture');

      // create a class on this row, then put it under "tabpane"
      row.classList.add('tabs-vertical-pane-items');
      // TODO: later, watch for the window resize instead
      if (window.matchMedia(verticalMediaQuery).matches) {
        const tabP = document.createElement('p');
        tabP.appendChild(picture);
        tabPaneAll.append(tabP);
      }
      tabPane.append(tabPaneAll);
      tabPaneAll.appendChild(row);

      const div = row.querySelector('div');
      const button = document.createElement('button');
      button.classList.add('tabs-vertical-btn');
      button.innerHTML = `<i class='icon ${iconPlus}'></i>${div.textContent}`;
      button.addEventListener('click', (e) => {
        toggleNav(block, e.target, i - 1);
      });
      div.remove();
      row.prepend(button);

      row.querySelector('div')
        .classList
        .add('tabs-vertical-content');
      tabMainContent.appendChild(tabPane);
    }
  });

  // set first tab active
  const firstTabPane = tabMainContent.querySelector('.tabs-vertical-pane');
  firstTabPane.classList.add(classActive);
  const firstI = firstTabPane.querySelector('i');
  firstI.classList.remove(iconPlus);
  firstI.classList.add(iconMinus);

  block.appendChild(tabMainContent);
}
