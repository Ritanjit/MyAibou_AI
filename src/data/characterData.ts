// Character database for MyAibou AI
// Handles both flat arrays and nested object structures

export interface AnimeData {
  anime: string;
  characters: string[] | Record<string, string[]>;
}

export const characterData: AnimeData[] = [
  {
    anime: "Naruto / Naruto Shippuden",
    characters: [
      "Naruto Uzumaki",
      "Sasuke Uchiha",
      "Sakura Haruno",
      "Kakashi Hatake",
      "Itachi Uchiha",
      "Madara Uchiha",
      "Hinata Hyuga",
      "Gaara"
    ]
  },
  {
    anime: "One Piece",
    characters: [
      "Monkey D. Luffy",
      "Roronoa Zoro",
      "Nami",
      "Usopp",
      "Sanji",
      "Tony Tony Chopper",
      "Nico Robin",
      "Franky",
      "Brook",
      "Jinbe"
    ]
  },
  {
    anime: "Horimiya",
    characters: ["Kyoko Hori", "Izumi Miyamura"]
  },
  {
    anime: "Gintama",
    characters: ["Gintoki Sakata", "Shinpachi Shimura", "Kagura"]
  },
  {
    anime: "Attack on Titan",
    characters: [
      "Eren Yeager",
      "Levi Ackerman",
      "Mikasa Ackerman",
      "Erwin Smith",
      "Armin Arlert"
    ]
  },
  {
    anime: "Demon Slayer: Kimetsu no Yaiba",
    characters: {
      main_trio: ["Tanjiro Kamado", "Nezuko Kamado", "Zenitsu Agatsuma"],
      hashiras: [
        "Giyu Tomioka",
        "Kyojuro Rengoku",
        "Shinobu Kocho",
        "Tengen Uzui",
        "Muichiro Tokito",
        "Mitsuri Kanroji",
        "Sanemi Shinazugawa",
        "Gyomei Himejima",
        "Obanai Iguro"
      ],
      villains: ["Muzan Kibutsuji", "Kokushibo", "Akaza"]
    }
  },
  {
    anime: "Haikyuu!!",
    characters: {
      karasuno: [
        "Shoyo Hinata",
        "Tobio Kageyama",
        "Daichi Sawamura",
        "Kosuke Nishinoya",
        "Kei Tsukishima"
      ],
      non_karasuno_top: ["Toru Oikawa", "Kotaro Bokuto", "Atsumu Miya"]
    }
  },
  {
    anime: "Jujutsu Kaisen",
    characters: [
      "Satoru Gojo",
      "Yuji Itadori",
      "Megumi Fushiguro",
      "Nobara Kugisaki",
      "Ryomen Sukuna"
    ]
  },
  {
    anime: "Sword Art Online",
    characters: ["Asuna Yuuki"]
  },
  {
    anime: "Re:Zero − Starting Life in Another World",
    characters: ["Rem", "Emilia"]
  },
  {
    anime: "Rascal Does Not Dream of Bunny Girl Senpai",
    characters: ["Mai Sakurajima"]
  },
  {
    anime: "My Dress-Up Darling",
    characters: ["Marin Kitagawa", "Wakana Gojo"]
  },
  {
    anime: "Darling in the FranXX",
    characters: ["Zero Two", "Hiro"]
  },
  {
    anime: "Chainsaw Man",
    characters: ["Denji (Chainsaw Man)", "Makima", "Reze"]
  },
  {
    anime: "Spy x Family",
    characters: ["Loid Forger", "Yor Forger", "Anya Forger"]
  }
];

// Helper function to flatten all characters for search
export function getAllCharacters(): { name: string; anime: string; group?: string }[] {
  const result: { name: string; anime: string; group?: string }[] = [];

  for (const animeData of characterData) {
    if (Array.isArray(animeData.characters)) {
      for (const char of animeData.characters) {
        result.push({ name: char, anime: animeData.anime });
      }
    } else {
      // Handle nested object structure
      for (const [group, chars] of Object.entries(animeData.characters)) {
        for (const char of chars) {
          result.push({ name: char, anime: animeData.anime, group });
        }
      }
    }
  }

  return result;
}

// Get anime name for a character
export function getAnimeForCharacter(characterName: string): string | undefined {
  for (const animeData of characterData) {
    if (Array.isArray(animeData.characters)) {
      if (animeData.characters.includes(characterName)) {
        return animeData.anime;
      }
    } else {
      for (const chars of Object.values(animeData.characters)) {
        if (chars.includes(characterName)) {
          return animeData.anime;
        }
      }
    }
  }
  return undefined;
}
