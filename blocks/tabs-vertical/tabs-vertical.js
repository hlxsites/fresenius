const iconPlus = 'icon-forward-button';
const iconMinus = 'icon-back-button';
const classActive = 'active';
const desktopMQ = '(min-width: 1024px)';
let curSlide = 0;
let maxSlide = 0;
let autoScroll;
let scrollInterval;
let scrollDuration = '1000';
// const tabletMQ = '(min-width: 768px)';

function getEmptyHeight() {
  if (window.innerWidth < 1700) {
    const emptyHeight = (window.innerWidth / 5.2);
    return emptyHeight;
  } return 340;
  // Could also try height based on padding?
  // function getEmptyHeight(tabPanel) {
  // Needs to be some values that won't change
  // const tabPaneInside = tabPane.querySelector('.tabs-vertical-pane-items');
  // const tabPaneInsideCS = window.getComputedStyle(tabPaneInside);
  // const tabBtn = tabPane.querySelector('.tabs-vertical-btn');
  // const emptyHeight = (parseInt(tabPaneInsideCS.paddingTop, 10) * 3) + tabBtn.offsetHeight;
  // return emptyHeight;
}

function setHeights(block) {
  const tabPanes = block.querySelectorAll('.tabs-vertical-pane');
  [...tabPanes].forEach((tabPane) => {
    // why is this so buggy at 768?
    if (window.matchMedia(desktopMQ).matches) {
      const emptyHeight = getEmptyHeight(tabPane);
      if (tabPane.classList.contains(`${classActive}`)) {
        // this is the height at which bottom of pics will be cut off
        const height = `${(tabPane.querySelector('.tabs-vertical-pane-items').offsetHeight + emptyHeight)}px`;
        tabPane.style.height = height;
      } else {
        tabPane.style.height = `${emptyHeight}px`;
      }
    } else {
      // for all widths under 1024
      tabPane.style.removeProperty('height');
    }
  });
}

// bug -- clicking icon button removes active pane and then toggleItem can't find "closest".
// so leaving it here and will hide with CSS for now.
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

function toggleNav(block, tabIndex = 0) {
  const actives = block.querySelectorAll(`.${classActive}`);
  if (actives.length) {
    [...actives].forEach((active) => {
      const newActive = active.parentElement.children[tabIndex];
      toggleItem(active, false);
      if (active !== newActive) {
        toggleItem(newActive, true);
      }
    });
    curSlide = tabIndex;
  }
}

/**
 * start auto scroll
 */
function startAutoScroll(block) {
  if (!scrollInterval) {
    scrollInterval = setInterval(() => {
      toggleNav(block, curSlide < maxSlide ? curSlide + 1 : 0);
    }, scrollDuration);
  }
}

/**
 * stop auto scroll
 */
function stopAutoScroll() {
  clearInterval(scrollInterval);
  scrollInterval = undefined;
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
    a.addEventListener('click', () => {
      toggleNav(block, i);
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

  // if block contains class auto-scroll add scroll functionality and get interval
  const blockClasses = block.className.split(' ');
  const autoScrollClass = blockClasses.find((className) => className.startsWith('auto-scroll-'));

  if (autoScrollClass) {
    autoScroll = true;
    // get scroll duration
    // eslint-disable-next-line prefer-destructuring
    scrollDuration = autoScrollClass.match(/\d+/)[0];
  }

  tabList.addEventListener('mouseenter', () => {
    if (autoScroll) stopAutoScroll();
  });

  tabList.addEventListener('mouseleave', () => {
    if (autoScroll) startAutoScroll(block);
  });

  const tabs = [...block.children];
  maxSlide = tabs.length - 2;

  tabs.forEach((row, i) => {
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
      if (window.matchMedia(desktopMQ).matches) {
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
      button.addEventListener('click', () => {
        toggleNav(block, i - 1);
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

  // autoscroll functionality
  if (autoScroll) {
    // auto scroll when visible
    const intersectionOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const handleAutoScroll = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAutoScroll(block);
        } else {
          stopAutoScroll();
        }
      });
    };

    const carouselObserver = new IntersectionObserver(handleAutoScroll, intersectionOptions);
    carouselObserver.observe(block);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoScroll();
      } else {
        startAutoScroll(block);
      }
    });
  }
}
