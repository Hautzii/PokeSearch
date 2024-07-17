// composables/useAutocomplete.ts

import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

export function useAutocomplete() {
  const BASE_API_URL = "https://pokeapi.co/api/v2/pokemon/";
  const searchInput = ref('');
  const allPokemonNames = ref<string[]>([]);
  const autocompleteSuggestions = ref<string[]>([]);
  const selectedIndex = ref(-1);

  const fetchAllPokemonNames = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}?limit=1200`);
      allPokemonNames.value = response.data.results.map((pokemon: any) => pokemon.name);
    } catch (error) {
      console.error("Error fetching Pokémon names:", error);
    }
  };

  const updateAutocompleteSuggestions = () => {
    if (searchInput.value.length > 0) {
      autocompleteSuggestions.value = allPokemonNames.value.filter(name =>
        name.toLowerCase().startsWith(searchInput.value.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
    } else {
      autocompleteSuggestions.value = [];
    }
    selectedIndex.value = -1; // Reset selected index when suggestions change
  };

  const hideKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const selectSuggestion = (suggestion: string) => {
    searchInput.value = suggestion;
    autocompleteSuggestions.value = [];
    selectedIndex.value = -1;
    hideKeyboard();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return [{ text, highlight: false }];
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => ({
      text: part,
      highlight: index % 2 === 1
    }));
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (autocompleteSuggestions.value.length === 0 && e.key !== 'Enter') return;
  
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex.value = (selectedIndex.value + 1) % autocompleteSuggestions.value.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex.value = (selectedIndex.value - 1 + autocompleteSuggestions.value.length) % autocompleteSuggestions.value.length;
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex.value !== -1) {
          selectSuggestion(autocompleteSuggestions.value[selectedIndex.value]);
        }
        hideKeyboard();
        // Emit an event to signal that the API call should be made
        window.dispatchEvent(new CustomEvent('makeApiCall'));
        break;
    }
  };

  const onMakeApiCall = (callback: () => void) => {
    window.addEventListener('makeApiCall', callback);
    return () => window.removeEventListener('makeApiCall', callback);
  };

  onMounted(() => {
    fetchAllPokemonNames();
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  return {
    searchInput,
    autocompleteSuggestions,
    selectedIndex,
    onMakeApiCall,
    updateAutocompleteSuggestions,
    selectSuggestion,
    highlightMatch,
    hideKeyboard
  };
}