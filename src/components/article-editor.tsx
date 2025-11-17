
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";
import { uploadFile } from "@/lib/storage";
import { Loader2, Sparkles, Trash2, CropIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useGeminiAiContentEnhancer } from "@/hooks/use-gemini-ai-content-enhancer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { RichTextEditor } from "./rich-text-editor";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  title: z.string().min(3, "Title is required and must be at least 3 characters."),
  tags: z.string().min(3, "At least one tag is required."),
  content: z.string(),
});

interface ArticleEditorProps {
  article?: any;
}

const aspect = 16 / 9;

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

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

export function ArticleEditor({ article }: ArticleEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgSrc, setImgSrc] = useState(article?.imageUrl || '');
  const [rawImgSrc, setRawImgSrc] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  const { prompt, setPrompt, isGenerating, generatedContent, generate } = useGeminiAiContentEnhancer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article?.title || "",
      tags: article?.tags?.join(", ") || "",
      content: article?.content || "",
    },
  });

  const canDelete = user && article && (user.role === 'Admin' || (user.role === 'Editor' && article.author === user.uid));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setRawImgSrc(reader.result?.toString() || '');
        setIsCropDialogOpen(true);
      });
      reader.readAsDataURL(event.target.files[0]);
      event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImgSrc('');
  };

  const handleDelete = async () => { 
    if (!canDelete || !article) return;
    setIsSubmitting(true);
    try {
        await deleteDocumentNonBlocking(doc(firestore, 'wiki_pages', article.id));
        toast({ title: "Entry Deleted", description: `"${article.title}" has been permanently deleted.` });
        router.push('/');
        router.refresh();
    } catch (e) {
        console.error("Delete error:", e);
        toast({ title: "Delete Failed", variant: "destructive" });
        setIsSubmitting(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) { 
        toast({ title: "Authentication Error", description: "You must be logged in to save an entry.", variant: "destructive" });
        return; 
    }
    
    setIsSubmitting(true);
    try {
      const newTags = values.tags.split(',').map(tag => tag.trim());

      if (article) {
        const hasChanges =
          article.title !== values.title ||
          JSON.stringify(article.tags.sort()) !== JSON.stringify(newTags.sort()) ||
          article.content !== values.content ||
          article.imageUrl !== imgSrc;

        if (!hasChanges) {
          toast({
            title: "No Changes Detected",
            description: "The entry was not updated because no changes were made.",
          });
          setIsSubmitting(false);
          router.push(`/article/${article.id}`);
          return;
        }
      }

      const articleData: any = {
        ...values,
        tags: newTags,
        updatedAt: serverTimestamp(),
        imageUrl: imgSrc,
        lastEditorId: user.uid,
        lastEditorDisplayName: user.displayName || user.email,
        lastEditorPhotoURL: user.photoURL || null,
      };

      if (article) {
        const articleRef = doc(firestore, 'wiki_pages', article.id);
        await updateDocumentNonBlocking(articleRef, articleData);
        toast({ title: "Entry Updated", description: `"${values.title}" has been saved.` });
        router.push(`/article/${article.id}`);
      } else {
        const newArticleRef = doc(collection(firestore, 'wiki_pages'));
        await setDocumentNonBlocking(newArticleRef, {
            ...articleData,
            id: newArticleRef.id,
            createdAt: serverTimestamp(),
            author: user.uid,
            authorDisplayName: user.displayName || user.email,
            authorPhotoURL: user.photoURL || null,
            viewCount: 0,
        }, {});

        toast({ title: "Entry Created", description: `"${values.title}" has been created.` });
        router.push(`/article/${newArticleRef.id}`);
      }
    } catch (e) {
      console.error("Submission error:", e);
      toast({ title: "Submission Failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }

  const handleCropAndUpload = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const fileName = `header-${Date.now()}.jpg`;
      const file = new File([croppedBlob], fileName, { type: 'image/jpeg' });

      const finalUrl = await uploadFile(file, "wiki-headers", setUploadProgress);
      
      setImgSrc(finalUrl);
      toast({ title: 'Image updated successfully!' });
    } catch (error) {
      console.error("Cropping/upload failed:", error);
      toast({ title: 'Upload Failed', description: String(error), variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      setIsCropDialogOpen(false);
    }
  }

  return (
    <>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the entry &quot;{article?.title}&quot;. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, delete it
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary"/> AI Content Assistant</DialogTitle>
                <DialogDescription>
                    Enter a prompt to generate or enhance the article content. The AI will provide a suggestion that you can insert into the editor.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <Textarea 
                    placeholder="e.g., 'Write a short introduction about the history of our company' or 'Make the following paragraph more professional...'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                />
                <Button onClick={generate} disabled={isGenerating || !prompt}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate Content
                </Button>
                {generatedContent && (
                    <div className="p-4 border rounded-md bg-muted max-h-64 overflow-y-auto">
                        <h4 className="font-semibold mb-2">AI Suggestion:</h4>
                        <div className="text-sm prose-base dark:prose-invert" dangerouslySetInnerHTML={{ __html: generatedContent }} />
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
                <Button 
                    onClick={() => {
                        if (generatedContent) {
                            const currentContent = form.getValues('content');
                            form.setValue('content', currentContent ? `${currentContent}<br>${generatedContent}` : generatedContent, { shouldDirty: true, shouldValidate: true });
                            toast({ title: "Content Inserted", description: "The AI-generated content has been added to the editor." });
                        }
                        setIsAiDialogOpen(false);
                    }}
                    disabled={!generatedContent}
                >
                    Insert into Editor
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Crop Header Image</DialogTitle></DialogHeader>
          <div className="flex justify-center bg-muted p-4">
            {rawImgSrc ? (
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={aspect}
                className="max-w-full"
              >
                <Image
                    ref={imgRef}
                    src={rawImgSrc}
                    alt="Crop preview"
                    width={800} 
                    height={450}
                    style={{ maxHeight: '70vh', objectFit: 'contain' }}
                    onLoad={onImageLoad}
                />
              </ReactCrop>
            ) : <p>Loading...</p>}
          </div>
          {isUploading && <Progress value={uploadProgress} className="w-full" />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCropDialogOpen(false)} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleCropAndUpload} disabled={!completedCrop || isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{article ? "Edit Entry" : "Create New Entry"}</h1>
            <div className='flex gap-2'>
              <Button type="button" variant='outline' onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}</Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-lg">Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Big Mike's Signature Move, Face Smashing, The Boston Cradle" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-lg">Tags</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Techniques, Theories, Long Ride" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

          <FormItem>
            <FormLabel className="text-lg">Header Image</FormLabel>
            <div className="relative group w-full min-h-[250px] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted overflow-hidden">
              {imgSrc ? (
                <>
                  <Image src={imgSrc} alt={form.getValues('title') || 'Header image'} fill style={{ objectFit: 'cover' }} />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Input id="image-upload-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <Label htmlFor="image-upload-input" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 cursor-pointer">
                      <CropIcon className="mr-2 h-4 w-4" /> Change Image
                    </Label>
                  </div>
                </>
              ) : (
                <>
                  <Input id="image-upload-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <Label htmlFor="image-upload-input" className="cursor-pointer text-primary hover:underline">Click to add a header image</Label>
                </>
              )}
            </div>
            {imgSrc && (
              <div className="text-right mt-1">
                <Button type="button" variant="link" size="sm" className="text-destructive" onClick={handleRemoveImage}>Remove Image</Button>
              </div>
            )}
          </FormItem>

          <FormField control={form.control} name="content" render={({ field }) => (
            <FormItem>
                <FormLabel className="text-lg">Content</FormLabel>
                <FormControl>
                    <RichTextEditor 
                        {...field}
                        actions={
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsAiDialogOpen(true)}>
                                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                AI Assistant
                            </Button>
                        }
                    />
                </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {article && canDelete && (
             <div className="flex justify-between items-center pt-8 border-t border-destructive/20">
                <div>
                    <h3 className="font-bold text-lg text-destructive">Danger Zone</h3>
                    <p className="text-muted-foreground text-sm">Deleting an entry is a permanent action.</p>
                </div>
                <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={isSubmitting}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Entry
                </Button>
            </div>
          )}
        </form>
      </Form>
    </>
  );
}
