interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

export default function SearchHeader({
  searchQuery,
  setSearchQuery,
  onSearch,
  isSearching,
}: SearchHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-purple-700 to-pink-600 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-sm font-semibold mb-8">GOV Route Library</h1>

        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">
            Describe a user need.
            <br />
            Discover the right component.
          </h2>
          <p className="text-purple-100 text-sm">
            Browse all your users are trying to do — or type in your
            <br />
            own query to find design components across Government.
          </p>
        </div>

        <div className="bg-white rounded-md p-1 flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search for a component
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="send an example of a service renewal notification"
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none rounded"
            />
          </div>
          <button
            onClick={onSearch}
            disabled={isSearching}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium transition-colors disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search design systems"}
          </button>
        </div>
      </div>
    </header>
  );
}
