import React, { useState, useEffect } from 'react';
import { Github, Loader2, User, Mail, MapPin, Search } from 'lucide-react';
import type { Repository } from './types';
import { RepoCard } from './components/RepoCard';

interface UserProfile {
  name: string;
  bio: string | null;
  avatar_url: string;
  location: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface SearchSuggestion {
  login: string;
  avatar_url: string;
  name: string | null;
}

function App() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('kirilkaratitsyn');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://api.github.com/search/users?q=${query}&per_page=5`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      const detailedSuggestions = await Promise.all(
        data.items.map(async (user: any) => {
          const userResponse = await fetch(`https://api.github.com/users/${user.login}`);
          const userData = await userResponse.json();
          return {
            login: user.login,
            avatar_url: user.avatar_url,
            name: userData.name
          };
        })
      );
      setSuggestions(detailedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [reposResponse, profileResponse] = await Promise.all([
          fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`),
          fetch(`https://api.github.com/users/${username}`)
        ]);

        if (!reposResponse.ok || !profileResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [reposData, profileData] = await Promise.all([
          reposResponse.json(),
          profileResponse.json()
        ]);

        setRepos(reposData);
        setProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUserSelect = (login: string) => {
    setUsername(login);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 animate-gradient-x"></div>
          <div className="absolute inset-0 opacity-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse"></div>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">GitHub Profile Explorer</h1>
          <p className="mt-2 text-lg text-blue-100">
            Search and explore GitHub profiles to discover repositories, contributions, and more.
          </p>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search GitHub users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.login}
                    onClick={() => handleUserSelect(suggestion.login)}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 text-left"
                  >
                    <img
                      src={suggestion.avatar_url}
                      alt={suggestion.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-gray-900">{suggestion.name || suggestion.login}</div>
                      {suggestion.name && (
                        <div className="text-sm text-gray-500">@{suggestion.login}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            )}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{profile?.name || 'GitHub Repositories'}</h1>
              {profile?.bio && <p className="mt-2 text-blue-100">{profile.bio}</p>}
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                {profile?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {profile?.followers} followers · {profile?.following} following
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {repos.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800">
                Repositories ({profile?.public_repos})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;