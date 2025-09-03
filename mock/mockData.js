export const profile = {
  name: "SUPERSTAR",
};

export const upcomingSidebar = [
  {
    title: "US North Invitationals",
    startsIn: "Starts in 2hrs 32mins",
    image_url: "/bfMiniImg.jpg",
    no_of_players: "32v32",
    today: true
  },
  {
    title: "US North Grand",
    date: "5th May, 15:00 (PT)",
    image_url: "/bfMiniImg.jpg",
    no_of_players: "32v32",
    today: false
  },
];

export const hubLinks = [
  { name: "Dashboard", icon: "/home.png", selected: true},
  { name: "Tournaments", badge: "2 New", badgeColor: "text-green-500", icon: "/tournaments.png"},
  { name: "Leaderboards", icon: "/leaderboard.png"},
  { name: "News", icon: "/news.png"},
  { name: "Events", icon: "/events.png"},
];

export const configLinks = [
  { name: "Settings", icon: "/settings.png"},
  { name: "Preferences", icon: "/preferences.png"},
  { name: "Help & Contact", icon: "/help.png"}
];

export const tournamentCards = [
  { title: 'US NORTH INVITATIONALS', players: '64/64', button: 'LIMIT REACHED', date: "5th May, 15:00 (PT)"},
  { title: 'US NORTH GRAND', players: '40/64', button: 'JOIN TOURNAMENT', date: "5th May, 15:00 (PT)" },
  { title: 'EUROPE LEVEL FINALS', players: '9/64', button: 'JOIN TOURNAMENT', date: "5th May, 15:00 (PT)" },
  { title: 'EU WEST OPEN 325', players: '24/64', button: 'JOIN TOURNAMENT', date: "5th May, 15:00 (PT)" },
];


export const newsItems = [
  {
    id: 1,
    image: '/warzone.png',
    title: 'NEW 32V32 MAPS HAVE BEEN ADDED',
    date: '5 MAY, 20:00',
    description: 'Lorem ipsum dolor sit amet consectetur. Vitae cursus placerat enim sapien posuere massa suscipit proin.',
    more_link: '#'
  },
  {
    id: 2,
    image: '/warzone2.png',
    title: 'NEW GAME MODES FOR 32V32',
    date: '5 MAY, 20:00',
    description: 'Vitae cursus placerat enim sapien posuere massa suscipit proin. Ultricies rhoncus tempus turpis.',
    more_link: '#'
  },
  {
    id: 3,
    image: '/warzone2.png',
    title: 'NEW 32V32 MAPS HAVE BEEN ADDED',
    date: '5 MAY, 20:00',
    description: 'Sit id vitae urna gravida. Dolor a accumsan arcu amet diam ut accumsan.',
    more_link: '#'
  },
  {
    id: 4,
    image: '/warzone.png',
    title: 'NEW 32V32 MAPS HAVE BEEN ADDED',
    date: '5 MAY, 20:00',
    description: 'Ultricies rhoncus tempus turpis sit id vitae urna gravida. Dolor a accumsan arcu.',
    more_link: '#'
  },
];

export const matches = [
  {
    date: "JUN. 28, 2025 11:00 CEST",
    mode: "CONQUEST",
    players: "32 v 32",
    teamA: "RED DEVILS",
    teamB: "SQUAD 34",
    winner: "A",
    score: "3 - 2",
    bgImg: "/warzone.png",
    zone: "USA NORTH GRAND 32 v 32"
  },
  {
    date: "JUN. 28, 2025 13:00 CEST",
    mode: "DOMINATION",
    players: "16 v 16",
    teamA: "IRON WOLVES",
    teamB: "GHOST UNIT",
    winner: "B",
    score: "2 - 4",
    bgImg: "/warzone2.png",
    zone: "USA NORTH GRAND 32 v 32"
  },
  {
    date: "JUN. 28, 2025 15:00 CEST",
    mode: "FRONTLINES",
    players: "24 v 24",
    teamA: "VALKYRIE",
    teamB: "SHADOW SQUAD",
    winner: "A",
    score: "5 - 3",
    bgImg: "/warzone.png",
    zone: "USA NORTH GRAND 32 v 32"
  },
  {
    date: "JUN. 28, 2025 17:00 CEST",
    mode: "BREAKTHROUGH",
    players: "40 v 40",
    teamA: "BLOOD HAWKS",
    teamB: "PHANTOM CORE",
    winner: "B",
    score: "1 - 2",
    bgImg: "/warzone2.png",
    zone: "USA NORTH GRAND 32 v 32"
  },
  {
    date: "JUN. 28, 2025 19:00 CEST",
    mode: "TEAM DEATHMATCH",
    players: "12 v 12",
    teamA: "OMEGA FORCE",
    teamB: "REAPER LEGION",
    winner: "A",
    score: "6 - 4",
    bgImg: "/warzone.png",
    zone: "USA NORTH GRAND 32 v 32"
  }
];

export const teams = {
  RED: {
    INFANTRY: {
      "ALPHA SQUAD": [
        {
          name: "Ghost",
          rank: "Sergeant",
          country: "USA",
          points: 1240,
          kd: 2.3,
          winrate: 75,
          icon: "/p_icon1.png",
          country_icon: "/usa.jfif"
        },
        {
          name: "Viper",
          rank: "Corporal",
          country: "USA",
          points: 980,
          kd: 1.9,
          winrate: 60,
          icon: "/p_icon2.png",
          country_icon: "/usa.jfif"
        },
      ],
      "BRAVO SQUAD": [
        {
          name: "Falcon",
          rank: "Lieutenant",
          country: "USA",
          points: 1100,
          kd: 2.1,
          winrate: 68,
          icon: "/p_icon3.png",
          country_icon: "/usa.jfif"
        },
      ],
    },
    ARMOR: {
      "ALPHA SQUAD": [
        {
          name: "Bulldozer",
          rank: "Captain",
          country: "USA",
          points: 1500,
          kd: 3.0,
          winrate: 82,
          icon: "/bfMiniImg.jpg",
          country_icon: "/usa.jfif"
        },
        {
          name: "Rhino",
          rank: "Sergeant",
          country: "USA",
          points: 1350,
          kd: 2.5,
          winrate: 70,
          icon: "/bfMiniImg.jpg",
          country_icon: "/usa.jfif"
        },
      ],
      "BRAVO SQUAD": [
        {
          name: "Crusher",
          rank: "Lieutenant",
          country: "USA",
          points: 1420,
          kd: 2.8,
          winrate: 74,
          icon: "/bfMiniImg.jpg",
          country_icon: "/usa.jfif"
        },
      ],
    },
  },
};

export const roleIcons = {
  INFANTRY: "/infantry2.png",
  ARMOR: "/armour2.png",
  HELI: "/heli.png",
};