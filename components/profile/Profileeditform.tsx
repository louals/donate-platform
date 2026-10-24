"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Briefcase, Loader2, AlignLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProfileEditFormProps {
  formData: {
    bio: string;
    location: string;
    phone: string;
    role: string;
  };
  setFormData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ProfileEditForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  loading,
}: ProfileEditFormProps) {
  const { t, locale, isRTL } = useLanguage();

  const profileSchema = z.object({
    bio: z.string().max(500, t.validation.bioMax).optional(),
    location: z.string().min(2, t.validation.locationShort).max(100),
    phone: z
      .string()
      .regex(/^\+?[0-9\s\-]+$/, t.validation.phoneInvalid)
      .max(20)
      .optional(),
    role: z.string().optional(),
  });

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: formData.bio || "",
      location: formData.location || "",
      phone: formData.phone || "",
      role: formData.role || "",
    },
  });

  const handleSubmit = (data: ProfileFormValues) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    onSave();
  };

  // Animated label helper
  const AnimatedLabel = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${locale}-${typeof children === "string" ? children.slice(0, 15) : "label"}`}
        initial={{ y: 4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -4, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-10"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* BIO SECTION */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl font-bold text-[#222222]">
                <AnimatedLabel>{t.editForm.bioLabel}</AnimatedLabel>
              </FormLabel>
              <p className="mb-4 text-sm font-light text-gray-500">
                <AnimatedLabel>{t.editForm.bioHint}</AnimatedLabel>
              </p>
              <FormControl>
                <Textarea
                  placeholder={t.editForm.bioPlaceholder}
                  className={`min-h-[150px] rounded-xl border-gray-200 p-4 text-lg leading-relaxed font-light transition-all focus:border-black focus:ring-0 ${isRTL ? "text-right" : ""}`}
                  {...field}
                />
              </FormControl>
              <div
                className={`flex ${isRTL ? "justify-start" : "justify-end"} pt-1`}
              >
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  {field.value?.length || 0}/500
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <hr className="border-gray-100" />

        {/* PERSONAL INFO GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`flex items-center gap-2 text-sm font-bold text-[#222222] ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <MapPin size={16} />{" "}
                  <AnimatedLabel>{t.editForm.locationLabel}</AnimatedLabel>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.editForm.locationPlaceholder}
                    className={`h-12 rounded-xl border-gray-200 transition-all focus:border-black focus:ring-0 ${isRTL ? "text-right" : ""}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`flex items-center gap-2 text-sm font-bold text-[#222222] ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Briefcase size={16} />{" "}
                  <AnimatedLabel>{t.editForm.roleLabel}</AnimatedLabel>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={`h-12 rounded-xl border-gray-200 transition-all focus:border-black ${isRTL ? "text-right" : ""}`}
                    >
                      <SelectValue placeholder={t.editForm.rolePlaceholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                    {t.editForm.roles.map((role: string) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className="cursor-pointer focus:bg-gray-50"
                      >
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={`flex items-center gap-2 text-sm font-bold text-[#222222] ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Phone size={16} />{" "}
                  <AnimatedLabel>{t.editForm.phoneLabel}</AnimatedLabel>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.editForm.phonePlaceholder}
                    className={`h-12 rounded-xl border-gray-200 transition-all focus:border-black focus:ring-0 ${isRTL ? "text-right" : ""}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* FOOTER ACTIONS */}
        <div
          className={`mt-12 flex items-center justify-between border-t border-gray-100 pt-10 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-bold underline decoration-1 underline-offset-4 transition-colors hover:text-black"
          >
            <AnimatedLabel>{t.editForm.cancel}</AnimatedLabel>
          </button>

          <Button
            type="submit"
            disabled={loading || !form.formState.isDirty}
            className="rounded-xl bg-[#1A2F23] px-10 py-6 font-bold text-white shadow-md transition-all hover:bg-[#254232] active:scale-95 disabled:opacity-30"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <AnimatedLabel>{t.editForm.save}</AnimatedLabel>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
