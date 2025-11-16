"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, HelpCircle, Minus, Plus } from "lucide-react";
import Link from "next/link";

const inventoryFaqs = [
  {
    question: "How does Vilyo Inventory help prevent stockouts?",
    answer:
      "Vilyo Inventory features real-time inventory tracking across all locations with customizable low stock threshold alerts. You'll receive automated notifications when inventory levels approach your predefined minimums, giving you ample time to reorder. Our system also provides inventory forecasting based on historical sales data to help you anticipate demand fluctuations and maintain optimal stock levels at all times.",
  },
  {
    question: "Can I manage inventory across multiple store locations?",
    answer:
      "Absolutely! Vilyo Inventory is designed with multi-location support as a core feature. You can track inventory levels across unlimited warehouse and store locations, easily transfer stock between locations with proper documentation, and generate location-specific reports. Each location can have its own reorder points and stock level settings, ensuring you maintain appropriate inventory levels based on the unique demand patterns of each location.",
  },
  {
    question: "How does the purchase order system work?",
    answer:
      "Our purchase order system streamlines the entire procurement process. You can create purchase orders with a few clicks, track their status from creation to fulfillment, and record partial receipts when needed. The system supports vendor-specific catalogs, automatically suggests reorders based on your stock levels, and maintains a complete history of all purchase activities. You can also set up approval workflows for larger purchases to maintain proper spending controls.",
  },
  {
    question: "What reports can I generate with Vilyo Inventory?",
    answer:
      "Vilyo Inventory includes a comprehensive reporting suite with over 20 pre-built reports. These include current inventory valuation, low stock reports, inventory turnover analysis, sales performance by product or category, profit margin reports, purchase order status, vendor performance metrics, and forecasting reports. All reports can be customized, filtered, and exported to Excel, PDF, or CSV formats for further analysis or sharing with stakeholders.",
  },
  {
    question: "Is Vilyo Inventory suitable for small businesses?",
    answer:
      "Yes, Vilyo Inventory is designed to scale with your business. Our Small Business plan is specifically tailored for growing operations, while our Entrepreneur tier is perfect for businesses just starting to formalize their inventory management. The software is intuitive enough for beginners but powerful enough to handle complex inventory scenarios as your business grows. Many of our customers start with the basic plan and upgrade as their needs evolve.",
  },
  {
    question: "How secure is my inventory data with Vilyo Inventory?",
    answer:
      "Security is a top priority for Vilyo Inventory. We implement role-based access controls so you can limit which employees can view or modify sensitive inventory and pricing information. All data is encrypted both in transit and at rest, and we perform regular security audits. Our platform maintains detailed audit logs of all system activities, allowing you to track any changes made to your inventory data and identify the users who made them.",
  },
  {
    question:
      "Can Vilyo Inventory integrate with my existing e-commerce platform?",
    answer:
      "Vilyo Inventory offers integrations with major e-commerce platforms including Shopify, WooCommerce, Magento, and BigCommerce. These integrations allow for real-time synchronization of inventory levels between your online store and physical locations, automated order creation when online purchases are made, and consistent product information across all sales channels. Additional integrations are available with our higher-tier plans.",
  },
  {
    question:
      "How difficult is it to migrate from spreadsheets to Vilyo Inventory?",
    answer:
      "We've designed our onboarding process to make migration as seamless as possible. Vilyo Inventory includes bulk import tools that can directly import your product data from Excel or CSV files. Our implementation team provides templates and guidance to ensure your data is properly formatted for import. Most customers can complete their initial setup within 1-2 weeks, and we offer optional data migration services if you need additional assistance with complex inventory datasets.",
  },
  {
    question: "Do you offer mobile access to inventory information?",
    answer:
      "Yes, Vilyo Inventory is fully responsive and can be accessed from any mobile device with a web browser. Additionally, we offer dedicated mobile apps for iOS and Android that provide streamlined access to core inventory functions like stock checks, receiving shipments, and processing sales. The mobile apps can also scan barcodes using your device's camera, making physical inventory counts much faster and more accurate.",
  },
];

export default function InventoryFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 bg-blue-50/50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-teal-600 mb-2 uppercase tracking-wide">
            Frequently Asked Questions
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Common Questions About{" "}
            <span className="text-teal-600">Vilyo Inventory</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get answers to the most frequently asked questions about our
            inventory management solution.
          </p>
        </div>
        <div className="space-y-4">
          {inventoryFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                className="w-full text-left p-4 focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 pt-0 text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <HelpCircle className="w-5 h-5 text-teal-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700">
                Still have questions about Vilyo Inventory?
              </span>
            </div>
            <Link
              href="/contact"
              className="bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition duration-300 flex items-center whitespace-nowrap"
            >
              Contact our team
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}