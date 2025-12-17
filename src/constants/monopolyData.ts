export const STARTING_MONEY = 1500;
export const PASS_GO_AMOUNT = 200;
export const HOUSE_COST = 50;
export const HOTEL_COST = 200;
export const TOTAL_HOUSES = 32; // Classic house limit
export const TOTAL_HOTELS = 12; // Classic hotel limit

export const GAME_PIECES = [
  { id: "car", name: "Car", icon: "/images/Racecar.svg" },
  { id: "ship", name: "Ship", icon: "/images/Battleship.svg" },
  { id: "cat", name: "Cat", icon: "/images/cat.svg" },
  { id: "dog", name: "Dog", icon: "/images/Scottie.svg" },
  { id: "wheelbarrow", name: "Wheelbarrow", icon: "/images/Wheelbarrow.svg" },
  { id: "hat", name: "Hat", icon: "/images/Top_Hat.svg" },
  { id: "thimble", name: "Sewing", icon: "/images/Thimble.svg" },
  { id: "iron", name: "Iron", icon: "/images/Iron.svg" },
];

export const PROPERTIES = [
  // Purple Properties - Low Value District
  {
    name: "Maple Lane",
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    color: "bg-purple-700",
    group: "purple",
  },
  {
    name: "Oak Street",
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    color: "bg-purple-700",
    group: "purple",
  },
  // Light Blue Properties - Residential Area
  {
    name: "Pine Avenue",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    color: "bg-cyan-600",
    group: "lightblue",
  },
  {
    name: "Birch Boulevard",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    color: "bg-cyan-600",
    group: "lightblue",
  },
  {
    name: "Cedar Court",
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    color: "bg-cyan-600",
    group: "lightblue",
  },
  // Pink Properties - Suburban District
  {
    name: "Willow Way",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    color: "bg-pink-600",
    group: "pink",
  },
  {
    name: "Elm Plaza",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    color: "bg-pink-600",
    group: "pink",
  },
  {
    name: "Aspen Drive",
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    color: "bg-pink-600",
    group: "pink",
  },
  // Orange Properties - Commercial Zone
  {
    name: "Sycamore Square",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    color: "bg-orange-600",
    group: "orange",
  },
  {
    name: "Redwood Road",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    color: "bg-orange-600",
    group: "orange",
  },
  {
    name: "Magnolia Mile",
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    color: "bg-orange-600",
    group: "orange",
  },
  // Red Properties - Business District
  {
    name: "Hickory Heights",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    color: "bg-red-700",
    group: "red",
  },
  {
    name: "Spruce Parkway",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    color: "bg-red-700",
    group: "red",
  },
  {
    name: "Poplar Plaza",
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    color: "bg-red-700",
    group: "red",
  },
  // Yellow Properties - Upscale Area
  {
    name: "Cypress Circle",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    color: "bg-yellow-600",
    group: "yellow",
  },
  {
    name: "Juniper Junction",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    color: "bg-yellow-600",
    group: "yellow",
  },
  {
    name: "Sequoia Summit",
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    color: "bg-yellow-600",
    group: "yellow",
  },
  // Green Properties - Premium District
  {
    name: "Dogwood Drive",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    color: "bg-green-700",
    group: "green",
  },
  {
    name: "Chestnut Center",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    color: "bg-green-700",
    group: "green",
  },
  {
    name: "Laurel Landing",
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    color: "bg-green-700",
    group: "green",
  },
  // Dark Blue Properties - Luxury Estates
  {
    name: "Rosewood Row",
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    color: "bg-blue-800",
    group: "darkblue",
  },
  {
    name: "Diamond District",
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    color: "bg-blue-800",
    group: "darkblue",
  },
  // Railroads - Transit Lines
  {
    name: "North Line",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "South Line",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "East Line",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  {
    name: "West Line",
    price: 200,
    rent: [25, 50, 100, 200],
    color: "bg-gray-600",
    group: "railroad",
  },
  // Utilities
  {
    name: "Power Grid",
    price: 150,
    rent: [],
    color: "bg-yellow-500",
    group: "utility",
  },
  {
    name: "Water Supply",
    price: 150,
    rent: [],
    color: "bg-blue-400",
    group: "utility",
  },
];

export const BOARD_SPACES = [
  "GO",
  "Maple Lane",
  "Community Chest",
  "Oak Street",
  "Income Tax",
  "North Line",
  "Pine Avenue",
  "Chance",
  "Birch Boulevard",
  "Cedar Court",
  "Just Visiting / Jail",
  "Willow Way",
  "Power Grid",
  "Elm Plaza",
  "Aspen Drive",
  "South Line",
  "Sycamore Square",
  "Community Chest",
  "Redwood Road",
  "Magnolia Mile",
  "Free Parking",
  "Hickory Heights",
  "Chance",
  "Spruce Parkway",
  "Poplar Plaza",
  "East Line",
  "Cypress Circle",
  "Juniper Junction",
  "Water Supply",
  "Sequoia Summit",
  "Go To Jail",
  "Dogwood Drive",
  "Chestnut Center",
  "Community Chest",
  "Laurel Landing",
  "West Line",
  "Chance",
  "Rosewood Row",
  "Luxury Tax",
  "Diamond District",
];

export const JAIL_INDEX = 10;

export type CardType = "chance" | "community";
export type CardEffect =
  | { kind: "bank"; amount: number } // positive collects, negative pays bank
  | { kind: "each"; amount: number } // collect from each (positive) or pay each (negative)
  | { kind: "move"; position: number; passGo?: boolean }
  | { kind: "gotoJail" };

export interface Card {
  id: string;
  type: CardType;
  text: string;
  effect: CardEffect;
}

export const CHANCE_CARDS: Card[] = [
  {
    id: "chance-go",
    type: "chance",
    text: "Advance to GO. Collect $200.",
    effect: { kind: "move", position: 0, passGo: true },
  },
  {
    id: "chance-bank-dividend",
    type: "chance",
    text: "Bank pays you dividend of $50.",
    effect: { kind: "bank", amount: 50 },
  },
  {
    id: "chance-speeding-fine",
    type: "chance",
    text: "Speeding fine $15.",
    effect: { kind: "bank", amount: -15 },
  },
  {
    id: "chance-jail",
    type: "chance",
    text: "Go to Jail. Do not pass GO. Do not collect $200.",
    effect: { kind: "gotoJail" },
  },
  {
    id: "chance-pay-each",
    type: "chance",
    text: "Pay each player $50.",
    effect: { kind: "each", amount: -50 },
  },
];

export const COMMUNITY_CARDS: Card[] = [
  {
    id: "comm-bank-error",
    type: "community",
    text: "Bank error in your favor. Collect $200.",
    effect: { kind: "bank", amount: 200 },
  },
  {
    id: "comm-doctor",
    type: "community",
    text: "Doctor's fee. Pay $50.",
    effect: { kind: "bank", amount: -50 },
  },
  {
    id: "comm-go",
    type: "community",
    text: "Advance to GO. Collect $200.",
    effect: { kind: "move", position: 0, passGo: true },
  },
  {
    id: "comm-collect-each",
    type: "community",
    text: "It is your birthday. Collect $10 from every player.",
    effect: { kind: "each", amount: 10 },
  },
  {
    id: "comm-go-to-jail",
    type: "community",
    text: "Go to Jail. Do not pass GO. Do not collect $200.",
    effect: { kind: "gotoJail" },
  },
];

export const PLAYER_COLORS = [
  "bg-red-600",
  "bg-blue-600",
  "bg-green-600",
  "bg-yellow-500",
  "bg-purple-600",
  "bg-pink-600",
  "bg-orange-600",
  "bg-teal-600",
];
