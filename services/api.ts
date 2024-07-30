import axios from 'axios'
import type { Pokemon } from '../types/Pokemon'

const BASE_API_URL = "https://pokeapi.co/api/v2/pokemon/"

export async function fetchPokemonData(searchInput: string): Promise<Pokemon> {
  const response = await axios.get(`${BASE_API_URL}/${searchInput}`)

  const tooltipUrl = response.data.abilities.map((ability: any) => ability.ability.url);

  async function fetchAbilityEffect(tooltipUrl: string): Promise<string> {
    const response = await axios.get(tooltipUrl);
    const effectEntry = response.data.effect_entries.find((entry: any) => entry.language.name === 'en');
    return effectEntry ? effectEntry.effect : 'No effect description available';
  }
  
  if (!response.data || !Array.isArray(response.data.stats)) {
    throw new Error('Invalid response data structure');
  }

  const getStatValue = (statName: string) => {
    const stat = response.data.stats.find((s: any) => s.stat.name === statName);
    return stat ? stat.base_stat : 0;
  };

  const abilityEffects = await Promise.all(
    response.data.abilities.map((ability: any) => fetchAbilityEffect(ability.ability.url))
  );

  return {
    name: response.data.name,
    id: response.data.id,
    types: response.data.types?.map((type: any) => type?.type?.name) || [],
    sprites: response.data.sprites,
    abilities: response.data.abilities?.map((ability: any) => ability?.ability?.name) || [],
    tooltip: abilityEffects.join('\n'),
    stats: {
      hp: getStatValue('hp'),
      attack: getStatValue('attack'),
      defense: getStatValue('defense'),
      special_attack: getStatValue('special-attack'),
      special_defense: getStatValue('special-defense'),
      speed: getStatValue('speed')
    }
  };
}