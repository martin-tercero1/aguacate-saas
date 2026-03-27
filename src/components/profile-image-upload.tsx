'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Camera, Upload, Trash2, Loader2, AlertCircle, User } from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

interface ProfileImageUploadProps {
  currentAvatarUrl?: string | null
  onUploadSuccess?: (avatarUrl: string) => void
  onDeleteSuccess?: () => void
}

export function ProfileImageUpload({
  currentAvatarUrl,
  onUploadSuccess,
  onDeleteSuccess
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Client-side validation
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP, SVG).'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo excede el tamaño máximo de 10MB.'
    }
    return null
  }, [])

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)

    // Client-side validation first
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload to server
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la imagen')
      }

      // Clear preview and use the actual URL
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(null)
      onUploadSuccess?.(data.avatarUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }, [validateFile, onUploadSuccess])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }, [handleFileSelect])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDelete = useCallback(async () => {
    setError(null)
    setDeleting(true)

    try {
      const response = await fetch('/api/profile/upload', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la imagen')
      }

      onDeleteSuccess?.()
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar la imagen')
    } finally {
      setDeleting(false)
    }
  }, [onDeleteSuccess])

  const displayUrl = previewUrl || currentAvatarUrl

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display / Drop Zone */}
      <div
        className={`relative group cursor-pointer rounded-full transition-all duration-200 ${
          dragActive ? 'ring-4 ring-primary ring-offset-2' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted border-2 border-border">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Foto de perfil"
              fill
              className="object-cover"
              sizes="128px"
              priority
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <User className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
          </div>
        </div>

        {/* Upload indicator badge */}
        <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg border-2 border-background">
          <Camera className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={uploading || deleting}
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || deleting}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir foto
            </>
          )}
        </Button>

        {currentAvatarUrl && !previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={uploading || deleting}
            className="text-destructive hover:text-destructive"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </>
            )}
          </Button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        Arrastra una imagen o haz clic para subir. Max 10MB. JPEG, PNG, GIF, WebP.
      </p>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
