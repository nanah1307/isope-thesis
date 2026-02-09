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

    const { data: files, error: listErr } = await supabaseAdmin.storage
      .from('requirement-pdfs')
      .list(folderPath, { limit: 100, sortBy: { column: 'created_at', order: 'asc' } });

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }

    const pdfFiles = (files || []).filter((f: any) => (f.name || '').toLowerCase().endsWith('.pdf'));

    const pdfs = await Promise.all(
      pdfFiles.map(async (f: any) => {
        const filepath = `${folderPath}/${f.name}`;

        const { data: signed, error: signErr } = await supabaseAdmin.storage
          .from('requirement-pdfs')
          .createSignedUrl(filepath, 60 * 60);

        return {
          id: filepath,
          filepath,
          signedUrl: signErr ? null : signed?.signedUrl,
          uploadedby: null,
          uploadedat: f.created_at || null,
        };
      })
    );

    return NextResponse.json({ pdfs }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const filepath = body?.filepath;

    if (!filepath) {
      return NextResponse.json({ error: 'Missing filepath' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage
      .from('requirement-pdfs')
      .remove([filepath]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
