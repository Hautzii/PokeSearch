import { defineStore } from 'pinia';

export const useAbilityStore = defineStore('ability', {
  state: () => ({
    abilityDescriptions: {} as Record<string, string>,
  }),
  actions: {
    async fetchAbilityDescription(abilityName: string) {
      if (this.abilityDescriptions[abilityName]) return;
      
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`);
        const data = await response.json();
        const description = data.effect_entries.find((entry: any) => entry.language.name === 'en')?.effect || 'No description available.';
        this.abilityDescriptions[abilityName] = description;
      } catch (error) {
        console.error(`Error fetching ability description for ${abilityName}:`, error);
        this.abilityDescriptions[abilityName] = 'Failed to load description.';
      }
    },
  },
});