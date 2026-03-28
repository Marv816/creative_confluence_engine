import React from 'react';
import Select from '../../../components/ui/Select';

const GenreSelector = ({ selectedGenre, onGenreChange }) => {
  const genreOptions = [
    { value: 'hip-hop', label: 'Hip-Hop/Rap' },
    { value: 'rnb', label: 'R&B/Soul' },
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock/Alternative' },
    { value: 'country', label: 'Country' },
    { value: 'electronic', label: 'Electronic/EDM' },
    { value: 'jazz', label: 'Jazz/Blues' },
    { value: 'folk', label: 'Folk/Acoustic' },
    { value: 'metal', label: 'Metal/Hard Rock' },
    { value: 'indie', label: 'Indie/Alternative' },
  ];

  return (
    <Select
      label="Musical Genre"
      description="Choose the genre that matches your creative direction"
      options={genreOptions}
      value={selectedGenre}
      onChange={onGenreChange}
      placeholder="Select a genre"
      searchable
    />
  );
};

export default GenreSelector;