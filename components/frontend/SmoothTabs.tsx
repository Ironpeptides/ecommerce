"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Database,
  BarChart2,
  Map,
  Edit3,
  ShoppingCart,
  Users,
  ShoppingBag,
  Truck,
  FileText,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";

const InventoryFeatureTabs = () => {
  const features = [
    {
      id: "product-catalog",
      icon: Database,
      tab: "Products",
      title: "Product Catalog Management",
      description:
        "Create and manage comprehensive product information with custom attributes, categorization, and pricing.",
      subFeatures: [
        "Intuitive product creation with customizable attributes",
        "SKU generation and management system",
        "Detailed product descriptions and specifications",
        "Hierarchical category organization",
        "Cost and selling price management",
        "Minimum stock level configuration",
        "Barcode and QR code generation",
        "Product import/export capabilities",
      ],
    },
    {
      id: "inventory-tracking",
      icon: BarChart2,
      tab: "Tracking",
      title: "Real-time Inventory Tracking",
      description:
        "Monitor your inventory levels in real-time with automated alerts and comprehensive history tracking.",
      subFeatures: [
        "Live stock quantity monitoring across all products",
        "Customizable low stock threshold alerts",
        "Email and in-app notifications for inventory events",
        "Complete inventory movement history",
        "Stock level forecasting based on historical data",
        "Batch and expiry date tracking",
        "Serial number tracking for high-value items",
        "Stock valuation reports with FIFO/LIFO methods",
      ],
    },
    {
      id: "multi-location",
      icon: Map,
      tab: "Locations",
      title: "Multi-location Support",
      description:
        "Manage inventory across multiple physical locations with seamless transfer capabilities.",
      subFeatures: [
        "Unlimited warehouse and store location support",
        "Location-specific inventory tracking",
        "Simple stock transfer between locations",
        "Transfer documentation and approval workflows",
        "Transfer history and audit trails",
        "Location-specific reorder points",
        "Location performance comparison",
        "Map view for geographical distribution",
      ],
    },
    {
      id: "stock-adjustments",
      icon: Edit3,
      tab: "Adjustments",
      title: "Stock Adjustment Tools",
      description:
        "Record and track inventory changes with detailed reason codes and comprehensive audit trails.",
      subFeatures: [
        "Quick stock adjustment interface",
        "Customizable reason codes for adjustments",
        "Documentation for damaged or lost inventory",
        "Adjustment authorization workflows",
        "Complete adjustment history log",
        "Bulk adjustment capabilities",
        "Inventory reconciliation tools",
        "Variance reports for inventory audits",
      ],
    },
    {
      id: "sales-orders",
      icon: ShoppingCart,
      tab: "Sales",
      title: "Sales Order Management",
      description:
        "Process customer orders efficiently with status tracking and automated invoice generation.",
      subFeatures: [
        "Intuitive sales order creation interface",
        "Real-time inventory availability check",
        "Order status tracking from creation to fulfillment",
        "Automated invoice generation",
        "Partial order fulfillment options",
        "Order history and customer purchase tracking",
        "Customizable order templates",
        "Integration with shipping providers",
      ],
    },
    {
      id: "customer-management",
      icon: Users,
      tab: "Customers",
      title: "Customer Relationship Management",
      description:
        "Maintain comprehensive customer profiles with specialized pricing and purchase history.",
      subFeatures: [
        "Detailed customer database with contact information",
        "Multiple shipping and billing addresses",
        "Customer categorization (retail vs. wholesale)",
        "Customer-specific pricing tiers",
        "Complete purchase history tracking",
        "Customer credit limit management",
        "Communication history log",
        "Customer analytics and insights",
      ],
    },
    {
      id: "purchase-orders",
      icon: ShoppingBag,
      tab: "Purchasing",
      title: "Purchase Order System",
      description:
        "Create and track supplier orders with receiving functionality and automated reordering.",
      subFeatures: [
        "Streamlined purchase order creation",
        "Automated reorder suggestions based on stock levels",
        "Purchase order approval workflow",
        "Order status tracking from creation to receipt",
        "Partial receiving functionality",
        "Variance recording for received goods",
        "Cost tracking and comparison",
        "Integration with supplier catalogs",
      ],
    },
    {
      id: "supplier-management",
      icon: Truck,
      tab: "Suppliers",
      title: "Supplier Management",
      description:
        "Manage supplier relationships and link products to preferred vendors for streamlined purchasing.",
      subFeatures: [
        "Comprehensive supplier database",
        "Product-supplier relationship mapping",
        "Supplier performance metrics",
        "Lead time tracking for improved forecasting",
        "Multiple supplier options for each product",
        "Supplier contact management",
        "Contract and agreement tracking",
        "Preferred supplier designation",
      ],
    },
    {
      id: "reporting",
      icon: FileText,
      tab: "Reports",
      title: "Comprehensive Reporting",
      description:
        "Generate detailed reports for inventory levels, sales performance, purchase orders, and forecasting.",
      subFeatures: [
        "Current inventory value and status reports",
        "Low stock and out-of-stock reporting",
        "Sales analysis by product, category, or customer",
        "Purchase order status and history reports",
        "Inventory turnover and aging analysis",
        "Profit margin reporting by product",
        "Customizable report templates",
        "Export capabilities for Excel, PDF, and CSV",
      ],
    },
    {
      id: "user-management",
      icon: Lock,
      tab: "Users",
      title: "Role-based Access Control",
      description:
        "Secure user management with customizable permissions for different staff roles and responsibilities.",
      subFeatures: [
        "Admin and standard user role definitions",
        "Custom role creation capabilities",
        "Granular permission settings",
        "Location-specific access restrictions",
        "Action logging and audit trails",
        "Time-based access controls",
        "Two-factor authentication support",
        "Password policy enforcement",
      ],
    },
  ];

  return (
    <section className="w-full py-20 bg-blue-50/50">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
          Powerful Features for
          <br /> Complete{" "}
          <span className="inline-block bg-gradient-to-r from-blue-200 via-teal-200 to-teal-300 px-4 rounded-lg">
            Inventory Control
          </span>
        </h2>
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
          From product management to comprehensive reporting,
          <br /> Vilyo Inventory covers all your inventory needs.
        </p>
      </div>

      {/* Tabs Component */}
      <div className="w-full max-w-6xl mx-auto px-6">
        <Tabs defaultValue="product-catalog" className="w-full">
          {/* Tab Buttons */}
          <TabsList className="flex items-center w-full gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-full shadow-sm mb-8 flex-wrap justify-center">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 transition-all duration-300 text-slate-600"
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline font-medium">
                    {feature.tab}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Content Panels */}
          {features.map((feature) => (
            <TabsContent
              key={feature.id}
              value={feature.id}
              className="focus-visible:outline-none focus-visible:ring-0"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100"
              >
                <div className="flex items-start gap-6">
                  {/* Feature Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-blue-50 flex items-center justify-center shadow-sm">
                    <feature.icon className="w-8 h-8 text-teal-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 text-lg">
                        {feature.description}
                      </p>
                    </div>
                    <ul className="space-y-4">
                      {feature.subFeatures.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <svg
                              className="w-3 h-3 text-teal-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-slate-700 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default InventoryFeatureTabs;
