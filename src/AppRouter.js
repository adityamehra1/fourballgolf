import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import supabase from './supabase';
import LoginPage from './LoginPage';

function FourballHome() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
    const subscription = supabase
      .channel('games_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => fetchGames())
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: true });
    if (error) console.error('Error fetching games:', error.message);
    else setGames(data);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🏌️‍♂️ Upcoming Games</h1>
      {games.length === 0 ? (
        <p>No games posted yet.</p>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{game.course}</h2>
              <p className="text-sm text-gray-600">
                {game.date} at {game.time} — {game.location}
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Players: {game.players?.length || 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateGame() {
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const navigate = null; // not needed here

  const handleSubmit = async () => {
    const { error } = await supabase
      .from('games')
      .insert([{ course, date, time, location, players: [] }]);
    if (error) alert('Error creating game: ' + error.message);
    else {
      alert('Game posted!');
      setCourse('');
      setDate('');
      setTime('');
      setLocation('');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-3">
      <h2 className="text-xl font-bold mb-2">Post a Game</h2>
      <input
        className="border p-2 w-full"
        placeholder="Course Name"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      />
      <input
        className="border p-2 w-full"
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        className="border p-2 w-full"
        placeholder="Time (e.g., 9:00 AM)"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <input
        className="border p-2 w-full"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        onClick={handleSubmit}
      >
        Create Game
      </button>
    </div>
  );
}

function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">👤 Profile</h1>
      {user && <p>Email: {user.email}</p>}
    </div>
  );
}

export default function AppRouter() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
  }, []);

  return (
    <Router>
      <nav className="p-4 bg-gray-100 flex gap-6">
        <Link to="/">Home</Link>
        {user && <Link to="/create">Create</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {user ? (
          <button onClick={() => supabase.auth.signOut()}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={user ? <FourballHome /> : <Navigate to="/login" />} />
        <Route path="/create" element={user ? <CreateGame /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
);
}
