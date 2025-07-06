import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = (session?.user as any)?.id || (session?.user as any)?.sub;
    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { filename, encryptedData } = await req.json();
    if (!filename || !encryptedData) {
      return NextResponse.json({ error: 'Missing filename or encryptedData' }, { status: 400 });
    }
    // Store in DNAUpload model
    const record = await prisma.dNAUpload.create({
      data: {
        userId,
        filename,
        fileType: 'OTHER',
        encryptedData,
        status: 'PENDING',
      },
    });
    console.log('Genealogy file stored in DNAUpload:', record.id, filename);
    return NextResponse.json({ success: true, id: record.id });
  } catch (error: any) {
    console.error('Genealogy upload error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
} 