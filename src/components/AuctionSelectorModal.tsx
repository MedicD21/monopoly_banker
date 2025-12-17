import React from "react";

type Property = {
  name: string;
  price: number;
  group: string;
  color: string;
};

type Props = {
  isOpen: boolean;
  properties: Property[];
  onSelect: (property: Property) => void;
  onClose: () => void;
};

const AuctionSelectorModal: React.FC<Props> = ({
  isOpen,
  properties,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  const content = (
    <div className="bg-zinc-900 border border-amber-900/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="float-right text-amber-400 hover:text-amber-300 mb-2"
      >
        ✕
      </button>
      <div className="clear-both">
        <h3 className="text-xl font-bold text-amber-400 mb-4">
          Select Property to Auction
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {properties.map((property) => (
            <div
              key={property.name}
              className="flex items-center justify-between bg-zinc-800 p-3 rounded"
            >
              <div className="flex items-center gap-2">
                {property.group === "railroad" ? (
                  <img
                    src="/images/Railroad.svg"
                    alt="Railroad"
                    className="w-5 h-5"
                  />
                ) : property.group === "utility" ? (
                  property.name === "Electric Company" ? (
                    <img
                      src="/images/Electric_Company.svg"
                      alt="Electric"
                      className="w-5 h-5"
                    />
                  ) : (
                    <img
                      src="/images/Waterworks.svg"
                      alt="Water"
                      className="w-5 h-5"
                    />
                  )
                ) : (
                  <div className={`w-4 h-4 rounded ${property.color}`}></div>
                )}
                <span className="text-amber-100 font-bold">
                  {property.name}
                </span>
                <span className="text-amber-400 ml-2">${property.price}</span>
              </div>
              <button
                onClick={() => onSelect(property)}
                className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
              >
                Start
              </button>
            </div>
          ))}
          {properties.length === 0 && (
            <div className="text-amber-400 text-center">
              All properties are owned.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4">
      {content}
    </div>
  );
};

export default AuctionSelectorModal;
