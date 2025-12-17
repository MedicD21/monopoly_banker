import React from "react";

type Props = {
  onTellerPays: () => void;
  onPassGo: () => void;
  onBuyProperty: () => void;
};

const BankerPrimaryActions: React.FC<Props> = ({
  onTellerPays,
  onPassGo,
  onBuyProperty,
}) => {
  return (
    <>
      {/* First Row: Banker Pays centered */}
      <button
        onClick={onTellerPays}
        className="bg-green-300 hover:bg-green-200 w-40 h-10 text-black text-xl rounded-xl font-bold transition-colors flex text-center items-center justify-center gap-2 mb-3 mx-auto relative"
      >
        <img
          src="/images/Banker.svg"
          alt="Banker"
          className="w-auto h-20 flex right-40 absolute drop-shadow-[0_0_3px_white]"
        />
        Teller Pays
      </button>

      {/* Pass GO / Buy Property */}
      <div className="flex gap-2 flex-wrap justify-center w-full">
        <button
          onClick={onPassGo}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-black text-lg drop-shadow-[0_0_10px_amber] -mt-3 mb-9 px-4 py-2 rounded-3xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          <img
            src="/images/Go.svg"
            alt="GO"
            className="w-auto h-20 -mt-3 -mb-3 pointer-events-none"
          />
          Pass GO
        </button>

        <button
          onClick={onBuyProperty}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-black text-lg drop-shadow-[0_0_10px_amber] -mt-3 mb-9 px-4 py-2 rounded-3xl font-bold transition-colors flex items-center justify-center gap-2"
        >
          <img
            src="/images/property.svg"
            alt="property"
            className="w-auto h-20 pb-1 pt-1 -mt-2 -mb-2 pointer-events-none"
          />
          Buy Property
        </button>
      </div>
    </>
  );
};

export default BankerPrimaryActions;
