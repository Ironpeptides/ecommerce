"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import {
  Star, Trash2,
  Images, ShieldCheck, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  addProductImage,
  deleteProductImage,
  setPrimaryProductImage,
  setProductCertificate,
  deleteProductCertificate,
} from "@/actions/products";

type ProductImage = {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  order: number;
};

type ProductCertificate = {
  id: string;
  url: string;
};

type Props = {
  product: {
    id: string;
    name: string;
    images: ProductImage[];
    certificates: ProductCertificate[];
  };
};

const MAX_IMAGES = 8;

export function ImagesTab({ product }: Props) {
  const [images, setImages] = useState<ProductImage[]>(
    [...product.images].sort((a, b) => a.order - b.order)
  );
  const [certificate, setCertificate] = useState<ProductCertificate | null>(
    product.certificates?.[0] ?? null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canAddMore = images.length < MAX_IMAGES;

  /* ── Image actions ── */
  async function handleImageUploaded(url: string) {
    startTransition(async () => {
      try {
        const newImage = await addProductImage(product.id, url, images.length);
        setImages((prev) => [...prev, newImage]);
        toast.success("Image added");
      } catch {
        toast.error("Failed to save image");
      }
    });
  }

  async function handleSetPrimary(imageId: string) {
    setSettingPrimaryId(imageId);
    try {
      await setPrimaryProductImage(product.id, imageId);
      setImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === imageId }))
      );
      toast.success("Primary image updated");
    } catch {
      toast.error("Failed to update primary image");
    } finally {
      setSettingPrimaryId(null);
    }
  }

  async function handleDeleteImage(imageId: string) {
    setDeletingId(imageId);
    try {
      await deleteProductImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image removed");
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setDeletingId(null);
    }
  }

  /* ── Certificate actions ── */
  async function handleCertificateUploaded(url: string) {
    startTransition(async () => {
      try {
        const cert = await setProductCertificate(product.id, url);
        setCertificate(cert);
        toast.success("Certificate saved");
      } catch {
        toast.error("Failed to save certificate");
      }
    });
  }

  async function handleDeleteCertificate() {
    if (!certificate) return;
    setDeletingId(certificate.id);
    try {
      await deleteProductCertificate(certificate.id);
      setCertificate(null);
      toast.success("Certificate removed");
    } catch {
      toast.error("Failed to remove certificate");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Product Images ── */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Images className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Product Images</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Up to {MAX_IMAGES} images. The starred image is shown first.
              </p>
            </div>
          </div>
          <Badge variant={canAddMore ? "outline" : "secondary"}>
            {images.length} / {MAX_IMAGES}
          </Badge>
        </div>

        <div className="p-6 space-y-6">
          {/* Image grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={cn(
                    "group relative rounded-lg overflow-hidden border-2 bg-muted aspect-square transition-all duration-200",
                    img.isPrimary
                      ? "border-primary shadow-sm shadow-primary/20"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? product.name}
                    
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />

                  {/* Primary badge */}
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <Badge className="text-[10px] px-1.5 py-0 h-5 gap-1">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        Primary
                      </Badge>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {/* Set primary */}
                    {!img.isPrimary && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 shadow"
                        onClick={() => handleSetPrimary(img.id)}
                        disabled={settingPrimaryId === img.id}
                        title="Set as primary"
                      >
                        {settingPrimaryId === img.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Star className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                    {/* Delete */}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 shadow"
                      onClick={() => handleDeleteImage(img.id)}
                      disabled={deletingId === img.id}
                      title="Remove image"
                    >
                      {deletingId === img.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          {canAddMore ? (
            <div className={cn(images.length === 0 && "mt-0")}>
              {images.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">
                    Add more images
                  </span>
                  <Separator className="flex-1" />
                </div>
              )}
              <UploadDropzone
                endpoint="productImageUploader"
                onClientUploadComplete={(res) => {
                  
                  res.forEach((file) => handleImageUploaded(file.url));
                }}
                onUploadError={(err) => {
                  toast.error(`Upload failed: ${err.message}`);
                }}
                className="border-dashed border-2 border-border rounded-lg ut-label:text-sm ut-label:font-medium ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground ut-button:bg-primary ut-button:text-primary-foreground ut-button:rounded-md ut-button:text-sm"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 rounded-lg bg-muted/50 border border-dashed">
              <p className="text-sm text-muted-foreground">
                Maximum of {MAX_IMAGES} images reached. Remove one to add more.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Certificate of Analysis ── */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold">Certificate of Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload the lab certificate image or PDF for this product. Shown to
              customers as proof of purity.
            </p>
          </div>
        </div>

        <div className="p-6">
          {certificate ? (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
              <div className="relative h-24 w-24 rounded-md overflow-hidden border flex-shrink-0 bg-white">
                <Image
                  src={certificate.url}
                  alt="Certificate of Analysis"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className="text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Certificate uploaded
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3 truncate">
                  {certificate.url}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => window.open(certificate.url, "_blank")}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDeleteCertificate}
                    disabled={deletingId === certificate.id}
                  >
                    {deletingId === certificate.id
                      ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      : <Trash2 className="h-3 w-3 mr-1" />}
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <UploadDropzone
              endpoint="certificateUploader"
              onClientUploadComplete={(res) => {
                handleCertificateUploaded(res[0].url);
              }}
              onUploadError={(err) => {
                toast.error(`Upload failed: ${err.message}`);
              }}
              className="border-dashed border-2 border-border rounded-lg ut-label:text-sm ut-label:font-medium ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground ut-button:bg-emerald-600 ut-button:text-white ut-button:rounded-md ut-button:text-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}