export default function MovieDetails({ movie }) {
  if (!movie) return null;

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">{movie.title}</h2>
      <p><strong>Year:</strong> {movie.year}</p>
      {/* Add more movie details here as needed */}
    </div>
  );
}
