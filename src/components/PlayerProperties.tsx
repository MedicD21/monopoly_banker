import React from "react";
import { PROPERTIES } from "../constants/monopolyData";

type OwnedProperty = {
  name: string;
  houses?: number;
  hotel?: boolean;
  mortgaged?: boolean;
};

type PlayerPropertiesProps = {
  properties: OwnedProperty[];
  isCurrentUser: boolean;
  onManage: (propertyName: string) => void;
};

const PlayerProperties: React.FC<PlayerPropertiesProps> = ({
  properties,
  isCurrentUser,
  onManage,
}) => {
  if (!properties || properties.length === 0) return null;

  // Define the order of color groups (matches board order)
  const groupOrder = [
    "purple",
    "lightblue",
    "pink",
    "orange",
    "red",
    "yellow",
    "green",
    "darkblue",
    "railroad",
    "utility",
  ];

  // Sort properties by color group
  const sortedProperties = [...properties].sort((a, b) => {
    const propA = PROPERTIES.find((p) => p.name === a.name);
    const propB = PROPERTIES.find((p) => p.name === b.name);

    if (!propA || !propB) return 0;

    const groupIndexA = groupOrder.indexOf(propA.group);
    const groupIndexB = groupOrder.indexOf(propB.group);

    // Sort by group order first
    if (groupIndexA !== groupIndexB) {
      return groupIndexA - groupIndexB;
    }

    // Within the same group, maintain original order (board position)
    const boardIndexA = PROPERTIES.findIndex((p) => p.name === a.name);
    const boardIndexB = PROPERTIES.findIndex((p) => p.name === b.name);
    return boardIndexA - boardIndexB;
  });

  return (
    <div className="mt-3 border-t border-amber-900/30 pt-3">
      <h4 className="text-xs font-bold text-amber-500 mb-2">Properties</h4>
      <div className="space-y-1">
        {sortedProperties.map((prop, idx) => {
          const property = PROPERTIES.find((p) => p.name === prop.name);
          if (!property) return null;

          return (
            <div
              key={`${prop.name}-${idx}`}
              className="flex items-center justify-between text-xs bg-zinc-900/50 p-2 rounded"
            >
              <div className="flex items-center gap-2">
                {property.group === "railroad" ? (
                  <img
                    src="/images/Railroad.svg"
                    alt="Railroad"
                    className="w-4 h-4"
                  />
                ) : property.group === "utility" ? (
                  property.name === "Electric Company" ? (
                    <img
                      src="/images/Electric_Company.svg"
                      alt="Electric"
                      className="w-4 h-4"
                    />
                  ) : (
                    <img
                      src="/images/Waterworks.svg"
                      alt="Water"
                      className="w-4 h-4"
                    />
                  )
                ) : (
                  <div className={`w-3 h-3 rounded ${property.color}`}></div>
                )}
                <span
                  className={`${
                    prop.mortgaged
                      ? "text-zinc-500 line-through"
                      : "text-amber-100"
                  }`}
                >
                  {prop.name}
                </span>
                {prop.mortgaged && (
                  <span className="text-xs bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-bold">
                    MORT
                  </span>
                )}
                {!prop.mortgaged && prop.hotel ? (
                  <span className="flex items-center gap-0.5">
                    <img src="/images/Hotel.svg" alt="Hotel" className="w-4 h-4" />
                  </span>
                ) : !prop.mortgaged && prop.houses && prop.houses > 0 ? (
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: prop.houses }).map((_, i) => (
                      <img
                        key={i}
                        src="/images/House.svg"
                        alt="House"
                        className="w-3 h-3"
                      />
                    ))}
                  </span>
                ) : null}
              </div>

              {isCurrentUser && (
                <button
                  onClick={() => onManage(prop.name)}
                  className="text-amber-400 hover:text-amber-300"
                >
                  Manage
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerProperties;
