import { Button } from "@/components/ui/button";
import {
  Heart,
  Package,
  Home,
  MessageSquare,
  Star,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: "heart" | "package" | "home" | "message" | "star" | "alert";
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  variant?: "primary" | "secondary";
  compact?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  variant = "primary",
  compact = false,
}: EmptyStateProps) {
  const icons = {
    heart: Heart,
    package: Package,
    home: Home,
    message: MessageSquare,
    star: Star,
    alert: AlertCircle,
  };

  const Icon = icons[icon];

  // Airbnb color palette
  const variants = {
    primary: {
      bgColor: "bg-white",
      border: "border border-gray-200",
      iconBg: "bg-[#FF385C]/10",
      iconColor: "text-[#FF385C]",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-600",
      buttonClass: "bg-[#FF385C] hover:bg-[#FF385C]/90 text-white rounded-lg",
    },
    secondary: {
      bgColor: "bg-gray-50",
      border: "border border-gray-200",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      titleColor: "text-gray-900",
      descriptionColor: "text-gray-600",
      buttonClass:
        "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg",
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={`${currentVariant.bgColor} ${currentVariant.border} rounded-2xl ${compact ? "p-6" : "p-12"}`}
    >
      <div className="text-center">
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center ${compact ? "h-16 w-16" : "h-20 w-20"} rounded-full ${currentVariant.iconBg} mb-6`}
        >
          <Icon size={compact ? 24 : 32} className={currentVariant.iconColor} />
        </div>

        {/* Content */}
        <div className={`${compact ? "space-y-3" : "space-y-4"}`}>
          <h3
            className={`${compact ? "text-lg" : "text-xl"} font-bold ${currentVariant.titleColor}`}
          >
            {title}
          </h3>
          <p
            className={`${currentVariant.descriptionColor} ${compact ? "text-sm" : "text-base"} mx-auto max-w-sm leading-relaxed`}
          >
            {description}
          </p>
        </div>

        {/* Action Button */}
        <div className={`mt-${compact ? "6" : "8"}`}>
          <Link href={actionHref}>
            <Button
              className={`${currentVariant.buttonClass} ${compact ? "px-6 py-2.5 text-sm" : "px-8 py-3"}`}
            >
              {actionLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
