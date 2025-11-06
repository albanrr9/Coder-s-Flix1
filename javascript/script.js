const option1 = document.getElementById("movie")
const option2 = document.getElementById("tvshow")
const hiddenFields = document.getElementById("hidden-fields")
const searchButton = document.getElementById("search-button")
const backButton = document.getElementById("back-btn")
const superembed = document.getElementById("superembed")
const twoembed = document.getElementById("2embed")
const playerContent = document.getElementById("player-content")
const historyDiv = document.getElementById("history-div")
const historyList = document.getElementById("history-list")
const titleSearchInput = document.getElementById("title-search")
const titleSearchButton = document.getElementById("title-search-button")
const searchResults = document.getElementById("search-results")
let searchInput = ""
const backendApiUrl = "https://imdb-scraper-backend-fixed-mrgjsjvpj-albanrr9s-projects.vercel.app/api/title/"
const TMDB_API_KEY = "242057332e9de19c52ae19d8ee67e027" // Users need to add their free TMDb API key
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w200"

// Toggle visibility of hidden fields
option1.addEventListener("change", () => {
  if (option1.checked) {
    hiddenFields.classList.add("hidden")
  }
})

option2.addEventListener("change", () => {
  if (option2.checked) {
    hiddenFields.classList.remove("hidden")
  }
})

function detectCodeType(code) {
  if (code.startsWith("tt")) {
    return "imdb"
  } else if (/^\d+$/.test(code)) {
    return "tmdb"
  }
  return null
}

async function fetchMetadataFromTMDb(code, codeType) {
  try {
    let url

    if (codeType === "imdb") {
      // Search by IMDb ID
      url = `${TMDB_BASE_URL}/find/${code}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
      const response = await fetch(url)
      const data = await response.json()

      // Check if it's a movie or TV show
      if (data.movie_results && data.movie_results.length > 0) {
        const movie = data.movie_results[0]
        return {
          title: movie.title,
          type: "movie",
          poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
          tmdbId: movie.id,
        }
      } else if (data.tv_results && data.tv_results.length > 0) {
        const tv = data.tv_results[0]
        return {
          title: tv.name,
          type: "tvshow",
          poster: tv.poster_path ? `${TMDB_IMAGE_BASE}${tv.poster_path}` : null,
          year: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : null,
          tmdbId: tv.id,
        }
      }
    } else if (codeType === "tmdb") {
      // Try movie first
      url = `${TMDB_BASE_URL}/movie/${code}?api_key=${TMDB_API_KEY}`
      let response = await fetch(url)

      if (response.ok) {
        const movie = await response.json()
        return {
          title: movie.title,
          type: "movie",
          poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
          tmdbId: movie.id,
        }
      }

      // If not a movie, try TV show
      url = `${TMDB_BASE_URL}/tv/${code}?api_key=${TMDB_API_KEY}`
      response = await fetch(url)

      if (response.ok) {
        const tv = await response.json()
        return {
          title: tv.name,
          type: "tvshow",
          poster: tv.poster_path ? `${TMDB_IMAGE_BASE}${tv.poster_path}` : null,
          year: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : null,
          tmdbId: tv.id,
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching metadata from TMDb:", error)
    return null
  }
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || []
  const watchProgress = JSON.parse(localStorage.getItem("watchProgress")) || {}
  historyList.innerHTML = ""

  if (history.length === 0) {
    historyList.innerHTML = '<li style="text-align: center; color: #888;">No search history yet</li>'
    return
  }

  history.forEach((item) => {
    const li = document.createElement("li")
    li.style.display = "flex"
    li.style.alignItems = "center"
    li.style.gap = "15px"
    li.style.padding = "15px"

    // Add poster if available
    if (item.poster) {
      const poster = document.createElement("img")
      poster.src = item.poster
      poster.alt = item.title || "Poster"
      poster.style.width = "60px"
      poster.style.height = "90px"
      poster.style.objectFit = "cover"
      poster.style.borderRadius = "8px"
      poster.style.flexShrink = "0"
      li.appendChild(poster)
    }

    // Content container
    const contentDiv = document.createElement("div")
    contentDiv.style.flex = "1"
    contentDiv.style.display = "flex"
    contentDiv.style.flexDirection = "column"
    contentDiv.style.gap = "5px"

    // Title
    const titleSpan = document.createElement("span")
    titleSpan.textContent = item.title || item.code
    titleSpan.style.fontWeight = "bold"
    titleSpan.style.fontSize = "1.1em"
    contentDiv.appendChild(titleSpan)

    // Type and year
    const metaSpan = document.createElement("span")
    metaSpan.style.fontSize = "0.9em"
    metaSpan.style.color = "#aaa"
    metaSpan.textContent = `${item.type === "movie" ? "Movie" : "TV Show"}${item.year ? ` • ${item.year}` : ""}`
    contentDiv.appendChild(metaSpan)

    // Continue watching indicator for TV shows
    if (item.type === "tvshow" && watchProgress[item.code]) {
      const progress = watchProgress[item.code]
      const continueSpan = document.createElement("span")
      continueSpan.style.fontSize = "0.85em"
      continueSpan.style.color = "#0ff"
      continueSpan.textContent = `Continue: S${progress.season} E${progress.episode}`
      contentDiv.appendChild(continueSpan)
    }

    li.appendChild(contentDiv)

    // Click handler to auto-fill search with type selection
    li.addEventListener("click", () => {
      document.getElementById("main-search").value = item.code

      // Auto-select the correct type
      if (item.type === "movie") {
        option1.checked = true
        hiddenFields.classList.add("hidden")
      } else if (item.type === "tvshow") {
        option2.checked = true
        hiddenFields.classList.remove("hidden")

        // Auto-fill last watched episode if available
        if (watchProgress[item.code]) {
          document.getElementById("season").value = watchProgress[item.code].season
          document.getElementById("episode").value = watchProgress[item.code].episode
        }
      }
    })

    historyList.appendChild(li)
  })
}

async function saveToHistory(code, season = null, episode = null) {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || []

  // Check if item already exists
  const existingIndex = history.findIndex((item) => item.code === code)

  if (existingIndex === -1) {
    // Fetch metadata
    const codeType = detectCodeType(code)
    const metadata = await fetchMetadataFromTMDb(code, codeType)

    const historyItem = {
      code: code,
      title: metadata?.title || code,
      type: metadata?.type || (season && episode ? "tvshow" : "movie"),
      poster: metadata?.poster || null,
      year: metadata?.year || null,
      timestamp: Date.now(),
    }

    history.unshift(historyItem)
    if (history.length > 10) history.pop()
    localStorage.setItem("searchHistory", JSON.stringify(history))
  } else {
    // Move existing item to top
    const item = history.splice(existingIndex, 1)[0]
    item.timestamp = Date.now()
    history.unshift(item)
    localStorage.setItem("searchHistory", JSON.stringify(history))
  }

  if (season && episode) {
    const watchProgress = JSON.parse(localStorage.getItem("watchProgress")) || {}
    watchProgress[code] = {
      season: Number.parseInt(season),
      episode: Number.parseInt(episode),
      timestamp: Date.now(),
    }
    localStorage.setItem("watchProgress", JSON.stringify(watchProgress))
  }
}

// Update search button click to save to history
searchButton.addEventListener("click", async () => {
  searchInput = document.getElementById("main-search").value.trim().toLowerCase()
  const selectedRadio = document.querySelector('input[name="type"]:checked')

  if (!searchInput) {
    alert("Please enter a search query!")
    return
  }

  let season = null
  let episode = null

  if (selectedRadio.value === "tvshow") {
    season = document.getElementById("season").value
    episode = document.getElementById("episode").value

    if (!season || !episode) {
      alert("Please enter season and episode numbers!")
      return
    }

    searchInput = `${searchInput}&s=${season}&e=${episode}`
  }

  await saveToHistory(searchInput.split("&")[0], season, episode)
  loadHistory()

  const searchDiv = document.getElementById("search-div")
  const playerDiv = document.getElementById("player-div")
  searchDiv.classList.add("hidden")
  playerDiv.classList.remove("hidden")

  superembed.classList.add("active")
  twoembed.classList.remove("active")
  const isId = searchInput.startsWith("tt")
  const playerUrl = generateEmbedUrls(searchInput, "superembed", isId)
  playerContent.innerHTML = `<iframe src="${playerUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>`
})

backButton.addEventListener("click", () => {
  const searchDiv = document.getElementById("search-div")
  const playerDiv = document.getElementById("player-div")
  searchDiv.classList.remove("hidden")
  playerDiv.classList.add("hidden")
  superembed.classList.remove("active")
  twoembed.classList.remove("active")
})

superembed.addEventListener("click", () => {
  superembed.classList.add("active")
  twoembed.classList.remove("active")
  const isId = searchInput.startsWith("tt")
  const playerUrl = generateEmbedUrls(searchInput, "superembed", isId)
  playerContent.innerHTML = `<iframe src="${playerUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>`
})

twoembed.addEventListener("click", () => {
  superembed.classList.remove("active")
  twoembed.classList.add("active")
  const isId = searchInput.startsWith("tt")
  const playerUrl = generateEmbedUrls(searchInput, "twoembed", isId)
  playerContent.innerHTML = `<iframe src="${playerUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>`
})

function generateEmbedUrls(searchInput, player, isId) {
  const baseSuperembedUrl = "https://multiembed.mov/directstream.php?video_id="
  const baseTwoembedUrl = "https://www.2embed.cc/"

  if (searchInput.includes("&s=") && searchInput.includes("&e=")) {
    if (player === "superembed") {
      return `${baseSuperembedUrl}${searchInput}${isId ? "" : "&tmdb=1"}`
    } else if (player === "twoembed") {
      return `${baseTwoembedUrl}embedtv/${searchInput}`
    }
  } else {
    if (player === "superembed") {
      return `${baseSuperembedUrl}${searchInput}${isId ? "" : "&tmdb=1"}`
    } else if (player === "twoembed") {
      return `${baseTwoembedUrl}embed/${searchInput}`
    }
  }
}

// Load history on page load
document.addEventListener("DOMContentLoaded", loadHistory)

async function searchByTitle(query) {
  if (!query || query.trim().length < 2) {
    searchResults.innerHTML = '<div class="search-results-empty">Please enter at least 2 characters</div>'
    return
  }

  searchResults.innerHTML = '<div class="search-results-loading">Searching...</div>'

  try {
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
    const response = await fetch(url)
    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      searchResults.innerHTML = '<div class="search-results-empty">No results found. Try a different search term.</div>'
      return
    }

    // Filter to only movies and TV shows
    const filtered = data.results.filter((item) => item.media_type === "movie" || item.media_type === "tv")

    if (filtered.length === 0) {
      searchResults.innerHTML = '<div class="search-results-empty">No movies or TV shows found.</div>'
      return
    }

    displaySearchResults(filtered)
  } catch (error) {
    console.error("Error searching by title:", error)
    searchResults.innerHTML = '<div class="search-results-empty">Error searching. Please try again.</div>'
  }
}

function displaySearchResults(results) {
  searchResults.innerHTML = ""

  results.forEach((item) => {
    const card = document.createElement("div")
    card.className = "result-card"

    const isMovie = item.media_type === "movie"
    const title = isMovie ? item.title : item.name
    const year = isMovie ? item.release_date?.split("-")[0] : item.first_air_date?.split("-")[0]
    const poster = item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : "/img/logo.png"

    card.innerHTML = `
      <img src="${poster}" alt="${title}" onerror="this.src='/img/logo.png'">
      <div class="result-card-info">
        <div class="result-card-title">${title}</div>
        <div class="result-card-meta">${year || "N/A"}</div>
        <div class="result-card-type">${isMovie ? "Movie" : "TV Show"}</div>
      </div>
    `

    card.addEventListener("click", () => {
      playFromSearchResult(item)
    })

    searchResults.appendChild(card)
  })
}

async function playFromSearchResult(item) {
  const isMovie = item.media_type === "movie"
  const tmdbId = item.id

  // Set the code in the search input
  document.getElementById("main-search").value = tmdbId

  // Select the correct type
  if (isMovie) {
    option1.checked = true
    hiddenFields.classList.add("hidden")
  } else {
    option2.checked = true
    hiddenFields.classList.remove("hidden")
    // Set default to S1E1 for TV shows
    document.getElementById("season").value = "1"
    document.getElementById("episode").value = "1"
  }

  // Save to history with metadata
  const metadata = {
    title: isMovie ? item.title : item.name,
    type: isMovie ? "movie" : "tvshow",
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
    year: isMovie ? item.release_date?.split("-")[0] : item.first_air_date?.split("-")[0],
  }

  const code = tmdbId.toString()
  const history = JSON.parse(localStorage.getItem("searchHistory")) || []
  const existingIndex = history.findIndex((historyItem) => historyItem.code === code)

  if (existingIndex === -1) {
    const historyItem = {
      code: code,
      title: metadata.title,
      type: metadata.type,
      poster: metadata.poster,
      year: metadata.year,
      timestamp: Date.now(),
    }
    history.unshift(historyItem)
    if (history.length > 10) history.pop()
  } else {
    const historyItem = history.splice(existingIndex, 1)[0]
    historyItem.timestamp = Date.now()
    history.unshift(historyItem)
  }

  localStorage.setItem("searchHistory", JSON.stringify(history))

  // For TV shows, save watch progress
  if (!isMovie) {
    const watchProgress = JSON.parse(localStorage.getItem("watchProgress")) || {}
    watchProgress[code] = {
      season: 1,
      episode: 1,
      timestamp: Date.now(),
    }
    localStorage.setItem("watchProgress", JSON.stringify(watchProgress))
  }

  loadHistory()

  // Build search input for player
  searchInput = isMovie ? code : `${code}&s=1&e=1`

  // Switch to player view
  const searchDiv = document.getElementById("search-div")
  const playerDiv = document.getElementById("player-div")
  searchDiv.classList.add("hidden")
  playerDiv.classList.remove("hidden")

  // Load default player
  superembed.classList.add("active")
  twoembed.classList.remove("active")
  const playerUrl = generateEmbedUrls(searchInput, "superembed", false)
  playerContent.innerHTML = `<iframe src="${playerUrl}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>`
}

titleSearchButton.addEventListener("click", () => {
  const query = titleSearchInput.value.trim()
  searchByTitle(query)
})

titleSearchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = titleSearchInput.value.trim()
    searchByTitle(query)
  }
})

titleSearchInput.addEventListener("input", (e) => {
  if (e.target.value.trim().length === 0) {
    searchResults.innerHTML = ""
  }
})

let selectedResultIndex = -1

// Global keyboard shortcuts
document.addEventListener("keydown", (e) => {
  const searchDiv = document.getElementById("search-div")
  const playerDiv = document.getElementById("player-div")
  const isPlayerVisible = !playerDiv.classList.contains("hidden")
  const isSearchVisible = !searchDiv.classList.contains("hidden")

  // Escape key - Go back from player to search
  if (e.key === "Escape" && isPlayerVisible) {
    e.preventDefault()
    backButton.click()
    return
  }

  // Enter key in main search input
  if (e.key === "Enter" && document.activeElement === document.getElementById("main-search")) {
    e.preventDefault()
    searchButton.click()
    return
  }

  // Arrow keys and Enter for search results navigation
  if (isSearchVisible && searchResults.children.length > 0) {
    const resultCards = Array.from(searchResults.querySelectorAll(".result-card"))

    if (e.key === "ArrowDown") {
      e.preventDefault()
      selectedResultIndex = Math.min(selectedResultIndex + 1, resultCards.length - 1)
      highlightResult(resultCards)
      scrollToResult(resultCards[selectedResultIndex])
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      selectedResultIndex = Math.max(selectedResultIndex - 1, 0)
      highlightResult(resultCards)
      scrollToResult(resultCards[selectedResultIndex])
    } else if (e.key === "Enter" && selectedResultIndex >= 0 && selectedResultIndex < resultCards.length) {
      e.preventDefault()
      resultCards[selectedResultIndex].click()
    }
  }
})

// Helper function to highlight selected result
function highlightResult(resultCards) {
  resultCards.forEach((card, index) => {
    if (index === selectedResultIndex) {
      card.style.outline = "3px solid #0ff"
      card.style.transform = "scale(1.05)"
    } else {
      card.style.outline = "none"
      card.style.transform = "scale(1)"
    }
  })
}

// Helper function to scroll to selected result
function scrollToResult(element) {
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }
}

// Reset selected index when search results change
const originalDisplaySearchResults = displaySearchResults
displaySearchResults = (results) => {
  selectedResultIndex = -1
  originalDisplaySearchResults(results)
}
