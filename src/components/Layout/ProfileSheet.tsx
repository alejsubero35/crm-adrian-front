import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CreditCard, Settings, Plus } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { usePosT } from "@/i18n/pos";

interface ProfileSheetProps {
  name?: string;
  email?: string;
  avatarSrc?: string;
}

export function ProfileSheet({
  name,
  email,
  avatarSrc,
}: ProfileSheetProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const t = usePosT();

  const displayName = name ?? user?.name ?? user?.username ?? user?.email ?? "";
  const displayEmail = email ?? user?.email ?? "";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="p-6">
        {/* Header avatar + name */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md" aria-hidden />
            <div className="relative rounded-full p-[4px] bg-white shadow-sm ring-2 ring-emerald-400">
              <Avatar className="h-24 w-24">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : null}
                <AvatarFallback>{initials || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
          </div>

          {/* Small team avatars + add */}
          {/* <div className="mt-5 flex items-center gap-3">
            {["/img/avatar.png","/img/avatar.png","/img/avatar.png"].map((src, idx) => (
              <Avatar key={idx} className="h-9 w-9 ring-1 ring-border">
                <AvatarImage src={src} alt="team" />
                <AvatarFallback>U{idx+1}</AvatarFallback>
              </Avatar>
            ))}
            <button className="grid place-items-center h-9 w-9 rounded-full border border-dashed text-muted-foreground hover:text-foreground hover:border-foreground/50 transition">
              <Plus className="h-4 w-4" />
            </button>
          </div> */}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Menu */}
      <nav className="px-4 py-3">
        <ul className="grid gap-1.5">
          <MenuItem
            icon={<CreditCard className="h-4 w-4" />}
            label={t("subscriptionLabel")}
            onClick={() => navigate('/subscription')}
            closeOnClick
          />
          <MenuItem icon={<Settings className="h-4 w-4" />} label={t("accountSettingsLabel")} />
        </ul>
      </nav>

      {/* Promo card */}
      {/* <div className="px-4">
        <div className="rounded-2xl p-5 bg-gradient-to-r from-[#F2994A] via-[#F36AD0] to-[#7367F0] text-white shadow-md">
          <p className="text-xl font-bold">35% OFF</p>
          <p className="text-sm/5 opacity-90">Power up Productivity!</p>
        </div>
      </div> */}

      {/* Logout */}
      <div className="p-4 pb-6">
        <SheetClose asChild>
          <Button
            variant="ghost"
            className="w-full btn-red-new btn-red-new-hover rounded-xltext-red-600 "
            onClick={() => logout()}
          >
            {t("logoutLabel")}
          </Button>
        </SheetClose>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, badge, onClick, closeOnClick }: { icon: React.ReactNode; label: string; badge?: React.ReactNode; onClick?: () => void; closeOnClick?: boolean }) {
  return (
    <li>
      {closeOnClick ? (
        <SheetClose asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl",
              "hover:bg-muted/80 text-foreground/90 hover:text-foreground",
              "transition-colors"
            )}
            onClick={onClick}
          >
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-muted text-foreground/70">
              {icon}
            </span>
            <span className="flex-1 text-sm font-medium text-left">{label}</span>
            {badge}
          </button>
        </SheetClose>
      ) : (
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl",
            "hover:bg-muted/80 text-foreground/90 hover:text-foreground",
            "transition-colors"
          )}
          onClick={onClick}
        >
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-muted text-foreground/70">
            {icon}
          </span>
          <span className="flex-1 text-sm font-medium text-left">{label}</span>
          {badge}
        </button>
      )}
    </li>
  );
}
