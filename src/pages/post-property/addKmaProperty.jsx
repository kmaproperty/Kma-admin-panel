import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Plus, Trash2, Upload, Star, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { axiosInstance } from "../../services/axiosService";
import {
  getCityApiHandler,
  getPropertyListApiHandler,
  getPropertyCategoryApiHandler,
  getPropertyTypeApiHandler,
  getBhkApiHandler,
  getAmenitiesApiHandler,
  getFurnishingsApiHandler,
  getAdditionalRoomsApiHandler,
  getFileUploadUrlApiHandler,
  uploadFileToS3ApiHandler,
} from "../../services/masterService";

const PHOTO_VIEWS = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Balcony", "Exterior", "Parking", "Amenities", "Other"];
const FACING_OPTIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"];
const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Pricing & Config" },
  { id: 3, label: "Amenities" },
  { id: 4, label: "Photos" },
];

function useKmaCpSession() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axiosInstance.post("admin/auth/kma-internal-login");
        if (cancelled) return;
        if (!data?.accessToken) { setError("Failed to issue KMA Internal CP tokens"); return; }
        sessionStorage.setItem("cpAccessToken", data.accessToken);
        sessionStorage.setItem("cpRefreshToken", data.refreshToken);
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || err?.message || "Auth failed");
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

const Field = ({ label, required, error, children, full }) => (
  <label className={`block ${full ? "md:col-span-2" : ""}`}>
    <span className="block text-xs font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-600">*</span>}
    </span>
    {children}
    {error && <span className="block mt-1 text-xs text-red-600">{error}</span>}
  </label>
);
const Input = (props) => <input {...props} className={`w-full h-10 rounded-md border border-gray-300 px-3 text-sm ${props.className ?? ""}`} />;
const Select = ({ children, ...props }) => <select {...props} className={`w-full h-10 rounded-md border border-gray-300 px-3 text-sm ${props.className ?? ""}`}>{children}</select>;
const Textarea = (props) => <textarea {...props} className={`w-full rounded-md border border-gray-300 p-3 text-sm ${props.className ?? ""}`} />;

const Stepper = ({ active }) => (
  <div className="flex items-center gap-2 mb-5 flex-wrap">
    {STEPS.map((s, i) => (
      <div key={s.id} className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
          active === s.id
            ? "bg-blue-600 text-white border-blue-600"
            : active > s.id
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-50 text-gray-600 border-gray-200"
        }`}>
          {active > s.id ? <Check className="w-3.5 h-3.5" /> : <span>{s.id}</span>}
          <span>{s.label}</span>
        </div>
        {i < STEPS.length - 1 && <span className="text-gray-300">—</span>}
      </div>
    ))}
  </div>
);

export default function AddKmaProperty() {
  const session = useKmaCpSession();
  const [active, setActive] = useState(1);
  const [propertyId, setPropertyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Step 1
  const [listingTypeId, setListingTypeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [propertyTypeId, setPropertyTypeId] = useState("");
  const [bhkTypeId, setBhkTypeId] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [balconies, setBalconies] = useState("");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [carpetArea, setCarpetArea] = useState("");
  const [transactionType, setTransactionType] = useState("resale");
  const [constructionStatus, setConstructionStatus] = useState("ready_to_move");
  const [ageOfProperty, setAgeOfProperty] = useState("");
  const [possessionStatus, setPossessionStatus] = useState("immediate");
  const [possessionDate, setPossessionDate] = useState("");
  const [facing, setFacing] = useState("");
  const [ownership, setOwnership] = useState("");
  const [cityId, setCityId] = useState("");
  const [societyName, setSocietyName] = useState("");
  const [localityName, setLocalityName] = useState("");

  // Step 2 (sale + rent)
  const [floorNumber, setFloorNumber] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [price, setPrice] = useState("");
  const [loanAvailable, setLoanAvailable] = useState("yes");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [rentAvailability, setRentAvailability] = useState("immediately");
  const [availableFromDate, setAvailableFromDate] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("include_in_rent");
  const [maintenanceChargeAmount, setMaintenanceChargeAmount] = useState("");
  const [securityDepositType, setSecurityDepositType] = useState("none");
  const [securityDepositAmount, setSecurityDepositAmount] = useState("");
  const [lockInType, setLockInType] = useState("none");
  const [lockInMonths, setLockInMonths] = useState("");
  const [brokerageType, setBrokerageType] = useState("none");
  const [brokerageAmount, setBrokerageAmount] = useState("");
  const [tenantType, setTenantType] = useState([]); // array
  const [isLiftAvailable, setIsLiftAvailable] = useState(false);
  const [privateParking, setPrivateParking] = useState("");
  const [publicParking, setPublicParking] = useState("");

  // Step 3
  const [additionalRooms, setAdditionalRooms] = useState([]);
  const [reservedParkingCovered, setReservedParkingCovered] = useState("");
  const [reservedParkingOpen, setReservedParkingOpen] = useState("");
  const [powerBackup, setPowerBackup] = useState("No Back-up");
  const [furnishType, setFurnishType] = useState("Unfurnished");
  const [furnishingsCounts, setFurnishingsCounts] = useState({}); // {item: count}
  const [amenities, setAmenities] = useState([]);
  const [waterSource, setWaterSource] = useState("Municipal Supply");
  const [description, setDescription] = useState("");

  // Step 4
  const [photos, setPhotos] = useState([]); // [{file, preview, view, isCover}]

  // Master data
  const enabled = session.ready;
  const { data: listingTypes } = useQuery({ queryKey: ["pp-lt"], queryFn: getPropertyListApiHandler, enabled, select: (r) => r?.data ?? r ?? [] });
  const { data: categories } = useQuery({ queryKey: ["pp-cat"], queryFn: getPropertyCategoryApiHandler, enabled, select: (r) => r?.data ?? r ?? [] });
  const { data: cities } = useQuery({ queryKey: ["pp-city"], queryFn: getCityApiHandler, enabled, select: (r) => r?.data ?? r ?? [] });
  const { data: amenityList } = useQuery({ queryKey: ["pp-am"], queryFn: getAmenitiesApiHandler, enabled, select: (r) => r?.data ?? r ?? [] });
  const { data: furnishingList } = useQuery({ queryKey: ["pp-fu"], queryFn: getFurnishingsApiHandler, enabled, select: (r) => r?.data ?? r ?? [] });
  const { data: roomsList } = useQuery({ queryKey: ["pp-rm"], queryFn: getAdditionalRoomsApiHandler, enabled, select: (r) => r?.data ?? r ?? [] });

  const listingTypeCode = useMemo(() => listingTypes?.find((l) => l.id === listingTypeId)?.code, [listingTypes, listingTypeId]);
  const categoryCode = useMemo(() => categories?.find((c) => c.id === categoryId)?.code, [categories, categoryId]);
  const isRent = listingTypeCode === "rent";

  const { data: propertyTypes } = useQuery({
    queryKey: ["pp-pt", listingTypeCode, categoryCode],
    queryFn: () => getPropertyTypeApiHandler({ propertyListType: listingTypeCode, propertyCategory: categoryCode }),
    enabled: !!listingTypeCode && !!categoryCode,
    select: (r) => r?.data ?? r ?? [],
  });
  const { data: bhkTypes } = useQuery({
    queryKey: ["pp-bhk", propertyTypeId],
    queryFn: () => getBhkApiHandler({ propertyTypeId }),
    enabled: !!propertyTypeId,
    select: (r) => r?.bhkTypes ?? r?.data ?? r ?? [],
  });

  useEffect(() => { setPropertyTypeId(""); setBhkTypeId(""); }, [listingTypeId, categoryId]);
  useEffect(() => { setBhkTypeId(""); }, [propertyTypeId]);

  const toggleArray = (arr, setArr, val) =>
    arr.includes(val) ? setArr(arr.filter((x) => x !== val)) : setArr([...arr, val]);

  const onAddPhotos = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const next = files.map((file) => ({ file, preview: URL.createObjectURL(file), view: "Living Room", isCover: false }));
    setPhotos((prev) => {
      const merged = [...prev, ...next];
      if (merged.length && !merged.some((p) => p.isCover)) merged[0].isCover = true;
      return merged;
    });
    e.target.value = "";
  };
  const removePhoto = (idx) => setPhotos((prev) => {
    const next = prev.filter((_, i) => i !== idx);
    if (next.length && !next.some((p) => p.isCover)) next[0].isCover = true;
    return next;
  });

  const validateStep = (step) => {
    const e = {};
    if (step === 1) {
      if (!listingTypeId) e.listingTypeId = "Required";
      if (!categoryId) e.categoryId = "Required";
      if (!propertyTypeId) e.propertyTypeId = "Required";
      if (!cityId) e.cityId = "Required";
      if (!societyName.trim()) e.societyName = "Required";
      if (!localityName.trim()) e.localityName = "Required";
    } else if (step === 2) {
      if (isRent) {
        if (!monthlyRent || Number(monthlyRent) < 1500) e.monthlyRent = "Min ₹1500";
        if (rentAvailability === "later" && !availableFromDate) e.availableFromDate = "Required";
        if (maintenanceType === "separate" && !maintenanceChargeAmount) e.maintenanceChargeAmount = "Required";
        if (securityDepositType === "custom" && !securityDepositAmount) e.securityDepositAmount = "Required";
        if (lockInType === "custom" && !lockInMonths) e.lockInMonths = "Required";
        if (brokerageType === "custom" && !brokerageAmount) e.brokerageAmount = "Required";
      } else {
        if (!price || Number(price) <= 0) e.price = "Required";
      }
    } else if (step === 4) {
      if (photos.length < 2) e.photos = "Upload at least 2 photos";
      if (photos.length > 0 && !photos.some((p) => p.isCover)) e.photos = "Pick a cover photo";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitStep1 = async () => {
    const payload = {
      ...(propertyId ? { propertyId } : {}),
      listingTypeId,
      categoryId,
      propertyTypeId,
      ...(bhkTypeId || bedrooms || bathrooms || balconies || builtUpArea || carpetArea
        ? {
          bhk: {
            ...(bhkTypeId ? { id: bhkTypeId } : {}),
            ...(builtUpArea ? { buildUpAreaSqFt: Number(builtUpArea) } : {}),
            ...(carpetArea ? { carpetAreaSqFt: Number(carpetArea) } : {}),
            ...(bedrooms ? { noOfBedrooms: Number(bedrooms) } : {}),
            ...(bathrooms ? { noOfBathrooms: Number(bathrooms) } : {}),
            ...(balconies ? { balconies: Number(balconies) } : {}),
          },
        }
        : {}),
      city: { id: cityId },
      society: { name: societyName.trim(), localityName: localityName.trim() },
      ...(builtUpArea ? { builtUpArea: Number(builtUpArea), builtUpAreaUnit: "Sq.Ft." } : {}),
      ...(carpetArea ? { carpetArea: Number(carpetArea), carpetAreaUnit: "Sq.Ft." } : {}),
      ...(transactionType ? { transactionType } : {}),
      ...(constructionStatus ? { constructionStatus } : {}),
      ...(ageOfProperty ? { ageOfProperty: Number(ageOfProperty) } : {}),
      ...(possessionStatus ? { possessionStatus } : {}),
      ...(possessionDate ? { possessionDate } : {}),
      ...(facing ? { facing } : {}),
      ...(ownership ? { ownership } : {}),
    };
    const { data } = await axiosInstance.post("property/step-1", payload);
    const pid = data?.id ?? data?.propertyId;
    if (!pid) throw new Error("Step 1 did not return propertyId");
    setPropertyId(pid);
    return pid;
  };

  const submitStep2 = async (pid) => {
    const payload = {
      propertyId: pid,
      ...(floorNumber ? { floorNumber: Number(floorNumber) } : {}),
      ...(totalFloors ? { totalFloors: Number(totalFloors) } : {}),
      isLiftAvailable: !!isLiftAvailable,
      ...(privateParking ? { privateParking: Number(privateParking) } : {}),
      ...(publicParking ? { publicParking: Number(publicParking) } : {}),
      ...(isRent
        ? {
          monthlyRent: Number(monthlyRent),
          rentAvailability,
          ...(rentAvailability === "later" && availableFromDate ? { availableFromDate } : {}),
          maintenanceType,
          ...(maintenanceType === "separate" && maintenanceChargeAmount ? { maintenanceChargeAmount: Number(maintenanceChargeAmount) } : {}),
          securityDepositType,
          ...(securityDepositType === "custom" && securityDepositAmount ? { securityDepositAmount: Number(securityDepositAmount) } : {}),
          lockInType,
          ...(lockInType === "custom" && lockInMonths ? { lockInMonths: Number(lockInMonths) } : {}),
          brokerageType,
          ...(brokerageType === "custom" && brokerageAmount ? { brokerageAmount: Number(brokerageAmount) } : {}),
          ...(tenantType.length ? { tenantType } : {}),
        }
        : {
          price: Number(price),
          loanAvailable,
          brokerageType,
          ...(brokerageType === "custom" && brokerageAmount ? { brokerageAmount: Number(brokerageAmount) } : {}),
        }),
    };
    await axiosInstance.post("property/step-2", payload);
  };

  const submitStep3 = async (pid) => {
    const furnishingsArr = Object.entries(furnishingsCounts)
      .filter(([, count]) => Number(count) > 0)
      .map(([item, count]) => ({ item, count: Number(count) }));
    const payload = {
      propertyId: pid,
      ...(additionalRooms.length ? { additionalRooms } : {}),
      ...(reservedParkingCovered ? { reservedParkingCovered: Number(reservedParkingCovered) } : {}),
      ...(reservedParkingOpen ? { reservedParkingOpen: Number(reservedParkingOpen) } : {}),
      ...(powerBackup ? { powerBackup } : {}),
      ...(furnishType ? { furnishType } : {}),
      ...(furnishingsArr.length ? { furnishingsCounts: furnishingsArr } : {}),
      ...(amenities.length ? { amenities } : {}),
      ...(waterSource ? { waterSource } : {}),
      ...(description.trim() ? { propertyDescription: description.trim() } : {}),
    };
    await axiosInstance.post("property/step-3", payload);
  };

  const submitStep4 = async (pid) => {
    const uploaded = [];
    for (const p of photos) {
      const presign = await getFileUploadUrlApiHandler({ fileName: p.file.name, fileType: p.file.type, folder: "properties" });
      const url = presign?.data?.uploadUrl ?? presign?.uploadUrl ?? presign?.url;
      const fileKey = presign?.data?.fileKey ?? presign?.fileKey ?? presign?.key;
      if (!url || !fileKey) throw new Error("Upload URL not returned");
      await uploadFileToS3ApiHandler({ url, file: p.file });
      uploaded.push({ fileKey, view: p.view, isCoverImage: !!p.isCover });
    }
    await axiosInstance.post("property/step-4", { propertyId: pid, photos: uploaded });
  };

  const onNext = async () => {
    if (!validateStep(active)) return;
    setSubmitting(true);
    const tId = toast.loading(`Saving step ${active}...`);
    try {
      let pid = propertyId;
      if (active === 1) pid = await submitStep1();
      else if (active === 2) await submitStep2(pid);
      else if (active === 3) await submitStep3(pid);
      toast.update(tId, { render: `Step ${active} saved`, type: "success", isLoading: false, autoClose: 1500 });
      setActive((a) => a + 1);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Save failed";
      toast.update(tId, { render: Array.isArray(msg) ? msg.join(", ") : msg, type: "error", isLoading: false, autoClose: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  const onPublish = async () => {
    if (!validateStep(4)) return;
    if (!propertyId) { toast.error("propertyId missing"); return; }
    setSubmitting(true);
    const tId = toast.loading("Uploading photos & publishing...");
    try {
      await submitStep4(propertyId);
      toast.update(tId, { render: "Property published & live!", type: "success", isLoading: false, autoClose: 4000 });
      // Reset everything
      setActive(1); setPropertyId(null); setErrors({});
      setListingTypeId(""); setCategoryId(""); setPropertyTypeId(""); setBhkTypeId("");
      setBedrooms(""); setBathrooms(""); setBalconies(""); setBuiltUpArea(""); setCarpetArea("");
      setAgeOfProperty(""); setPossessionDate(""); setFacing(""); setOwnership("");
      setCityId(""); setSocietyName(""); setLocalityName("");
      setFloorNumber(""); setTotalFloors(""); setPrice(""); setMonthlyRent("");
      setMaintenanceChargeAmount(""); setSecurityDepositAmount(""); setLockInMonths(""); setBrokerageAmount("");
      setAvailableFromDate(""); setTenantType([]); setIsLiftAvailable(false);
      setPrivateParking(""); setPublicParking("");
      setAdditionalRooms([]); setReservedParkingCovered(""); setReservedParkingOpen("");
      setFurnishingsCounts({}); setAmenities([]); setDescription("");
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Publish failed";
      toast.update(tId, { render: Array.isArray(msg) ? msg.join(", ") : msg, type: "error", isLoading: false, autoClose: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (session.error) {
    return <div className="p-6"><div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{session.error}</div></div>;
  }
  if (!session.ready) {
    return <div className="p-6 flex items-center gap-3 text-sm text-gray-600"><Loader2 className="w-4 h-4 animate-spin" />Initialising KMA Internal CP session…</div>;
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl">
      <div className="mb-4">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Add KMA Property</h1>
        <p className="text-xs text-gray-500 mt-1">
          Posting as <span className="font-medium">KMA Internal CP</span>. Auto-approved and live on submit.
        </p>
      </div>

      <Stepper active={active} />

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
        {active === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Listing Type" required error={errors.listingTypeId}>
                <Select value={listingTypeId} onChange={(e) => setListingTypeId(e.target.value)}>
                  <option value="">Select…</option>
                  {(listingTypes ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
              </Field>
              <Field label="Category" required error={errors.categoryId}>
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Select…</option>
                  {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Property Type" required error={errors.propertyTypeId}>
                <Select value={propertyTypeId} onChange={(e) => setPropertyTypeId(e.target.value)} disabled={!listingTypeCode || !categoryCode}>
                  <option value="">{!listingTypeCode || !categoryCode ? "Pick listing + category first" : "Select…"}</option>
                  {(propertyTypes ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field label="BHK Type">
                <Select value={bhkTypeId} onChange={(e) => setBhkTypeId(e.target.value)} disabled={!propertyTypeId}>
                  <option value="">{!propertyTypeId ? "Pick property type first" : "Select…"}</option>
                  {(bhkTypes ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Field label="Bedrooms"><Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} /></Field>
              <Field label="Bathrooms"><Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} /></Field>
              <Field label="Balconies"><Input type="number" value={balconies} onChange={(e) => setBalconies(e.target.value)} /></Field>
              <Field label="Built-up (Sq.Ft.)"><Input type="number" value={builtUpArea} onChange={(e) => setBuiltUpArea(e.target.value)} /></Field>
              <Field label="Carpet (Sq.Ft.)"><Input type="number" value={carpetArea} onChange={(e) => setCarpetArea(e.target.value)} /></Field>
            </div>

            {!isRent && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Transaction Type">
                  <Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                    <option value="resale">Resale</option>
                    <option value="new_booking">New Booking</option>
                  </Select>
                </Field>
                <Field label="Construction Status">
                  <Select value={constructionStatus} onChange={(e) => setConstructionStatus(e.target.value)}>
                    <option value="ready_to_move">Ready to Move</option>
                    <option value="under_construction">Under Construction</option>
                  </Select>
                </Field>
                <Field label="Age of Property (years)"><Input type="number" value={ageOfProperty} onChange={(e) => setAgeOfProperty(e.target.value)} /></Field>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Possession Status">
                <Select value={possessionStatus} onChange={(e) => setPossessionStatus(e.target.value)}>
                  <option value="immediate">Immediate</option>
                  <option value="future">Future</option>
                </Select>
              </Field>
              {possessionStatus === "future" && (
                <Field label="Possession Date"><Input type="date" value={possessionDate} onChange={(e) => setPossessionDate(e.target.value)} /></Field>
              )}
              <Field label="Facing">
                <Select value={facing} onChange={(e) => setFacing(e.target.value)}>
                  <option value="">Select…</option>
                  {FACING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </Select>
              </Field>
              <Field label="Ownership">
                <Select value={ownership} onChange={(e) => setOwnership(e.target.value)}>
                  <option value="">Select…</option>
                  {OWNERSHIP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="City" required error={errors.cityId}>
                <Select value={cityId} onChange={(e) => setCityId(e.target.value)}>
                  <option value="">Select…</option>
                  {(cities ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Locality" required error={errors.localityName}>
                <Input value={localityName} onChange={(e) => setLocalityName(e.target.value)} placeholder="e.g. Sector 49" />
              </Field>
              <Field label="Society / Project" required error={errors.societyName}>
                <Input value={societyName} onChange={(e) => setSocietyName(e.target.value)} placeholder="e.g. Pyramid Midtown" />
              </Field>
            </div>
          </>
        )}

        {active === 2 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Floor Number"><Input type="number" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} /></Field>
              <Field label="Total Floors"><Input type="number" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} /></Field>
              <Field label="Private Parking"><Input type="number" value={privateParking} onChange={(e) => setPrivateParking(e.target.value)} /></Field>
              <Field label="Public Parking"><Input type="number" value={publicParking} onChange={(e) => setPublicParking(e.target.value)} /></Field>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={isLiftAvailable} onChange={(e) => setIsLiftAvailable(e.target.checked)} />
              Lift Available
            </label>

            {!isRent && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 text-sm border-b pb-2">Sale Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Sale Price (₹)" required error={errors.price}>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 7500000" />
                  </Field>
                  <Field label="Loan Available">
                    <Select value={loanAvailable} onChange={(e) => setLoanAvailable(e.target.value)}>
                      <option value="yes">Yes</option><option value="no">No</option>
                    </Select>
                  </Field>
                  <Field label="Brokerage">
                    <Select value={brokerageType} onChange={(e) => setBrokerageType(e.target.value)}>
                      <option value="none">None</option>
                      <option value="custom">Custom</option>
                    </Select>
                  </Field>
                  {brokerageType === "custom" && (
                    <Field label="Brokerage Amount" required error={errors.brokerageAmount}>
                      <Input type="number" value={brokerageAmount} onChange={(e) => setBrokerageAmount(e.target.value)} />
                    </Field>
                  )}
                </div>
              </div>
            )}

            {isRent && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 text-sm border-b pb-2">Rent Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Monthly Rent (₹)" required error={errors.monthlyRent}>
                    <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="e.g. 25000" />
                  </Field>
                  <Field label="Rent Availability">
                    <Select value={rentAvailability} onChange={(e) => setRentAvailability(e.target.value)}>
                      <option value="immediately">Immediately</option>
                      <option value="later">Later</option>
                    </Select>
                  </Field>
                  {rentAvailability === "later" && (
                    <Field label="Available From" required error={errors.availableFromDate}>
                      <Input type="date" value={availableFromDate} onChange={(e) => setAvailableFromDate(e.target.value)} />
                    </Field>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Maintenance">
                    <Select value={maintenanceType} onChange={(e) => setMaintenanceType(e.target.value)}>
                      <option value="include_in_rent">Included in rent</option>
                      <option value="separate">Separate</option>
                    </Select>
                  </Field>
                  {maintenanceType === "separate" && (
                    <Field label="Maintenance Amount" required error={errors.maintenanceChargeAmount}>
                      <Input type="number" value={maintenanceChargeAmount} onChange={(e) => setMaintenanceChargeAmount(e.target.value)} />
                    </Field>
                  )}
                  <Field label="Security Deposit">
                    <Select value={securityDepositType} onChange={(e) => setSecurityDepositType(e.target.value)}>
                      <option value="none">None</option>
                      <option value="1_month">1 Month</option>
                      <option value="2_month">2 Months</option>
                      <option value="6_month">6 Months</option>
                      <option value="custom">Custom</option>
                    </Select>
                  </Field>
                  {securityDepositType === "custom" && (
                    <Field label="Deposit Amount" required error={errors.securityDepositAmount}>
                      <Input type="number" value={securityDepositAmount} onChange={(e) => setSecurityDepositAmount(e.target.value)} />
                    </Field>
                  )}
                  <Field label="Lock-in Period">
                    <Select value={lockInType} onChange={(e) => setLockInType(e.target.value)}>
                      <option value="none">None</option>
                      <option value="custom">Custom</option>
                    </Select>
                  </Field>
                  {lockInType === "custom" && (
                    <Field label="Lock-in Months" required error={errors.lockInMonths}>
                      <Input type="number" value={lockInMonths} onChange={(e) => setLockInMonths(e.target.value)} />
                    </Field>
                  )}
                  <Field label="Brokerage">
                    <Select value={brokerageType} onChange={(e) => setBrokerageType(e.target.value)}>
                      <option value="none">None</option><option value="custom">Custom</option>
                    </Select>
                  </Field>
                  {brokerageType === "custom" && (
                    <Field label="Brokerage Amount" required error={errors.brokerageAmount}>
                      <Input type="number" value={brokerageAmount} onChange={(e) => setBrokerageAmount(e.target.value)} />
                    </Field>
                  )}
                </div>

                <Field label="Tenant Type">
                  <div className="flex flex-wrap gap-3 mt-1">
                    {["family", "bachelors", "company"].map((t) => (
                      <label key={t} className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={tenantType.includes(t)} onChange={() => toggleArray(tenantType, setTenantType, t)} />
                        <span className="capitalize">{t}</span>
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
            )}
          </>
        )}

        {active === 3 && (
          <>
            <Field label="Additional Rooms">
              <div className="flex flex-wrap gap-3 mt-1">
                {(roomsList ?? ["Pooja Room", "Servant Room", "Study Room", "Extra Room"]).map((r) => {
                  const name = typeof r === "string" ? r : r?.name;
                  if (!name) return null;
                  return (
                    <label key={name} className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={additionalRooms.includes(name)} onChange={() => toggleArray(additionalRooms, setAdditionalRooms, name)} />
                      <span>{name}</span>
                    </label>
                  );
                })}
              </div>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Reserved Parking (Covered)"><Input type="number" value={reservedParkingCovered} onChange={(e) => setReservedParkingCovered(e.target.value)} /></Field>
              <Field label="Reserved Parking (Open)"><Input type="number" value={reservedParkingOpen} onChange={(e) => setReservedParkingOpen(e.target.value)} /></Field>
              <Field label="Power Backup">
                <Select value={powerBackup} onChange={(e) => setPowerBackup(e.target.value)}>
                  <option value="No Back-up">No Back-up</option>
                  <option value="Available">Available</option>
                </Select>
              </Field>
              <Field label="Furnish Type">
                <Select value={furnishType} onChange={(e) => setFurnishType(e.target.value)}>
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Furnished">Furnished</option>
                </Select>
              </Field>
              <Field label="Water Source">
                <Select value={waterSource} onChange={(e) => setWaterSource(e.target.value)}>
                  <option value="Municipal Supply">Municipal Supply</option>
                  <option value="BoreWell/ Underground">Borewell / Underground</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
            </div>

            {furnishType !== "Unfurnished" && (furnishingList ?? []).length > 0 && (
              <Field label="Furnishings (counts)">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                  {(furnishingList ?? []).map((f) => {
                    const name = typeof f === "string" ? f : f?.name ?? f?.label;
                    if (!name) return null;
                    return (
                      <div key={name} className="flex items-center gap-2 border rounded-md px-2 py-1">
                        <span className="text-xs flex-1 truncate">{name}</span>
                        <input type="number" min="0" value={furnishingsCounts[name] ?? ""} onChange={(e) => setFurnishingsCounts({ ...furnishingsCounts, [name]: e.target.value })}
                          className="w-14 h-7 text-xs border rounded px-1" />
                      </div>
                    );
                  })}
                </div>
              </Field>
            )}

            <Field label="Amenities">
              <div className="flex flex-wrap gap-2 mt-1 max-h-60 overflow-y-auto border rounded-md p-3">
                {(amenityList ?? []).map((a) => {
                  const id = typeof a === "string" ? a : a?.id ?? a?.name;
                  const name = typeof a === "string" ? a : a?.name;
                  if (!id) return null;
                  return (
                    <label key={id} className="inline-flex items-center gap-2 text-xs border rounded px-2 py-1">
                      <input type="checkbox" checked={amenities.includes(id)} onChange={() => toggleArray(amenities, setAmenities, id)} />
                      <span>{name}</span>
                    </label>
                  );
                })}
              </div>
            </Field>

            <Field label="Description">
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the property" />
            </Field>
          </>
        )}

        {active === 4 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                Photos <span className="text-red-600">*</span> <span className="ml-2 text-gray-500">min 2 — pick a cover</span>
              </span>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-blue-700 hover:underline">
                <Upload className="w-4 h-4" /> Add photos
                <input type="file" multiple accept="image/*" className="hidden" onChange={onAddPhotos} />
              </label>
            </div>
            {errors.photos && <div className="text-xs text-red-600">{errors.photos}</div>}
            {photos.length === 0 ? (
              <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-md p-6 text-center">
                No photos yet. Click <span className="font-medium">Add photos</span> above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((p, idx) => (
                  <div key={idx} className={`relative border rounded-md p-2 ${p.isCover ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                    <img src={p.preview} alt="" className="w-full h-28 object-cover rounded" />
                    <Select value={p.view} onChange={(e) => setPhotos((prev) => prev.map((x, i) => i === idx ? { ...x, view: e.target.value } : x))} className="mt-2 h-7 text-[11px]">
                      {PHOTO_VIEWS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </Select>
                    <div className="mt-1 flex items-center justify-between">
                      <button type="button" onClick={() => setPhotos((prev) => prev.map((x, i) => ({ ...x, isCover: i === idx })))}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${p.isCover ? "text-blue-700" : "text-gray-600 hover:text-gray-900"}`}>
                        <Star className={`w-3.5 h-3.5 ${p.isCover ? "fill-blue-500 text-blue-500" : ""}`} />
                        {p.isCover ? "Cover" : "Set cover"}
                      </button>
                      <button type="button" onClick={() => removePhoto(idx)} className="text-[11px] text-red-600 hover:underline inline-flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button type="button" disabled={active === 1 || submitting} onClick={() => setActive((a) => Math.max(1, a - 1))}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {active < 4 ? (
            <button type="button" onClick={onNext} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save & Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={onPublish} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {submitting ? "Publishing…" : "Publish Property"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
