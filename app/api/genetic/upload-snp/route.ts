import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const worldId = formData.get('worldId') as string;

    if (!file || !worldId) {
      return NextResponse.json({ error: 'Missing file or World ID' }, { status: 400 });
    }

    // Read file content
    const content = await file.text();

    // Validate SNP data format
    const lines = content.split('\n');
    let snpCount = 0;
    
    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue;
      
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4 && parts[0].startsWith('rs')) {
        snpCount++;
      }
    }

    if (snpCount < 100) {
      return NextResponse.json({ 
        error: `Insufficient SNP data. Found ${snpCount} SNPs, minimum 100 required.` 
      }, { status: 400 });
    }

    // Calculate hash of the data
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Return hash and validation info
    // The actual storage happens client-side in IndexedDB
    return NextResponse.json({
      success: true,
      hash,
      snpCount,
      fileName: file.name,
      fileSize: file.size
    });

  } catch (error) {
    console.error('SNP upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}