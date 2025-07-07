import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Travel {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  destination: string;
  budget: number;
  participants: string[];
  created_at?: string;
  updated_at?: string;
}

serve(async (req) => {
  // CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    // デバッグ用ログ出力
    console.log('headers:', Object.fromEntries(req.headers.entries()));
    console.log('supabaseServiceKey:', supabaseServiceKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { pathname } = new URL(req.url)
    const method = req.method
    // 追加: 実際のpathnameをログ出力
    console.log('pathname:', pathname)

    // ヘルスチェック
    if ((pathname === '/health' || pathname === '/ai-app/health') && method === 'GET') {
      return new Response(
        JSON.stringify({ message: 'Travel App API is running' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // 旅行データの取得
    if ((pathname === '/api/travels' || pathname === '/ai-app/api/travels') && method === 'GET') {
      const { data, error } = await supabase
        .from('travels')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // 旅行データの作成
    if ((pathname === '/api/travels' || pathname === '/ai-app/api/travels') && method === 'POST') {
      const body: Travel = await req.json()
      
      const { data, error } = await supabase
        .from('travels')
        .insert([body])
        .select()

      if (error) throw error

      return new Response(
        JSON.stringify(data[0]),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201 
        }
      )
    }

    // 特定の旅行データの取得
    if ((pathname.match(/^\/api\/travels\/[^/]+$/) || pathname.match(/^\/ai-app\/api\/travels\/[^/]+$/)) && method === 'GET') {
      const id = pathname.split('/').pop();
      const { data, error } = await supabase.from('travels').select('*').eq('id', id).single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }

    // 旅行データの更新
    if ((pathname.match(/^\/api\/travels\/[^/]+$/) || pathname.match(/^\/ai-app\/api\/travels\/[^/]+$/)) && method === 'PUT') {
      const id = pathname.split('/').pop();
      const body = await req.json();
      const { data, error } = await supabase.from('travels').update(body).eq('id', id).select();
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }

    // 旅行データの削除
    if ((pathname.match(/^\/api\/travels\/[^/]+$/) || pathname.match(/^\/ai-app\/api\/travels\/[^/]+$/)) && method === 'DELETE') {
      const id = pathname.split('/').pop();
      const { error } = await supabase.from('travels').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({
        message: 'Travel deleted successfully'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }

    // AI推奨機能
    if ((pathname === '/api/ai-recommendations' || pathname === '/ai-app/api/ai-recommendations') && method === 'POST') {
      const { preferences } = await req.json()
      
      const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_API_KEY')!)
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })

      const prompt = `旅行の好みに基づいて推奨プランを提案してください：\n好み: ${JSON.stringify(preferences)}\n\n以下の形式で回答してください：\n- 推奨目的地\n- 推奨期間\n- 予算の目安\n- 推奨アクティビティ\n- 注意点`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return new Response(
        JSON.stringify({ recommendation: text }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // AIプラン生成エンドポイント
    if ((pathname === '/api/travels/generate-plan' || pathname === '/ai-app/api/travels/generate-plan') && method === 'POST') {
      // ここにAIプラン生成の処理を実装（今回はダミーで返す）
      return new Response(
        JSON.stringify({ success: true, plan: {}, message: 'AIプラン生成ダミー', error: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // 404エラー
    return new Response(
      JSON.stringify({ message: 'エンドポイントが見つかりません' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ message: 'サーバーエラーが発生しました', error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 