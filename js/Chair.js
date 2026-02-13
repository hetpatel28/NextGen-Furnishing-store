function scrollLeftButton(ps1) {
  const container = document.getElementById(ps1);
  container.scrollBy({
    left: -320,
    behavior: 'smooth'
  });
}

function scrollRightButton(ps1) {
  const container = document.getElementById(ps1);
  container.scrollBy({
    left: 320,
    behavior: 'smooth'
  });
}

