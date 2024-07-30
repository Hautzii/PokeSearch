<script setup lang="ts">
import { useAutocomplete } from "~/composables/useAutocomplete";
import { usePokemonStore } from "../stores/pokemonStore";
import { useAbilityStore } from "../stores/abilityStore";
import { storeToRefs } from "pinia";
import {
  formatTypes,
  textColor,
  formatStatName,
  getGradient,
  toggleSprite,
  toggleSpriteHandler,
  getCurrentSprite,
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
const abilityStore = useAbilityStore();
const { pokemon, prominentColor } = storeToRefs(pokemonStore);

const fetchPokemon = async () => {
  try {
    toggleSprite.value = false;
    pokemonStore.setSearchInput(searchInput.value);
    autocompleteSuggestions.value = [];
    await pokemonStore.fetchPokemonData();
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
  }
};


const handleSuggestionClick = async (suggestion: string) => {
  selectSuggestion(suggestion);
  autocompleteSuggestions.value = [];
  await fetchPokemon();
};

const currentSprite = computed(() => getCurrentSprite(pokemon.value));

const handleToggleSprite = async () => {
  await toggleSpriteHandler(pokemon.value, pokemonStore);
};

const isModalOpen = ref(false);
const modalContent = ref({ abilities: '', tooltip: '' });

const openModal = async (abilityName: string) => {
  await abilityStore.fetchAbilityDescription(abilityName);
  modalContent.value = {
    abilities: abilityName,
    tooltip: abilityStore.abilityDescriptions[abilityName],
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

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
        <img @click="handleToggleSprite" :src="currentSprite" :alt="pokemon.name" class="sprite" :style="{ backgroundColor: prominentColor }" />
        <div class="types-abilities-container">
          <p :style="{ color: textColor(prominentColor), backgroundColor: prominentColor }">
            {{ formatTypes(pokemon.types) }}
          </p>
          <div class="abilities-container">
            <div 
            :style="{ color: textColor(prominentColor), backgroundColor: prominentColor, cursor: 'pointer' }"
              class="ability-item"
            >
            <template v-for="(ability, index) in pokemon.abilities" :key="ability">
              <span @click="openModal(ability)" class="ability">{{ ability }}</span>
              <span v-if="index < pokemon.abilities.length - 1" class="ability-separator">/</span>
            </template>
            </div>
          </div>
        </div>
      </div>
        <div class="stats-container">
        <div v-for="(value, key) in pokemon.stats" :key="key" class="stat-row">
          <span class="stat-name">{{ formatStatName(key) }}:</span>
          <div class="stat-bar-container">
            <div class="stat-bar" :style="{ width: `${(value / 255) * 100}%`, background: getGradient(prominentColor)}"></div>
            <span class="stat-value">{{ value }}</span>
          </div>
        </div>
      </div>
      </div>
  </main>
  <Transition name="modal">
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop :style="{ color: textColor(prominentColor), backgroundColor: prominentColor }">
      <button :style="{ color: textColor(prominentColor), backgroundColor: prominentColor }" class="close-button" @click="closeModal">&times;</button>
      <h2 class="ability-name">{{ modalContent.abilities }}</h2>
      <p>{{ modalContent.tooltip }}</p>
    </div>
  </div>
  </Transition>
</template>

<style scoped>

.ability-separator {
  margin: 0 0.25em;
}

.ability-name {
  text-transform: uppercase;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 80%;
  max-height: 80%;
  font-size: 2rem;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: -.75rem;
  right: .75rem;
  font-size: 4rem;
  background: none;
  border: none;
  cursor: pointer;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content {
  transition: all 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

.head-container {
  display: flex;
  justify-content: space-between;
  font-size: 5rem;
  font-weight: bold;
  text-transform: uppercase;
  width: 100%;
}

.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.body-container {
  margin-top: 2rem;
  font-size: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 35%;
  border-radius: .5rem;
  padding: .5rem 1rem;
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

.types-abilities-container p {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.abilities-container {
  margin-top: 1rem;
}

.ability-item {
  display: flex;
  align-items: center;
  padding: .5rem 1rem;
  border-radius: 0.5rem;
  font-size: 2rem;
}

.stats-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 450px;
  gap: 0.25rem;
  margin-top: 2rem;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.stat-name {
  width: 150px;
  text-align: right;
  flex-shrink: 0;
  font-size: 1.5rem;
}

.stat-bar-container {
  flex-grow: 1;
  height: 20px;
  background-color: #181818;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.stat-bar {
  height: 100%;
  border-radius: 10px;
}

.stat-value {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  color: #ffffe3;
  font-weight: bold;
  font-size: 1.5rem;
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
  top: 7.25%;
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

@media screen and (max-width: 768px) {
  .stats-container {
    width: 350px;
  }
  
  form {
    width: 90%;
    max-width: none;
    margin: 0 auto;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .autocomplete-container {
    width: 100%;
  }
  
  input {
    width:90%;
    font-size: 2rem;
    padding: 0.5rem;
  }
  
  .search-icon {
    position: absolute;
    left: 80%;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
  }

  .head-container {
    font-size: 4rem;
    justify-content: space-around;
  }

  .main-container {
    align-items: center;
      max-width: 90vw;
  }

  .sprite {
    width: 150px;
    height: 150px;
  }

  .types-abilities-container {
    margin-left: 0;
    margin-top: 1rem;
  }

  .ability-item {
    font-size: 1.5rem;
  }

  .modal-content {
    max-width: 70vw;
  }
}
</style>
