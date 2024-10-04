import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ActorDetails({ actor }) {
  const [filmography, setFilmography] = useState([]);

  useEffect(() => {
    const fetchFilmography = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/actors/${actor.name}/filmography`);
        setFilmography(response.data.movies || []);
      } catch (error) {
        console.error('Error fetching filmography:', error);
      }
    };

    if (actor) {
      fetchFilmography();
    }
  }, [actor]);

  if (!actor) return null;

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">{actor.name}</h2>
      <p><strong>Date of Birth:</strong> {actor.date_of_birth || 'Unknown'}</p>
      <p><strong>Gender:</strong> {actor.gender || 'Unknown'}</p>
      <h3 className="text-xl font-bold mt-4 mb-2">Filmography</h3>
      <ul className="list-disc pl-5">
        {filmography.map((movie, index) => (
          <li key={index}>{movie.title} ({movie.year})</li>
        ))}
      </ul>
    </div>
  );
}
