import { ref } from "vue";
import { fetchPokemonData as apiFetchPokemonData } from "../services/api";
import type { Pokemon } from "../types/Pokemon";

export const fetchPokemonData = async (input: string) => {
  const pokemon = ref<Pokemon | null>(null);
  const prominentColor = ref<string>("");

  try {
    pokemon.value = await apiFetchPokemonData(input);
    
    // Calculate dominant color from the sprite
    if (pokemon.value.sprites.front_default) {
      try {
        const dominantColor = await calculateDominantColor(pokemon.value.sprites.front_default);
        prominentColor.value = dominantColor || '#ffffe3';
      } catch (error) {
        console.error("Error calculating dominant color:", error);
        prominentColor.value = '#ffffe3';
      }
    } else {
      prominentColor.value = '#ffffe3';
    }
  } catch (error) {
    console.error(error);
  }

  return { pokemon, prominentColor };
};

export function calculateDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const colorCounts: { [key: string]: number } = {};

        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const a = imageData.data[i + 3];

          // Skip only transparent pixels
          if (a === 0) continue;

          const colorKey = `${r},${g},${b}`;
          colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        }

        let dominantColor = "";
        let maxCount = 0;

        for (const colorKey in colorCounts) {
          if (colorCounts[colorKey] > maxCount) {
            maxCount = colorCounts[colorKey];
            dominantColor = colorKey;
          }
        }

        const [r, g, b] = dominantColor.split(",").map(Number);

        // We'll keep the check for very dark colors
        if (r < 30 && g < 30 && b < 30) {
          resolve("#ffffe3"); // Fallback color for very dark colors
        } else {
          resolve(`rgb(${r}, ${g}, ${b})`);
        }
      } else {
        resolve("#ffffe3");
      }
    };

    img.onerror = (error) => {
      console.error("Error loading image:", error);
      resolve("#ffffe3");
    };

    img.src = imageUrl;
  });
}
  
function getLuminance(color: string): number {
  let r: number, g: number, b: number;

  if (color.startsWith('rgb')) {
    // Parse RGB format
    const match = color.match(/\d+/g);
    if (match) {
      [r, g, b] = match.map(Number);
    } else {
      return 0; // Default to 0 if parsing fails
    }
  } else {
    // Parse Hex format
    const hex = color.charAt(0) === '#' ? color.slice(1) : color;
    r = parseInt(hex.substr(0,2), 16);
    g = parseInt(hex.substr(2,2), 16);
    b = parseInt(hex.substr(4,2), 16);
  }

  // Normalize RGB values
  r /= 255;
  g /= 255;
  b /= 255;

  // Calculate luminance
  const luminance = 
    0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
    0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
    0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));

  return luminance;
}

export function textColor(prominentColor: string): string {
  const bgLuminance = getLuminance(prominentColor);
  
  const threshold = 0.9;

  // For debugging
  console.log(`Color: ${prominentColor}, Luminance: ${bgLuminance}, Threshold: ${threshold}`);

  // Return white text if the background luminance is below the threshold
  return bgLuminance < threshold ? '#ffffff' : '#10100e';
}
  
  // format the types and abilities
  export function formatTypes(types: any) {
    return types.join(" / ");
  }
  
  export function formatAbilities(abilities: any) {
    return abilities.map((ability: string) => ability.replace(/-/g, " ")).join(" / ");
  }
  

  export function formatHeight(height: any) {
    if (height < 10) {
      return `0.${height}m`;
    } else {
      return `${height}m`;
  }
  }

  export function formatWeight(weight: any) {
    if (weight < 10) {
      return `0.${weight}kg`;
    } else {
      return `${weight}kg`;
    }
  }

  export function formatBaseExperience(baseExperience: any) {
    return `${baseExperience}xp`;
  }

