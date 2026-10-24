"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import dynamic from "next/dynamic";

import {
  account,
  databases,
  storage,
  COLLECTIONS,
  DATABASE_ID,
  ID,
  BUCKET_ID,
  Query,
} from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  ImagePlus,
  X,
  Loader2,
  MapPin,
  Phone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { Permission, Role } from "appwrite";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { validateText } from "@/lib/moderation";
// tf and nsfwjs will be imported dynamically

// Dynamic import for Leaflet to avoid SSR issues
const LocationPicker = dynamic(
  () => import("@/components/posts/Locationpicker"),
  { ssr: false }
);

const CATEGORY_KEYS = [
  { value: "electronics", gradient: "from-blue-600 to-indigo-500" },
  { value: "school", gradient: "from-emerald-600 to-teal-500" },
  { value: "furniture", gradient: "from-amber-700 to-orange-500" },
  { value: "clothing", gradient: "from-purple-600 to-pink-500" },
  { value: "appliances", gradient: "from-slate-600 to-slate-400" },
  { value: "food", gradient: "from-red-600 to-rose-500" },
  { value: "baby", gradient: "from-sky-400 to-blue-400" },
  { value: "books", gradient: "from-yellow-600 to-amber-500" },
  { value: "tools", gradient: "from-zinc-700 to-zinc-500" },
  { value: "other", gradient: "from-gray-500 to-gray-400" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(5, t.createPost.validation.titleShort),
        category: z.string().min(1, t.createPost.validation.categoryRequired),
        description: z.string().min(20, t.createPost.validation.descShort),
        location: z.string().min(2, t.createPost.validation.locationRequired),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        contact: z.string().min(5, t.createPost.validation.contactRequired),
      }),
    [t]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "donate",
      description: "",
      location: "",
      contact: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  useEffect(() => {
    account
      .get()
      .then(setUser)
      .catch(() => {
        toast.error(t.createPost.toasts.loginRequired);
        router.push("/auth/login");
      });
  }, [router, t]);

  const CATEGORIES = useMemo(
    () =>
      CATEGORY_KEYS.map((c) => ({
        ...c,
        label: (t.createPost.categories as any)[c.value],
      })),
    [t]
  );

  // Fetch address suggestions from Nominatim (OpenStreetMap)
  const fetchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=dz`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced search
  const handleLocationInput = (value: string) => {
    form.setValue("location", value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 300);
  };

  // Select suggestion
  const selectSuggestion = (suggestion: any) => {
    const displayName = suggestion.display_name;
    form.setValue("location", displayName);
    form.setValue("latitude", parseFloat(suggestion.lat));
    form.setValue("longitude", parseFloat(suggestion.lon));
    setSuggestions([]);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t.createPost.toasts.geoNotSupported);
      return;
    }

    toast.loading(t.createPost.toasts.gettingPosition);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);

        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.address && data.address.country_code !== "dz") {
            toast.dismiss();
            toast.error("Veuillez sélectionner un lieu en Algérie");
            return;
          }

          form.setValue("location", data.display_name);
          toast.dismiss();
          toast.success(t.createPost.toasts.positionObtained);
        } catch (error) {
          toast.dismiss();
          toast.error(t.createPost.toasts.addressError);
        }
      },
      () => {
        toast.dismiss();
        toast.error(t.createPost.toasts.positionError);
      }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 4 - images.length);
    setImages((prev) => [...prev, ...files]);
  };

  const validateImageModeration = async (file: File): Promise<boolean> => {
    try {
      // 1. Load heavy libraries dynamically
      const [tf, nsfwjs] = await Promise.all([
        import("@tensorflow/tfjs"),
        import("nsfwjs"),
      ]);

      await tf.ready();
      const model = await nsfwjs.load();

      // 2. Create an image element to process
      const img = document.createElement("img");
      const url = URL.createObjectURL(file);

      return new Promise((resolve) => {
        img.onload = async () => {
          try {
            const predictions = await model.classify(img);
            URL.revokeObjectURL(url);

            // NSFWJS Categories: Neutral, Drawing, Hentai, Sexy, Porn
            // We block Porn and Hentai. We might allow Sexy/Drawing depending on strictness.
            const unsafeCategories = ["Porn", "Hentai"];
            const isUnsafe = predictions.some(
              (p) =>
                unsafeCategories.includes(p.className) && p.probability > 0.5
            );

            resolve(!isUnsafe);
          } catch (err) {
            console.error("Moderation error:", err);
            resolve(true); // Fail-safe (allow if check fails, or false to be strict)
          }
        };
        img.src = url;
      });
    } catch (error) {
      console.error("NSFWJS Loading error:", error);
      return true; // Fail-safe
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of images) {
      // AI Image Moderation Check
      const isSafe = await validateImageModeration(file);
      if (!isSafe) {
        throw new Error("UNSAFE_IMAGE");
      }

      const uploaded = await storage.createFile(BUCKET_ID!, ID.unique(), file);
      urls.push(
        `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploaded.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      );
    }
    return urls;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (images.length === 0)
      return toast.error(t.createPost.validation.addPhoto);

    // Keyword Guard
    const titleModeration = validateText(values.title);
    const descModeration = validateText(values.description);

    if (!titleModeration.isSafe || !descModeration.isSafe) {
      return toast.error(t.createPost.validation.inappropriate);
    }

    setIsSubmitting(true);
    try {
      // 🚀 Advanced Rate Limiting Check (Max 5 posts per 24h)
      const twentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();
      const userPosts = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        [
          Query.equal("userId", user.$id),
          Query.greaterThan("$createdAt", twentyFourHoursAgo),
        ]
      );

      if (userPosts.total >= 5) {
        setIsSubmitting(false);
        return toast.error(t.createPost.validation.rateLimit);
      }

      const uploadedUrls = await uploadImages();
      await databases.createDocument(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        ID.unique(),
        {
          ...values,
          images: uploadedUrls,
          userId: user.$id,
          status: "pending", // Default to pending
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );
      toast.success(t.createPost.toasts.published);
      router.push("/");
    } catch (error: any) {
      if (error.message === "UNSAFE_IMAGE") {
        toast.error(t.createPost.validation.unsafeImage);
      } else {
        toast.error(t.createPost.toasts.publishError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = CATEGORIES.find(
    (c) => c.value === form.watch("category")
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-emerald-50/40 via-white to-green-50/20 lg:flex-row">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#50a55f]/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#197946]/5 blur-3xl" />
      </div>

      {/* LEFT: FORM SIDE */}
      <div className="z-20 w-full overflow-y-auto border-r border-emerald-100/50 bg-white/95 shadow-2xl backdrop-blur-xl lg:w-[480px]">
        <div className="sticky top-0 z-10 border-b border-emerald-100/50 bg-white/95 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full hover:bg-emerald-50"
            >
              <ChevronLeft className="text-slate-700" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {t.createPost.title}
              </h1>
              <p className="text-xs text-slate-500">
                {t.createPost.step} {step} {t.createPost.of} 2
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full bg-gradient-to-r ${selectedCategory?.gradient || "from-emerald-500 to-green-500"} transition-all duration-500`}
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          {/* Scam Warning */}
          <div className="mt-6 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs leading-none font-black tracking-widest text-amber-900 uppercase">
                Anti-Scam Reminder
              </h4>
              <p className="text-[11px] leading-relaxed font-medium text-amber-800/80">
                {t.createPost.scamAlert}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* STEP 1: MEDIA */}
              <section
                className={
                  step === 1
                    ? "animate-in fade-in slide-in-from-bottom-4 block duration-500"
                    : "hidden"
                }
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {t.createPost.photos}
                  </h2>
                  <span className="text-sm text-slate-500">
                    {images.length}/4
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-emerald-100"
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        alt="preview"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                      {i === 0 && (
                        <div className="absolute bottom-2 left-2 rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
                          {t.createPost.main}
                        </div>
                      )}
                    </div>
                  ))}

                  {images.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 text-slate-400 transition-all hover:border-emerald-400 hover:bg-emerald-50"
                    >
                      <ImagePlus
                        className="transition-transform group-hover:scale-110"
                        size={28}
                      />
                      <span className="mt-2 text-xs font-medium">
                        {t.createPost.add}
                      </span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                />

                <Button
                  type="button"
                  className={`mt-8 h-12 w-full rounded-full bg-gradient-to-r ${selectedCategory?.gradient || "from-emerald-500 to-green-500"} transition-all hover:shadow-lg hover:shadow-emerald-500/30`}
                  onClick={() => setStep(2)}
                  disabled={images.length === 0}
                >
                  {t.createPost.continue}
                  <ChevronRight className="ml-2" size={18} />
                </Button>
              </section>

              {/* STEP 2: DETAILS */}
              <section
                className={
                  step === 2
                    ? "animate-in fade-in slide-in-from-bottom-4 block duration-500"
                    : "hidden"
                }
              >
                <h2 className="mb-4 text-lg font-semibold text-slate-800">
                  {t.createPost.category}
                </h2>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block font-semibold text-slate-700">
                        {t.createPost.objectType}
                      </FormLabel>
                      <div className="custom-scrollbar grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => field.onChange(c.value)}
                            className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all duration-200 ${field.value === c.value
                                ? `border-[#309051] bg-emerald-50 shadow-sm ring-1 ring-[#309051]`
                                : "border-slate-100 hover:border-emerald-200 hover:bg-white"
                              }`}
                          >
                            <span
                              className={`text-center text-[10px] leading-tight font-bold uppercase ${field.value === c.value
                                  ? "text-[#309051]"
                                  : "text-slate-500"
                                }`}
                            >
                              {c.label}
                            </span>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-700">
                          {t.createPost.titleLabel}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.createPost.titlePlaceholder}
                            {...field}
                            className="h-12 rounded-2xl border-2 border-emerald-100 transition-all focus:border-[#309051]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-700">
                          {t.createPost.descriptionLabel}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.createPost.descriptionPlaceholder}
                            {...field}
                            className="min-h-[120px] resize-none rounded-2xl border-2 border-emerald-100 transition-all focus:border-[#309051]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between font-semibold text-slate-700">
                          <span>{t.createPost.locationLabel}</span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={getCurrentLocation}
                              className="h-7 rounded-full text-xs text-[#309051] hover:bg-emerald-50"
                            >
                              <Navigation size={14} className="mr-1" />
                              {t.createPost.myPosition}
                            </Button>

                            {form.watch("latitude") &&
                              form.watch("longitude") && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowLocationPicker(true)}
                                  className="h-7 rounded-full text-xs text-[#309051] hover:bg-emerald-50"
                                >
                                  <MapPin size={14} className="mr-1" />
                                  {t.createPost.viewMap}
                                </Button>
                              )}
                          </div>
                        </FormLabel>

                        <FormControl>
                          <div className="relative">
                            <MapPin
                              className="absolute top-4 left-4 z-10 text-slate-400"
                              size={18}
                            />
                            <Input
                              placeholder={t.createPost.locationPlaceholder}
                              value={field.value}
                              onChange={(e) =>
                                handleLocationInput(e.target.value)
                              }
                              className="h-12 rounded-2xl border-2 border-emerald-100 pl-12 transition-all focus:border-[#309051]"
                            />

                            {suggestions.length > 0 && (
                              <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-hidden overflow-y-auto rounded-2xl border-2 border-emerald-100 bg-white shadow-2xl shadow-emerald-500/10">
                                {suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => selectSuggestion(suggestion)}
                                    className="group w-full border-b border-emerald-50 px-4 py-3 text-left transition-all last:border-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50"
                                  >
                                    <div className="flex items-start gap-3">
                                      <MapPin
                                        size={16}
                                        className="mt-1 flex-shrink-0 text-[#309051]"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-800 transition-colors group-hover:text-[#309051]">
                                          {
                                            suggestion.display_name.split(
                                              ","
                                            )[0]
                                          }
                                        </p>
                                        <p className="truncate text-xs text-slate-500">
                                          {suggestion.display_name}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                            {loadingSuggestions && (
                              <div className="absolute top-4 right-4">
                                <Loader2
                                  size={18}
                                  className="animate-spin text-[#309051]"
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-700">
                          {t.createPost.contactLabel}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone
                              className="absolute top-4 left-4 text-slate-400"
                              size={18}
                            />
                            <Input
                              placeholder={t.createPost.contactPlaceholder}
                              {...field}
                              className="h-12 rounded-2xl border-2 border-emerald-100 pl-12 transition-all focus:border-[#309051]"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-full border-2 border-emerald-200 hover:bg-emerald-50"
                  >
                    <ChevronLeft size={18} className="mr-2" />
                    {t.createPost.back}
                  </Button>
                  <Button
                    type="submit"
                    className={`h-12 flex-1 rounded-full bg-gradient-to-r ${selectedCategory?.gradient || "from-emerald-500 to-green-500"} transition-all hover:shadow-lg hover:shadow-emerald-500/30`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={18} />
                        {t.createPost.publishing}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2" size={18} />
                        {t.createPost.publishNow}
                      </>
                    )}
                  </Button>
                </div>
              </section>
            </form>
          </Form>
        </div>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="relative z-10 hidden flex-1 items-center justify-center p-12 lg:flex">
        <div className="animate-in fade-in slide-in-from-bottom-4 w-[400px] overflow-hidden rounded-3xl border-2 border-emerald-100/50 bg-white shadow-2xl shadow-emerald-500/10 duration-700">
          <div className="absolute top-8 right-8 z-10 rounded-full border-2 border-emerald-200 bg-white/90 px-4 py-2 text-xs font-bold text-[#309051] backdrop-blur-sm">
            {t.createPost.preview}
          </div>

          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-100 to-green-100">
            {images.length > 0 ? (
              <img
                src={URL.createObjectURL(images[0])}
                className="h-full w-full object-cover"
                alt="Preview"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ImagePlus size={64} className="text-emerald-300" />
                <p className="text-sm font-medium text-emerald-600">
                  {t.createPost.noPhoto}
                </p>
              </div>
            )}

            {form.watch("category") && (
              <div
                className={`absolute top-4 left-4 bg-gradient-to-r ${selectedCategory?.gradient || "from-emerald-500 to-green-500"} rounded-full px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-lg`}
              >
                {selectedCategory?.label}
              </div>
            )}
          </div>

          <div className="space-y-4 p-6">
            <h3 className="truncate text-2xl font-bold text-slate-800">
              {form.watch("title") || t.createPost.titleFallback}
            </h3>

            <p className="line-clamp-3 min-h-[60px] text-sm leading-relaxed text-slate-600">
              {form.watch("description") || t.createPost.descFallback}
            </p>

            <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-100">
                  <MapPin size={16} className="text-[#309051]" />
                </div>
                <span className="truncate">
                  {form.watch("location") || t.createPost.locationFallback}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-100">
                  <Phone size={16} className="text-[#309051]" />
                </div>
                <span className="truncate">
                  {form.watch("contact") || t.createPost.contactFallback}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          latitude={form.watch("latitude") || 0}
          longitude={form.watch("longitude") || 0}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={(lat, lng, address) => {
            form.setValue("latitude", lat);
            form.setValue("longitude", lng);
            form.setValue("location", address);
            setShowLocationPicker(false);
          }}
        />
      )}
    </div>
  );
}
