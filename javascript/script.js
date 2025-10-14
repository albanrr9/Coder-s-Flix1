const option1 = document.getElementById('movie');
const option2 = document.getElementById('tvshow');
const hiddenFields = document.getElementById('hidden-fields');
const searchButton = document.getElementById('search-button');
const backButton = document.getElementById('back-btn');
const superembed = document.getElementById('superembed');
const twoembed = document.getElementById('2embed');
const playerContent = document.getElementById('player-content');
const historyDiv = document.getElementById('history-div');
const historyList = document.getElementById('history-list');
let searchInput = "";
const backendApiUrl = "https://imdb-scraper-backend-fixed-mrgjsjvpj-albanrr9s-projects.vercel.app/api/title/";

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

// Load history from local storage
function loadHistory() {
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  historyList.innerHTML = '';

  history.forEach(async (item) => {
    const li = document.createElement('li');

    try {
      // Fetch the title from the backend API
      const response = await fetch(`${backendApiUrl}${item}`);
      const data = await response.json();

      if (data.title) {
        li.textContent = data.title; // Use the fetched title
      } else {
        li.textContent = item; // Fallback to the code if title is unavailable
      }
    } catch (error) {
      console.error('Error fetching title:', error);
      li.textContent = item; // Fallback to the code in case of an error
    }

    li.addEventListener('click', () => {
      document.getElementById('main-search').value = item;
    });

    historyList.appendChild(li);
  });
}

// Save to history in local storage
function saveToHistory(code) {
  let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!history.includes(code)) {
    history.unshift(code);
    if (history.length > 10) history.pop(); // Limit history to 10 items
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }
}

// Update search button click to save to history
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

  saveToHistory(searchInput); // Save the search input to history
  loadHistory(); // Reload the history section

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

// Load history on page load
document.addEventListener('DOMContentLoaded', loadHistory);
