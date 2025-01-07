import React, { useState, useEffect } from 'react';
import { Star, GitFork, Clock, ExternalLink, GitCommit, Globe, BookOpen } from 'lucide-react';
import type { Repository } from '../types';

interface RepoCardProps {
  repo: Repository;
}

export function RepoCard({ repo }: RepoCardProps) {
  const [commitCount, setCommitCount] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchCommitCount = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`
        );
        const link = response.headers.get('Link') || '';
        const match = link.match(/&page=(\d+)>; rel="last"/);
        if (match) {
          setCommitCount(parseInt(match[1], 10));
        }
      } catch (error) {
        console.error('Error fetching commit count:', error);
      }
    };

    fetchCommitCount();
  }, [repo.full_name]);

  const languageColors: { [key: string]: string } = {
    JavaScript: 'bg-yellow-400',
    TypeScript: 'bg-blue-500',
    Python: 'bg-green-500',
    Java: 'bg-red-500',
    HTML: 'bg-orange-500',
    CSS: 'bg-pink-500',
    Ruby: 'bg-red-600',
    'C++': 'bg-purple-500',
    PHP: 'bg-indigo-500',
    Go: 'bg-cyan-500',
    Rust: 'bg-orange-600',
    Swift: 'bg-orange-500',
    Kotlin: 'bg-purple-600',
    Dart: 'bg-blue-400',
  };

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {repo.name}
            </a>
          </h3>
        </div>
        
        {repo.description && (
          <p className="text-gray-600 mb-4 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
            {repo.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {repo.topics.map((topic) => (
            <span
              key={topic}
              className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full ${languageColors[repo.language] || 'bg-gray-400'}`}></span>
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1" title="Stars">
            <Star className={`w-4 h-4 ${repo.stargazers_count > 0 ? 'text-yellow-500' : ''}`} />
            {repo.stargazers_count}
          </span>
          <span className="flex items-center gap-1" title="Forks">
            <GitFork className={`w-4 h-4 ${repo.forks_count > 0 ? 'text-blue-500' : ''}`} />
            {repo.forks_count}
          </span>
          {commitCount !== null && (
            <span className="flex items-center gap-1" title="Total Commits">
              <GitCommit className="w-4 h-4" />
              {commitCount}
            </span>
          )}
          <span className="flex items-center gap-1" title="Last Updated">
            <Clock className="w-4 h-4" />
            {new Date(repo.updated_at).toLocaleDateString()}
          </span>
        </div>

        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Live Demo
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        )}
      </div>
    </div>
  );
}