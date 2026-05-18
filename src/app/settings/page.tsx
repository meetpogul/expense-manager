import Link from "next/link";
import {
  FolderIcon,
  LogOutIcon,
  UserIcon,
  WalletCardsIcon,
} from "lucide-react";

import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signOutAction } from "@/features/auth/server/actions";
import { getSupabaseAndUser } from "@/features/auth/server/session";

export default async function SettingsPage() {
  const { supabase } = await getSupabaseAndUser();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? "Signed in";

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Keep the app quiet and focused.
          </p>
        </div>
        <Card className="shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-secondary flex size-10 items-center justify-center rounded-lg">
                <UserIcon />
              </div>
              <div>
                <p className="text-sm font-medium">{email}</p>
                <p className="text-muted-foreground text-xs">
                  INR / India formatting
                </p>
              </div>
            </div>
            <Separator />
            <Button asChild className="justify-start" variant="ghost">
              <Link href="/accounts">
                <WalletCardsIcon data-icon="inline-start" />
                Accounts
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="ghost">
              <Link href="/categories">
                <FolderIcon data-icon="inline-start" />
                Categories
              </Link>
            </Button>
            <form action={signOutAction}>
              <Button
                className="w-full justify-start"
                type="submit"
                variant="ghost"
              >
                <LogOutIcon data-icon="inline-start" />
                Log out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
