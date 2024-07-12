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
        this.pokemon = await fetchPokemonData(this.searchInput)
        
        if (this.pokemon.sprites.front_default) {
          try {
            this.prominentColor = await calculateDominantColor(this.pokemon.sprites.front_default) || '#ffffe3'
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
    }
  }
})