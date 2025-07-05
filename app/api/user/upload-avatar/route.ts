import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `avatar-${userId}-${timestamp}.${extension}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to public/avatars directory
    const uploadDir = join(process.cwd(), 'public', 'avatars');
    const filepath = join(uploadDir, filename);
    
    try {
      await writeFile(filepath, buffer);
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      );
    }

    // Generate public URL
    const avatarUrl = `/avatars/${filename}`;

    // Update user avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        avatar: avatarUrl,
        updatedAt: new Date()
      }
    });

    // Log the avatar update activity
    await prisma.userActivity.create({
      data: {
        userId: userId,
        activityType: 'PROFILE_UPDATED',
        description: 'Profile picture updated',
        metadata: {
          avatarUrl: avatarUrl,
          fileSize: file.size,
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      avatarUrl,
      message: 'Avatar uploaded successfully' 
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
} 