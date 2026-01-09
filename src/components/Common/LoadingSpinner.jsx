// import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  const sizeClass = {
    small: 'spinner-sm',
    medium: 'spinner-md',
    large: 'spinner-lg'
  }[size];

  if (fullScreen) {
    return (
      <div className="fullscreen-spinner">
        <div className={`spinner ${sizeClass}`}></div>
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass}`}></div>
    </div>
  );
};

export default LoadingSpinner;