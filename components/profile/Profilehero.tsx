import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, MapPin, Briefcase } from "lucide-react";

interface ProfileHeroProps {
  user: any;
  formData: any;
  setFormData: (data: any) => void;
  editing: boolean;
}

export default function ProfileHero({
  user,
  formData,
  setFormData,
  editing,
}: ProfileHeroProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-100/50 to-violet-100/50 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-6">
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-[#349950] text-3xl text-white">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {editing ? (
          <div className="w-full max-w-md space-y-4">
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Votre nom"
                maxLength={128}
              />
              <p className="text-right text-xs text-slate-500">
                {formData.name.length}/128
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Parlez-nous de vous..."
                rows={3}
                maxLength={500}
              />
              <p className="text-right text-xs text-slate-500">
                {formData.bio.length}/500
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-slate-900">
              {user.name}
            </h1>
            {user.role && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                <Briefcase size={12} />
                <span>{user.role}</span>
              </div>
            )}
            {user.location && (
              <div className="mb-3 flex items-center justify-center gap-2 text-slate-500">
                <MapPin size={14} />
                <span className="text-sm">{user.location}</span>
              </div>
            )}
            {user.bio && (
              <p className="mx-auto max-w-md text-slate-600">{user.bio}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
