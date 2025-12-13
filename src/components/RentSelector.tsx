import React from 'react';
import { X } from 'lucide-react';

interface Property {
  name: string;
  houses: number;
  hotel: boolean;
}

interface PropertyDefinition {
  name: string;
  price: number;
  rent: number[];
  color: string;
  group: string;
}

interface Player {
  id: number;
  name: string;
  balance: number;
  properties: Property[];
}

interface RentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  landlord: Player;
  allPlayers: Player[];
  propertyDefinitions: PropertyDefinition[];
  onPayRent: (amount: number, propertyName: string) => void;
}

export default function RentSelector({
  isOpen,
  onClose,
  landlord,
  allPlayers,
  propertyDefinitions,
  onPayRent,
}: RentSelectorProps) {
  if (!isOpen) return null;

  const calculateRent = (propertyName: string): number => {
    const propertyDef = propertyDefinitions.find((p) => p.name === propertyName);
    const landlordProp = landlord.properties.find((p) => p.name === propertyName);

    if (!propertyDef || !landlordProp) return 0;

    // Railroad
    if (propertyDef.group === 'railroad') {
      const railroadCount = landlord.properties.filter((p) => {
        const def = propertyDefinitions.find((pd) => pd.name === p.name);
        return def?.group === 'railroad';
      }).length;
      return propertyDef.rent[railroadCount - 1] || 0;
    }

    // Utility
    if (propertyDef.group === 'utility') {
      const utilityCount = landlord.properties.filter((p) => {
        const def = propertyDefinitions.find((pd) => pd.name === p.name);
        return def?.group === 'utility';
      }).length;
      // For now, use a default dice roll of 7 (you could prompt for actual dice roll)
      const diceRoll = 7;
      return (utilityCount === 2 ? 10 : 4) * diceRoll;
    }

    // Regular property
    const groupProperties = propertyDefinitions.filter((p) => p.group === propertyDef.group);
    const landlordGroupProperties = landlord.properties.filter((lp) => {
      const def = propertyDefinitions.find((pd) => pd.name === lp.name);
      return def?.group === propertyDef.group;
    });

    const hasMonopoly = groupProperties.length === landlordGroupProperties.length;

    if (landlordProp.hotel) {
      return propertyDef.rent[5] || 0;
    } else if (landlordProp.houses > 0) {
      return propertyDef.rent[landlordProp.houses] || 0;
    } else if (hasMonopoly) {
      return (propertyDef.rent[0] || 0) * 2;
    } else {
      return propertyDef.rent[0] || 0;
    }
  };

  const getRentDescription = (propertyName: string): string => {
    const propertyDef = propertyDefinitions.find((p) => p.name === propertyName);
    const landlordProp = landlord.properties.find((p) => p.name === propertyName);

    if (!propertyDef || !landlordProp) return 'base';

    if (propertyDef.group === 'railroad') {
      const count = landlord.properties.filter((p) => {
        const def = propertyDefinitions.find((pd) => pd.name === p.name);
        return def?.group === 'railroad';
      }).length;
      return `${count}/4 railroads`;
    }

    if (propertyDef.group === 'utility') {
      const count = landlord.properties.filter((p) => {
        const def = propertyDefinitions.find((pd) => pd.name === p.name);
        return def?.group === 'utility';
      }).length;
      return `${count}/2 utilities × 7`;
    }

    const groupProperties = propertyDefinitions.filter((p) => p.group === propertyDef.group);
    const landlordGroupProperties = landlord.properties.filter((lp) => {
      const def = propertyDefinitions.find((pd) => pd.name === lp.name);
      return def?.group === propertyDef.group;
    });

    const hasMonopoly = groupProperties.length === landlordGroupProperties.length;

    if (landlordProp.hotel) {
      return 'HOTEL';
    } else if (landlordProp.houses > 0) {
      return `${landlordProp.houses} house${landlordProp.houses > 1 ? 's' : ''}`;
    } else if (hasMonopoly) {
      return 'Color set (2× base)';
    } else {
      return 'base';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
      <div className="bg-zinc-900 border border-amber-900/30 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-amber-400">
            Pay Rent to {landlord.name}
          </h3>
          <button onClick={onClose} className="text-amber-400 hover:text-amber-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2">
          {landlord.properties.map((prop) => {
            const propertyDef = propertyDefinitions.find((p) => p.name === prop.name);
            if (!propertyDef) return null;

            const rent = calculateRent(prop.name);
            const description = getRentDescription(prop.name);

            return (
              <div
                key={prop.name}
                className="bg-zinc-800 rounded-lg p-3 border border-amber-900/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {propertyDef.group === 'railroad' ? (
                      <img src="/images/Railroad.svg" alt="Railroad" className="w-5 h-5" />
                    ) : propertyDef.group === 'utility' ? (
                      propertyDef.name === 'Electric Company' ? (
                        <img src="/images/Electric_Company.svg" alt="Electric" className="w-5 h-5" />
                      ) : (
                        <img src="/images/Waterworks.svg" alt="Water" className="w-5 h-5" />
                      )
                    ) : (
                      <div className={`w-4 h-4 rounded ${propertyDef.color}`}></div>
                    )}
                    <span className="font-bold text-amber-50">{prop.name}</span>
                  </div>
                  {prop.hotel ? (
                    <img src="/images/Hotel.svg" alt="Hotel" className="w-5 h-5" />
                  ) : prop.houses > 0 ? (
                    <div className="flex gap-0.5">
                      {Array.from({ length: prop.houses }).map((_, i) => (
                        <img key={i} src="/images/House.svg" alt="House" className="w-4 h-4" />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-400">{description}</p>
                    <p className="text-lg font-bold text-amber-50">Rent: ${rent}</p>
                  </div>
                  <button
                    onClick={() => onPayRent(rent, prop.name)}
                    className="bg-orange-700 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                  >
                    Pay ${rent}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold py-3 rounded transition-colors border border-amber-900/30"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
