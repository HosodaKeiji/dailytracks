// LoadingSpinner.tsx
export default function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-40">
        <svg
            className="animate-spin -ml-1 mr-3 h-10 w-10 text-[#00004d]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            ></circle>
            <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
        </svg>
        <span className="text-[#00004d] text-lg font-semibold">読み込み中...</span>
        </div>
    );
}
