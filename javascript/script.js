const option1 = document.getElementById('movie');
const option2 = document.getElementById('tvshow');
const hiddenFields = document.getElementById('hidden-fields');
const searchButton = document.getElementById('search-button');
const backButton = document.getElementById('back-btn');
const superembed = document.getElementById('superembed');
const twoembed = document.getElementById('2embed');
const playerContent = document.getElementById('player-content');
let searchInput = "";

// Toggle visibility of hidden fields
option1.addEventListener('change', () => {
  if (option1.checked) {
    hiddenFields.classList.add('hidden');
  }
});

option2.addEventListener('change', () => {
  if (option2.checked) {
    hiddenFields.classList.remove('hidden');
  }
});

searchButton.addEventListener('click', () => {
  searchInput = document.getElementById('main-search').value.trim().toLowerCase();
  const selectedRadio = document.querySelector('input[name="type"]:checked');

  if (!searchInput) {
    alert('Please enter a search query!');
    return;
  }

  if (selectedRadio.value === "tvshow") {
    const season = document.getElementById('season').value;
    const episode = document.getElementById('episode').value;

    if (!season || !episode) {
      alert('Please enter season and episode numbers!');
      return;
    }

    searchInput = `${searchInput}&s=${season}&e=${episode}`;
  }
  
  const searchDiv = document.getElementById('search-div');
  const playerDiv = document.getElementById('player-div');
  searchDiv.classList.add('hidden');
  playerDiv.classList.remove('hidden');
  playerContent.innerHTML = "";
});

backButton.addEventListener('click', () => {
  const searchDiv = document.getElementById('search-div');
  const playerDiv = document.getElementById('player-div');
  searchDiv.classList.remove('hidden');
  playerDiv.classList.add('hidden');
  superembed.classList.remove('active');
  twoembed.classList.remove('active');
});

superembed.addEventListener('click', () => {
  superembed.classList.add('active');
  twoembed.classList.remove('active');
  const isId = searchInput.startsWith("tt");
  const playerUrl = generateEmbedUrls(searchInput, "superembed", isId);
  playerContent.innerHTML = `<iframe src="${playerUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>`;

});

twoembed.addEventListener('click', () => {
  superembed.classList.remove('active');
  twoembed.classList.add('active');
  const isId = searchInput.startsWith("tt");
  const playerUrl = generateEmbedUrls(searchInput, "twoembed", isId);
  playerContent.innerHTML = `<iframe src="${playerUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>`;
});

function generateEmbedUrls(searchInput, player, isId) {
  const baseSuperembedUrl = "https://multiembed.mov/directstream.php?video_id=";
  const baseTwoembedUrl = "https://www.2embed.cc/";

  if (searchInput.includes('&s=') && searchInput.includes('&e=')) {
    if (player === "superembed") {
      return `${baseSuperembedUrl}${searchInput}${isId ? "" : "&tmdb=1"}`;
    } else if (player === "twoembed") {
      return `${baseTwoembedUrl}embedtv/${searchInput}`;
    }
  } else {
    if (player === "superembed") {
      return `${baseSuperembedUrl}${searchInput}${isId ? "" : "&tmdb=1"}`;
    } else if (player === "twoembed") {
      return `${baseTwoembedUrl}embed/${searchInput}`;
    }
  }
}