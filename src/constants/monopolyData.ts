import { CallerSdkTypeEnum } from "firebase/data-connect";

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
  | { kind: "moveNearest"; group: "railroad" | "utility"; passGo?: boolean }
  | { kind: "back"; spaces: number }
  | { kind: "repairs"; perHouse: number; perHotel: number }
  | { kind: "getOutOfJailFree" }
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
    text: "Advance to Go (Collect $200).",
    effect: { kind: "move", position: 0, passGo: true },
  },
  {
    id: "chance-boardwalk",
    type: "chance",
    text: "Advance to Boardwalk.",
    effect: { kind: "move", position: 39, passGo: true },
  },
  {
    id: "chance-illinois",
    type: "chance",
    text: "Advance to Illinois Avenue. If you pass Go, collect $200.",
    effect: { kind: "move", position: 24, passGo: true },
  },
  {
    id: "chance-st-charles",
    type: "chance",
    text: "Advance to St. Charles Place. If you pass Go, collect $200.",
    effect: { kind: "move", position: 11, passGo: true },
  },
  {
    id: "chance-utility-nearest",
    type: "chance",
    text: "Advance to the nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times amount thrown.",
    effect: { kind: "moveNearest", group: "utility", passGo: true },
  },
  {
    id: "chance-railroad-nearest-1",
    type: "chance",
    text: "Advance to the nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay owner twice the rental to which they are otherwise entitled.",
    effect: { kind: "moveNearest", group: "railroad", passGo: true },
  },
  {
    id: "chance-railroad-nearest-2",
    type: "chance",
    text: "Advance to the nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay owner twice the rental to which they are otherwise entitled.",
    effect: { kind: "moveNearest", group: "railroad", passGo: true },
  },
  {
    id: "chance-bank-dividend",
    type: "chance",
    text: "Bank pays you dividend of $50.",
    effect: { kind: "bank", amount: 50 },
  },
  {
    id: "chance-get-out-of-jail",
    type: "chance",
    text: "Get Out of Jail Free. This card may be kept until needed or traded.",
    effect: { kind: "getOutOfJailFree" },
  },
  {
    id: "chance-back-3",
    type: "chance",
    text: "Go Back 3 Spaces.",
    effect: { kind: "back", spaces: 3 },
  },
  {
    id: "chance-jail",
    type: "chance",
    text: "Go to Jail. Go directly to Jail, do not pass Go, do not collect $200.",
    effect: { kind: "gotoJail" },
  },
  {
    id: "chance-repairs",
    type: "chance",
    text: "Make general repairs on all your property. For each house pay $25. For each hotel pay $100.",
    effect: { kind: "repairs", perHouse: 25, perHotel: 100 },
  },
  {
    id: "chance-speeding-fine",
    type: "chance",
    text: "Speeding fine $15.",
    effect: { kind: "bank", amount: -15 },
  },
  {
    id: "chance-reading-railroad",
    type: "chance",
    text: "Take a trip to Reading Railroad. If you pass Go, collect $200.",
    effect: { kind: "move", position: 5, passGo: true },
  },
  {
    id: "chance-chairman",
    type: "chance",
    text: "You have been elected Chairman of the Board. Pay each player $50.",
    effect: { kind: "each", amount: -50 },
  },
  {
    id: "chance-building-loan",
    type: "chance",
    text: "Your building loan matures. Collect $150.",
    effect: { kind: "bank", amount: 150 },
  },
];

export const COMMUNITY_CARDS: Card[] = [
  // Classic set mapped to our board indexing
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
    id: "comm-get-out-of-jail",
    type: "community",
    text: "Get Out of Jail Free. This card may be kept until needed or traded.",
    effect: { kind: "getOutOfJailFree" },
  },
  {
    id: "comm-go-to-jail",
    type: "community",
    text: "Go to Jail. Do not pass GO. Do not collect $200.",
    effect: { kind: "gotoJail" },
  },
  {
    id: "comm-grand-opera",
    type: "community",
    text: "Grand Opera Opening. Collect $50 from every player.",
    effect: { kind: "each", amount: 50 },
  },
  {
    id: "comm-holiday-fund",
    type: "community",
    text: "Holiday Fund matures. Receive $100.",
    effect: { kind: "bank", amount: 100 },
  },
  {
    id: "comm-income-tax-refund",
    type: "community",
    text: "Income tax refund. Collect $20.",
    effect: { kind: "bank", amount: 20 },
  },
  {
    id: "comm-birthday",
    type: "community",
    text: "It is your birthday. Collect $10 from every player.",
    effect: { kind: "each", amount: 10 },
  },
  {
    id: "comm-life-insurance",
    type: "community",
    text: "Life insurance matures. Collect $100.",
    effect: { kind: "bank", amount: 100 },
  },
  {
    id: "comm-hospital-fees",
    type: "community",
    text: "Hospital Fees. Pay $50.",
    effect: { kind: "bank", amount: -50 },
  },
  {
    id: "comm-school-fees",
    type: "community",
    text: "School Fees. Pay $50.",
    effect: { kind: "bank", amount: -50 },
  },
  {
    id: "comm-consultancy",
    type: "community",
    text: "Receive $25 consultancy fee.",
    effect: { kind: "bank", amount: 25 },
  },
  {
    id: "comm-street-repairs",
    type: "community",
    text: "You are assessed for street repairs: $40 per house, $115 per hotel.",
    effect: { kind: "repairs", perHouse: 40, perHotel: 115 },
  },
  {
    id: "comm-beauty-contest",
    type: "community",
    text: "You have won second prize in a beauty contest. Collect $10.",
    effect: { kind: "bank", amount: 10 },
  },
  {
    id: "comm-inherit-100",
    type: "community",
    text: "You inherit $100.",
    effect: { kind: "bank", amount: 100 },
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
