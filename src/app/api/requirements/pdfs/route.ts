import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgname = searchParams.get('orgname');
    const reqid = searchParams.get('reqid');

    if (!orgname || !reqid) {
      return NextResponse.json({ error: 'Missing orgname or reqid' }, { status: 400 });
    }

    const folderPath = `${orgname}/${reqid}`;

    const { data: files, error } = await supabaseAdmin.storage
      .from('requirement-pdfs')
      .list(folderPath, { limit: 200 });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: pub } = supabaseAdmin.storage
      .from('requirement-pdfs')
      .getPublicUrl('');

    const basePublicUrl = pub.publicUrl.replace(/\/$/, '');

    const pdfs = (files || []).map((f: any) => {
      const filepath = `${folderPath}/${f.name}`;
      const publicUrl = `${basePublicUrl}/${filepath}`;

      return {
        id: filepath,
        filepath,
        publicUrl,
        uploadedby: null,
        uploadedat: f.created_at || null,
      };
    });

    return NextResponse.json({ pdfs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to load files' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { filepath } = await req.json();

    if (!filepath) {
      return NextResponse.json({ error: 'Missing filepath' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage
      .from('requirement-pdfs')
      .remove([filepath]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete file' }, { status: 500 });
  }
}
