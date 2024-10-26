export const Checkbox = ({ 
    id, 
    checked, 
    onChange, 
    label,
    className = ""
  }) => {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only" // Hidden actual checkbox
          />
          <div className={`
            w-4 h-4 border rounded
            cursor-pointer
            transition-colors
            hover:bg-gray-100
            ${checked 
              ? 'bg-blue-500 border-blue-500' 
              : 'bg-white border-gray-300'
            }
          `}>
            {/* Checkmark */}
            {checked && (
              <svg 
                className="w-4 h-4 text-white" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
        </div>
        {label && (
          <label 
            htmlFor={id}
            className="text-sm text-gray-700 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  };