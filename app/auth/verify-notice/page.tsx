"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function VerifyNoticePage() {
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await account.createVerification(`${window.location.origin}/auth/verify`);
      toast.success("Email de vérification envoyé !");
    } catch (error: any) {
      toast.error(
        error.message || "Impossible d'envoyer l'email. Réessayez plus tard."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md overflow-hidden rounded-3xl border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="relative bg-slate-900 p-8 text-center">
          <div className="from-primary/20 absolute inset-0 bg-gradient-to-br to-transparent" />
          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Vérifiez votre email
            </h1>
          </div>
        </div>

        <CardContent className="p-8 text-center">
          <p className="mb-6 text-slate-600">
            Nous vous avons envoyé un email de vérification. Cliquez sur le lien
            dans l'email pour activer votre compte.
          </p>

          <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>Conseil :</strong> Vérifiez votre dossier spam si vous ne
              voyez pas l'email dans votre boîte de réception.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-slate-200 font-medium"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Renvoyer l'email
            </Button>

            <Button
              variant="ghost"
              className="h-12 w-full rounded-xl font-medium text-slate-500"
              asChild
            >
              <Link href="/auth/login">Retour à la connexion</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
