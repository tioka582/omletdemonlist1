import List from './pages/List.js';
import CHList from './pages/CHList.js';
import PLList from './pages/PLList.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Form from './pages/Form.js'

export default [
    { path: '/', component: List },
    { path: '/ch', component: CHList },
    { path: '/pl', component: PLList },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/form', component: Form }
];
