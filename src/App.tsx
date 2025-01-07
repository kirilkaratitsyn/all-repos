import React, { useState, useEffect } from 'react';
import { Github, Loader2, User, Mail, MapPin } from 'lucide-react';
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

function App() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reposResponse, profileResponse] = await Promise.all([
          fetch('https://api.github.com/users/kirilkaratitsyn/repos?sort=updated&per_page=100'),
          fetch('https://api.github.com/users/kirilkaratitsyn')
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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