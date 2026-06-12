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
  food:        ['pizza', 'sushi', 'hamburger', 'tacos', 'pasta', 'ice cream', 'ramen', 'pancakes', 'steak', 'lasagna', 'curry', 'sashimi', 'burrito', 'waffles', 'nachos'],
  animals:     ['elephant', 'dolphin', 'penguin', 'giraffe', 'tiger', 'kangaroo', 'octopus', 'wolf', 'flamingo', 'shark', 'cheetah', 'koala', 'gorilla', 'peacock', 'platypus'],
  movies:      ['Titanic', 'Inception', 'Avengers', 'Joker', 'Lion King', 'Frozen', 'Interstellar', 'Parasite', 'The Matrix', 'Shrek', 'Gladiator', 'Toy Story', 'Forrest Gump', 'Pulp Fiction', 'Up'],
  sports:      ['soccer', 'basketball', 'tennis', 'swimming', 'boxing', 'golf', 'volleyball', 'cycling', 'surfing', 'wrestling', 'gymnastics', 'skiing', 'archery', 'fencing', 'rowing'],
  places:      ['Paris', 'Tokyo', 'New York', 'Sydney', 'Cairo', 'Rome', 'Bangkok', 'London', 'Dubai', 'Barcelona', 'Rio de Janeiro', 'Amsterdam', 'Marrakech', 'Venice', 'Singapore'],
  professions: ['doctor', 'teacher', 'chef', 'pilot', 'astronaut', 'firefighter', 'architect', 'detective', 'scientist', 'musician', 'lawyer', 'artist', 'surgeon', 'journalist', 'engineer'],
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

// ─── Word + hint selection ──────────────────────────────────────────────────
// The impostor receives a DIFFERENT word from the same category as a hint —
// similar enough to bluff, different enough to not know the actual word.
function pickWordAndHint(category, customWords) {
  if (category === 'custom') {
    const bank = customWords.filter(Boolean);
    // Guaranteed ≥2 words (enforced at start-game)
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    return { word: shuffled[0], hint: shuffled[1] };
  }
  const bank    = wordBank[category] ?? wordBank.food;
  const wordIdx = Math.floor(Math.random() * bank.length);
  let hintIdx;
  do { hintIdx = Math.floor(Math.random() * bank.length); } while (hintIdx === wordIdx);
  return { word: bank[wordIdx], hint: bank[hintIdx] };
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
      hint:     room.hint,          // remind them of their hint
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
      settings:         { category: 'food', impostorCount: 1, customWords: [] },
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

    if (room.settings.category === 'custom' && room.settings.customWords.length < 2)
      return socket.emit('error', 'Add at least 2 custom words for the impostor hint to work');

    const { word, hint } = pickWordAndHint(room.settings.category, room.settings.customWords);
    const count          = Math.min(room.settings.impostorCount, Math.floor(players.length / 2));
    const shuffled       = [...players].sort(() => Math.random() - 0.5);
    const impostorIds    = new Set(shuffled.slice(0, count).map(p => p.id));

    room.word      = word;
    room.hint      = hint;
    room.impostors = impostorIds;
    room.phase     = 'playing';
    room.votes.clear();

    for (const player of players) {
      const isImpostor = impostorIds.has(player.id);
      io.to(player.id).emit('game-started', {
        isImpostor,
        word:          isImpostor ? null : word,
        hint:          isImpostor ? hint : null,
        category:      room.settings.category,
        impostorCount: count,
        playerCount:   players.length,
      });
    }

    broadcast(room, 'room-updated', roomSnapshot(room));
    console.log(`[Room] ${room.code} started — word:"${word}" hint:"${hint}" impostors:${count}/${players.length}`);
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
