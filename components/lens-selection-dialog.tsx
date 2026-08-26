"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { formatPKR } from "@/lib/utils";
import type { LensOption, LensSelection } from "@/types";
import { CheckCircle2, Circle, MessageCircle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (selection: LensSelection) => void;
};

const EYESIGHT_TYPES = [
  "Single Vision",
  "Bifocal",
  "Progressive",
  "Cylinder",
  "Conical",
  "Reading",
];

export function LensSelectionDialog({ open, onClose, onConfirm }: Props) {
  const [lensType, setLensType] = useState<"no_eyesight" | "eyesight">("no_eyesight");
  const [prescriptionMethod, setPrescriptionMethod] = useState<"manual" | "upload">("manual");
  const [rightEye, setRightEye] = useState("");
  const [leftEye, setLeftEye] = useState("");
  const [eyesightType, setEyesightType] = useState(EYESIGHT_TYPES[0]);
  const [selectedLensOptionId, setSelectedLensOptionId] = useState<string>("");
  const [lensOptions, setLensOptions] = useState<LensOption[]>([]);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("lens_options")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setLensOptions(data as LensOption[]);
      });
  }, [open]);

  function handleConfirm() {
    if (lensType === "no_eyesight") {
      onConfirm({ lens_type: "no_eyesight" });
      reset();
      return;
    }

    if (prescriptionMethod === "manual") {
      if (!rightEye && !leftEye) {
        alert("Please enter at least one eyesight value.");
        return;
      }
      onConfirm({
        lens_type: "eyesight",
        prescription_method: "manual",
        right_eye: rightEye ? parseFloat(rightEye) : undefined,
        left_eye: leftEye ? parseFloat(leftEye) : undefined,
        eyesight_type: eyesightType,
        selected_lens_option_id: selectedLensOptionId || undefined,
      });
    } else {
      onConfirm({
        lens_type: "eyesight",
        prescription_method: "upload",
        selected_lens_option_id: selectedLensOptionId || undefined,
      });
    }
    reset();
  }

  function reset() {
    setLensType("no_eyesight");
    setPrescriptionMethod("manual");
    setRightEye("");
    setLeftEye("");
    setEyesightType(EYESIGHT_TYPES[0]);
    setSelectedLensOptionId("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Lense</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-ink/60">Do you need eyesight lenses?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLensType("no_eyesight")}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                lensType === "no_eyesight"
                  ? "border-ink ring-1 ring-ink bg-ink/5"
                  : "border-ink/15 hover:border-ink/40"
              }`}
            >
              {lensType === "no_eyesight" ? (
                <CheckCircle2 className="h-5 w-5 text-ink shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-ink/30 shrink-0" />
              )}
              <div>
                <p className="font-medium text-sm">No Eyesight</p>
                <p className="text-xs text-ink/50">Plain glass / sunglasses</p>
              </div>
            </button>
            <button
              onClick={() => setLensType("eyesight")}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                lensType === "eyesight"
                  ? "border-ink ring-1 ring-ink bg-ink/5"
                  : "border-ink/15 hover:border-ink/40"
              }`}
            >
              {lensType === "eyesight" ? (
                <CheckCircle2 className="h-5 w-5 text-ink shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-ink/30 shrink-0" />
              )}
              <div>
                <p className="font-medium text-sm">Eyesight Lenses</p>
                <p className="text-xs text-ink/50">Prescription lenses</p>
              </div>
            </button>
          </div>
        </div>

        {lensType === "eyesight" && (
          <div className="space-y-4 mt-2 border-t border-ink/10 pt-4">
            <div className="flex gap-2">
              <button
                onClick={() => setPrescriptionMethod("manual")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                  prescriptionMethod === "manual"
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/20 hover:border-ink/50"
                }`}
              >
                Add Eyesight Manually
              </button>
              <button
                onClick={() => setPrescriptionMethod("upload")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                  prescriptionMethod === "upload"
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/20 hover:border-ink/50"
                }`}
              >
                Send Prescription Image
              </button>
            </div>

            {prescriptionMethod === "manual" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-ink/60 mb-1 block">Right Eye (OD)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      placeholder="e.g. -2.00"
                      value={rightEye}
                      onChange={(e) => setRightEye(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-ink/60 mb-1 block">Left Eye (OS)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      placeholder="e.g. -1.75"
                      value={leftEye}
                      onChange={(e) => setLeftEye(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-ink/60 mb-1 block">Lenses Type</Label>
                  <select
                    value={eyesightType}
                    onChange={(e) => setEyesightType(e.target.value)}
                    className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-ink/20"
                  >
                    {EYESIGHT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {prescriptionMethod === "upload" && (
              <div className="flex items-start gap-3 p-4 bg-ink/5 rounded-lg">
                <MessageCircle className="h-5 w-5 shrink-0 mt-0.5 text-ink/50" />
                <div>
                  <p className="text-sm font-medium">Send on WhatsApp</p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    After placing the order, send your prescription image in the WhatsApp chat.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs text-ink/60 block">Choose Lens Package</Label>
              <div className="grid grid-cols-3 gap-3">
                {lensOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedLensOptionId(opt.id)}
                    className={`rounded-xl border-2 p-2 text-center transition-all ${
                      selectedLensOptionId === opt.id
                        ? "border-ink ring-1 ring-ink bg-ink/5"
                        : "border-ink/15 hover:border-ink/40"
                    }`}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-cream">
                      <Image src={opt.image_url} alt={opt.title} fill className="object-cover" />
                    </div>
                    <p className="text-xs font-medium leading-tight">{opt.title}</p>
                    <p className="text-xs text-ink/50 mt-0.5">
                      {opt.price > 0 ? `+${formatPKR(opt.price)}` : "Free"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-ink/10 mt-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm}>
            {lensType === "no_eyesight" ? "Add to Cart" : "Confirm & Add to Cart"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
