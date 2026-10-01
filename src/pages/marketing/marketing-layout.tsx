import { Outlet } from "react-router-dom";
import { MarketingNav } from "./components/marketing-nav";
import { MarketingFooter } from "./components/marketing-footer";

export default function MarketingLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
