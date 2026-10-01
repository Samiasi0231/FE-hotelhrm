// src/components/layout/UserAvatar.tsx
import { useAuth } from "@/contexts/AuthContext";

export function UserAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { user } = useAuth();
  const dim = size === "lg" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";

  return (
    <div
      className={`${dim} rounded-full overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0`}
    >
      {(user as any)?.avatar ? (
        <img
          src={(user as any).avatar}
          alt="avatar"
          className="w-full h-full object-cover"
          key={(user as any).avatar}
        />
      ) : (
        <span className="text-white font-bold">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </span>
      )}
    </div>
  );
}
