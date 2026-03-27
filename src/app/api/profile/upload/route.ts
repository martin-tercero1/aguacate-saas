import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication server-side
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión para continuar.' },
        { status: 401 }
      )
    }

    // 2. Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo.' },
        { status: 400 }
      )
    }

    // 3. Server-side validation - File type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP, SVG).' },
        { status: 400 }
      )
    }

    // 4. Server-side validation - File size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo permitido de 10MB.' },
        { status: 400 }
      )
    }

    // 5. Generate unique filename with user ID for proper isolation
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const fileName = `profile/${user.id}/${timestamp}.${fileExtension}`

    // 6. Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // 7. Delete previous profile images for this user (cleanup)
    const { data: existingFiles } = await supabase.storage
      .from('images')
      .list(`profile/${user.id}`)

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `profile/${user.id}/${f.name}`)
      await supabase.storage.from('images').remove(filesToDelete)
    }

    // 8. Upload to Supabase Storage (RLS ensures only owner can access)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Error al subir la imagen. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    // 9. Generate signed URL for private access (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('images')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError)
      return NextResponse.json(
        { error: 'Error al generar URL de acceso.' },
        { status: 500 }
      )
    }

    // 10. Update the user's profile with the new avatar URL
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        avatarUrl: signedUrlData.signedUrl
      })

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Still return success since upload worked - profile sync is secondary
    }

    return NextResponse.json({
      success: true,
      avatarUrl: signedUrlData.signedUrl,
      path: uploadData.path
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove profile image
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado.' },
        { status: 401 }
      )
    }

    // List and delete all files in user's profile folder
    const { data: existingFiles } = await supabase.storage
      .from('images')
      .list(`profile/${user.id}`)

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `profile/${user.id}/${f.name}`)
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove(filesToDelete)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return NextResponse.json(
          { error: 'Error al eliminar la imagen.' },
          { status: 500 }
        )
      }
    }

    // Clear avatarUrl from profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatarUrl: null })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
