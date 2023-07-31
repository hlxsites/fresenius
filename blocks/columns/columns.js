// export default lets you use this single function in other js
export default function decorate(block) {
// spread operator (…) means iterate through all the children of  the 1st element
  const cols = [...block.firstElementChild.children];
  // and add to the BLOCK add class of “columns-$n-cols”
  // where n is the amount of children this function encountered
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  // col and row defined in libs-franklin, from readBlockConfig
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // look in every row in the block for a column that has the ”picture” HTML element in it
      const pic = col.querySelector('picture');
      // if one exists, find the closest Div (would be the one surrounding the picture,
      // because Franklin already knows to create a dive per "cell")
      if (pic) {
        const picWrapper = pic.closest('div');
        // if the picture is the only content in the column (=== 1 or > 0 would work),
        if (picWrapper && picWrapper.children.length === 1) {
          // add a class of “columns-img-col” to the div surrounding the picture
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
