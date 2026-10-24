"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const userId = searchParams.get("userId");
      const secret = searchParams.get("secret");

      if (!userId || !secret) {
        setStatus("error");
        setMessage("Lien de vérification invalide.");
        return;
      }

      try {
        await account.updateVerification(userId, secret);
        setStatus("success");
        setMessage("Votre email a été vérifié avec succès !");
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.message ||
            "La vérification a échoué. Le lien est peut-être expiré."
        );
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md overflow-hidden rounded-3xl border-slate-100 shadow-2xl shadow-slate-200/50">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="text-primary mx-auto mb-6 h-16 w-16 animate-spin" />
              <h2 className="mb-2 text-2xl font-bold text-slate-900">
                Vérification en cours...
              </h2>
              <p className="text-slate-500">Veuillez patienter</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">
                Email Vérifié !
              </h2>
              <p className="mb-6 text-slate-500">{message}</p>
              <Button
                className="h-12 w-full rounded-xl font-bold"
                onClick={() => router.push("/")}
              >
                Accéder à la plateforme
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">
                Erreur de Vérification
              </h2>
              <p className="mb-6 text-slate-500">{message}</p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl font-medium"
                  asChild
                >
                  <Link href="/auth/login">Retour à la connexion</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
