// tournamentData.js
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
  { title: 'EU WEST OPEN 325', players: '24/64', button: 'JOIN TOURNAMENT', date: "5th May, 15:00 (PT)" }
];
