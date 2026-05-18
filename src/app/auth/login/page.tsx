import { WalletCardsIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/features/auth/components/auth-form";

export default function LoginPage() {
  return (
    <main className="bg-background text-foreground flex min-h-svh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
            <WalletCardsIcon />
          </div>
          <div>
            <p className="text-lg font-semibold">Expense Manager</p>
            <p className="text-muted-foreground text-sm">
              Track money without the noise.
            </p>
          </div>
        </div>
        <Card className="shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="text-2xl tracking-normal">
              Welcome back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
