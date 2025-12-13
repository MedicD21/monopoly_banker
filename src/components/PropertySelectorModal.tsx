import React, { useState } from "react";
import { X, Search } from "lucide-react";

interface Property {
  name: string;
  price: number;
  rent: number[];
  color: string;
  group: string;
}

interface PropertySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  ownedProperties: string[];
  onSelectProperty: (property: Property) => void;
}

export default function PropertySelectorModal({
  isOpen,
  onClose,
  properties,
  ownedProperties,
  onSelectProperty,
}: PropertySelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  // Filter available properties (not owned)
  const availableProperties = properties.filter(
    (prop) => !ownedProperties.includes(prop.name)
  );

  // Filter by search term
  const filteredProperties = availableProperties.filter((prop) =>
    prop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group properties by color group
  const groupedProperties = filteredProperties.reduce((acc, prop) => {
    if (!acc[prop.group]) {
      acc[prop.group] = [];
    }
    acc[prop.group].push(prop);
    return acc;
  }, {} as Record<string, Property[]>);

  const colorGroupNames: Record<string, string> = {
    purple: "Purple",
    lightblue: "Light Blue",
    pink: "Pink",
    orange: "Orange",
    red: "Red",
    yellow: "Yellow",
    green: "Green",
    darkblue: "Dark Blue",
    railroad: "Railroads",
    utility: "Utilities",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-amber-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-400">
            Select Property to Auction
          </h2>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search properties..."
            className="w-full bg-zinc-800 border border-amber-600 text-amber-50 rounded pl-10 pr-4 py-2"
          />
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-8 text-amber-600">
            {availableProperties.length === 0
              ? "All properties are owned!"
              : "No properties match your search."}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedProperties).map(([group, props]) => (
              <div key={group}>
                <h3 className="text-amber-400 font-bold mb-2">
                  {colorGroupNames[group] || group}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {props.map((property) => (
                    <button
                      key={property.name}
                      onClick={() => {
                        onSelectProperty(property);
                        onClose();
                      }}
                      className="bg-zinc-800 hover:bg-zinc-700 border border-amber-900/30 hover:border-amber-600 rounded-lg p-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-4 h-4 ${property.color} rounded`}
                        ></div>
                        <span className="text-amber-50 font-semibold">
                          {property.name}
                        </span>
                      </div>
                      <div className="text-sm text-amber-600">
                        Price: ${property.price.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
