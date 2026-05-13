import { redirect } from "next/navigation";

import RegisterForm from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/services/auth-service";

export const metadata = {
  title: "Register - Soccer Planner",
  description: "Create your Soccer Planner account",
};

export default async function RegisterPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/");
  }

  return (
    <div className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,0.92),_rgba(226,232,240,0.96))] px-4 py-16">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  );
}
