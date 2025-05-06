import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>Page not found</p>
      <p>The page you are looking for doesn't exist or has been moved.</p>
    </div>
  );
};

export default NotFound;