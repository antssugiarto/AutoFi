import { useState } from "react";
import { IconClose, IconTune } from "./icons";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [slippage, setSlippage] = useState("Auto");
  const [priority, setPriority] = useState("Fast");
  const [customSlippage, setCustomSlippage] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-surface-container-high rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-headline font-bold flex items-center gap-2">
              <IconTune size={24} className="text-primary" />
              Transaction Settings
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center hover:bg-surface-bright transition-colors text-on-surface-variant hover:text-white"
            >
              <IconClose size={16} />
            </button>
          </div>

          <div className="space-y-8">
            {/* Slippage Tolerance */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-on-surface">Slippage Tolerance</label>
                <span className="text-xs text-on-surface-variant tooltip-trigger" title="Your transaction will revert if the price changes unfavorably by more than this percentage.">
                  What is this?
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["Auto", "0.1%", "0.5%"].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setSlippage(val);
                      setCustomSlippage("");
                    }}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                      slippage === val 
                        ? "bg-primary text-on-primary font-bold" 
                        : "bg-surface-container-lowest text-on-surface-variant hover:text-white hover:bg-surface-variant"
                    }`}
                  >
                    {val}
                  </button>
                ))}
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => {
                      setCustomSlippage(e.target.value);
                      setSlippage("Custom");
                    }}
                    className={`w-full h-full py-2 px-3 rounded-xl bg-surface-container-lowest text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary ${
                      slippage === "Custom" ? "ring-1 ring-primary text-white" : "text-on-surface-variant"
                    }`}
                  />
                  {customSlippage && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">%</span>}
                </div>
              </div>
              {slippage === "Custom" && parseFloat(customSlippage) > 5 && (
                <p className="text-xs text-error mt-2">
                  High slippage! Your transaction may be frontrun.
                </p>
              )}
            </div>

            {/* Priority Fee */}
            <div>
              <label className="text-sm font-bold text-on-surface mb-3 block">Network Priority Fee</label>
              <div className="bg-surface-container-lowest p-1 rounded-2xl flex relative">
                {["Standard", "Fast", "Turbo"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPriority(val)}
                    className={`flex-1 py-2.5 rounded-xl text-sm transition-all duration-300 z-10 ${
                      priority === val ? "text-white font-bold" : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    {val}
                  </button>
                ))}
                {/* Sliding active background */}
                <div 
                  className="absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-surface-variant rounded-xl transition-transform duration-300 shadow-sm"
                  style={{
                    transform: `translateX(${
                      priority === "Standard" ? "2px" : priority === "Fast" ? "calc(100% + 6px)" : "calc(200% + 10px)"
                    })`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface-container-low border-t border-outline-variant/10">
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dim text-on-primary font-bold active:scale-95 transition-transform"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
