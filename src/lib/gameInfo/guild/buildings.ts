type LogRequirement = {
  name: string;
  amount: number;
};

type OtherMaterialRequirement = {
  name: string;
  amount: number;
};

type BuildingRequirement = {
  level: number;
  credits: number;
  coins: number;
  log: LogRequirement;
  otherMaterials: OtherMaterialRequirement[];
};

type GuildBuilding = {
  name: string;
  maxLevel: number;
  levelUpCosts: BuildingRequirement[];
};

const guildHall: GuildBuilding = {
  name: "Hall",
  maxLevel: 7,
  levelUpCosts: [
    {
      level: 25,
      credits: 100,
      coins: 250_000,
      log: { name: "Pine", amount: 5_000 },
      otherMaterials: [
        { name: "Copper Ore", amount: 5_000 },
        { name: "Peony", amount: 5_000 },
        { name: "Raw Shrimp", amount: 5_000 },
        { name: "Bone", amount: 5_000 },
      ],
    },
  ],
};

const guildLibrary: GuildBuilding = {
  name: "Library",
  maxLevel: 7,
  levelUpCosts: [
    {
      level: 25,
      credits: 100,
      coins: 500_000,
      log: { name: "Pine", amount: 5_000 },
      otherMaterials: [{ name: "Apple", amount: 250 }],
    },
  ],
};

const guildBank: GuildBuilding = {
  name: "Bank",
  maxLevel: 7,
  levelUpCosts: [
    {
      level: 25,
      credits: 100,
      coins: 500_000,
      log: { name: "Pine", amount: 5_000 },
      otherMaterials: [{ name: "Ruby", amount: 500 }],
    },
  ],
};

const guildStorehouse: GuildBuilding = {
  name: "Storehouse",
  maxLevel: 7,
  levelUpCosts: [
    {
      level: 25,
      credits: 100,
      coins: 500_000,
      log: { name: "Pine", amount: 5_000 },
      otherMaterials: [{ name: "Copper Bar", amount: 1_000 }],
    },
  ],
};

const guildWorkshop: GuildBuilding = {
  name: "Workshop",
  maxLevel: 7,
  levelUpCosts: [
    {
      level: 25,
      credits: 100,
      coins: 500_000,
      log: { name: "Pine", amount: 5_000 },
      otherMaterials: [{ name: "Copper Bar", amount: 1_000 }],
    },
  ],
};

const guildArmoury: GuildBuilding = {
  name: "Armoury",
  maxLevel: 7,
  levelUpCosts: [
    {
      level: 25,
      credits: 100,
      coins: 500_000,
      log: { name: "Pine", amount: 5_000 },
      otherMaterials: [{ name: "Copper Bar", amount: 1_000 }],
    },
  ],
};

const guildEventHall: GuildBuilding = {
  name: "Event Hall",
  maxLevel: 7,
  levelUpCosts: [
    {
      level: 25,
      credits: 100,
      coins: 500_000,
      log: { name: "Pine", amount: 5_000 },
      otherMaterials: [
        { name: "Copper Ore", amount: 5_000 },
        { name: "Peony", amount: 5_000 },
        { name: "Raw Shrimp", amount: 5_000 },
        { name: "Bone", amount: 5_000 },
      ],
    },
  ],
};

export {
  guildArmoury,
  guildBank,
  guildEventHall,
  guildHall,
  guildLibrary,
  guildStorehouse,
  guildWorkshop,
};
