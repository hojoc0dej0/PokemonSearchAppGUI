document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const statusMessage = document.getElementById('status-message');

    searchButton.addEventListener('click', () => {
        const query = formatQuery(searchInput.value.trim());
        if (query) {
            fetchPokemon(query);
        }
    });
    
    searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchButton.click();
    }
});

    function showError(message) {
        statusMessage.textContent = message;
        statusMessage.className = 'error';
        }
        
    function clearStatus() {
        statusMessage.textContent = '';
        statusMessage.className = '';
        }

    function formatQuery(query) {
        return query.toLowerCase().replace(/[♀]/g, '-f').replace(/[♂]/g, '-m').replace(/[^a-z0-9-]/g, '');
    }

    async function fetchPokemon(query) {
        const apiUrl = `https://pokeapi-proxy.freecodecamp.rocks/api/pokemon/${query}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Pokémon not found');
            }
            const data = await response.json();
            displayPokemonData(data);
        } catch (error) {
            clearAllData();
            showError(error.message);
        }
    }

    function displayPokemonData(data) {
        clearStatus();

        // Update Pokémon data
        document.getElementById('pokemon-name').textContent = data.name;
        document.getElementById('pokemon-id').textContent = data.id;
        document.getElementById('weight').textContent = data.weight;
        document.getElementById('height').textContent = data.height;
        
        const typesElement = document.getElementById('types');
        data.types.forEach(typeInfo => {
            const typeElement = document.createElement('div'); // Changed from span to div for better block-level handling
            typeElement.textContent = typeInfo.type.name.toUpperCase();
            typesElement.appendChild(typeElement);
        });
        
        document.getElementById('hp').textContent = data.stats.find(stat => stat.stat.name === 'hp').base_stat;
        document.getElementById('attack').textContent = data.stats.find(stat => stat.stat.name === 'attack').base_stat;
        document.getElementById('defense').textContent = data.stats.find(stat => stat.stat.name === 'defense').base_stat;
        document.getElementById('special-attack').textContent = data.stats.find(stat => stat.stat.name === 'special-attack').base_stat;
        document.getElementById('special-defense').textContent = data.stats.find(stat => stat.stat.name === 'special-defense').base_stat;
        document.getElementById('speed').textContent = data.stats.find(stat => stat.stat.name === 'speed').base_stat;

        let spriteImg = document.getElementById('sprite');
        if (!spriteImg) {
            spriteImg = document.createElement('img');
            spriteImg.id = 'sprite';
            document.getElementById('pokemon-sprites').appendChild(spriteImg);
        }
        spriteImg.src = data.sprites.front_default;
        spriteImg.alt = data.name;
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
        if (spriteImg) {
            spriteImg.remove();
        }
    }
});