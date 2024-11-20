import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, User, Film } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  searchType, 
  onSearch, 
  onTypeChange 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const lastQuery = useRef(searchQuery);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Prevent duplicate fetches
    if (query === lastQuery.current) return;
    lastQuery.current = query;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:10000/autocomplete/${searchType}?query=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [searchType]);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSearchClick = () => {
    setShowSuggestions(false);
    onSearch();
  };

  // Handle click outside to close suggestions
  const wrapperRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex gap-4 mb-8 relative">
      <div className="flex-1 relative" ref={wrapperRef}>
        <Input
          placeholder={`Search for ${searchType === "actor" ? "an actor" : "a movie"}...`}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchClick();
            }
          }}
          className="w-full"
        />
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute w-full mt-1 z-50 max-h-60 overflow-y-auto shadow-lg">
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </Card>
        )}
        
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={searchType === "actor" ? "default" : "outline"}
          onClick={() => onTypeChange("actor")}
        >
          <User className="w-4 h-4 mr-2" />
          Actor
        </Button>
        <Button
          variant={searchType === "movie" ? "default" : "outline"}
          onClick={() => onTypeChange("movie")}
        >
          <Film className="w-4 h-4 mr-2" />
          Movie
        </Button>
      </div>

      <Button onClick={handleSearchClick}>
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
    </div>
  );
};

export {SearchBar };