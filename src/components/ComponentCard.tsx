import type { Component } from "@/types/api";

interface ComponentCardProps {
  component: Component;
}

export default function ComponentCard({ component }: ComponentCardProps) {
  const {
    title,
    url,
    description,
    parent,
    has_research,
    views,
    accessability,
  } = component;

  // Determine tag based on research status
  const tag = has_research ? "Research available" : "Needs research";
  const tagColor = has_research ? "green" : "yellow";

  const tagColorClasses = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 font-semibold mb-1 hover:underline cursor-pointer block"
      >
        {title}
      </a>
      <p className="text-xs text-gray-500 mb-3">{parent}</p>
      <p className="text-sm text-gray-700 mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${tagColorClasses[tagColor]}`}
        >
          {tag}
        </span>
        <div className="text-xs text-gray-500 flex items-center gap-3">
          <span title="Accessibility level">{accessability}</span>
          <span title="Views">{views} views</span>
        </div>
      </div>
    </div>
  );
}
