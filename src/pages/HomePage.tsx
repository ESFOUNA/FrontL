import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import API_BASE_URL from "../api/api";
import { getMatchData } from '../utils/matchDataService';

interface Fixture {
  id: number;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  league: {
    name: string;
  };
  date: string;
}

const HomePage = () => {
  const [lastMatches, setLastMatches] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        console.log('Starting to load matches...');
        const matchData = await getMatchData();
        console.log('Received match data:', matchData);
        
        if (matchData && matchData.response && Array.isArray(matchData.response)) {
          const matches = matchData.response.slice(0, 3).map((match: any) => ({
            id: match.fixture.id,
            homeTeam: {
              name: match.teams.home.name,
              logo: match.teams.home.logo,
            },
            awayTeam: {
              name: match.teams.away.name,
              logo: match.teams.away.logo,
            },
            league: {
              name: match.league.name,
            },
            date: match.fixture.date,
          }));
          console.log('Processed matches:', matches);
          setLastMatches(matches);
          setError(null);
        } else {
          console.error('Invalid match data format:', matchData);
          setError('Failed to load matches - Invalid data format');
        }
      } catch (err) {
        console.error('Error loading matches:', err);
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();

    // Cycle through players 1, 2, and 3
    const intervalId = setInterval(() => {
      setCurrentPlayer((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1));
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const formatMatchTime = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const userDisplay = user ? user.email || "User" : "NOT LOGGED IN";

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-900 text-white">
      <div
        className="w-full min-h-screen flex flex-col items-center bg-cover bg-center px-0 py-10 relative"
        style={{
          backgroundImage: "url('/stadium.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Player Image with Enhanced Smooth Crossfade */}
        <div className="absolute inset-0 flex justify-center items-center overflow-hidden pointer-events-none">
          <div className="relative w-full max-w-4xl h-full">
            <img
              src="/player1.png"
              alt="Player 1"
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out will-change-opacity ${
                currentPlayer === 1 ? "opacity-100" : "opacity-0"
              }`}
              style={{ backfaceVisibility: 'hidden' }}
              loading="eager"
            />
            <img
              src="/player2.png"
              alt="Player 2"
              className={`absolute inset-16 w-full h-full object-contain transition-opacity duration-1000 ease-in-out will-change-opacity ${
                currentPlayer === 2 ? "opacity-100" : "opacity-0"
              }`}
              style={{ backfaceVisibility: 'hidden' }}
              loading="eager"
            />
            <img
              src="/player3.png"
              alt="Player 3"
              className={`absolute inset-24 w-full h-full object-contain transition-opacity duration-1000 ease-in-out will-change-opacity ${
                currentPlayer === 3 ? "opacity-100" : "opacity-0"
              }`}
              style={{ backfaceVisibility: 'hidden' }}
              loading="eager"
            />
          </div>
        </div>

        <div className="relative w-full max-w-7xl flex mt-8 items-start">
          {/* Left Section - Match Title and Last Matches */}
          <div className="w-1/3 flex flex-col space-y-4 pl-0">
            <h2 className="text-5xl font-bold bg-black bg-opacity-50 p-4 rounded-lg">
              {lastMatches.length > 0 ? (
                <>
                  {lastMatches[0].homeTeam.name} <span className="text-green-400">VS</span>{" "}
                  {lastMatches[0].awayTeam.name}
                </>
              ) : loading ? (
                "Loading..."
              ) : (
                <span className="ml-0">No Recent Matches</span>
              )}
            </h2>

            {loading ? (
              <p className="text-white ml-0">Loading matches...</p>
            ) : error ? (
              <p className="text-red-400 ml-0">{error}</p>
            ) : lastMatches.length > 0 ? (
              lastMatches.slice(0, 2).map((match, index) => (
                <div
                  key={index}
                  className="bg-black bg-opacity-80 p-4 rounded-lg shadow-lg flex flex-col items-center text-white w-60"
                >
                  <div className="flex flex-col items-center w-full mb-2">
                    <div className="flex justify-between w-full">
                      <span className="text-sm truncate">{match.homeTeam.name}</span>
                      <span className="text-sm truncate">{match.awayTeam.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{match.league.name}</span>
                  </div>
                  <div className="flex justify-between items-center w-full mb-4">
                    <img
                      src={match.homeTeam.logo}
                      alt={`${match.homeTeam.name} Logo`}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="text-lg font-bold">VS</span>
                    <img
                      src={match.awayTeam.logo}
                      alt={`${match.awayTeam.name} Logo`}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="text-sm mb-4">{formatMatchTime(match.date)}</div>
                  <Link
                    to={`/highlights/${match.id}`}
                    className="bg-green-500 text-black font-bold py-2 px-4 rounded hover:bg-green-600 transition"
                  >
                    View Highlights
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-400 ml-0">No recent matches available.</p>
            )}
          </div>

          {/* Center Section - Empty */}
          <div className="w-1/3"></div>

          {/* Right Section - Upcoming Matches and User Profile */}
          <div className="w-1/3 flex flex-col items-end pr-0 space-y-4">
            <div className="flex flex-col w-64 space-y-4">
              {loading ? (
                <p className="text-white text-right">Loading upcoming matches...</p>
              ) : error ? (
                <p className="text-red-400 text-right">{error}</p>
              ) : lastMatches.length > 0 ? (
                lastMatches.map((match, index) => (
                  <div
                    key={index}
                    className="bg-black bg-opacity-70 p-6 rounded-xl text-right"
                  >
                    <div className="flex flex-col items-end space-y-4">
                      <span className="truncate">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </span>
                      <div className="flex justify-end items-center w-full space-x-8 my-10">
                        <img
                          src={match.awayTeam.logo}
                          alt={`${match.awayTeam.name} Logo`}
                          className="w-12 h-12 object-contain"
                        />
                        <span className="text-lg font-bold">VS</span>
                        <img
                          src={match.homeTeam.logo}
                          alt={`${match.homeTeam.name} Logo`}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                    </div>
                    <Link
                      to="/ticketlist"
                      className="mt-2 px-10 py-2 bg-green-400 text-black font-bold rounded-lg"
                    >
                      Purchase a ticket
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-right mr-2">No upcoming matches available.</p>
              )}
            </div>

            {/* User Profile */}
            <div className="bg-black bg-opacity-70 p-4 rounded-xl w-64 text-right mr-0">
              <div className="flex justify-end items-center space-x-2 mb-2">
                <span>{userDisplay}</span>
                <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
              </div>
              {!user && (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-green-500 text-black font-bold py-2 px-4 rounded hover:bg-green-600 transition"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Info Section */}
        <div className="w-full max-w-7xl flex justify-end pr-0 z-18 absolute bottom-10 transform translate-y-0">
          <div className="flex space-x-6 mr-60">
            <div className="bg-black bg-opacity-80 p-5 rounded-xl text-center border border-gray-600 shadow-lg transform transition-transform hover:scale-80">
              <h3 className="text-xl font-semibold mb-2">Ticket Price</h3>
              <p className="text-3xl font-bold">50.999$</p>
            </div>
            <div className="bg-black bg-opacity-80 p-5 rounded-xl text-center border border-gray-600 shadow-lg transform transition-transform hover:scale-80">
              <h3 className="text-xl font-semibold mb-2">Timing</h3>
              <p className="text-3xl font-bold">6:30 pm</p>
            </div>
            <div className="bg-black bg-opacity-80 p-5 rounded-xl text-center border border-gray-600 shadow-lg transform transition-transform hover:scale-80">
              <h3 className="text-xl font-semibold mb-2">Remaining Tickets</h3>
              <p className="text-3xl font-bold">268</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;