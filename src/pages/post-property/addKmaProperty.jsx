import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Plus, Trash2, Upload, Star } from "lucide-react";
import { axiosInstance } from "../../services/axiosService";
import {
  getCityApiHandler,
  getPropertyListApiHandler,
  getPropertyCategoryApiHandler,
  getPropertyTypeApiHandler,
  getBhkApiHandler,
  getFileUploadUrlApiHandler,
  uploadFileToS3ApiHandler,
} from "../../services/masterService";

const PHOTO_VIEWS = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Balcony",
  "Exterior",
  "Parking",
  "Amenities",
  "Other",
];

/**
 * Stash the KMA Internal CP token in sessionStorage so all property/* and
 * uploads/* calls on this page are authenticated as that CP. Cleared on
 * unmount so it does not leak into other admin pages.
 */
function useKmaCpSession() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axiosInstance.post("admin/auth/kma-internal-login");
        if (cancelled) return;
        if (!data?.accessToken || !data?.refreshToken) {
          setError("Failed to issue KMA Internal CP tokens");
          return;
        }
        sessionStorage.setItem("cpAccessToken", data.accessToken);
        sessionStorage.setItem("cpRefreshToken", data.refreshToken);
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        const msg = err?.response?.data?.message || err?.message || "Failed to authenticate as KMA Internal CP";
        setError(Array.isArray(msg) ? msg.join(", ") : msg);
      }
    })();
    return () => {
      cancelled = true;
      sessionStorage.removeItem("cpAccessToken");
      sessionStorage.removeItem("cpRefreshToken");
    };
  }, []);

  return { ready, error };
}

const TextField = ({ label, required, error, children }) => (
  <label className="block">
    <span className="block text-xs font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-600">*</span>}
    </span>
    {children}
    {error && <span className="block mt-1 text-xs text-red-600">{error}</span>}
  </label>
);

export default function AddKmaProperty() {
  const session = useKmaCpSession();

  // Form state
  const [listingTypeId, setListingTypeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [propertyTypeId, setPropertyTypeId] = useState("");
  const [bhkTypeId, setBhkTypeId] = useState("");
  const [cityId, setCityId] = useState("");
  const [societyName, setSocietyName] = useState("");
  const [localityName, setLocalityName] = useState("");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [carpetArea, setCarpetArea] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [price, setPrice] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); // [{file, view, isCover, fileKey?}]
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Master data
  const { data: listingTypes } = useQuery({
    queryKey: ["pp-listing-types"],
    queryFn: getPropertyListApiHandler,
    enabled: session.ready,
    select: (r) => r?.data ?? r ?? [],
  });
  const { data: categories } = useQuery({
    queryKey: ["pp-categories"],
    queryFn: getPropertyCategoryApiHandler,
    enabled: session.ready,
    select: (r) => r?.data ?? r ?? [],
  });
  const { data: cities } = useQuery({
    queryKey: ["pp-cities"],
    queryFn: getCityApiHandler,
    enabled: session.ready,
    select: (r) => r?.data ?? r ?? [],
  });

  const listingTypeCode = useMemo(
    () => listingTypes?.find((l) => l.id === listingTypeId)?.code,
    [listingTypes, listingTypeId]
  );
  const categoryCode = useMemo(
    () => categories?.find((c) => c.id === categoryId)?.code,
    [categories, categoryId]
  );
  const isRent = listingTypeCode === "rent";

  const { data: propertyTypes } = useQuery({
    queryKey: ["pp-property-types", listingTypeCode, categoryCode],
    queryFn: () =>
      getPropertyTypeApiHandler({
        propertyListType: listingTypeCode,
        propertyCategory: categoryCode,
      }),
    enabled: !!listingTypeCode && !!categoryCode,
    select: (r) => r?.data ?? r ?? [],
  });

  const { data: bhkTypes } = useQuery({
    queryKey: ["pp-bhk-types", propertyTypeId],
    queryFn: () => getBhkApiHandler({ propertyTypeId }),
    enabled: !!propertyTypeId,
    select: (r) => r?.bhkTypes ?? r?.data ?? r ?? [],
  });

  // Reset downstream selections when their parent changes.
  useEffect(() => { setPropertyTypeId(""); setBhkTypeId(""); }, [listingTypeId, categoryId]);
  useEffect(() => { setBhkTypeId(""); }, [propertyTypeId]);

  const onAddPhotos = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      view: "Living Room",
      isCover: false,
    }));
    setPhotos((prev) => {
      const next = [...prev, ...newPhotos];
      if (next.length && !next.some((p) => p.isCover)) next[0].isCover = true;
      return next;
    });
    e.target.value = ""; // allow re-selecting same file
  };
  const removePhoto = (idx) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length && !next.some((p) => p.isCover)) next[0].isCover = true;
      return next;
    });
  };
  const setCover = (idx) => {
    setPhotos((prev) => prev.map((p, i) => ({ ...p, isCover: i === idx })));
  };
  const setView = (idx, view) => {
    setPhotos((prev) => prev.map((p, i) => (i === idx ? { ...p, view } : p)));
  };

  const validate = () => {
    const e = {};
    if (!listingTypeId) e.listingTypeId = "Required";
    if (!categoryId) e.categoryId = "Required";
    if (!propertyTypeId) e.propertyTypeId = "Required";
    if (!cityId) e.cityId = "Required";
    if (!societyName.trim()) e.societyName = "Required";
    if (!localityName.trim()) e.localityName = "Required";
    if (isRent) {
      if (!monthlyRent || Number(monthlyRent) < 1500) e.monthlyRent = "Min ₹1500";
    } else {
      if (!price || Number(price) <= 0) e.price = "Required";
    }
    if (photos.length < 2) e.photos = "Upload at least 2 photos";
    if (photos.length > 0 && !photos.some((p) => p.isCover)) e.photos = "Pick a cover photo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitProperty = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const tId = toast.loading("Creating property...");
    try {
      // Step 1: create
      const step1Payload = {
        listingTypeId,
        categoryId,
        propertyTypeId,
        ...(bhkTypeId ? { bhk: { id: bhkTypeId } } : {}),
        city: { id: cityId },
        society: { name: societyName.trim(), localityName: localityName.trim() },
        ...(builtUpArea ? { builtUpArea: Number(builtUpArea), builtUpAreaUnit: "Sq.Ft." } : {}),
        ...(carpetArea ? { carpetArea: Number(carpetArea), carpetAreaUnit: "Sq.Ft." } : {}),
      };
      const step1Res = await axiosInstance.post("property/step-1", step1Payload);
      const propertyId = step1Res?.data?.id ?? step1Res?.data?.propertyId;
      if (!propertyId) throw new Error("Step 1 did not return a propertyId");

      // Step 2: pricing + floor
      toast.update(tId, { render: "Saving pricing details...", isLoading: true });
      const step2Payload = {
        propertyId,
        ...(floorNumber ? { floorNumber: Number(floorNumber) } : {}),
        ...(totalFloors ? { totalFloors: Number(totalFloors) } : {}),
        ...(isRent
          ? { monthlyRent: Number(monthlyRent), rentAvailability: "immediately" }
          : { price: Number(price) }),
      };
      await axiosInstance.post("property/step-2", step2Payload);

      // Step 3: description
      toast.update(tId, { render: "Saving description...", isLoading: true });
      await axiosInstance.post("property/step-3", {
        propertyId,
        ...(description.trim() ? { propertyDescription: description.trim() } : {}),
      });

      // Step 4: upload photos to S3 and submit
      toast.update(tId, { render: "Uploading photos...", isLoading: true });
      const uploadedPhotos = [];
      for (const p of photos) {
        const presign = await getFileUploadUrlApiHandler({
          fileName: p.file.name,
          fileType: p.file.type,
          folder: "properties",
        });
        const url = presign?.data?.uploadUrl ?? presign?.uploadUrl ?? presign?.url;
        const fileKey = presign?.data?.fileKey ?? presign?.fileKey ?? presign?.key;
        if (!url || !fileKey) throw new Error("Failed to get upload URL");
        await uploadFileToS3ApiHandler({ url, file: p.file });
        uploadedPhotos.push({ fileKey, view: p.view, isCoverImage: !!p.isCover });
      }

      toast.update(tId, { render: "Publishing property...", isLoading: true });
      await axiosInstance.post("property/step-4", {
        propertyId,
        photos: uploadedPhotos,
      });

      toast.update(tId, {
        render: "Property published! It is now live.",
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });

      // Reset form
      setListingTypeId("");
      setCategoryId("");
      setPropertyTypeId("");
      setBhkTypeId("");
      setCityId("");
      setSocietyName("");
      setLocalityName("");
      setBuiltUpArea("");
      setCarpetArea("");
      setFloorNumber("");
      setTotalFloors("");
      setPrice("");
      setMonthlyRent("");
      setDescription("");
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      setErrors({});
    } catch (err) {
      console.error("Add KMA Property failed", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to publish property";
      toast.update(tId, {
        render: Array.isArray(msg) ? msg.join(", ") : msg,
        type: "error",
        isLoading: false,
        autoClose: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (session.error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Add KMA Property</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {session.error}
        </div>
      </div>
    );
  }
  if (!session.ready) {
    return (
      <div className="p-6 flex items-center gap-3 text-sm text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Initialising KMA Internal CP session…
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Add KMA Property</h1>
        <p className="text-xs text-gray-500 mt-1">
          Posting as <span className="font-medium">KMA Internal CP</span>. Properties added here are
          auto-approved and go live immediately.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-6">
        {/* Listing + Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Listing Type" required error={errors.listingTypeId}>
            <select
              value={listingTypeId}
              onChange={(e) => setListingTypeId(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="">Select…</option>
              {(listingTypes ?? []).map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </TextField>
          <TextField label="Category" required error={errors.categoryId}>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="">Select…</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </TextField>
        </div>

        {/* Property Type + BHK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Property Type" required error={errors.propertyTypeId}>
            <select
              value={propertyTypeId}
              onChange={(e) => setPropertyTypeId(e.target.value)}
              disabled={!listingTypeCode || !categoryCode}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm disabled:bg-gray-100"
            >
              <option value="">{!listingTypeCode || !categoryCode ? "Pick listing + category first" : "Select…"}</option>
              {(propertyTypes ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </TextField>
          <TextField label="BHK">
            <select
              value={bhkTypeId}
              onChange={(e) => setBhkTypeId(e.target.value)}
              disabled={!propertyTypeId}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm disabled:bg-gray-100"
            >
              <option value="">{!propertyTypeId ? "Pick property type first" : "Select…"}</option>
              {(bhkTypes ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </TextField>
        </div>

        {/* City + Locality + Society */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField label="City" required error={errors.cityId}>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="">Select…</option>
              {(cities ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </TextField>
          <TextField label="Locality" required error={errors.localityName}>
            <input
              type="text"
              value={localityName}
              onChange={(e) => setLocalityName(e.target.value)}
              placeholder="e.g. Sector 49"
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            />
          </TextField>
          <TextField label="Society / Project" required error={errors.societyName}>
            <input
              type="text"
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              placeholder="e.g. Pyramid Midtown"
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            />
          </TextField>
        </div>

        {/* Areas + Floor */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField label="Built-up Area (Sq.Ft.)">
            <input type="number" value={builtUpArea} onChange={(e) => setBuiltUpArea(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm" />
          </TextField>
          <TextField label="Carpet Area (Sq.Ft.)">
            <input type="number" value={carpetArea} onChange={(e) => setCarpetArea(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm" />
          </TextField>
          <TextField label="Floor Number">
            <input type="number" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm" />
          </TextField>
          <TextField label="Total Floors">
            <input type="number" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm" />
          </TextField>
        </div>

        {/* Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isRent ? (
            <TextField label="Monthly Rent (₹)" required error={errors.monthlyRent}>
              <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm" />
            </TextField>
          ) : (
            <TextField label="Sale Price (₹)" required error={errors.price}>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 7500000"
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm" />
            </TextField>
          )}
        </div>

        {/* Description */}
        <TextField label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            placeholder="Brief description shown on the listing"
            className="w-full rounded-md border border-gray-300 p-3 text-sm" />
        </TextField>

        {/* Photos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">
              Photos <span className="text-red-600">*</span>
              <span className="ml-2 text-gray-500">min 2 — pick a cover</span>
            </span>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-blue-700 hover:underline">
              <Upload className="w-4 h-4" />
              Add photos
              <input type="file" multiple accept="image/*" className="hidden" onChange={onAddPhotos} />
            </label>
          </div>
          {errors.photos && <div className="text-xs text-red-600 mb-2">{errors.photos}</div>}
          {photos.length === 0 ? (
            <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-md p-6 text-center">
              No photos yet. Click <span className="font-medium">Add photos</span> above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((p, idx) => (
                <div key={idx} className={`relative border rounded-md p-2 ${p.isCover ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                  <img src={p.preview} alt="" className="w-full h-28 object-cover rounded" />
                  <select
                    value={p.view}
                    onChange={(e) => setView(idx, e.target.value)}
                    className="mt-2 w-full h-7 rounded border border-gray-300 px-1 text-[11px]"
                  >
                    {PHOTO_VIEWS.map((v) => (<option key={v} value={v}>{v}</option>))}
                  </select>
                  <div className="mt-1 flex items-center justify-between">
                    <button type="button" onClick={() => setCover(idx)}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${p.isCover ? "text-blue-700" : "text-gray-600 hover:text-gray-900"}`}>
                      <Star className={`w-3.5 h-3.5 ${p.isCover ? "fill-blue-500 text-blue-500" : ""}`} />
                      {p.isCover ? "Cover" : "Set cover"}
                    </button>
                    <button type="button" onClick={() => removePhoto(idx)}
                      className="text-[11px] text-red-600 hover:underline inline-flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={submitProperty}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {submitting ? "Publishing…" : "Publish Property"}
          </button>
        </div>
      </div>
    </div>
  );
}
