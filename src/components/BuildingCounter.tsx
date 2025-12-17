import React from "react";
import { TOTAL_HOUSES, TOTAL_HOTELS } from "../constants/monopolyData";

type Props = {
  housesAvailable: number;
  hotelsAvailable: number;
};

const BuildingCounter: React.FC<Props> = ({
  housesAvailable,
  hotelsAvailable,
}) => {
  return (
    <div className="flex justify-center gap-4 mb-4 text-xs">
      <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded border border-amber-900/30">
        <img
          src="/images/House.svg"
          alt="Houses"
          className="w-10 h-10 drop-shadow-[0_0_10px_green]"
        />
        <span
          className={`font-bold ${
            housesAvailable <= 5 ? "text-red-400" : "text-amber-400"
          }`}
        >
          {housesAvailable}/{TOTAL_HOUSES}
        </span>
        <span className="text-amber-600">available</span>
      </div>
      <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded border border-amber-900/30">
        <img
          src="/images/Hotel.svg"
          alt="Hotels"
          className="w-10 h-10 drop-shadow-[0_0_5px_red]"
        />
        <span
          className={`font-bold ${
            hotelsAvailable <= 2 ? "text-red-400" : "text-amber-400"
          }`}
        >
          {hotelsAvailable}/{TOTAL_HOTELS}
        </span>
        <span className="text-amber-600">available</span>
      </div>
    </div>
  );
};

export default BuildingCounter;
