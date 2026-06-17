"use client";

import { useActionState } from "react";
import { Gift } from "lucide-react";

import { buttonClassName } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  redeemPromoCode,
  type PromoCodeActionState
} from "@/features/billing/actions";
import { useTranslation } from "@/i18n/useTranslation";

const initialState: PromoCodeActionState = {};

export function PromoCodeCard() {
  const { t } = useTranslation();
  const [state, action, isPending] = useActionState(
    redeemPromoCode,
    initialState
  );

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Gift className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>{t("promo.title")}</CardTitle>
          <CardDescription>{t("promo.description")}</CardDescription>
        </div>
      </div>

      <form action={action} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          name="code"
          type="text"
          autoComplete="off"
          placeholder={t("promo.placeholder")}
          className="min-w-0 rounded-lg border border-line bg-black/30 px-3 py-2.5 text-sm uppercase text-ink outline-none transition placeholder:normal-case placeholder:text-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/25"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className={buttonClassName({
            variant: "secondary",
            className: "w-full sm:w-auto"
          })}
        >
          {t("promo.redeem")}
        </button>
      </form>

      {state.success ? (
        <p className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-green-200">
          ✅ {state.success}
        </p>
      ) : null}
      {state.error ? (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">
          ❌ {state.error}
        </p>
      ) : null}
    </Card>
  );
}
