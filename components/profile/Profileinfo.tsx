import { Card, CardContent } from "@/components/ui/card";
import { Mail, Calendar, Phone, MapPin } from "lucide-react";

interface ProfileInfoProps {
  user: {
    email?: string;
    phone?: string;
    location?: string;
    $createdAt: string;
  };
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const infoItems = [
    { icon: Mail, label: "Contact", value: user.email, show: !!user.email },
    { icon: Phone, label: "Téléphone", value: user.phone, show: !!user.phone },
    {
      icon: MapPin,
      label: "Localisation",
      value: user.location,
      show: !!user.location,
    },
    {
      icon: Calendar,
      label: "Membre depuis",
      value: new Date(user.$createdAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
      }),
      show: true,
    },
  ];

  return (
    <div className="mt-12 border-t border-slate-100 pt-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {infoItems
          .filter((item) => item.show)
          .map((item) => (
            <Card key={item.label} className="rounded-2xl border-slate-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <item.icon size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {item.label}
                    </h4>
                    <p className="text-sm text-slate-500">{item.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
