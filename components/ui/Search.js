'use client';

import { useState } from 'react';

/**
 * @typedef {Object} SearchProps
 * @property {(query: string) => void} onSearch
 * @property {string} [placeholder]
 */

/**
 * Typeahead search component.
 * @param {SearchProps} props
 */
export default function Search({ onSearch, placeholder = 'Search...' }) {
  const [query, setQuery] = useState('');

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (value.length >= 4) {
      onSearch(value);
    }
  }

  return (
    <div className="ui search">
      <div className="ui icon input">
        <input
          className="prompt"
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
        />
        <i className="search icon"></i>
      </div>
    </div>
  );
}
