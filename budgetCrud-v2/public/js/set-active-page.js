const currentPage = location.href.substring(location.href.lastIndexOf('/'));

const $navLinks = document.getElementsByTagName('a');

function getCurrentPage(link){
  return link.href.substring(link.href.lastIndexOf('/'))
}

Object.values($navLinks).forEach(link => {
  if (getCurrentPage(link) === getCurrentPage(location)){
    console.log(`${link.href} is active`)
    return link.parentNode.classList.add("active");
  }
})
