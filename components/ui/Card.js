'use client';

/**
 * @typedef {Object} CardProps
 * @property {string} title
 * @property {string} [image]
 * @property {string} [overview]
 * @property {number} [rating]
 */

/**
 * Reusable card component.
 * @param {CardProps} props
 */
export default function Card({ title, image, overview, rating }) {
  return (
    <div className="ui card">
      {image && (
        <div className="image">
          <img src={image} alt={title} />
        </div>
      )}
      <div className="content">
        <div className="header">{title}</div>
        {overview && <div className="description">{overview}</div>}
        {rating && (
          <div className="meta">
            <span className="rating">&#9733; {rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
