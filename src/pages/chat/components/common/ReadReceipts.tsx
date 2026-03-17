import React, { useState } from "react";
import { CheckCheck} from "lucide-react";
import type { ReadReceipt } from "../../types/read.receipt.type";

interface ReadReceiptsProps {
  receipts: ReadReceipt[];
  totalMembers?: number;
}

const ReadReceipts: React.FC<ReadReceiptsProps> = ({
  receipts,
  totalMembers,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (receipts.length === 0) {
    return <CheckCheck size={14} className="text-gray-400" />;
  }

  if (totalMembers) {
    return (
      <div className="relative group">
        <CheckCheck size={14} className="text-green-500" />
        <span className="absolute -top-5 -right-2 text-xs bg-gray-800 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition">
          {receipts.length}/{totalMembers}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="hover:bg-gray-100 rounded p-1"
      >
        <CheckCheck size={14} className="text-green-500" />
      </button>

      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border z-50">
            <div className="p-2 border-b">
              <h4 className="text-xs font-semibold">Lu par</h4>
            </div>
            <div className="max-h-40 overflow-y-auto p-1">
              {receipts.map((receipt) => (
                <div
                  key={receipt.userId}
                  className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded text-xs"
                >
                  {receipt.user.photo ? (
                    <img
                      src={receipt.user.photo}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center text-white text-[8px]">
                      {receipt.user.nom[0]}
                    </div>
                  )}
                  <span className="flex-1">
                    {receipt.user.prenom} {receipt.user.nom}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(receipt.readAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReadReceipts;
