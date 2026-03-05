"use client";

import { useState, useEffect, useId, useCallback, useRef } from "react";
import { getCities, getRegions, extractLocationFromAddress } from "@/lib/api/admin/masters";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { COUNTRIES } from "@/lib/data/masterData";
import { uploadImage } from "@/lib/api/admin/upload";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminStudioItem, StudioFormData, StudioTab } from "@/types/studio";
import type { CityMaster, RegionMaster } from "@/types/master";

interface StudioFormProps {
  studio?: AdminStudioItem;
  isLoading?: boolean;
  onSubmit: (data: StudioFormData) => Promise<void>;
  onCancel: () => void;
}

export default function StudioForm({
  studio,
  isLoading = false,
  onSubmit,
  onCancel,
}: StudioFormProps) {
  const isEditMode = !!studio;
  const { accessToken } = useAuth();
  const idPrefix = useId();
  const fieldIds = {
    name: `${idPrefix}-name`,
    tab: `${idPrefix}-tab`,
    country: `${idPrefix}-country`,
    city: `${idPrefix}-city`,
    region: `${idPrefix}-region`,
    address: `${idPrefix}-address`,
    phone: `${idPrefix}-phone`,
    social: `${idPrefix}-social`,
    managerName: `${idPrefix}-manager-name`,
    managerPhone: `${idPrefix}-manager-phone`,
    managerEmail: `${idPrefix}-manager-email`,
    capacity: `${idPrefix}-capacity`,
    operatingHours: `${idPrefix}-operating-hours`,
    description: `${idPrefix}-description`,
    status: `${idPrefix}-status`,
  };

  // Form State
  const [formData, setFormData] = useState<StudioFormData>({
    name: studio?.name || "",
    tab: studio?.tab || "official",
    country: studio?.country || "KR",
    city: studio?.city || "",
    region: studio?.region || "",
    address: studio?.address || "",
    phone: studio?.phone || "",
    social: studio?.social || "",
    lat: studio?.lat || 0,
    lng: studio?.lng || 0,
    managerName: studio?.managerName || "",
    managerPhone: studio?.managerPhone || "",
    managerEmail: studio?.managerEmail || "",
    capacity: studio?.capacity || 0,
    status: studio?.status || "active",
    description: studio?.description || "",
    operatingHours: studio?.operatingHours || "",
    amenities: studio?.amenities || [],
    thumbnail: studio?.thumbnail || "",
  });

  // Master Data State
  const [cities, setCities] = useState<CityMaster[]>([]);
  const [regions, setRegions] = useState<RegionMaster[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Address search state
  const [addressVerified, setAddressVerified] = useState(!!studio?.address);

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(studio?.thumbnail || null);

  // Handle place selection from Google Places Autocomplete
  const handlePlaceSelected = useCallback((placeResult: { lat: number; lng: number; address: string; city?: string; region?: string }) => {
    // Update form with place details – address, lat, lng are all set from Google
    setFormData((prev) => ({
      ...prev,
      address: placeResult.address,
      lat: placeResult.lat,
      lng: placeResult.lng,
    }));
    // Update the input value directly (uncontrolled)
    if (inputRef.current) {
      inputRef.current.value = placeResult.address;
    }
    setAddressVerified(true);

    // Try auto-extract city/region from address
    extractLocationFromAddress(
      "KR",
      placeResult.address
    ).then((result) => {
      if (result.cityId) {
        setFormData((prev) => ({
          ...prev,
          city: result.cityId!,
        }));
        if (result.confidence === "high" && result.regionId) {
          setTimeout(() => {
            setFormData((prev) => ({
              ...prev,
              region: result.regionId!,
            }));
          }, 300);
        }
      }
    }).catch(() => {
      // Silently fail — user can still select city/region manually
    });
  }, []);

  // E2E Test compatibility: listen for custom event to simulate Google Places selection
  useEffect(() => {
    const form = document.querySelector('form');
    if (!form) return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.address && detail?.lat && detail?.lng) {
        handlePlaceSelected({
          address: detail.address,
          lat: detail.lat,
          lng: detail.lng,
        });
      }
    };

    form.addEventListener('__test_place_selected', handler);
    return () => form.removeEventListener('__test_place_selected', handler);
  }, [handlePlaceSelected]);

  // Google Places Hook with callback
  const { inputRef } = useGooglePlaces(handlePlaceSelected);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setImagePreview(previewUrl);
    };
    reader.readAsDataURL(file);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      thumbnail: "",
    }));
  };

  // Handle address clear (user wants to re-search)
  const handleClearAddress = () => {
    setAddressVerified(false);
    setFormData((prev) => ({
      ...prev,
      address: "",
      lat: 0,
      lng: 0,
    }));
    // Clear and focus the search input after clearing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    }, 100);
  };

  // Load cities when country changes
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesList = await getCities(formData.country as "KR" | "CN");
        setCities(citiesList);
        if (!isEditMode) {
          setFormData((prev) => ({ ...prev, city: "", region: "" }));
        }
        setRegions([]);
      } catch (err) {
        console.error("Failed to load cities:", err);
      }
    };
    loadCities();
  }, [formData.country, isEditMode]);

  // Load regions when city changes
  useEffect(() => {
    const loadRegions = async () => {
      if (formData.city) {
        try {
          const regionsList = await getRegions(formData.city);
          setRegions(regionsList);
          if (!isEditMode) {
            setFormData((prev) => ({ ...prev, region: "" }));
          }
        } catch (err) {
          console.error("Failed to load regions:", err);
        }
      } else {
        setRegions([]);
      }
    };
    loadRegions();
  }, [formData.city, isEditMode]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError("스튜디오명을 입력해주세요.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("연락처를 입력해주세요.");
      return;
    }

    if (!addressVerified || !formData.address.trim()) {
      setError("주소 검색을 통해 주소를 선택해주세요.");
      return;
    }

    if (formData.lat === 0 || formData.lng === 0) {
      setError("주소 검색을 통해 유효한 주소를 선택해주세요. (좌표가 설정되지 않았습니다)");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let finalThumbnail = formData.thumbnail;

      // Upload image via Vercel Blob API first if needed
      if (imageFile) {
        setUploadingImage(true);
        const uploadResult = await uploadImage(imageFile, accessToken || undefined);
        finalThumbnail = uploadResult.url;
      }

      await onSubmit({ ...formData, thumbnail: finalThumbnail });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "저장에 실패했습니다.";
      setError(errorMsg);
    } finally {
      setUploadingImage(false);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {/* 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b">기본 정보</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 스튜디오명 */}
          <div>
            <label htmlFor={fieldIds.name} className="block text-sm font-medium text-gray-700 mb-1">
              스튜디오명 <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldIds.name}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 강남 A스튜디오"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* 스튜디오 유형 */}
          <div>
            <label htmlFor={fieldIds.tab} className="block text-sm font-medium text-gray-700 mb-1">
              스튜디오 유형 <span className="text-red-500">*</span>
            </label>
            <select
              id={fieldIds.tab}
              value={formData.tab}
              onChange={(e) => setFormData({ ...formData, tab: e.target.value as StudioTab })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            >
              <option value="official">공인 스튜디오</option>
              <option value="partner">파트너 스튜디오</option>
              <option value="associated">협력 스튜디오</option>
            </select>
          </div>

          {/* 국가 */}
          <div>
            <label htmlFor={fieldIds.country} className="block text-sm font-medium text-gray-700 mb-1">
              국가 <span className="text-red-500">*</span>
            </label>
            <select
              id={fieldIds.country}
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value as "KR" | "CN" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* 도시 */}
          <div>
            <label htmlFor={fieldIds.city} className="block text-sm font-medium text-gray-700 mb-1">
              도시 <span className="text-red-500">*</span>
            </label>
            <select
              id={fieldIds.city}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            >
              <option value="">선택하세요</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* 지역 */}
          <div>
            <label htmlFor={fieldIds.region} className="block text-sm font-medium text-gray-700 mb-1">
              지역 <span className="text-red-500">*</span>
            </label>
            <select
              id={fieldIds.region}
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              disabled={!formData.city}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">선택하세요</option>
              {regions.map((region) => (
                <option key={region.id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* 주소 검색 */}
          <div className="md:col-span-2">
            <label htmlFor={fieldIds.address} className="block text-sm font-medium text-gray-700 mb-1">
              주소 <span className="text-red-500">*</span>
            </label>

            {/* 검색된 주소가 확정되었을 때 */}
            {addressVerified ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-800 flex-1">{formData.address}</span>
                  <button
                    type="button"
                    onClick={handleClearAddress}
                    className="text-xs text-gray-500 hover:text-red-600 underline transition-colors shrink-0"
                  >
                    다시 검색
                  </button>
                </div>
                {/* 좌표 확인 배지 */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded">
                    📍 위도: {formData.lat.toFixed(4)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded">
                    📍 경도: {formData.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            ) : (
              /* 주소 검색 입력 */
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      id={fieldIds.address}
                      type="text"
                      defaultValue={studio?.address || ""}
                      placeholder="예: 서울 강남구 테헤란로 → 자동완성 드롭다운에서 선택"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  🔍 주소를 입력하면 Google Places 자동완성 목록이 표시됩니다. <strong>목록에서 주소를 선택</strong>하면 위도/경도가 자동으로 반영됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 스튜디오 이미지 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b">스튜디오 이미지</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              스튜디오 소개 이미지
            </label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-18-2h0m-9 9h18"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">클릭하여 업로드</span> 또는 드래그
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF 최대 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {imagePreview && (
                <div className="relative w-32 h-32 shrink-0">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 연락처 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b">연락처 정보</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 대표번호 */}
          <div>
            <label htmlFor={fieldIds.phone} className="block text-sm font-medium text-gray-700 mb-1">
              대표번호 <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldIds.phone}
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="예: 02-1234-5678"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* SNS */}
          <div>
            <label htmlFor={fieldIds.social} className="block text-sm font-medium text-gray-700 mb-1">SNS</label>
            <input
              id={fieldIds.social}
              type="text"
              value={formData.social}
              onChange={(e) => setFormData({ ...formData, social: e.target.value })}
              placeholder="예: Instagram/username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* 담당자명 */}
          <div>
            <label htmlFor={fieldIds.managerName} className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
            <input
              id={fieldIds.managerName}
              type="text"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              placeholder="예: 최관리"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* 담당자 전화 */}
          <div>
            <label htmlFor={fieldIds.managerPhone} className="block text-sm font-medium text-gray-700 mb-1">담당자 전화</label>
            <input
              id={fieldIds.managerPhone}
              type="tel"
              value={formData.managerPhone}
              onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
              placeholder="예: 010-1234-5678"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* 담당자 이메일 */}
          <div className="md:col-span-2">
            <label htmlFor={fieldIds.managerEmail} className="block text-sm font-medium text-gray-700 mb-1">담당자 이메일</label>
            <input
              id={fieldIds.managerEmail}
              type="email"
              value={formData.managerEmail}
              onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
              placeholder="예: manager@studio.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 시설 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b">시설 정보</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 수용 인원 */}
          <div>
            <label htmlFor={fieldIds.capacity} className="block text-sm font-medium text-gray-700 mb-1">수용 인원</label>
            <input
              id={fieldIds.capacity}
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              placeholder="예: 30"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* 운영 시간 */}
          <div>
            <label htmlFor={fieldIds.operatingHours} className="block text-sm font-medium text-gray-700 mb-1">운영 시간</label>
            <input
              id={fieldIds.operatingHours}
              type="text"
              value={formData.operatingHours}
              onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
              placeholder="예: 09:00 - 22:00"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* 시설 설명 */}
          <div className="md:col-span-2">
            <label htmlFor={fieldIds.description} className="block text-sm font-medium text-gray-700 mb-1">시설 설명</label>
            <textarea
              id={fieldIds.description}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="시설에 대한 설명을 입력하세요"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* 편의시설 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">편의시설</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["주차", "WiFi", "라커", "카페", "샤워실", "에어컨", "난방", "엘리베이터"].map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.amenities || []).includes(amenity)}
                    onChange={(e) => {
                      const currentAmenities = formData.amenities || [];
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          amenities: [...currentAmenities, amenity],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          amenities: currentAmenities.filter((a) => a !== amenity),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 추가 정보 (편집 모드에서만) */}
      {isEditMode && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4 pb-2 border-b">추가 정보</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 상태 */}
            <div>
              <label htmlFor={fieldIds.status} className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                id={fieldIds.status}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "maintenance" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="maintenance">점검중</option>
              </select>
            </div>

            {/* 등록일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">등록일</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-300 text-sm text-gray-600">
                {studio?.createdAt}
              </div>
            </div>

            {/* 등록자 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">등록자</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-300 text-sm text-gray-600">
                {studio?.createdBy}
              </div>
            </div>

            {/* 수정일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수정일</label>
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-300 text-sm text-gray-600">
                {studio?.updatedAt}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          취소
        </button>

        <button
          type="submit"
          disabled={submitting || isLoading || uploadingImage}
          className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploadingImage ? "이미지 업로드 중..." : (submitting || isLoading) ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
