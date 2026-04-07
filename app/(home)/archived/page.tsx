/* import Iframe from "react-iframe";
import TechStackGrid from "@/components/frontend/Techstack";
import { GridBackground } from "@/components/reusable-ui/grid-background";

import ReUsableHero from "@/components/reusable-ui/reusable-hero";
import {
  Database,
  BarChart2,
  ShoppingCart,
} from "lucide-react";
import React from "react";
import Showcase from "@/components/frontend/showcase";
import PricingCard from "@/components/frontend/single-tier-pricing";
import CustomizationCard from "@/components/frontend/customisation-card";
import Image from "next/image";
import { BorderBeam } from "@/components/magicui/border-beam";
import InventoryComparison from "@/components/reusable-ui/project-comparison";
import InventoryFeatureTabs from "@/components/frontend/SmoothTabs";
import InventoryFAQ from "@/components/frontend/FAQ";

export default async function page() {
  const currentUsers = 100;
  return (
    <section>
      <ReUsableHero
  theme="light"
  announcement={{
    text: "New: Multi-location inventory tracking now available",
  }}
  title={
    <>
      Simplify Your Inventory
      <br />Management with Vilyo Inventory
    </>
  }
  mobileTitle="Simplify Inventory Management with Vilyo Inventory"
  subtitle="Vilyo Inventory offers a comprehensive solution for businesses to track products, manage stock levels across multiple locations, process sales orders,  and handle supplier relationships. Boost efficiency, reduce stockouts, and gain valuable insights with our powerful yet easy-to-use inventory management system.It is also connected to Vilyo finance  and Vilyo e.Commerce so we help you with; daily and monthly reports, track expenses and profits  of your business and receive orders online!"
  buttons={[
    {
      label: "Start Free Trial",
      href: "/register",
      primary: true,
    },
    {
      label: "View Demo",
      href: "/#demo",
    },
  ]}
  icons={[
    { icon: Database, position: "left" },    // Database icon for inventory/products
    { icon: BarChart2, position: "right" },  // Chart for reporting/analytics
    { icon: ShoppingCart, position: "center" }, // Cart for sales orders
  ]}
  backgroundStyle="neutral"
  className="min-h-[70vh]"
  userCount={currentUsers > 10 ? currentUsers : null}
/>
      <GridBackground>
        <div className="px-8 py-16 ">
          <TechStackGrid />
        </div>
      </GridBackground>
      <div className="py-16 max-w-6xl mx-auto px-8">
        <div className="relative rounded-lg overflow-hidden">
          <BorderBeam />
          <Image
            src="/images/dash-2.webp"
            alt="This is the dashbaord Image"
            width={1775}
            height={1109}
            className="w-full h-full rounded-lg object-cover  border shadow-2xl"
          />
        </div>
      </div>
      <InventoryComparison />
      <GridBackground className="">
        <InventoryFeatureTabs />
      </GridBackground>

      <div id="demo" className="py-16 max-w-6xl mx-auto relative">
        <Iframe
          url="https://www.youtube.com/embed/TcyKfjikcIA?si=naix1jg9I2r0CnSu"
          width="100%"
          className="h-[32rem] rounded-lg"
          display="block"
          position="relative"
        />
        <div className="pb-16">
          <Showcase />
        </div>
        <div className="py-8">
          <PricingCard />
        </div>
        <div className="py">
          <CustomizationCard theme="light" />
        </div>
      </div>
      <InventoryFAQ />
    </section>
  );
}
 */