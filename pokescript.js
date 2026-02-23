document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  let isLoading = false;
  const searchInput = document.getElementById('search-input');
  const statusMessage = document.getElementById('status-message');

  // --- Helpers ---
  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'error';
  }

  function clearStatus() {
    statusMessage.textContent = '';
    statusMessage.className = '';
  }

  function setLoading(isBusy) {
    isLoading = isBusy;
    searchButton.disabled = isBusy;
    searchInput.disabled = isBusy;

    const spinner = searchButton.querySelector('.spinner');
    const label = searchButton.querySelector('.btn-label');

    if (spinner && label) {
      spinner.hidden = !isBusy;
      label.textContent = isBusy ? 'Loading...' : 'Search';
    }
  };

  // Keep this proxy-friendly (it expects slugs like "mr-mime")
  // Also allow spaces/dots/apostrophes from user input.
  function formatQuery(query) {
    return query
      .toLowerCase()
      .trim()
      .replace(/♀/g, '-f')
      .replace(/♂/g, '-m')
      .replace(/[.'’]/g, '')     // mr. mime -> mr mime, farfetch’d -> farfetchd
      .replace(/\s+/g, '-')      // spaces -> hyphen
      .replace(/[^a-z0-9-]/g, ''); // strip anything else
  }

  // Fallback formatter if species lookup fails
  function fallbackDisplayName(apiName = '') {
    return apiName
      .split('-')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Try to get the official English display name from PokéAPI species endpoint.
  // Works well for Mr. Mime, Farfetch’d, Type: Null, etc.
  async function getEnglishDisplayName(data) {
    // If the proxy gives us a species name (like "mr-mime"), we can use that.
    // If not, fall back to pokemon name.
    const speciesSlug = (typeof data.species === 'string' && data.species) ? data.species : data.name;

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesSlug}`);
      if (!res.ok) throw new Error('Species lookup failed');
      const species = await res.json();
      const en = species.names?.find(n => n.language?.name === 'en');
      return en?.name || fallbackDisplayName(data.name);
    } catch {
      return fallbackDisplayName(data.name);
    }
  }

  async function fetchPokemon(query) {
    if (isLoading) return;
    
    const apiUrl = `https://pokeapi-proxy.freecodecamp.rocks/api/pokemon/${query}`;

    try {
      setLoading(true);
      clearAllData();
  
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Pokémon not found');
      }

      const data = await response.json();
      const displayName = await getEnglishDisplayName(data);
      displayPokemonData(data, displayName);
    
    } catch (error) {
      clearAllData();
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  function displayPokemonData(data, displayName) {
    clearStatus();

    const typesElement = document.getElementById('types');
    typesElement.innerHTML = '';

    document.getElementById('pokemon-name').textContent = displayName;
    document.getElementById('pokemon-id').textContent = data.id;

    const weightKg = (data.weight / 10).toFixed(1);
    const heightM = (data.height / 10).toFixed(1);

    document.getElementById('weight').textContent = `${weightKg} kg`;
    document.getElementById('height').textContent = `${heightM} m`;

    data.types.forEach(typeInfo => {
      const typeName = typeInfo.type.name; 
      const typeElement = document.createElement('div');

      typeElement.textContent = typeName.toUpperCase();
      typeElement.className = `type-chip type-${typeName}`;
      
      typesElement.appendChild(typeElement);
    });

    document.getElementById('hp').textContent =
      data.stats.find(stat => stat.stat.name === 'hp').base_stat;
    document.getElementById('attack').textContent =
      data.stats.find(stat => stat.stat.name === 'attack').base_stat;
    document.getElementById('defense').textContent =
      data.stats.find(stat => stat.stat.name === 'defense').base_stat;
    document.getElementById('special-attack').textContent =
      data.stats.find(stat => stat.stat.name === 'special-attack').base_stat;
    document.getElementById('special-defense').textContent =
      data.stats.find(stat => stat.stat.name === 'special-defense').base_stat;
    document.getElementById('speed').textContent =
      data.stats.find(stat => stat.stat.name === 'speed').base_stat;

    // Sprite
    let spriteImg = document.getElementById('sprite');
    if (!spriteImg) {
      spriteImg = document.createElement('img');
      spriteImg.id = 'sprite';
      document.getElementById('pokemon-sprites').appendChild(spriteImg);
    }
    spriteImg.src = data.sprites.front_default;
    spriteImg.alt = displayName;
  }

  function clearAllData() {
    document.getElementById('pokemon-name').textContent = '';
    document.getElementById('pokemon-id').textContent = '';
    document.getElementById('weight').textContent = '';
    document.getElementById('height').textContent = '';
    document.getElementById('types').textContent = '';
    document.getElementById('hp').textContent = '';
    document.getElementById('attack').textContent = '';
    document.getElementById('defense').textContent = '';
    document.getElementById('special-attack').textContent = '';
    document.getElementById('special-defense').textContent = '';
    document.getElementById('speed').textContent = '';
    const spriteImg = document.getElementById('sprite');
    if (spriteImg) spriteImg.remove();
  }

  // --- Events ---
  function runSearch() {
    const query = formatQuery(searchInput.value);
    if (query) fetchPokemon(query);
  }

  searchButton.addEventListener('click', runSearch);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch();
    }
  });

  searchInput.addEventListener('input', clearStatus);
});

