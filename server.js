const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const path     = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { pingInterval: 10_000, pingTimeout: 5_000 });

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) =>
  res.json({ ok: true, rooms: rooms.size, players: io.engine.clientsCount })
);

// ─── Word bank ──────────────────────────────────────────────────────────────
const wordBank = {
  comida: [
    'pizza', 'sushi', 'hamburguesa', 'tacos', 'pasta', 'helado', 'ramen', 'pancakes',
    'bistec', 'lasaña', 'curry', 'sashimi', 'burrito', 'waffles', 'nachos', 'ceviche',
    'empanadas', 'paella', 'hot dog', 'arroz', 'pollo frito', 'donas', 'churros',
    'chocolate', 'queso', 'papas fritas', 'aguacate', 'tortilla', 'enchiladas', 'tamales',
    'chilaquiles', 'pozole', 'flan', 'brownie', 'cheesecake', 'croissant', 'crepes',
    'tiramisú', 'salmón', 'camarones', 'guacamole', 'sandwich', 'quesadilla', 'dim sum',
    'pho', 'shawarma', 'kebab', 'pad thai', 'gelato', 'macarons',
  ],
  animales: [
    'elefante', 'delfín', 'pingüino', 'jirafa', 'tigre', 'canguro', 'pulpo', 'lobo',
    'flamenco', 'tiburón', 'guepardo', 'koala', 'gorila', 'pavorreal', 'ornitorrinco',
    'oso polar', 'panda', 'rinoceronte', 'cocodrilo', 'hipopótamo', 'águila', 'serpiente',
    'loro', 'gato', 'perro', 'caballo', 'vaca', 'cerdo', 'gallina', 'conejo', 'ardilla',
    'zorro', 'oso', 'ballena', 'mariposa', 'abeja', 'araña', 'escorpión', 'camaleón',
    'llama', 'alpaca', 'bisonte', 'cebra', 'leopardo', 'jaguar', 'puma', 'mono',
    'tortuga', 'medusa', 'cangrejo',
  ],
  peliculas: [
    'Titanic', 'Inception', 'Avengers', 'Joker', 'El Rey León', 'Frozen', 'Interestelar',
    'Parasite', 'The Matrix', 'Shrek', 'Gladiador', 'Toy Story', 'Forrest Gump',
    'Pulp Fiction', 'Up', 'Avatar', 'El Padrino', 'Star Wars', 'Jurassic Park',
    'El Señor de los Anillos', 'Harry Potter', 'Spider-Man', 'Batman', 'Coco', 'Moana',
    'Encanto', 'Ratatouille', 'WALL-E', 'Buscando a Nemo', 'Monsters Inc', 'Shutter Island',
    'La La Land', 'Bohemian Rhapsody', 'Mad Max', 'Rápidos y Furiosos', 'John Wick',
    'Top Gun', 'Karate Kid', 'Rocky', 'Terminator', 'Alien', 'Scarface', 'Titanic',
    'Black Panther', 'Thor', 'Iron Man', 'Doctor Strange', 'Deadpool', 'Oppenheimer',
    'Barbie', 'Dune',
  ],
  deportes: [
    'fútbol', 'baloncesto', 'tenis', 'natación', 'boxeo', 'golf', 'voleibol', 'ciclismo',
    'surf', 'lucha libre', 'gimnasia', 'esquí', 'tiro con arco', 'esgrima', 'remo',
    'béisbol', 'rugby', 'atletismo', 'MMA', 'judo', 'karate', 'taekwondo', 'escalada',
    'patinaje', 'Fórmula 1', 'motociclismo', 'triatlón', 'waterpolo', 'ping pong',
    'bádminton', 'hockey', 'cricket', 'snowboard', 'halterofilia', 'maratón',
    'parkour', 'skateboarding', 'breakdance', 'esports', 'pádel', 'fútbol americano',
    'handball', 'polo', 'equitación', 'paracaidismo', 'windsurf', 'kayak',
  ],
  lugares: [
    'París', 'Tokio', 'Nueva York', 'Sídney', 'El Cairo', 'Roma', 'Bangkok', 'Londres',
    'Dubái', 'Barcelona', 'Río de Janeiro', 'Ámsterdam', 'Marrakech', 'Venecia',
    'Singapur', 'Los Ángeles', 'Ciudad de México', 'Buenos Aires', 'Moscú', 'Pekín',
    'Mumbai', 'Toronto', 'Chicago', 'Miami', 'Las Vegas', 'Berlín', 'Madrid', 'Lisboa',
    'Estambul', 'Seúl', 'Hong Kong', 'Santorini', 'Bali', 'Machu Picchu', 'Petra',
    'Times Square', 'La Torre Eiffel', 'El Coliseo', 'La Sagrada Familia', 'El Taj Mahal',
    'La Gran Muralla', 'Disney World', 'Cancún', 'Cartagena', 'Medellín', 'La Habana',
    'Praga', 'Dubrovnik', 'Reikiavik', 'Nairobi',
  ],
  profesiones: [
    'médico', 'maestro', 'chef', 'piloto', 'astronauta', 'bombero', 'arquitecto',
    'detective', 'científico', 'músico', 'abogado', 'artista', 'cirujano', 'periodista',
    'ingeniero', 'psicólogo', 'veterinario', 'dentista', 'farmacéutico', 'policía',
    'actor', 'cantante', 'diseñador', 'programador', 'fotógrafo', 'escritor', 'político',
    'futbolista', 'entrenador', 'carpintero', 'electricista', 'plomero', 'mecánico',
    'enfermero', 'paramédico', 'juez', 'contador', 'biólogo', 'físico', 'químico',
    'historiador', 'arqueólogo', 'sociólogo', 'filósofo', 'mago', 'YouTuber', 'streamer',
    'influencer', 'tatuador', 'sommelier',
  ],
  superheroes: [
    'Spider-Man', 'Batman', 'Superman', 'Iron Man', 'Thor', 'Capitán América', 'Hulk',
    'Wonder Woman', 'Black Panther', 'Flash', 'Aquaman', 'Doctor Strange', 'Wolverine',
    'Deadpool', 'Magneto', 'Joker', 'Harley Quinn', 'Catwoman', 'Hawkeye', 'Viuda Negra',
    'Cíclope', 'Tormenta', 'Mystique', 'Lex Luthor', 'Thanos', 'Loki', 'Venom',
    'Ant-Man', 'Rocket Raccoon', 'Groot', 'Gamora', 'Star-Lord', 'Capitana Marvel',
    'Shazam', 'Linterna Verde', 'Nightwing', 'Robin', 'Batgirl', 'Daredevil', 'Punisher',
    'Silver Surfer', 'Mr. Fantastic', 'Hombre Invisible', 'La Cosa', 'Antorcha Humana',
    'Vision', 'Scarlet Witch', 'Doctor Doom', 'Galactus',
  ],
  videojuegos: [
    'Minecraft', 'Fortnite', 'League of Legends', 'Call of Duty', 'FIFA', 'GTA',
    'Mario Bros', 'Zelda', 'Pokémon', 'Sonic', 'Pac-Man', 'Tetris', 'Counter-Strike',
    'Valorant', 'Apex Legends', 'Among Us', 'Roblox', 'Los Sims', 'Red Dead Redemption',
    'God of War', 'The Last of Us', 'Halo', 'Doom', 'Resident Evil', 'Mortal Kombat',
    'Street Fighter', 'Final Fantasy', 'Dark Souls', 'Elden Ring', 'Cyberpunk 2077',
    'The Witcher', 'Overwatch', 'World of Warcraft', 'Diablo', 'Starcraft',
    'Age of Empires', 'Clash of Clans', 'Candy Crush', 'Angry Birds', 'Subway Surfers',
    'Hollow Knight', 'Celeste', 'Fall Guys', 'Stumble Guys', 'Rocket League',
    'Clash Royale', 'Brawl Stars', 'Free Fire', 'PUBG', 'Warzone',
  ],
  series: [
    'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office', 'Friends',
    'La Casa de Papel', 'Narcos', 'Peaky Blinders', 'Black Mirror', 'The Witcher',
    'Squid Game', 'Dark', 'Ozark', 'Better Call Saul', 'The Crown', 'Succession',
    'The Mandalorian', 'The Boys', 'Loki', 'Euphoria', 'Ted Lasso', 'Modern Family',
    'Grey\'s Anatomy', 'Sherlock', 'Chernobyl', 'Mindhunter', 'Lupin', 'Emily in Paris',
    'Élite', 'Cobra Kai', 'Dexter', 'Los Sopranos', 'The Wire', 'Lost', 'Prison Break',
    'Heroes', 'Supernatural', 'The Walking Dead', 'Bridgerton', 'The Last of Us',
    'Andor', 'House of the Dragon', 'Wednesday', 'Arcane', 'Avatar: La Leyenda de Aang',
    'Simpsons', 'South Park', 'Rick y Morty', 'Futurama',
  ],
};

// ─── In-memory state ────────────────────────────────────────────────────────
const rooms = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function getPlayerRoom(socket) {
  return socket.roomCode ? rooms.get(socket.roomCode) : null;
}

function roomSnapshot(room) {
  return {
    code:     room.code,
    owner:    room.owner,
    players:  [...room.players.values()],
    settings: room.settings,
    phase:    room.phase,
  };
}

function broadcast(room, event, data) {
  io.to(room.code).emit(event, data);
}

// ─── Word selection ─────────────────────────────────────────────────────────
// The impostor only knows the category — they must deduce the word by listening.
function pickWord(category, customWords) {
  if (category === 'custom') {
    const bank = customWords.filter(Boolean);
    return bank[Math.floor(Math.random() * bank.length)];
  }
  const bank = wordBank[category] ?? wordBank.comida;
  return bank[Math.floor(Math.random() * bank.length)];
}

// Normalize for final-guess comparison (case, whitespace, punctuation)
function normalizeWord(str) {
  return (str ?? '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,!?'"]/g, '');
}

// ─── Vote helpers ───────────────────────────────────────────────────────────
function tallyVotes(room) {
  const tally = {};
  for (const [, targetId] of room.votes) {
    if (targetId !== 'skip') tally[targetId] = (tally[targetId] ?? 0) + 1;
  }
  const sorted   = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const topCount = sorted[0]?.[1] ?? 0;
  const tied     = sorted.filter(([, c]) => c === topCount);
  return {
    tally,
    eliminated: tied.length === 1 ? sorted[0][0] : null, // tie → no elimination
  };
}

function buildVoteMap(room) {
  const map = {};
  for (const [voterId, targetId] of room.votes) {
    const voter  = room.players.get(voterId)?.name  ?? '?';
    const target = targetId === 'skip' ? 'Skip' : (room.players.get(targetId)?.name ?? '?');
    map[voter] = target;
  }
  return map;
}

// ─── Results pipeline ───────────────────────────────────────────────────────
function revealResults(room) {
  const { tally, eliminated } = tallyVotes(room);
  const voteMap               = buildVoteMap(room);

  // Impostor caught → give them a 30-second final guess
  if (eliminated && room.impostors.has(eliminated)) {
    room.phase            = 'final-guess';
    room.finalGuessTarget = eliminated;
    room._tally           = tally;
    room._voteMap         = voteMap;

    const impostorName = room.players.get(eliminated)?.name ?? '?';
    io.to(eliminated).emit('final-guess', {
      category: room.settings.category,
      impostorName,
    });
    for (const [pid] of room.players) {
      if (pid !== eliminated) io.to(pid).emit('awaiting-final-guess', { impostorName });
    }

    room.finalGuessTimer = setTimeout(() => {
      if (room.phase === 'final-guess') {
        finalizeResults(room, false, eliminated, tally, voteMap);
      }
    }, 30_000);
  } else {
    // Not caught (wrong person or tie) → impostors win directly
    finalizeResults(room, null, eliminated, tally, voteMap);
  }
}

// impostorGuessedCorrectly:  true → impostor wins | false → players win | null → impostor wins (not caught)
function finalizeResults(room, impostorGuessedCorrectly, eliminated, tally, voteMap) {
  if (room.finalGuessTimer) { clearTimeout(room.finalGuessTimer); room.finalGuessTimer = null; }
  room.phase = 'results';

  const impostorsWin = impostorGuessedCorrectly !== false; // null or true → impostor wins

  broadcast(room, 'results', {
    word:                    room.word,
    category:                room.settings.category,
    impostors:               [...room.impostors].map(id => ({ id, name: room.players.get(id)?.name ?? '?' })),
    eliminated:              eliminated ? { id: eliminated, name: room.players.get(eliminated)?.name ?? '?' } : null,
    impostorsWin,
    impostorGuessedCorrectly,
    voteMap,
    tally: Object.fromEntries(
      Object.entries(tally).map(([id, count]) => [room.players.get(id)?.name ?? '?', count])
    ),
    players: [...room.players.values()],
  });

  broadcast(room, 'room-updated', roomSnapshot(room));
}

// ─── Socket connections ─────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[IO] + ${socket.id}`);
  socket.roomCode = null;

  // ── Create room ─────────────────────────────────────────────────────────
  socket.on('create-room', ({ name } = {}, cb) => {
    const trimmed = name?.trim().slice(0, 20);
    if (!trimmed) return cb?.({ ok: false, error: 'Name is required' });

    const code = generateCode();
    const room = {
      code,
      owner:            socket.id,
      players:          new Map([[socket.id, { id: socket.id, name: trimmed }]]),
      settings:         { category: 'comida', impostorCount: 1, customWords: [] },
      phase:            'lobby',
      word:             null,
      hint:             null,
      impostors:        new Set(),
      votes:            new Map(),
      finalGuessTarget: null,
      finalGuessTimer:  null,
      _tally:           null,
      _voteMap:         null,
    };

    rooms.set(code, room);
    socket.roomCode = code;
    socket.join(code);

    cb?.({ ok: true, code });
    broadcast(room, 'room-updated', roomSnapshot(room));
    console.log(`[Room] ${trimmed} created ${code}`);
  });

  // ── Join room ────────────────────────────────────────────────────────────
  socket.on('join-room', ({ code, name } = {}, cb) => {
    const room = rooms.get(code?.trim().toUpperCase());
    if (!room)                  return cb?.({ ok: false, error: 'Room not found' });
    if (room.phase !== 'lobby') return cb?.({ ok: false, error: 'Game already in progress' });

    const trimmed = name?.trim().slice(0, 20);
    if (!trimmed) return cb?.({ ok: false, error: 'Name is required' });
    if ([...room.players.values()].some(p => p.name === trimmed))
      return cb?.({ ok: false, error: 'That name is already taken in this room' });
    if (room.players.size >= 12)
      return cb?.({ ok: false, error: 'Room is full (max 12)' });

    room.players.set(socket.id, { id: socket.id, name: trimmed });
    socket.roomCode = code.trim().toUpperCase();
    socket.join(socket.roomCode);

    cb?.({ ok: true });
    broadcast(room, 'room-updated', roomSnapshot(room));
    console.log(`[Room] ${trimmed} joined ${room.code}`);
  });

  // ── Update settings (host only, lobby only) ──────────────────────────────
  socket.on('update-settings', (patch = {}) => {
    const room = getPlayerRoom(socket);
    if (!room || room.owner !== socket.id || room.phase !== 'lobby') return;

    if (patch.category      !== undefined) room.settings.category      = patch.category;
    if (patch.impostorCount !== undefined) room.settings.impostorCount = Math.min(3, Math.max(1, Number(patch.impostorCount)));
    if (patch.customWords   !== undefined) room.settings.customWords   = patch.customWords;

    broadcast(room, 'room-updated', roomSnapshot(room));
  });

  // ── Start game (host only) ───────────────────────────────────────────────
  socket.on('start-game', () => {
    const room = getPlayerRoom(socket);
    if (!room || room.owner !== socket.id || room.phase !== 'lobby') return;

    const players = [...room.players.values()];
    if (players.length < 3)
      return socket.emit('error', 'Need at least 3 players to start');

    if (room.settings.category === 'custom' && room.settings.customWords.length < 1)
      return socket.emit('error', 'Agrega al menos 1 palabra personalizada');

    const word         = pickWord(room.settings.category, room.settings.customWords);
    const count        = Math.min(room.settings.impostorCount, Math.floor(players.length / 2));
    const shuffled     = [...players].sort(() => Math.random() - 0.5);
    const impostorIds  = new Set(shuffled.slice(0, count).map(p => p.id));

    room.word      = word;
    room.hint      = null;
    room.impostors = impostorIds;
    room.phase     = 'playing';
    room.votes.clear();

    for (const player of players) {
      const isImpostor = impostorIds.has(player.id);
      io.to(player.id).emit('game-started', {
        isImpostor,
        word:          isImpostor ? null : word,
        hint:          null,
        category:      room.settings.category,
        impostorCount: count,
        playerCount:   players.length,
      });
    }

    broadcast(room, 'room-updated', roomSnapshot(room));
    console.log(`[Room] ${room.code} started — word:"${word}" impostors:${count}/${players.length}`);
  });

  // ── Host: everyone saw their word, start the round ───────────────────────
  socket.on('start-round', () => {
    const room = getPlayerRoom(socket);
    if (!room || room.owner !== socket.id || room.phase !== 'playing') return;
    broadcast(room, 'round-started', { players: [...room.players.values()] });
  });

  // ── Host: open voting ────────────────────────────────────────────────────
  socket.on('start-voting', () => {
    const room = getPlayerRoom(socket);
    if (!room || room.owner !== socket.id || room.phase !== 'playing') return;
    room.phase = 'voting';
    broadcast(room, 'room-updated', roomSnapshot(room));
    broadcast(room, 'voting-started', { players: [...room.players.values()] });
  });

  // ── Player submits vote ──────────────────────────────────────────────────
  socket.on('submit-vote', ({ targetId } = {}) => {
    const room = getPlayerRoom(socket);
    if (!room || room.phase !== 'voting' || room.votes.has(socket.id)) return;
    if (targetId !== 'skip' && !room.players.has(targetId)) return;

    room.votes.set(socket.id, targetId);
    broadcast(room, 'vote-updated', { count: room.votes.size, total: room.players.size });

    if (room.votes.size === room.players.size) revealResults(room);
  });

  // ── Host: force reveal without waiting for all votes ─────────────────────
  socket.on('reveal-results', () => {
    const room = getPlayerRoom(socket);
    if (!room || room.owner !== socket.id || room.phase !== 'voting') return;
    revealResults(room);
  });

  // ── Caught impostor submits their final guess ────────────────────────────
  socket.on('submit-final-guess', ({ word } = {}) => {
    const room = getPlayerRoom(socket);
    if (!room || room.phase !== 'final-guess' || room.finalGuessTarget !== socket.id) return;

    const correct = normalizeWord(word) === normalizeWord(room.word);
    finalizeResults(room, correct, room.finalGuessTarget, room._tally, room._voteMap);
  });

  // ── Host: reset to lobby ─────────────────────────────────────────────────
  socket.on('new-game', () => {
    const room = getPlayerRoom(socket);
    if (!room || room.owner !== socket.id) return;

    if (room.finalGuessTimer) { clearTimeout(room.finalGuessTimer); room.finalGuessTimer = null; }
    room.phase            = 'lobby';
    room.word             = null;
    room.hint             = null;
    room.impostors        = new Set();
    room.votes            = new Map();
    room.finalGuessTarget = null;
    room._tally           = null;
    room._voteMap         = null;

    broadcast(room, 'room-updated', roomSnapshot(room));
  });

  // ── Disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const room = getPlayerRoom(socket);
    if (!room) return;

    const name = room.players.get(socket.id)?.name ?? socket.id;
    room.players.delete(socket.id);
    console.log(`[IO] - ${name} left ${room.code} (${room.players.size} remaining)`);

    if (room.players.size === 0) {
      if (room.finalGuessTimer) clearTimeout(room.finalGuessTimer);
      rooms.delete(room.code);
      return;
    }

    if (room.owner === socket.id) {
      room.owner = [...room.players.keys()][0];
      io.to(room.owner).emit('you-are-host');
    }

    // Caught impostor disconnected → players win
    if (room.phase === 'final-guess' && room.finalGuessTarget === socket.id) {
      finalizeResults(room, false, socket.id, room._tally ?? {}, room._voteMap ?? {});
      return;
    }

    // Voting: check if all remaining players have voted
    if (room.phase === 'voting') {
      const remaining = [...room.players.keys()];
      if (remaining.length > 0 && remaining.every(id => room.votes.has(id))) {
        revealResults(room);
        return;
      }
      broadcast(room, 'vote-updated', { count: room.votes.size, total: room.players.size });
    }

    broadcast(room, 'room-updated', roomSnapshot(room));
  });
});

// ─── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`🎮 Party Games → http://0.0.0.0:${PORT}`));
