import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hotelApi, roomApi } from "@/api/services";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";
import { Loader2, ChevronDown, Plus, X, ImagePlus, Upload } from "lucide-react";

const AMENITIES = [
  "WiFi",
  "AC",
  "TV",
  "Mini Bar",
  "Safe",
  "Balcony",
  "Ocean View",
  "Bathtub",
  "Room Service",
  "Parking",
  "Gym Access",
  "Pool Access",
];
const DEFAULT_ROOM_TYPES = [
  "Standard",
  "Deluxe",
  "Suite",
  "Executive Suite",
  "Presidential Suite",
  "Family Room",
  "Single",
  "Double",
  "Twin",
];

// ─── Room Type Combobox ───────────────────────────────────────────────────────

function RoomTypeCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = DEFAULT_ROOM_TYPES.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase()),
  );
  const showAddCustom =
    search.trim().length > 0 &&
    !DEFAULT_ROOM_TYPES.some((t) => t.toLowerCase() === search.toLowerCase());

  function select(type: string) {
    onChange(type);
    setSearch("");
    setOpen(false);
  }
  function addCustom() {
    const custom = search.trim();
    if (custom) {
      onChange(custom);
      setSearch("");
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || "Select or type a room type"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
            <div className="p-2 border-b border-slate-100">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search or type custom type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (filtered.length === 1) select(filtered[0]);
                    else if (showAddCustom) addCustom();
                  }
                  if (e.key === "Escape") setOpen(false);
                }}
                className="w-full text-sm px-2 py-1.5 outline-none bg-transparent placeholder:text-muted-foreground"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length > 0
                ? filtered.map((type) => (
                    <li key={type}>
                      <button
                        type="button"
                        onClick={() => select(type)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${value === type ? "text-blue-600 font-medium bg-blue-50" : "text-slate-700"}`}
                      >
                        {type}
                        {value === type && (
                          <span className="text-xs text-blue-400">
                            selected
                          </span>
                        )}
                      </button>
                    </li>
                  ))
                : !showAddCustom && (
                    <li className="px-3 py-2 text-sm text-muted-foreground">
                      No types found
                    </li>
                  )}
              {showAddCustom && (
                <li>
                  <button
                    type="button"
                    onClick={addCustom}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 border-t border-slate-100 mt-1 pt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add &quot;{search.trim()}&quot; as custom type
                  </button>
                </li>
              )}
            </ul>
          </div>
        </>
      )}

      {value && !DEFAULT_ROOM_TYPES.includes(value) && (
        <div className="mt-1.5 flex items-center gap-1">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Custom type
            <button
              type="button"
              onClick={() => onChange("Standard")}
              className="hover:text-amber-900"
              aria-label="Remove custom type"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Image Picker ─────────────────────────────────────────────────────────────
// Staged locally; uploaded to Cloudinary after the room is created.

function ImagePicker({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const next = [...files, ...Array.from(e.target.files)].slice(0, 10);
    onChange(next);
    e.target.value = "";
  }

  function remove(idx: number) {
    onChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {files.map((f, i) => (
          <div
            key={i}
            className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-dashed border-blue-300 group"
          >
            <img
              src={URL.createObjectURL(f)}
              alt={f.name}
              className="w-full h-full object-cover opacity-80"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        ))}

        {files.length < 10 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-500"
          >
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <p className="text-xs text-muted-foreground">
        Up to 10 images · JPG, PNG, WebP · Max 10 MB each · Hosted on Cloudinary
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddRoomPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState({
    roomNumber: "",
    roomType: "Standard",
    description: "",
    pricePerNight: "",
    capacity: "2",
    floor: "",
    amenities: [] as string[],
  });

  const { data: hotel } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => roomApi.create(hotel!.id, data),
    onSuccess: async (res) => {
      const createdRoom = res.data?.data || res.data;

      // Step 2: upload staged images to Cloudinary via the backend
      if (imageFiles.length > 0 && createdRoom?.id) {
        setUploadingImages(true);
        try {
          await roomApi.uploadImages(hotel!.id, createdRoom.id, imageFiles);
        } catch {
          toast.error(
            "Room created but image upload failed — add photos from the edit page.",
          );
        } finally {
          setUploadingImages(false);
        }
      }

      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room added successfully!");
      navigate("/rooms");
    },
    onError: (e: any) =>
      toast.error("Error", e.response?.data?.message || "Failed to add room"),
  });

  const toggleAmenity = (a: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      ...form,
      pricePerNight: parseFloat(form.pricePerNight),
      capacity: parseInt(form.capacity),
      floor: form.floor ? parseInt(form.floor) : undefined,
    });
  };

  const isBusy = isPending || uploadingImages;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Room</h1>
        <p className="text-muted-foreground text-sm">
          Add a new room to your hotel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Room Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Room Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Room Number *</Label>
                <Input
                  required
                  placeholder="101"
                  value={form.roomNumber}
                  onChange={(e) =>
                    setForm({ ...form, roomNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Room Type *</Label>
                <RoomTypeCombobox
                  value={form.roomType}
                  onChange={(v) => setForm({ ...form, roomType: v })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of the room"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Price / Night (₦) *</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  placeholder="25000"
                  value={form.pricePerNight}
                  onChange={(e) =>
                    setForm({ ...form, pricePerNight: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Capacity *</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  max="20"
                  placeholder="2"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Floor</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="1"
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Room Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <ImagePicker files={imageFiles} onChange={setImageFiles} />
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    form.amenities.includes(a)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-200 text-slate-600 hover:border-blue-400"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            {form.amenities.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Selected: {form.amenities.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/rooms")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadingImages ? "Uploading to Cloudinary..." : "Adding..."}
              </>
            ) : imageFiles.length > 0 ? (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add Room & Upload {imageFiles.length} Photo
                {imageFiles.length > 1 ? "s" : ""}
              </>
            ) : (
              "Add Room"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
