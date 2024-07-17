import { defineStore } from 'pinia'
import { calculateDominantColor } from '../composables/main'
import { fetchPokemonData } from '../services/api'
import type { Pokemon } from '../types/Pokemon'

export const usePokemonStore = defineStore('pokemon', {
  state: () => ({
    pokemon: null as Pokemon | null,
    prominentColor: '',
    searchInput: '',
    textColor: '',
  }),
  actions: {
    async fetchPokemonData() {
      try {
        // Convert searchInput to lowercase before making the API call
        const lowercaseInput = this.searchInput.toLowerCase()
        this.pokemon = await fetchPokemonData(lowercaseInput)
        
        if (this.pokemon.sprites.front_default) {
          try {
            const defaultSprite = this.pokemon.sprites.front_default;
            this.prominentColor = await calculateDominantColor(defaultSprite) || '#ffffe3'
          } catch (error) {
            console.error("Error calculating dominant color:", error)
            this.prominentColor = '#ffffe3'
          }
        } else {
          this.prominentColor = '#ffffe3'
        }
      } catch (error) {
        console.error(error)
        this.pokemon = null
      }
    },
    setSearchInput(input: string) {
      this.searchInput = input
    },
    async setDominantColor(spriteUrl: string) {
      const color = await calculateDominantColor(spriteUrl);
      this.prominentColor = color;
    }
  }
})