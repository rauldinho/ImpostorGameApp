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
    'pizza', 'hamburguesa', 'hot dog', 'tacos', 'sushi',
    'helado', 'papas fritas', 'pollo', 'arroz', 'queso',
    'chocolate', 'pastel', 'galletas', 'donas', 'sandwich',
    'empanada', 'lasaña', 'espagueti', 'burrito', 'quesadilla',
    'cereal', 'yogur', 'manzana', 'banana', 'naranja',
    'carne', 'ensalada', 'huevo', 'pan', 'pollo frito',
    'waffles', 'nachos', 'brownie', 'cheesecake', 'croissant',
    'aguacate', 'salchicha', 'palomitas', 'pancakes', 'tortilla',
    'flan', 'churros', 'salmón', 'camarones', 'ceviche',
    'torta', 'hamburguesa doble', 'milkshake', 'muffin', 'pizza hawaiana',
  ],

  animales: [
    'perro', 'gato', 'caballo', 'vaca', 'cerdo',
    'gallina', 'conejo', 'ratón', 'mono', 'oso',
    'león', 'tigre', 'elefante', 'jirafa', 'cebra',
    'zorro', 'lobo', 'águila', 'serpiente', 'cocodrilo',
    'tiburón', 'ballena', 'delfín', 'pingüino', 'tortuga',
    'mariposa', 'abeja', 'araña', 'cangrejo', 'pulpo',
    'koala', 'canguro', 'panda', 'camello', 'burro',
    'rana', 'pez', 'loro', 'ardilla', 'hipopótamo',
    'gorila', 'alpaca', 'llama', 'puma', 'jaguar',
    'flamenco', 'búho', 'gallo', 'oveja', 'pato',
  ],

  peliculas: [
    'Titanic', 'Avatar', 'Frozen', 'Shrek', 'Toy Story',
    'Cars', 'Coco', 'Moana', 'El Rey León', 'Buscando a Nemo',
    'Harry Potter', 'Star Wars', 'Jurassic Park', 'Batman', 'Superman',
    'Spider-Man', 'Avengers', 'Iron Man', 'Thor', 'Hulk',
    'Rocky', 'Karate Kid', 'Top Gun', 'Joker', 'Barbie',
    'Oppenheimer', 'Gladiador', 'Terminator', 'Forrest Gump', 'Up',
    'Ratatouille', 'Monsters Inc', 'Intensamente', 'Deadpool', 'Black Panther',
    'Doctor Strange', 'Ant-Man', 'Madagascar', 'Kung Fu Panda', 'Minions',
    'Aladdin', 'La Sirenita', 'Encanto', 'John Wick', 'Avatar 2',
    'Rapidos y Furiosos', 'WALL-E', 'Los Increíbles', 'Dune', 'El Padrino',
  ],

  deportes: [
    'fútbol', 'baloncesto', 'tenis', 'béisbol', 'voleibol',
    'golf', 'boxeo', 'natación', 'ciclismo', 'rugby',
    'fútbol americano', 'hockey', 'karate', 'judo', 'taekwondo',
    'atletismo', 'gimnasia', 'surf', 'esquí', 'patinaje',
    'Fórmula 1', 'MMA', 'lucha libre', 'ping pong', 'bádminton',
    'maratón', 'pádel', 'skate', 'ajedrez', 'billar',
    'levantamiento de pesas', 'remo', 'waterpolo', 'escalada', 'bowling',
    'paracaidismo', 'motociclismo', 'triatlón', 'kickboxing', 'cricket',
    'handball', 'esgrima', 'kayak', 'snowboard', 'parkour',
    'equitación', 'tiro con arco', 'lucha olímpica', 'breakdance', 'esports',
  ],

  profesiones: [
    'médico', 'enfermero', 'profesor', 'ingeniero', 'abogado',
    'policía', 'bombero', 'piloto', 'chef', 'arquitecto',
    'programador', 'mecánico', 'electricista', 'carpintero', 'dentista',
    'veterinario', 'periodista', 'fotógrafo', 'actor', 'cantante',
    'futbolista', 'contador', 'juez', 'científico', 'astronauta',
    'taxista', 'panadero', 'cajero', 'mesero', 'diseñador',
    'constructor', 'guardia', 'repartidor', 'doctor', 'farmacéutico',
    'entrenador', 'modelo', 'pescador', 'plomero', 'barbero',
    'peluquero', 'agricultor', 'secretario', 'vendedor', 'chofer',
    'paramédico', 'locutor', 'youtuber', 'streamer', 'influencer',
  ],

  personajes: [
    'Batman', 'Spider-Man', 'Superman', 'Iron Man', 'Thor',
    'Hulk', 'Capitán América', 'Wonder Woman', 'Flash', 'Aquaman',
    'Joker', 'Harley Quinn', 'Deadpool', 'Wolverine', 'Loki',
    'Thanos', 'Venom', 'Robin', 'Batgirl', 'Daredevil',
    'Mario', 'Luigi', 'Sonic', 'Pikachu', 'Ash',
    'Goku', 'Vegeta', 'Naruto', 'Sasuke', 'Luffy',
    'Shrek', 'Minion', 'Elsa', 'Olaf', 'Buzz Lightyear',
    'Woody', 'Darth Vader', 'Yoda', 'Mickey Mouse', 'Donald Duck',
    'Scooby-Doo', 'Bob Esponja', 'Patricio', 'Homero Simpson', 'Bart Simpson',
    'Rick', 'Morty', 'Po', 'Kung Fu Panda', 'Optimus Prime',
  ],

  videojuegos: [
    'Minecraft', 'Fortnite', 'Roblox', 'Free Fire', 'GTA',
    'FIFA', 'Mario Bros', 'Pokémon', 'Sonic', 'Pac-Man',
    'Tetris', 'Among Us', 'Brawl Stars', 'Clash Royale', 'Clash of Clans',
    'Candy Crush', 'Angry Birds', 'Subway Surfers', 'Call of Duty', 'Valorant',
    'League of Legends', 'Counter-Strike', 'Halo', 'God of War', 'The Last of Us',
    'Resident Evil', 'Mortal Kombat', 'Street Fighter', 'Fall Guys', 'Rocket League',
    'Zelda', 'Mario Kart', 'PUBG', 'Warzone', 'Apex Legends',
    'Overwatch', 'Diablo', 'World of Warcraft', 'The Sims', 'Red Dead Redemption',
    'Elden Ring', 'Dark Souls', 'Doom', 'Five Nights at Freddys', 'Stumble Guys',
    'Crash Bandicoot', 'Donkey Kong', 'Metroid', 'Animal Crossing', 'Pokémon GO',
  ],

  tecnologia: [
    'iPhone', 'Android', 'WhatsApp', 'Instagram', 'TikTok',
    'YouTube', 'Netflix', 'Google', 'Facebook', 'X',
    'PlayStation', 'Xbox', 'Nintendo', 'computadora', 'laptop',
    'tablet', 'smartwatch', 'audífonos', 'cámara', 'televisor',
    'wifi', 'internet', 'Bluetooth', 'USB', 'correo electrónico',
    'chat', 'videollamada', 'streaming', 'inteligencia artificial', 'robot',
    'drone', 'teclado', 'mouse', 'monitor', 'impresora',
    'Alexa', 'ChatGPT', 'Spotify', 'Discord', 'Telegram',
  ],

  vehiculos: [
    'automóvil', 'camión', 'moto', 'bicicleta', 'avión',
    'helicóptero', 'barco', 'tren', 'autobús', 'ambulancia',
    'patrulla', 'tractor', 'metro', 'submarino', 'cohete',
    'monopatín', 'scooter', 'jet ski', 'velero', 'camioneta',
    'limusina', 'tanque', 'excavadora', 'grúa', 'carro de bomberos',
    'furgoneta', 'motoneta', 'teleférico', 'tranvía', 'cuatrimoto',
  ],

  objetos: [
    'silla', 'mesa', 'cama', 'sofá', 'televisión',
    'reloj', 'espejo', 'lámpara', 'puerta', 'ventana',
    'teléfono', 'computadora', 'libro', 'cuaderno', 'lápiz',
    'mochila', 'paraguas', 'llave', 'cartera', 'maleta',
    'cepillo', 'vaso', 'plato', 'cuchara', 'tenedor',
    'cuchillo', 'pelota', 'guitarra', 'micrófono', 'cámara',
    'control remoto', 'ventilador', 'refrigerador', 'microondas', 'cafetera',
    'casco', 'botella', 'tijeras', 'martillo', 'destornillador',
    'candado', 'linterna', 'almohada', 'manta', 'anillo',
    'collar', 'lentes', 'auriculares', 'impresora', 'calculadora',
  ],

  marcas: [
    'Coca-Cola', 'Pepsi', "McDonald's", 'Burger King', 'KFC',
    'Nike', 'Adidas', 'Puma', 'Apple', 'Samsung',
    'Sony', 'Microsoft', 'Google', 'Amazon', 'Netflix',
    'Disney', 'LEGO', 'PlayStation', 'Xbox', 'Nintendo',
    'Ferrari', 'Toyota', 'BMW', 'Mercedes', 'Tesla',
    'Starbucks', 'Subway', "Domino's Pizza", 'Uber', 'Airbnb',
    'TikTok', 'Instagram', 'YouTube', 'Spotify', 'WhatsApp',
    'Visa', 'Mastercard', 'Rolex', 'IKEA', 'H&M',
  ],

  paises_ciudades: [
    'Chile', 'Argentina', 'Brasil', 'México', 'Venezuela',
    'Colombia', 'Perú', 'España', 'Francia', 'Italia',
    'Alemania', 'Inglaterra', 'Japón', 'China', 'Canadá',
    'Estados Unidos', 'Australia', 'Egipto', 'India', 'Rusia',
    'París', 'Londres', 'Roma', 'Madrid', 'Barcelona',
    'Nueva York', 'Los Ángeles', 'Miami', 'Las Vegas', 'Tokio',
    'Pekín', 'Dubái', 'Sídney', 'Buenos Aires', 'Santiago',
    'Ciudad de México', 'Río de Janeiro', 'Cancún', 'Machu Picchu', 'Torre Eiffel',
    'Estatua de la Libertad', 'Gran Muralla China', 'Taj Mahal', 'Coliseo Romano', 'Amazonas',
    'Everest', 'Antártida', 'Desierto del Sahara', 'Canal de Panamá', 'Isla de Pascua',
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
  if (category === 'aleatorio') {
    const keys = Object.keys(wordBank);
    const randomCat = keys[Math.floor(Math.random() * keys.length)];
    const bank = wordBank[randomCat];
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
