export interface Pokemon {
    id: number
    name: string
    types: string[]
    abilities: string[]
    tooltip: string
    stats: {
        hp: number
        attack: number
        defense: number
        special_attack: number
        special_defense: number
        speed: number
    }
    sprites: {
        front_default: string
        front_shiny: string
    }
}