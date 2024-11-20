import { useState, useEffect } from 'react';
import { Film, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const DetailsCard = ({ data, type }) => {
  const [posterUrl, setPosterUrl] = useState(null);
  const [isLoadingPoster, setIsLoadingPoster] = useState(false);

  useEffect(() => {
    const fetchMoviePoster = async () => {
      if (type !== 'movie' || !data?.movie?.title) return;

      setIsLoadingPoster(true);
      try {
        const response = await fetch(
          `http://localhost:10000/movie/poster/${encodeURIComponent(data.movie.title)}`
        );
        
        if (response.ok) {
          const posterData = await response.json();
          if (posterData.poster_path) {
            setPosterUrl(`https://image.tmdb.org/t/p/w500${posterData.poster_path}`);
          }
        }
      } catch (error) {
        console.error('Error fetching movie poster:', error);
      } finally {
        setIsLoadingPoster(false);
      }
    };

    fetchMoviePoster();
  }, [data?.movie?.title, type]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const calculateAge = (birthDate, deathDate) => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (!data) return null;

  // Actor Card
  if (type === 'actor' && data.actor && data.movies) {
    const { actor, movies } = data;
    const imageUrl = actor?.profile_path ? 
      `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 
      null;

    const age = calculateAge(actor.date_of_birth, actor.date_of_death);
    const sortedMovies = [...movies].sort((a, b) => (b.year || '0') - (a.year || '0'));
    
    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-32 h-40">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={actor.name}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{actor.name}</h2>
                  <div className="space-y-1 text-sm">
                    {actor.gender && (
                      <p className="text-gray-600">
                        <span className="font-medium">Gender:</span> {actor.gender}
                      </p>
                    )}
                    {actor.date_of_birth && (
                      <p className="text-gray-600">
                        <span className="font-medium">Born:</span> {formatDate(actor.date_of_birth)}
                        {age && ` (${age} years${actor.date_of_death ? ' old at death' : ' old'})`}
                      </p>
                    )}
                    {actor.date_of_death && (
                      <p className="text-gray-600">
                        <span className="font-medium">Died:</span> {formatDate(actor.date_of_death)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">Movies</span>
                  <span className="font-medium text-lg">{movies.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                {sortedMovies.length > 0 && (
                  <>
                    <div>
                      <span className="text-gray-500">Latest Movie</span>
                      <p className="font-medium">
                        {sortedMovies[0].title} 
                        {sortedMovies[0].year && ` (${sortedMovies[0].year})`}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">First Movie</span>
                      <p className="font-medium">
                        {sortedMovies[sortedMovies.length - 1].title}
                        {sortedMovies[sortedMovies.length - 1].year && 
                          ` (${sortedMovies[sortedMovies.length - 1].year})`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Movie Card
  if (type === 'movie' && data.movie && data.actors) {
    const { movie, actors } = data;

    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-48 h-72 relative">
              {isLoadingPoster ? (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
              ) : posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
                  <div className="space-y-1">
                    {movie.year && (
                      <p className="text-gray-600">
                        <span className="font-medium">Release Year:</span> {movie.year}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-medium">Cast:</span> {actors.length} {actors.length === 1 ? 'actor' : 'actors'} in database
                    </p>
                  </div>
                </div>
                {movie.rating && (
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">Rating</span>
                    <span className="font-medium text-lg">{movie.rating}</span>
                  </div>
                )}
              </div>

              {movie.overview && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Overview</h3>
                  <p className="text-sm text-gray-800">{movie.overview}</p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {actors.map((actor, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                    >
                      {actor.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export { DetailsCard };