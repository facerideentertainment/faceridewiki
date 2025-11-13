
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/storage';
import { Loader2, UploadCloud } from 'lucide-react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface ProfilePictureEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const aspect = 1 / 1; // Square aspect ratio

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

// This function converts the cropped area on the canvas to a Blob
async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg');
    });
}


export function ProfilePictureEditor({ open, onOpenChange }: ProfilePictureEditorProps) {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    // When the dialog opens, if there's a user photoURL and no image is loaded yet, load it.
    if (open && user?.photoURL && !imgSrc) {
      // Use a proxy to bypass CORS issues when loading the image from Firebase Storage into the canvas
      setImgSrc(`https://images.weserv.nl/?url=${encodeURIComponent(user.photoURL)}`);
    } else if (!open) {
      // Clear the image source when the dialog is closed to ensure it re-fetches next time
      setImgSrc('');
    }
  }, [user, open, imgSrc]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setCrop(undefined); // Reset crop when new image is selected
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
    imgRef.current = e.currentTarget;
  }

  async function handleSubmit() {
    if (!completedCrop || !imgRef.current) {
      toast({
        title: 'No Image Cropped',
        description: 'Please select and crop an image before saving.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const file = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });

      const photoURL = await uploadFile(file, 'profile-pictures', (progress) => {
        setUploadProgress(progress);
      });
      
      await updateUserProfile({ photoURL });

      toast({
        title: 'Profile Picture Updated',
        description: 'Your new picture has been saved.',
      });
      closeDialog(); // Close dialog on success
    } catch (error) {
      console.error(error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }
  
  const closeDialog = () => {
    onOpenChange(false);
    // Reset state when closing the dialog
    setTimeout(() => {
      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
    }, 300); // Delay to allow dialog to animate out
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new image and crop it to update your profile picture.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Input type="file" accept="image/*" onChange={handleImageChange} />

          {imgSrc ? (
            <div className="flex justify-center bg-muted rounded-md p-2">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop
              >
                <Image
                  ref={imgRef}
                  src={imgSrc}
                  alt="Profile picture preview"
                  onLoad={onImageLoad}
                  width={400}
                  height={400}
                  style={{ maxHeight: '70vh', width: 'auto', height: 'auto' }}
                  crossOrigin="anonymous" // Important for loading external images into canvas
                />
              </ReactCrop>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-48 bg-muted rounded-md p-4 text-center">
                <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Select an image to preview</p>
            </div>
          )}

          {isSubmitting && uploadProgress !== null && (
            <Progress value={uploadProgress} className="w-full" />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !completedCrop}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
