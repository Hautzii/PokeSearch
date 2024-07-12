<script setup lang="ts">
import { useAutocomplete } from "~/composables/useAutocomplete";
import { usePokemonStore } from "../stores/pokemonStore";
import { storeToRefs } from "pinia";
import {
  formatTypes,
  formatAbilities,
  formatHeight,
  formatWeight,
  textColor,
} from "~/composables/main";
import { onMounted, onUnmounted } from "vue";

const {
  searchInput,
  autocompleteSuggestions,
  selectedIndex,
  updateAutocompleteSuggestions,
  selectSuggestion,
  highlightMatch,
  onMakeApiCall,
} = useAutocomplete();

const pokemonStore = usePokemonStore();
const { pokemon, prominentColor } = storeToRefs(pokemonStore);

const fetchPokemon = async () => {
  toggleSprite.value = false;
  pokemonStore.setSearchInput(searchInput.value);
  await pokemonStore.fetchPokemonData();
};

const handleSuggestionClick = async (suggestion: string) => {
  selectSuggestion(suggestion);
  await fetchPokemon();
};

const toggleSprite = ref(false);

const toggleSpriteHandler = async () => {
  toggleSprite.value = !toggleSprite.value;
  if (pokemon.value) {
    const spriteUrl = toggleSprite.value ? pokemon.value.sprites.front_shiny : pokemon.value.sprites.front_default;
    await pokemonStore.setDominantColor(spriteUrl);
  }
};

const currentSprite = computed(() => {
  return pokemon.value 
    ? (toggleSprite.value ? pokemon.value.sprites.front_shiny : pokemon.value.sprites.front_default)
    : '';
});

onMounted(() => {
  const removeListener = onMakeApiCall(fetchPokemon);
  onUnmounted(removeListener);
});
</script>

<template>
  <header>
    <form @submit.prevent="fetchPokemon">
      <label for="search" class="visually-hidden">Search Bar</label>
      <div class="autocomplete-container">
        <input
          id="search"
          v-model="searchInput"
          type="text"
          autofocus
          autocomplete="off"
          spellcheck="false"
          @input="updateAutocompleteSuggestions"
        />
        <ul
          v-if="autocompleteSuggestions.length > 0"
          class="autocomplete-list"
          ref="listRef"
        >
          <li
            v-for="(suggestion, index) in autocompleteSuggestions"
            :key="suggestion"
            @click="handleSuggestionClick(suggestion)"
            :class="{ selected: index === selectedIndex }"
          >
            <template
              v-for="part in highlightMatch(suggestion, searchInput)"
              :key="partIndex"
            >
              <span :class="{ highlight: part.highlight }">{{
                part.text
              }}</span>
            </template>
          </li>
        </ul>
      </div>
      <button type="submit" aria-label="Search">
        <img src="/search.svg" alt="search icon" class="search-icon" />
      </button>
    </form>
  </header>
  <main>
    <div v-if="pokemon">
      <div class="head-container" :style="{ color: prominentColor }">
        <p class="name">{{ pokemon.name }}</p>
        <p class="id">#{{ String(pokemon.id).padStart(3, "0") }}</p>
      </div>
      <div class="main-container">
        <img
          @click="toggleSpriteHandler"
          :src="currentSprite"
          :alt="pokemon.name"
          class="sprite"
          :style="{ backgroundColor: prominentColor }"
        />
        <div class="types-abilities-container">
          <p :style="{ color: textColor(prominentColor), backgroundColor: prominentColor }">
            {{ formatTypes(pokemon.types) }}
          </p>
          <p :style="{ color: textColor(prominentColor), backgroundColor: prominentColor }">
            {{ formatAbilities(pokemon.abilities) }}
          </p>
        </div>
      </div>
      <div class="body-container">
        <p :style="{ color: textColor(prominentColor), backgroundColor: prominentColor }">{{ formatHeight(pokemon.height) }}</p>
        <p :style="{ color: textColor(prominentColor), backgroundColor: prominentColor }">{{ formatWeight(pokemon.weight) }}</p>
      </div>
      <!-- <div class="stats-container" :style=" { backgroundColor: prominentColor }">
        <p :style="{ color: textColor(prominentColor)}">HP : {{ pokemon.stats.hp }}</p>
        <p :style="{ color: textColor(prominentColor)}">Attack : {{ pokemon.stats.attack }}</p>
        <p :style="{ color: textColor(prominentColor)}">Defense : {{ pokemon.stats.defense }}</p>
        <p :style="{ color: textColor(prominentColor)}">Special Attack : {{ pokemon.stats.special_attack }}</p>
        <p :style="{ color: textColor(prominentColor)}">Special Defense : {{ pokemon.stats.special_defense }}</p>
        <p :style="{ color: textColor(prominentColor)}">Speed : {{ pokemon.stats.speed }}</p>
      </div> -->
    </div>
  </main>
</template>

<style scoped>
.head-container {
  display: flex;
  justify-content: space-between;
  font-size: 5rem;
  font-weight: bold;
  text-transform: uppercase;
  width: 100%;
}

.main-container, .body-container, .stats-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.stats-container {
  display: flex;
  flex-direction: column;
}

.body-container, .stats-container {
  margin-top: 2rem;
  font-size: 2rem;
}

.main-container p {
  font-size: 2rem;
}

.main-container {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
}

.types-abilities-container {
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
  align-items: end;
  text-align: center;
  white-space: pre-line;
}

.stats-container {
  width: 40%;
  border-radius: 1rem;
  font-size: 1.5rem;
}

.types-abilities-container p, .body-container p {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.stats-container p:first-child {
  padding-top: 1rem;
}

.stats-container p:last-child {
  padding-bottom: 1rem;
}

.types-abilities-container p:nth-child(2) {
  margin-top: 2rem;
}

.id {
  margin-left: 3rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: rect(0, 0, 0, 0);
  border: 0;
}

input {
  width: 100%;
  font-size: 3rem;
  border-radius: 10rem;
  border: none;
  text-align: center;
  outline: none;
  background-color: #ffffe3;
}

button {
  background-color: none;
  border: none;
}

.search-icon {
  position: absolute;
  left: 63%;
  top: 7.5%;
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.sprite {
  width: 192px;
  height: 192px;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: 1rem;
  padding: 1rem;
}

.sprite:hover {
  cursor: pointer;
}
</style>
