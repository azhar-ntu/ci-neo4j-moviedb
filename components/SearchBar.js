import { useState } from 'react';
import axios from 'axios';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('actor');

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/search/${searchType}s?query=${query}`);
      if (response.data.length > 0) {
        onSearch(response.data[0]);
      } else {
        alert('No results found');
      }
    } catch (error) {
      console.error('Error searching:', error);
      alert('Error searching. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="border p-2 rounded-l"
      />
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        className="border-t border-b border-r p-2"
      >
        <option value="actor">Actor</option>
        <option value="movie">Movie</option>
      </select>
      <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded-r">
        Search
      </button>
    </div>
  );
}
