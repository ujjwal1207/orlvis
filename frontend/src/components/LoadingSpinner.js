import React from 'react'

const LoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`loading-container ${className}`}>
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {text && <p className='loading-text'>{text}</p>}

      <style>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
        }

        .spinner {
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .w-4 {
          width: 1rem;
          height: 1rem;
        }
        .w-8 {
          width: 2rem;
          height: 2rem;
        }
        .w-12 {
          width: 3rem;
          height: 3rem;
        }
        .w-16 {
          width: 4rem;
          height: 4rem;
        }

        .loading-text {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingSpinner
